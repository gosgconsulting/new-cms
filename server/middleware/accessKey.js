import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState } from '../utils/database.js';

// Access key authentication middleware
export const authenticateWithAccessKey = async (req, res, next) => {
  try {
    // Safely get database state with error handling
    let dbState;
    try {
      dbState = getDatabaseState();
    } catch (stateError) {
      console.error('[testing] Error getting database state in access key middleware:', stateError);
      // If we can't get database state, allow the request to continue
      // (login/register endpoints will handle their own database checks)
      return next();
    }
    
    const { dbInitialized, dbInitializationError } = dbState;
    
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

    // Extract Access key from headers (only from x-access-key header, not Authorization)
    // This allows JWT tokens in Authorization header to be handled by authenticateUser middleware
    const accessKey = req.headers['x-access-key'] || 
                   req.headers['X-Access-Key'] || null;
    
    if (!accessKey) {
      return next(); // No access key provided, continue to next middleware
    }

    // Verify the access key
    const result = await query(`
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
    `, [accessKey]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired access key'
      });
    }

    const keyData = result.rows[0];

    // Check if user is active
    if (!keyData.is_active) {
      return res.status(401).json({
        success: false,
        error: 'User account is not active'
      });
    }

    // Set user data in request object
    req.user = {
      id: keyData.id,
      first_name: keyData.first_name,
      last_name: keyData.last_name,
      email: keyData.email,
      role: keyData.role,
      tenant_id: keyData.tenant_id,
      is_super_admin: keyData.is_super_admin
    };

    // Set tenant ID based on user type (same logic as authenticateUser)
    if (keyData.is_super_admin) {
      req.tenantId = req.query.tenantId || req.headers['x-tenant-id'] || keyData.tenant_id;
    } else {
      req.tenantId = keyData.tenant_id;
    }

    // Update last_used_at timestamp
    await query(
      'UPDATE user_access_keys SET last_used_at = NOW() WHERE id = $1',
      [keyData.key_id]
    );

    next();
  } catch (error) {
    console.error('[testing] Error in access key authentication:', error);
    console.error('[testing] Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    
    // Handle database not ready errors gracefully
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      let dbState;
      try {
        dbState = getDatabaseState();
        if (!dbState.dbInitialized) {
          return res.status(503).json({
            success: false,
            error: 'Database is initializing',
            message: 'Please try again in a moment'
          });
        }
      } catch (stateError) {
        // If we can't get database state, return a generic error
        console.error('[testing] Error getting database state in catch block:', stateError);
      }
    }
    
    // For login/register endpoints, don't block with access key errors
    // Let them handle their own authentication
    if (req.path === '/auth/login' || req.path === '/auth/register') {
      return next();
    }
    
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: process.env.NODE_ENV === 'development' 
        ? `Access key authentication failed: ${error?.message || 'Unknown error'}`
        : 'Authentication error. Please try again.'
    });
  }
};

