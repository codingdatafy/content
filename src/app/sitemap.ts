/**
 * @project CodingDatafy
 * @license MIT
 * @copyright 2026 CodingDatafy Organization
 * @author CodingDatafy Team
 */

import fs from 'fs';
import path from 'path';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.codingdatafy.com';
const DATA_DIRECTORY = path.join(process.cwd(), 'data');

/**
 * RECURSIVE FILE SCANNER
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    if (!fs.existsSync(dirPath)) return [];

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (
            file.endsWith('.md') && 
            !file.startsWith('_') && 
            !file.startsWith('.')
        ) {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

/**
 * SITEMAP GENERATOR
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const files = getAllFiles(DATA_DIRECTORY);

    const sitemapEntries = files.map((filePath) => {
        // 1. Normalize path relative to the data root
        let relativePath = path.relative(DATA_DIRECTORY, filePath)
            .replace(/\\/g, '/') // Ensure cross-platform URL compatibility
            .replace('.md', '');

        // 2. Handle directory indexing logic (index.md -> /)
        if (relativePath === 'index') {
            relativePath = '';
        } else if (relativePath.endsWith('/index')) {
            relativePath = relativePath.slice(0, -6);
        }

        const urlPath = relativePath === '' ? '' : `/${relativePath}`;
        const stats = fs.statSync(filePath);
        
        // 3. SEO PRIORITY LOGIC
        // Hierarchy: Home (1.0) > Category Hubs (0.9) > Technical Articles (0.8)
        let priority = 0.7;
        if (urlPath === '') {
            priority = 1.0;
        } else if (urlPath.startsWith('/languages')) {
            const depth = urlPath.split('/').filter(Boolean).length;
            priority = depth <= 2 ? 0.9 : 0.8;
        }

        return {
            url: `${BASE_URL}${urlPath}`,
            lastModified: stats.mtime,
            changeFrequency: 'weekly' as const,
            priority: priority,
        };
    });

    return sitemapEntries;
}