/**
 * Zip backup / restore for CMS upload files.
 * - Disk: public/uploads (when Blob storage is not active).
 * - Blob: Vercel Blob objects under pathname prefix `uploads/` (when BLOB_READ_WRITE_TOKEN / VERCEL blob mode is active).
 * @module server/services/uploadsBackupService
 */

import { mkdirSync, existsSync } from 'fs';
import { writeFile as writeFileAsync } from 'fs/promises';
import { dirname, extname, join, resolve, sep } from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { useBlobStorage } from '../utils/blobStorage.js';
import { getUploadsDir } from '../utils/uploads.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** @returns {'disk' | 'blob'} */
export function getUploadsBackupStorage() {
  return useBlobStorage() ? 'blob' : 'disk';
}

/** Absolute path to repo `public/` (same layout as getUploadsDir). */
export function getPublicDir() {
  return join(__dirname, '..', '..', 'public');
}

function guessContentType(pathname) {
  const ext = extname(pathname).toLowerCase();
  return EXT_TO_MIME[ext] || 'application/octet-stream';
}

/** @returns {Promise<Array<{ pathname: string, downloadUrl: string }>>} */
async function listAllBlobsWithPrefix(prefix) {
  const { list } = await import('@vercel/blob');
  const out = [];
  let cursor;
  for (;;) {
    const page = await list({ prefix, cursor, limit: 1000, mode: 'expanded' });
    out.push(...page.blobs);
    if (!page.hasMore) {
      break;
    }
    cursor = page.cursor;
    if (!cursor) {
      break;
    }
  }
  return out;
}

/**
 * Create a zip of all upload files (disk or Blob, depending on configuration).
 * Archive paths are always `uploads/…` so disk import layout matches Blob layout.
 * @returns {Promise<{ buffer: Buffer, entryCount: number, storage: 'disk' | 'blob' }>}
 */
export async function backupAllUploadsToZip() {
  if (useBlobStorage()) {
    return backupBlobUploadsToZip();
  }
  return backupDiskUploadsToZip();
}

async function backupDiskUploadsToZip() {
  const uploadsDir = getUploadsDir();
  const zip = new AdmZip();
  if (existsSync(uploadsDir)) {
    zip.addLocalFolder(uploadsDir, 'uploads');
  }
  const buffer = zip.toBuffer();
  const entryCount = zip.getEntries().filter((e) => !e.isDirectory).length;
  return { buffer, entryCount, storage: 'disk' };
}

async function backupBlobUploadsToZip() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is required to export uploads from Vercel Blob.',
    );
  }

  const blobs = await listAllBlobsWithPrefix('uploads/');
  const zip = new AdmZip();
  for (const blob of blobs) {
    const pathname = blob.pathname.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!pathname.startsWith('uploads/') || pathname.includes('..')) {
      continue;
    }
    const res = await fetch(blob.downloadUrl);
    if (!res.ok) {
      throw new Error(`Failed to download blob ${pathname}: HTTP ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    zip.addFile(pathname, buf);
  }
  const buffer = zip.toBuffer();
  const entryCount = zip.getEntries().filter((e) => !e.isDirectory).length;
  return { buffer, entryCount, storage: 'blob' };
}

/**
 * @param {string} entryName
 * @returns {string|null} absolute file path under public/uploads
 */
function safeResolveDiskTarget(entryName) {
  const normalized = entryName.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    return null;
  }
  if (!normalized.startsWith('uploads/')) {
    return null;
  }
  const publicDir = resolve(getPublicDir());
  const target = resolve(join(publicDir, normalized));
  const uploadsRoot = resolve(join(publicDir, 'uploads'));
  if (target === uploadsRoot) {
    return null;
  }
  if (!target.startsWith(uploadsRoot + sep)) {
    return null;
  }
  return target;
}

/**
 * @param {string} entryName
 * @returns {string|null} blob pathname (uploads/…)
 */
function safeBlobPathname(entryName) {
  const normalized = entryName.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    return null;
  }
  if (!normalized.startsWith('uploads/')) {
    return null;
  }
  return normalized;
}

/**
 * Extract a zip (layout `uploads/**`) to disk or re-upload to Blob based on configuration.
 * @param {Buffer} zipBuffer
 * @param {{ overwrite?: boolean }} [options]
 * @returns {Promise<{ extractedFiles: number, skipped: number, storage: 'disk' | 'blob' }>}
 */
export async function importUploadsFromZip(zipBuffer, options = {}) {
  if (useBlobStorage()) {
    return importUploadsToBlob(zipBuffer, options);
  }
  return importUploadsToDisk(zipBuffer, options);
}

async function importUploadsToDisk(zipBuffer, options) {
  const overwrite = options.overwrite !== false;
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  let extractedFiles = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (entry.isDirectory) {
      continue;
    }
    const target = safeResolveDiskTarget(entry.entryName);
    if (!target) {
      skipped += 1;
      continue;
    }
    if (!overwrite && existsSync(target)) {
      skipped += 1;
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    await writeFileAsync(target, entry.getData());
    extractedFiles += 1;
  }

  return { extractedFiles, skipped, storage: 'disk' };
}

async function importUploadsToBlob(zipBuffer, options) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is required to import uploads into Vercel Blob.',
    );
  }

  const { put } = await import('@vercel/blob');
  const overwrite = options.overwrite !== false;

  /** @type {Set<string>} */
  let existing = null;
  if (!overwrite) {
    const listed = await listAllBlobsWithPrefix('uploads/');
    existing = new Set(listed.map((b) => b.pathname));
  }

  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  let extractedFiles = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (entry.isDirectory) {
      continue;
    }
    const pathname = safeBlobPathname(entry.entryName);
    if (!pathname) {
      skipped += 1;
      continue;
    }
    if (existing && existing.has(pathname)) {
      skipped += 1;
      continue;
    }

    const body = entry.getData();
    const ext = pathname.toLowerCase();
    const contentType = ext.endsWith('.ico')
      ? 'image/x-icon'
      : guessContentType(pathname);

    await put(pathname, body, {
      access: 'public',
      contentType,
    });
    extractedFiles += 1;
  }

  return { extractedFiles, skipped, storage: 'blob' };
}
