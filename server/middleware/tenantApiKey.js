import { validateApiKey } from '../../sparti-cms/db/tenant-management.js';
import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState } from '../utils/database.js';
import { verifyAccessToken, extractTokenFromHeader } from '../services/authService.js';

/**
 * If req.user is not set, try to set it from JWT in Authorization: Bearer.
 * JWTs are identified by having two dots (three base64 parts). Does nothing if no Bearer token or not a JWT.
 */
async function attachUserFromJwtIfPresent(req) {
  if (req.user) return;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = extractTokenFromHeader(authHeader);
  if (!token || token.split('.').length !== 3) return;
  try {
    const decoded = verifyAccessToken(token);
    const userId = decoded.id ?? decoded.userId;
    if (!userId) return;
    const userResult = await query(
      `SELECT id, first_name, last_name, email, role, tenant_id,
              COALESCE(is_super_admin, false) as is_super_admin
       FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    if (userResult.rows.length > 0) {
      const row = userResult.rows[0];
      req.user = {
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        role: row.role,
        tenant_id: row.tenant_id,
        is_super_admin: row.is_super_admin
      };
    }
  } catch (_) {
    // Invalid or expired JWT; leave req.user unset
  }
}

// Tenant API key authentication middleware for public API
// Supports both tenant API keys and user access keys for smooth migration
export const authenticateTenantApiKey = async (req, res, next) => {
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

    // Extract API key from headers (primary authentication method).
    // Use X-API-Key, or Bearer only when it's not a JWT (so JWT can be used with X-Tenant-Id for user-only auth).
    const bearerToken = (req.headers.authorization || req.headers['authorization'] || '').startsWith('Bearer ')
      ? (req.headers.authorization || req.headers['authorization'] || '').substring(7).trim()
      : null;
    const isLikelyJwt = bearerToken && bearerToken.split('.').length === 3;
    const apiKey = req.headers['x-api-key'] ||
                   req.headers['X-API-Key'] ||
                   (bearerToken && !isLikelyJwt ? bearerToken : null);
    
    // Extract tenant ID from headers or query params (fallback for public tenant pages)
    const tenantIdFromHeader = req.headers['x-tenant-id'] || req.headers['X-Tenant-Id'];
    const tenantIdFromQuery = req.query.tenantId;

    // Primary: Try API key authentication (most secure)
    if (apiKey) {
      // First, try to validate as tenant API key
      const validation = await validateApiKey(apiKey);
      
      if (validation.valid) {
        // Set tenant ID from validated tenant API key
        req.tenantId = validation.tenant.tenant_id;
        await attachUserFromJwtIfPresent(req);
        return next();
      }

      // If tenant API key validation failed, try user access key as fallback.
      // Normalize key (trim, lowercase) so lookup matches DB regardless of header formatting.
      const userAccessKeyLookup = String(apiKey).trim().toLowerCase();
      const userKeyResult = await query(`
        SELECT 
          uak.id as key_id,
          uak.access_key,
          uak.key_name,
          uak.last_used_at,
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          u.is_active,
          u.tenant_id,
          u.is_super_admin
        FROM user_access_keys uak
        JOIN users u ON uak.user_id = u.id
        WHERE uak.access_key = $1 AND uak.is_active = true
      `, [userAccessKeyLookup]);

      if (userKeyResult.rows.length > 0) {
        const keyData = userKeyResult.rows[0];

        // Check if user is active
        if (!keyData.is_active) {
          return res.status(401).json({
            success: false,
            error: 'User account is not active',
            code: 'USER_INACTIVE'
          });
        }

        // Set tenant ID from user access key
        // For super admins, allow tenant override via query param or header
        if (keyData.is_super_admin) {
          req.tenantId = tenantIdFromQuery || tenantIdFromHeader || keyData.tenant_id;
        } else {
          req.tenantId = keyData.tenant_id;
        }

        // Optionally set user data for user access keys (useful for logging/auditing)
        req.user = {
          id: keyData.id,
          first_name: keyData.first_name,
          last_name: keyData.last_name,
          email: keyData.email,
          role: keyData.role,
          tenant_id: keyData.tenant_id,
          is_super_admin: keyData.is_super_admin
        };

        // Update last_used_at timestamp for user access keys
        await query(
          'UPDATE user_access_keys SET last_used_at = NOW() WHERE id = $1',
          [keyData.key_id]
        );
        
        return next();
      }

      // API key was provided but matched neither tenant nor user access key
      return res.status(401).json({
        success: false,
        error: 'Invalid or unknown API key. Use a tenant API key, a user access key from the CMS, or send X-Tenant-Id (and optionally Authorization: Bearer <JWT> for user).',
        code: 'INVALID_API_KEY'
      });
    }

    // Fallback: Try tenant ID from header or query param (for public tenant pages)
    const tenantId = tenantIdFromHeader || tenantIdFromQuery;
    
    if (tenantId) {
      // Validate that the tenant exists and is active
      const tenantResult = await query(`
        SELECT id, name, slug
        FROM tenants
        WHERE id = $1
        LIMIT 1
      `, [tenantId]);

      if (tenantResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
      }

      // Set tenant ID from validated tenant
      req.tenantId = tenantResult.rows[0].id;
      await attachUserFromJwtIfPresent(req);
      return next();
    }

    // No authentication method provided
    return res.status(401).json({
      success: false,
      error: 'API key or tenant ID is required',
      code: 'MISSING_AUTH'
    });
  } catch (error) {
    console.error('[testing] Error in tenant API key authentication:', error);
    
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
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

