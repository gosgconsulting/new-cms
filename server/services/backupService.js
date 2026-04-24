/**
 * Backup Service
 * Automated per-tenant backups using the existing fetchTenantData export logic.
 * Stores JSON in Vercel Blob when BLOB_READ_WRITE_TOKEN is set; otherwise (or on Blob failure)
 * writes to public/uploads/backups/{tenantId}/{date}.json (served as /uploads/backups/...).
 * @module server/services/backupService
 */

import { mkdir, writeFile, readdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve, sep } from 'path';
import { query } from '../../sparti-cms/db/index.js';
import { getUploadsDir } from '../utils/uploads.js';

// Re-use the exact same data-fetching logic from the export service
// (import the internal helper; we don't need the Express res-based streaming wrapper)
import { fetchTenantDataForBackup } from './tenantImportExportService.js';

const EXPORT_VERSION = 1;

function isBlobConfigured() {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function getLocalBackupsRoot() {
    return join(getUploadsDir(), 'backups');
}

/**
 * @param {string} tenantId
 * @param {string} date - YYYY-MM-DD
 * @param {string} jsonString
 * @returns {Promise<{ url: string, size: number, pathname: string }>}
 */
async function writeJsonBackupToLocalDisk(tenantId, date, jsonString) {
    const dir = join(getLocalBackupsRoot(), tenantId);
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, `${date}.json`);
    await writeFile(filePath, jsonString, 'utf8');
    const pathname = `backups/${tenantId}/${date}.json`;
    const url = `/uploads/backups/${tenantId}/${date}.json`;
    return { url, size: Buffer.byteLength(jsonString, 'utf8'), pathname };
}

/**
 * @param {string} tenantId
 * @returns {Promise<Array<{ url: string, pathname: string, size: number, uploadedAt: string }>>}
 */
async function listLocalBackups(tenantId) {
    const dir = join(getLocalBackupsRoot(), tenantId);
    if (!existsSync(dir)) {
        return [];
    }
    const names = await readdir(dir);
    const out = [];
    for (const name of names) {
        if (!name.endsWith('.json')) {
            continue;
        }
        const filePath = join(dir, name);
        const st = await stat(filePath);
        if (!st.isFile()) {
            continue;
        }
        const date = name.replace(/\.json$/i, '');
        out.push({
            url: `/uploads/backups/${tenantId}/${date}.json`,
            pathname: `backups/${tenantId}/${date}.json`,
            size: st.size,
            uploadedAt: st.mtime.toISOString(),
        });
    }
    return out.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

/**
 * Resolve a backup file on disk from a public URL or path (same origin /uploads/backups/...).
 * @param {string} url
 * @returns {string | null} absolute file path
 */
function resolveLocalBackupPathFromUrl(url) {
    let pathname;
    try {
        pathname = new URL(url).pathname;
    } catch {
        pathname = url.startsWith('/') ? url : `/${url}`;
    }
    if (!pathname.startsWith('/uploads/backups/')) {
        return null;
    }
    const rel = pathname.slice('/uploads/'.length);
    if (rel.includes('..')) {
        return null;
    }
    const backupsRoot = resolve(join(getUploadsDir(), 'backups'));
    const resolved = resolve(join(getUploadsDir(), rel));
    if (resolved !== backupsRoot && !resolved.startsWith(backupsRoot + sep)) {
        return null;
    }
    return resolved;
}

/**
 * Upload a JSON string to Vercel Blob.
 * @param {string} pathname - e.g. "backups/tenant-abc/2026-02-23.json"
 * @param {string} jsonString
 * @returns {Promise<{ url: string, size: number, pathname: string } | null>}
 */
async function uploadJsonToBlob(pathname, jsonString) {
    if (!isBlobConfigured()) {
        return null;
    }
    try {
        const { put } = await import('@vercel/blob');
        const blob = await put(pathname, jsonString, {
            access: 'public',
            contentType: 'application/json',
        });
        return { url: blob.url, size: jsonString.length, pathname };
    } catch (error) {
        console.error('[backup] Blob upload failed:', error?.message || error);
        return null;
    }
}

/**
 * Backup a single tenant — fetch data, wrap in export payload, upload to Blob if configured, else disk.
 * @param {string} tenantId
 * @returns {Promise<{ tenantId: string, success: boolean, url?: string, size?: number, error?: string }>}
 */
export async function backupSingleTenant(tenantId) {
    try {
        const data = await fetchTenantDataForBackup(tenantId);

        const payload = {
            version: EXPORT_VERSION,
            tenantId,
            exportedAt: new Date().toISOString(),
            counts: {
                pages: data.pages.length,
                page_layouts: data.page_layouts.length,
                posts: data.posts.length,
                media: data.media.length,
                media_folders: data.media_folders.length,
                categories: data.categories.length,
                tags: data.tags.length,
            },
            ...data,
        };

        const jsonString = JSON.stringify(payload);
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const pathname = `backups/${tenantId}/${date}.json`;

        let result = await uploadJsonToBlob(pathname, jsonString);
        if (!result) {
            try {
                result = await writeJsonBackupToLocalDisk(tenantId, date, jsonString);
                console.info(`[backup] Stored backup on disk for tenant ${tenantId} (${pathname})`);
            } catch (diskErr) {
                console.error('[backup] Local disk backup failed:', diskErr?.message || diskErr);
                return {
                    tenantId,
                    success: false,
                    error: diskErr?.message || 'Backup failed (blob unavailable and disk write failed)',
                };
            }
        }

        return { tenantId, success: true, url: result.url, size: result.size };
    } catch (error) {
        console.error(`[backup] Error backing up tenant ${tenantId}:`, error);
        return { tenantId, success: false, error: error?.message || String(error) };
    }
}

/**
 * Backup all active tenants.
 * @returns {Promise<{ success: boolean, results: Array, timestamp: string }>}
 */
export async function backupAllTenants() {
    const timestamp = new Date().toISOString();
    try {
        const tenantsRes = await query('SELECT id, name FROM tenants ORDER BY id');
        const tenants = tenantsRes.rows || [];

        if (tenants.length === 0) {
            return { success: true, results: [], timestamp, message: 'No tenants found' };
        }

        const results = [];
        for (const tenant of tenants) {
            const result = await backupSingleTenant(tenant.id);
            results.push({ ...result, tenantName: tenant.name });
        }

        const allOk = results.every((r) => r.success);
        return { success: allOk, results, timestamp };
    } catch (error) {
        console.error('[backup] backupAllTenants failed:', error);
        return { success: false, results: [], timestamp, error: error?.message || String(error) };
    }
}

/**
 * List available backups for a tenant (Vercel Blob when configured, plus on-disk under public/uploads/backups).
 * @param {string} tenantId
 * @returns {Promise<Array<{ url: string, pathname: string, size: number, uploadedAt: string }>>}
 */
export async function listBackups(tenantId) {
    const local = await listLocalBackups(tenantId);
    const byPathname = new Map(local.map((e) => [e.pathname, e]));

    if (!isBlobConfigured()) {
        return Array.from(byPathname.values()).sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        );
    }

    try {
        const { list } = await import('@vercel/blob');
        const prefix = `backups/${tenantId}/`;
        const { blobs } = await list({ prefix });

        for (const b of blobs) {
            byPathname.set(b.pathname, {
                url: b.url,
                pathname: b.pathname,
                size: b.size,
                uploadedAt: b.uploadedAt,
            });
        }
    } catch (error) {
        console.error(`[backup] listBackups blob list failed for ${tenantId}:`, error);
    }

    return Array.from(byPathname.values()).sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
}

/**
 * Delete a specific backup by URL (on-disk path under /uploads/backups/ or Vercel Blob URL).
 * @param {string} url
 * @returns {Promise<boolean>}
 */
export async function deleteBackup(url) {
    const localPath = resolveLocalBackupPathFromUrl(url);
    if (localPath) {
        try {
            await unlink(localPath);
            return true;
        } catch (error) {
            console.error('[backup] deleteBackup local failed:', error);
            return false;
        }
    }

    if (!isBlobConfigured()) {
        return false;
    }

    try {
        const { del } = await import('@vercel/blob');
        await del(url);
        return true;
    } catch (error) {
        console.error('[backup] deleteBackup blob failed:', error);
        return false;
    }
}

/**
 * Delete backups older than retainDays for a given tenant.
 * @param {string} tenantId
 * @param {number} [retainDays=30]
 * @returns {Promise<{ deleted: number, errors: number }>}
 */
export async function deleteOldBackups(tenantId, retainDays = 30) {
    const backups = await listBackups(tenantId);
    const cutoff = Date.now() - retainDays * 24 * 60 * 60 * 1000;
    let deleted = 0;
    let errors = 0;

    for (const backup of backups) {
        if (new Date(backup.uploadedAt).getTime() < cutoff) {
            const ok = await deleteBackup(backup.url);
            if (ok) deleted++;
            else errors++;
        }
    }

    return { deleted, errors };
}
