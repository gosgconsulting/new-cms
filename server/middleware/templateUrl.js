import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState } from '../utils/database.js';

/**
 * Middleware to extract template slug from URL and find tenants with that template
 * Works with routes like /template/:templateSlug/admin or /template/:templateSlug/auth
 * Sets req.templateSlug and req.templateTenants (array of tenants using this template)
 */
export const extractTemplateFromUrl = async (req, res, next) => {
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

    // Extract template slug from URL params
    // This works with routes like /template/:templateSlug/admin
    const templateSlug = req.params.templateSlug;
    
    if (!templateSlug) {
      return res.status(400).json({
        success: false,
        error: 'Template slug is required',
        code: 'MISSING_TEMPLATE_SLUG'
      });
    }

    // Query database to find all tenants using this template
    const tenantsResult = await query(`
      SELECT id, name, slug, template_id, created_at, updated_at
      FROM tenants
      WHERE template_id = $1
      ORDER BY created_at DESC
    `, [templateSlug]);

    // Set template information on request object
    req.templateSlug = templateSlug;
    req.templateTenants = tenantsResult.rows || [];
    
    // If a user is authenticated, filter to only their tenant if they're not a super admin
    if (req.user && !req.user.is_super_admin) {
      // Filter tenants to only include the user's tenant
      req.templateTenants = req.templateTenants.filter(
        tenant => tenant.id === req.user.tenant_id
      );
      
      // If user has a tenant_id, set it as the primary tenant for this request
      if (req.user.tenant_id && req.templateTenants.length > 0) {
        req.tenantId = req.user.tenant_id;
        req.tenant = req.templateTenants[0];
      }
    } else if (req.templateTenants.length > 0) {
      // For super admins or unauthenticated users, use the first tenant as default
      // In practice, they should select which tenant to use
      req.tenantId = req.templateTenants[0].id;
      req.tenant = req.templateTenants[0];
    }

    next();
  } catch (error) {
    console.error('[testing] Error in template URL extraction:', error);
    
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
      error: 'Error extracting template from URL',
      code: 'TEMPLATE_EXTRACTION_ERROR'
    });
  }
};

