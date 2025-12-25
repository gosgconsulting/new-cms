import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState } from '../utils/database.js';
import { authenticateUser } from '../middleware/auth.js';

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

/**
 * GET /api/tenants/:id/integrations/:type
 * Get integration status for a tenant
 * Requires authentication
 */
router.get('/:id/integrations/:type', authenticateUser, async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
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

    const tenantId = req.params.id;
    const integrationType = req.params.type.toLowerCase();

    // Validate integration type
    if (!['woocommerce', 'wordpress'].includes(integrationType)) {
      return res.status(400).json(errorResponse('Invalid integration type. Must be woocommerce or wordpress', 'INVALID_INTEGRATION_TYPE', 400));
    }

    // Check if user has access to this tenant
    if (!req.user.is_super_admin && req.user.tenant_id !== tenantId) {
      return res.status(403).json(errorResponse('Access denied', 'ACCESS_DENIED', 403));
    }

    // Check if tenant_integrations table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenant_integrations'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Table doesn't exist yet, return inactive
      return res.json({
        is_active: false,
        integration_type: integrationType,
        tenant_id: tenantId
      });
    }

    // Query integration status
    const result = await query(`
      SELECT is_active, config, created_at, updated_at
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = $2
      LIMIT 1
    `, [tenantId, integrationType]);

    if (result.rows.length === 0) {
      return res.json({
        is_active: false,
        integration_type: integrationType,
        tenant_id: tenantId
      });
    }

    res.json({
      is_active: result.rows[0].is_active,
      integration_type: integrationType,
      tenant_id: tenantId,
      config: result.rows[0].config,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('[testing] Error fetching integration status:', error);
    
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      // Table doesn't exist, return inactive
      return res.json({
        is_active: false,
        integration_type: req.params.type.toLowerCase(),
        tenant_id: req.params.id
      });
    }
    
    res.status(500).json(errorResponse(error, 'FETCH_INTEGRATION_ERROR'));
  }
});

/**
 * PUT /api/tenants/:id/integrations/:type
 * Update integration status for a tenant
 * Requires authentication
 */
router.put('/:id/integrations/:type', authenticateUser, async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
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

    const tenantId = req.params.id;
    const integrationType = req.params.type.toLowerCase();
    const { is_active, config } = req.body;

    // Validate integration type
    if (!['woocommerce', 'wordpress'].includes(integrationType)) {
      return res.status(400).json(errorResponse('Invalid integration type. Must be woocommerce or wordpress', 'INVALID_INTEGRATION_TYPE', 400));
    }

    // Check if user has access to this tenant
    if (!req.user.is_super_admin && req.user.tenant_id !== tenantId) {
      return res.status(403).json(errorResponse('Access denied', 'ACCESS_DENIED', 403));
    }

    // Verify tenant exists
    const tenantCheck = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);

    if (tenantCheck.rows.length === 0) {
      return res.status(404).json(errorResponse('Tenant not found', 'TENANT_NOT_FOUND', 404));
    }

    // Check if tenant_integrations table exists, create if not
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenant_integrations'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Table doesn't exist, return error suggesting migration
      return res.status(503).json({
        success: false,
        error: 'Integration table not initialized',
        message: 'Please run database migrations to create tenant_integrations table'
      });
    }

    // Upsert integration status
    const result = await query(`
      INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (tenant_id, integration_type)
      DO UPDATE SET
        is_active = EXCLUDED.is_active,
        config = EXCLUDED.config,
        updated_at = NOW()
      RETURNING is_active, config, created_at, updated_at
    `, [tenantId, integrationType, is_active || false, config || null]);

    res.json({
      success: true,
      is_active: result.rows[0].is_active,
      integration_type: integrationType,
      tenant_id: tenantId,
      config: result.rows[0].config,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('[testing] Error updating integration status:', error);
    res.status(500).json(errorResponse(error, 'UPDATE_INTEGRATION_ERROR'));
  }
});

export default router;
