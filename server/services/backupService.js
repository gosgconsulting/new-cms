/**
 * Backup Service
 * Automated per-tenant backups using the existing fetchTenantData export logic.
 * Stores JSON snapshots in Vercel Blob under backups/{tenantId}/{date}.json
 * @module server/services/backupService
 */

import { query } from '../../sparti-cms/db/index.js';

// Re-use the exact same data-fetching logic from the export service
// (import the internal helper; we don't need the Express res-based streaming wrapper)
import { fetchTenantDataForBackup } from './tenantImportExportService.js';

const EXPORT_VERSION = 1;

/**
 * Upload a JSON string to Vercel Blob.
 * @param {string} pathname - e.g. "backups/tenant-abc/2026-02-23.json"
 * @param {string} jsonString
 * @returns {Promise<{ url: string, size: number } | null>}
 */
async function uploadJsonToBlob(pathname, jsonString) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        console.warn('[backup] BLOB_READ_WRITE_TOKEN not set — cannot store backup');
        return null;
    }
    try {
        const { put } = await import('@vercel/blob');
        const blob = await put(pathname, jsonString, {
            access: 'public',
            contentType: 'application/json',
        });
        return { url: blob.url, size: jsonString.length };
    } catch (error) {
        console.error('[backup] Blob upload failed:', error?.message || error);
        return null;
    }
}

/**
 * Backup a single tenant — fetch data, wrap in export payload, upload to Blob.
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

        const result = await uploadJsonToBlob(pathname, jsonString);
        if (!result) {
            return { tenantId, success: false, error: 'Blob upload failed or not configured' };
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
 * List available backups for a tenant from Vercel Blob.
 * @param {string} tenantId
 * @returns {Promise<Array<{ url: string, pathname: string, size: number, uploadedAt: string }>>}
 */
export async function listBackups(tenantId) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return [];

    try {
        const { list } = await import('@vercel/blob');
        const prefix = `backups/${tenantId}/`;
        const { blobs } = await list({ prefix });

        return blobs
            .map((b) => ({
                url: b.url,
                pathname: b.pathname,
                size: b.size,
                uploadedAt: b.uploadedAt,
            }))
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } catch (error) {
        console.error(`[backup] listBackups failed for ${tenantId}:`, error);
        return [];
    }
}

/**
 * Delete a specific backup by URL.
 * @param {string} url - Blob URL to delete
 * @returns {Promise<boolean>}
 */
export async function deleteBackup(url) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return false;

    try {
        const { del } = await import('@vercel/blob');
        await del(url);
        return true;
    } catch (error) {
        console.error('[backup] deleteBackup failed:', error);
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
