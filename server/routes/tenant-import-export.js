/**
 * Tenant Import/Export API
 * GET /api/tenant-export - single JSON of tenant data (metadata + data; all media URLs absolute)
 * POST /api/tenant-import - accept JSON body and import into current tenant (media URLs already set by frontend)
 */

import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { streamTenantExport, importTenantData } from '../services/tenantImportExportService.js';

const router = express.Router();

/**
 * Resolve tenant ID for the request (user's tenant or query override for super-admin).
 */
function getTenantId(req) {
  const tenantId = req.tenantId || req.query.tenantId || req.body?.tenantId || req.user?.tenant_id;
  return tenantId;
}

/**
 * Base URL for export (absolute media URLs). Prefer env, then request.
 */
function getBaseUrl(req) {
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return req && req.protocol && req.get && req.get('host')
    ? `${req.protocol}://${req.get('host')}`
    : '';
}

/**
 * GET /api/tenant-export
 * Single JSON export for the current tenant (all media URLs absolute).
 */
router.get('/tenant-export', authenticateUser, async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    const isSuperAdmin = req.user?.is_super_admin === true;
    if (!isSuperAdmin && req.user?.tenant_id && req.user.tenant_id !== tenantId) {
      return res.status(403).json({ error: 'You can only export your own tenant data' });
    }
    const baseUrl = getBaseUrl(req);
    await streamTenantExport(tenantId, res, baseUrl);
  } catch (error) {
    console.error('[testing] tenant-export error:', error);
    res.status(500).json({ error: error.message || 'Export failed' });
  }
});

/**
 * POST /api/tenant-import
 * Accept JSON body (single export payload). Media URLs in payload are used as-is.
 */
router.post('/tenant-import', authenticateUser, async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    const isSuperAdmin = req.user?.is_super_admin === true;
    if (!isSuperAdmin && req.user?.tenant_id && req.user.tenant_id !== tenantId) {
      return res.status(403).json({ error: 'You can only import into your own tenant' });
    }
    const payload = req.body;
    if (!payload || typeof payload !== 'object' || payload.version === undefined) {
      return res.status(400).json({ error: 'Invalid payload: expected export JSON with version.' });
    }
    const result = await importTenantData(tenantId, payload);
    res.json(result);
  } catch (error) {
    console.error('[testing] tenant-import error:', error);
    res.status(500).json({ error: error.message || 'Import failed' });
  }
});

export default router;
