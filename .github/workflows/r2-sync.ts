import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Executes a shell command synchronously and returns stdout as a string.
 */
function runCommand(command: string, inheritStdio = false): string {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: inheritStdio ? 'inherit' : 'pipe',
      env: process.env,
    });
    return result ? result.toString() : '';
  } catch (error: unknown) {
    if (inheritStdio) {
      throw error;
    }
    return '';
  }
}

/**
 * Recursively scans directory for all .md files.
 */
function walkDirectory(dirPath: string, fileSet: Set<string>): void {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(fullPath, fileSet);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      fileSet.add(fullPath.replace(/\\/g, '/'));
    }
  }
}

async function syncR2Content(): Promise<void> {
  const beforeSha = process.env['BEFORE_SHA'] || '';
  const currentSha = process.env['CURRENT_SHA'] || 'HEAD';
  const refName = process.env['GITHUB_REF_NAME'] || '';
  const ref = process.env['GITHUB_REF'] || '';
  const eventName = process.env['GITHUB_EVENT_NAME'] || '';
  const forceFullSyncEnv = process.env['FORCE_FULL_SYNC'] || '';

  const isDevBranch = refName === 'develop' || ref === 'refs/heads/develop';
  const r2Bucket = process.env['R2_BUCKET'] || (isDevBranch ? 'codingdatafy-content-dev' : 'codingdatafy-content');
  const forceFullSync = forceFullSyncEnv === 'true' || eventName === 'workflow_dispatch';

  console.log(`[INFO] Event: ${eventName} | Branch: ${refName || ref}`);
  console.log(`[INFO] Target R2 Bucket: ${r2Bucket}`);
  console.log(`[INFO] Force Full Sync Mode: ${forceFullSync}`);

  const addedOrModified = new Set<string>();
  const deleted = new Set<string>();

  if (forceFullSync) {
    console.log('[INFO] Performing full directory scan of data/...');
    walkDirectory('data', addedOrModified);
  } else {
    // 1. Resolve base commit for git diff comparison
    let baseCommit = '';
    if (beforeSha && beforeSha !== '0000000000000000000000000000000000000000') {
      const verifyBefore = runCommand(`git rev-parse --verify "${beforeSha}"`);
      if (verifyBefore) {
        baseCommit = beforeSha;
      }
    }

    if (!baseCommit) {
      const verifyHeadPrev = runCommand('git rev-parse --verify HEAD~1');
      if (verifyHeadPrev) {
        baseCommit = 'HEAD~1';
      }
    }

    // 2. Perform git diff
    let diffOutput = '';
    if (baseCommit) {
      diffOutput = runCommand(`git diff --name-status "${baseCommit}" "${currentSha}"`);
    }

    if (diffOutput.trim()) {
      const lines = diffOutput.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 2) continue;

        const status = parts[0] || '';

        if (status.startsWith('R') && parts.length >= 3) {
          // File rename (R): delete old path, add new path
          const oldPath = (parts[1] || '').replace(/\\/g, '/');
          const newPath = (parts[2] || '').replace(/\\/g, '/');
          if (oldPath.startsWith('data/') && oldPath.endsWith('.md')) {
            deleted.add(oldPath);
          }
          if (newPath.startsWith('data/') && newPath.endsWith('.md')) {
            addedOrModified.add(newPath);
          }
        } else {
          const rawFilePath = parts[parts.length - 1] || '';
          const filePath = rawFilePath.replace(/\\/g, '/');

          if (filePath.startsWith('data/') && filePath.endsWith('.md')) {
            if (status.startsWith('D')) {
              deleted.add(filePath);
            } else {
              addedOrModified.add(filePath);
            }
          }
        }
      }
    } else {
      console.warn('[WARN] Git diff returned no changes or failed. Falling back to full scan of data/ directory.');
      walkDirectory('data', addedOrModified);
    }
  }

  console.log(
    `[SUMMARY] Syncing ${addedOrModified.size} file(s) to upload and ${deleted.size} file(s) to delete in [${r2Bucket}]...`
  );

  // 3. Process and Upload Added / Modified Files
  let uploadCount = 0;
  for (const filePath of addedOrModified) {
    if (!fs.existsSync(filePath)) continue;

    let commitDate = runCommand(
      `git log -1 --format="%cd" --date=format:"%Y-%m-%d" -- "${filePath}"`
    ).trim();

    if (!commitDate) {
      commitDate = new Date().toISOString().split('T')[0] ?? '';
    }

    let rawContent = fs.readFileSync(filePath, 'utf8');
    // Strip UTF-8 BOM if present
    if (rawContent.charCodeAt(0) === 0xfeff) {
      rawContent = rawContent.slice(1);
    }

    const frontmatterRegex = /^---[\r\n]+([\s\S]*?)[\r\n]+---[\r\n]*/;
    const match = rawContent.match(frontmatterRegex);

    let content: string;
    if (match) {
      let yamlBlock = match[1] ?? '';
      if (/^updatedAt:.*/m.test(yamlBlock)) {
        yamlBlock = yamlBlock.replace(/^updatedAt:.*/m, `updatedAt: "${commitDate}"`);
      } else {
        yamlBlock = `${yamlBlock.trimEnd()}\nupdatedAt: "${commitDate}"`;
      }
      content = rawContent.replace(frontmatterRegex, `---\n${yamlBlock}\n---\n`);
    } else {
      content = `---\nupdatedAt: "${commitDate}"\n---\n${rawContent.trimStart()}`;
    }

    fs.writeFileSync(filePath, content, 'utf8');

    const r2Key = filePath.replace(/^data\//, '');
    console.log(`[UPLOAD] ${filePath} -> ${r2Bucket}/${r2Key}`);
    const uploadCmd = `npx wrangler r2 object put "${r2Bucket}/${r2Key}" --file="${filePath}"`;
    runCommand(uploadCmd, true);
    uploadCount++;
  }

  // 4. Delete Removed Files from R2 Bucket
  let deleteCount = 0;
  for (const filePath of deleted) {
    const r2Key = filePath.replace(/^data\//, '');
    console.log(`[DELETE] ${r2Bucket}/${r2Key}`);
    const deleteCmd = `npx wrangler r2 object delete "${r2Bucket}/${r2Key}"`;
    try {
      runCommand(deleteCmd, true);
      deleteCount++;
    } catch {
      console.warn(`[DELETE SKIPPED] Could not delete ${r2Key} from ${r2Bucket}.`);
    }
  }

  console.log(`[COMPLETE] Successfully uploaded ${uploadCount} file(s) and deleted ${deleteCount} file(s) in bucket [${r2Bucket}].`);
}

syncR2Content().catch((error: unknown) => {
  console.error('[Sync Failure]', error);
  process.exit(1);
});