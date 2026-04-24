/**
 * Backup Routes
 * - POST /api/cron/tenant-backup  — Vercel Cron trigger (auth via CRON_SECRET)
 * - GET  /api/backups              — List backups for a tenant
 * - POST /api/backups/trigger      — Manually trigger a single-tenant backup
 * - DELETE /api/backups            — Delete a specific backup by URL
 * - GET  /api/backups/uploads/export   — Super admin: zip uploads (disk: public/uploads; Blob: list prefix uploads/)
 * - POST /api/backups/uploads/import   — Super admin: restore zip to disk or re-upload to Blob (multipart field `file`)
 */

import express from 'express';
import multer from 'multer';
import { readFile, unlink } from 'fs/promises';
import os from 'os';
import { authenticateUser } from '../middleware/auth.js';
import {
    backupAllTenants,
    backupSingleTenant,
    listBackups,
    deleteBackup,
    deleteOldBackups,
} from '../services/backupService.js';
import {
    backupAllUploadsToZip,
    importUploadsFromZip,
} from '../services/uploadsBackupService.js';

const router = express.Router();

const uploadsBackupImport = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 512 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const name = (file.originalname || '').toLowerCase();
        const ok =
            name.endsWith('.zip') ||
            file.mimetype === 'application/zip' ||
            file.mimetype === 'application/x-zip-compressed';
        if (ok) {
            cb(null, true);
        } else {
            cb(new Error('Only .zip archives are accepted'));
        }
    },
});

/* ------------------------------------------------------------------ */
/*  Cron endpoint — Vercel sends Authorization: Bearer <CRON_SECRET>  */
/* ------------------------------------------------------------------ */

router.all('/cron/tenant-backup', async (req, res) => {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return res.status(500).json({ error: 'CRON_SECRET not configured' });
    }

    const authHeader = req.headers.authorization || '';
    if (authHeader !== `Bearer ${secret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await backupAllTenants();

        // Clean up old backups (> 30 days) after successful run
        if (result.success && result.results.length > 0) {
            for (const r of result.results) {
                if (r.success) {
                    await deleteOldBackups(r.tenantId, 30).catch(() => { });
                }
            }
        }

        const status = result.success ? 200 : 207; // 207 = partial success
        res.status(status).json(result);
    } catch (error) {
        console.error('[backup] Cron handler error:', error);
        res.status(500).json({ error: error?.message || 'Backup failed' });
    }
});

/* ------------------------------------------------------------------ */
/*  Authenticated endpoints (access key / JWT)                        */
/* ------------------------------------------------------------------ */

/**
 * GET /api/backups?tenantId=...
 * List backups for a tenant.
 */
router.get('/backups', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.query.tenantId || req.tenantId || req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json({ error: 'tenantId is required' });
        }

        // Non-super-admin can only see own tenant
        if (!req.user?.is_super_admin && req.user?.tenant_id && req.user.tenant_id !== tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const backups = await listBackups(tenantId);
        res.json({ success: true, backups });
    } catch (error) {
        console.error('[backup] List error:', error);
        res.status(500).json({ error: error?.message || 'Failed to list backups' });
    }
});

/**
 * POST /api/backups/trigger
 * Manually trigger a backup for a single tenant.
 * Body: { tenantId: "..." }
 */
router.post('/backups/trigger', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.body?.tenantId || req.tenantId || req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json({ error: 'tenantId is required' });
        }

        if (!req.user?.is_super_admin && req.user?.tenant_id && req.user.tenant_id !== tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await backupSingleTenant(tenantId);
        res.json(result);
    } catch (error) {
        console.error('[backup] Trigger error:', error);
        res.status(500).json({ error: error?.message || 'Backup trigger failed' });
    }
});

/**
 * DELETE /api/backups
 * Delete a specific backup by URL.
 * Body: { url: "https://..." }
 */
router.delete('/backups', authenticateUser, async (req, res) => {
    try {
        const url = req.body?.url;
        if (!url) {
            return res.status(400).json({ error: 'url is required' });
        }

        // Verify the URL belongs to the user's tenant (basic path check)
        const tenantId = req.body?.tenantId || req.tenantId || req.user?.tenant_id;
        if (!req.user?.is_super_admin && tenantId && !url.includes(`backups/${tenantId}/`)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const deleted = await deleteBackup(url);
        res.json({ success: deleted });
    } catch (error) {
        console.error('[backup] Delete error:', error);
        res.status(500).json({ error: error?.message || 'Delete failed' });
    }
});

/**
 * GET /api/backups/uploads/export
 * Super admin only. Zip of uploads (disk or Vercel Blob, depending on env).
 */
router.get('/backups/uploads/export', authenticateUser, async (req, res) => {
    try {
        if (!req.user?.is_super_admin) {
            return res.status(403).json({ error: 'Super admin access required' });
        }
        const { buffer, entryCount, storage } = await backupAllUploadsToZip();
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `uploads-backup-${stamp}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('X-Backup-Entry-Count', String(entryCount));
        res.setHeader('X-Backup-Storage', storage);
        res.send(buffer);
    } catch (error) {
        console.error('[backup] uploads export error:', error);
        const msg = error?.message || 'Export failed';
        const status = msg.includes('BLOB_READ_WRITE_TOKEN') ? 503 : 400;
        res.status(status).json({ error: msg });
    }
});

/**
 * POST /api/backups/uploads/import
 * Super admin only. Body: multipart form with field `file` (.zip from export or compatible layout).
 */
router.post(
    '/backups/uploads/import',
    authenticateUser,
    (req, res, next) => {
        if (!req.user?.is_super_admin) {
            return res.status(403).json({ error: 'Super admin access required' });
        }
        next();
    },
    (req, res, next) => {
        uploadsBackupImport.single('file')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: err.message || 'Invalid upload' });
            }
            next();
        });
    },
    async (req, res) => {
        let tmpPath;
        try {
            if (!req.file?.path) {
                return res.status(400).json({ error: 'Missing zip file (field name: file)' });
            }
            tmpPath = req.file.path;
            const zipBuffer = await readFile(tmpPath);
            const overwrite = req.body?.overwrite !== 'false' && req.body?.overwrite !== false;
            const result = await importUploadsFromZip(zipBuffer, { overwrite });
            res.json({ success: true, ...result });
        } catch (error) {
            console.error('[backup] uploads import error:', error);
            const msg = error?.message || 'Import failed';
            const status = msg.includes('BLOB_READ_WRITE_TOKEN') ? 503 : 400;
            res.status(status).json({ error: msg });
        } finally {
            if (tmpPath) {
                await unlink(tmpPath).catch(() => { });
            }
        }
    },
);

export default router;
