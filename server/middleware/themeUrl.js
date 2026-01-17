import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState } from '../utils/database.js';

/**
 * Middleware to extract theme slug from URL and find tenants with that theme
 * Works with routes like /theme/:themeSlug/admin or /theme/:themeSlug/auth
 * Sets req.themeSlug and req.themeTenants (array of tenants using this theme)
 */
export const extractThemeFromUrl = async (req, res, next) => {
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

    // Extract theme slug from URL params
    // This works with routes like /theme/:themeSlug/admin
    const themeSlug = req.params.themeSlug;
    
    if (!themeSlug) {
      return res.status(400).json({
        success: false,
        error: 'Theme slug is required',
        code: 'MISSING_THEME_SLUG'
      });
    }

    // Query database to find all tenants using this theme
    const tenantsResult = await query(`
      SELECT id, name, slug, theme_id, created_at, updated_at
      FROM tenants
      WHERE theme_id = $1
      ORDER BY created_at DESC
    `, [themeSlug]);

    // Set theme information on request object
    req.themeSlug = themeSlug;
    req.themeTenants = tenantsResult.rows || [];
    
    // If a user is authenticated, validate tenant-theme relationship
    if (req.user && !req.user.is_super_admin) {
      // For non-super-admin users, validate that their tenant uses this theme
      if (req.user.tenant_id) {
        // Check if user's tenant uses the requested theme
        const userTenantUsesTheme = req.themeTenants.some(
          tenant => tenant.id === req.user.tenant_id
        );
        
        if (!userTenantUsesTheme) {
          // User's tenant doesn't use this theme - access denied
          return res.status(403).json({
            success: false,
            error: 'Access denied',
            message: 'Your tenant does not use this theme. You can only access themes assigned to your tenant.',
            code: 'TENANT_THEME_MISMATCH'
          });
        }
        
        // User's tenant uses this theme - set it as the primary tenant
        const userTenant = req.themeTenants.find(
          tenant => tenant.id === req.user.tenant_id
        );
        req.tenantId = req.user.tenant_id;
        req.tenant = userTenant;
        // Filter to only show user's tenant
        req.themeTenants = [userTenant];
      } else {
        // User has no tenant_id - this shouldn't happen for non-super-admins, but deny access
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'Your account is not associated with a tenant.',
          code: 'NO_TENANT_ASSOCIATED'
        });
      }
    } else if (req.themeTenants.length > 0) {
      // For super admins or unauthenticated users, use the first tenant as default
      // In practice, they should select which tenant to use
      req.tenantId = req.themeTenants[0].id;
      req.tenant = req.themeTenants[0];
    }

    next();
  } catch (error) {
    console.error('[testing] Error in theme URL extraction:', error);
    
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
      error: 'Error extracting theme from URL',
      code: 'THEME_EXTRACTION_ERROR'
    });
  }
};

