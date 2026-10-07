import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Executes a shell command synchronously and returns stdout as a string.
 */
function runCommand(command: string, inheritStdio = false): string {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: inheritStdio ? 'inherit' : 'pipe',
    })?.toString() ?? '';
  } catch (error: unknown) {
    if (inheritStdio) {
      throw error;
    }
    return '';
  }
}

/**
 * Recursively scans directory for all .md files as a fallback when git diff is unavailable.
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
  const isDevBranch = refName === 'develop' || ref === 'refs/heads/develop';

  const r2Bucket = process.env['R2_BUCKET'] || (isDevBranch ? 'codingdatafy-content-dev' : 'codingdatafy-content');

  console.log(`[INFO] Branch: ${refName || ref} | Targeting R2 Bucket: ${r2Bucket}`);

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

  const addedOrModified = new Set<string>();
  const deleted = new Set<string>();

  if (diffOutput.trim()) {
    const lines = diffOutput.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) continue;

      const status = parts[0] || '';

      if (status.startsWith('R') && parts.length >= 3) {
        // Handle file rename (R): delete old path, add new path
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
    console.warn('Git diff empty or failed. Falling back to scanning all markdown files in data/.');
    walkDirectory('data', addedOrModified);
  }

  console.log(
    `Syncing ${addedOrModified.size} edited/added file(s) and ${deleted.size} deleted file(s) to R2 bucket [${r2Bucket}]...`
  );

  // 3. Process and Upload Added / Modified Files
  for (const filePath of addedOrModified) {
    if (!fs.existsSync(filePath)) continue;

    let commitDate = runCommand(
      `git log -1 --format="%cd" --date=format:"%Y-%m-%d" -- "${filePath}"`
    ).trim();

    if (!commitDate) {
      commitDate = new Date().toISOString().split('T')[0] ?? '';
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const frontmatterRegex = /^---[\r\n]+([\s\S]*?)[\r\n]+---[\r\n]*/;
    const match = content.match(frontmatterRegex);

    if (match) {
      let yamlBlock = match[1] ?? '';
      if (/^updatedAt:.*/m.test(yamlBlock)) {
        yamlBlock = yamlBlock.replace(/^updatedAt:.*/m, `updatedAt: "${commitDate}"`);
      } else {
        yamlBlock = `${yamlBlock.trimEnd()}\nupdatedAt: "${commitDate}"`;
      }
      content = content.replace(frontmatterRegex, `---\n${yamlBlock}\n---\n`);
    } else {
      content = `---\nupdatedAt: "${commitDate}"\n---\n${content}`;
    }

    fs.writeFileSync(filePath, content, 'utf8');

    const r2Key = filePath.replace(/^data\//, '');
    console.log(`[UPLOAD] ${filePath} -> ${r2Bucket}/${r2Key}`);
    runCommand(`npx wrangler r2 object put "${r2Bucket}/${r2Key}" --file="${filePath}"`, true);
  }

  // 4. Delete Removed Files from R2 Bucket
  for (const filePath of deleted) {
    const r2Key = filePath.replace(/^data\//, '');
    console.log(`[DELETE] ${r2Bucket}/${r2Key}`);
    try {
      runCommand(`npx wrangler r2 object delete "${r2Bucket}/${r2Key}"`, true);
    } catch {
      console.warn(`[DELETE SKIPPED] Could not delete ${r2Key} from R2.`);
    }
  }
}

syncR2Content().catch((error: unknown) => {
  console.error('[Sync Failure]', error);
  process.exit(1);
});