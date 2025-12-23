import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState } from '../utils/database.js';

/**
 * Middleware to extract tenant slug from URL and set req.tenantId
 * Works with routes like /tenants/:tenantSlug
 */
export const extractTenantFromUrl = async (req, res, next) => {
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

    // Extract tenant slug from URL params
    // This works with routes like /tenants/:tenantSlug
    const tenantSlug = req.params.tenantSlug;
    
    if (!tenantSlug) {
      return res.status(400).json({
        success: false,
        error: 'Tenant slug is required',
        code: 'MISSING_TENANT_SLUG'
      });
    }

    // Query database to find tenant by slug
    const tenantResult = await query(`
      SELECT id, name, slug, created_at, updated_at
      FROM tenants
      WHERE slug = $1
      LIMIT 1
    `, [tenantSlug]);

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      });
    }

    const tenant = tenantResult.rows[0];

    // Set tenant information on request object
    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;
    req.tenant = tenant;

    next();
  } catch (error) {
    console.error('[testing] Error in tenant URL extraction:', error);
    
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
    
    return res.status(500).json({
      success: false,
      error: 'Error extracting tenant from URL',
      code: 'TENANT_EXTRACTION_ERROR'
    });
  }
};

