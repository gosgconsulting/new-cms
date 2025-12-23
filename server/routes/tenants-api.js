import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState } from '../utils/database.js';

const router = express.Router();

const successResponse = (data, tenantId = null) => ({
  success: true,
  data,
  meta: {
    tenant_id: tenantId,
    timestamp: new Date().toISOString()
  }
});

const errorResponse = (error, code = 'ERROR', status = 500) => ({
  success: false,
  error: error instanceof Error ? error.message : error,
  code: code || 'ERROR'
});

/**
 * GET /api/tenants/by-slug/:slug
 * Get tenant by slug (public endpoint, no authentication required)
 * This is used by client-side to fetch tenant information
 */
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready first
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          success: false,
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        success: false,
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    const slug = req.params.slug;
    
    if (!slug) {
      return res.status(400).json(errorResponse('Slug is required', 'MISSING_SLUG', 400));
    }

    // Query database to find tenant by slug
    const tenantResult = await query(`
      SELECT id, name, slug, created_at, updated_at, theme_id
      FROM tenants
      WHERE slug = $1
      LIMIT 1
    `, [slug]);

    if (tenantResult.rows.length === 0) {
      return res.status(404).json(errorResponse('Tenant not found', 'TENANT_NOT_FOUND', 404));
    }

    const tenant = tenantResult.rows[0];
    
    res.json(successResponse(tenant));
  } catch (error) {
    console.error('[testing] Error fetching tenant by slug:', error);
    
    // Handle database not ready errors gracefully
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      const { dbInitialized } = getDatabaseState();
      if (!dbInitialized) {
        return res.status(503).json({
          success: false,
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    res.status(500).json(errorResponse(error, 'FETCH_TENANT_ERROR'));
  }
});

/**
 * GET /api/tenants/by-theme/:themeId
 * Get all tenants using a specific theme
 * Requires authentication - users can only see tenants they have access to
 */
router.get('/by-theme/:themeId', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready first
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          success: false,
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        success: false,
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    const themeId = req.params.themeId;
    
    if (!themeId) {
      return res.status(400).json(errorResponse('Theme ID is required', 'MISSING_THEME_ID', 400));
    }

    // Query database to find all tenants using this theme
    let queryText = `
      SELECT id, name, slug, theme_id, created_at, updated_at
      FROM tenants
      WHERE theme_id = $1
      ORDER BY created_at DESC
    `;
    let queryParams = [themeId];
    
    // If user is authenticated and not super admin, filter to only their tenant
    if (req.user && !req.user.is_super_admin && req.user.tenant_id) {
      queryText = `
        SELECT id, name, slug, theme_id, created_at, updated_at
        FROM tenants
        WHERE theme_id = $1 AND id = $2
        ORDER BY created_at DESC
      `;
      queryParams = [themeId, req.user.tenant_id];
    }

    const tenantsResult = await query(queryText, queryParams);

    res.json(successResponse({ tenants: tenantsResult.rows }));
  } catch (error) {
    console.error('[testing] Error fetching tenants by template:', error);
    
    // Handle database not ready errors gracefully
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      const { dbInitialized } = getDatabaseState();
      if (!dbInitialized) {
        return res.status(503).json({
          success: false,
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    res.status(500).json(errorResponse(error, 'FETCH_TENANTS_BY_THEME_ERROR'));
  }
});

export default router;
