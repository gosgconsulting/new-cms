#!/usr/bin/env node
/**
 * Upload theme assets (sparti-cms/theme and public/theme) to Vercel Blob
 * and create a path -> URL manifest. Run once or when theme assets change.
 *
 * Requires: BLOB_READ_WRITE_TOKEN in env (never commit this; use Vercel env or .env).
 * Output: Set the printed manifest URL as BLOB_THEME_MANIFEST_URL in Vercel and .env.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const THEME_DIRS = [
  path.join(rootDir, 'sparti-cms', 'theme'),
  path.join(rootDir, 'public', 'theme'),
];

const EXT_TO_MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXT_TO_MIME[ext] || 'application/octet-stream';
}

function* walkDir(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      yield* walkDir(full, rel);
    } else if (ent.isFile()) {
      yield { relativePath: rel.replace(/\\/g, '/'), fullPath: full };
    }
  }
}

function collectThemeFiles() {
  const seen = new Set();
  const files = [];
  for (const themeDir of THEME_DIRS) {
    for (const { relativePath, fullPath } of walkDir(themeDir)) {
      if (seen.has(relativePath)) continue;
      seen.add(relativePath);
      files.push({ relativePath, fullPath });
    }
  }
  return files;
}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('Error: BLOB_READ_WRITE_TOKEN is not set.');
    console.error('Set it in .env or environment, then run again. Never commit the token.');
    process.exit(1);
  }

  const { put } = await import('@vercel/blob');

  const files = collectThemeFiles();
  console.log(`Found ${files.length} theme asset file(s). Uploading to Vercel Blob...`);

  const manifest = {};
  for (const { relativePath, fullPath } of files) {
    const buffer = fs.readFileSync(fullPath);
    const blobPath = `theme/${relativePath}`;
    const contentType = getContentType(fullPath);
    try {
      const blob = await put(blobPath, buffer, {
        access: 'public',
        contentType,
      });
      manifest[relativePath] = blob.url;
    } catch (err) {
      console.error(`[testing] Upload failed for ${relativePath}:`, err?.message || err);
    }
  }

  const manifestJson = JSON.stringify(manifest, null, 0);
  const manifestBlob = await put('theme-manifest.json', Buffer.from(manifestJson), {
    access: 'public',
    contentType: 'application/json',
  });

  console.log('');
  console.log('Theme assets uploaded. Set this URL as BLOB_THEME_MANIFEST_URL in Vercel and .env:');
  console.log(manifestBlob.url);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
