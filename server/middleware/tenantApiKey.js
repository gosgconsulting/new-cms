import { validateApiKey } from '../../sparti-cms/db/tenant-management.js';

// Tenant API key authentication middleware for public API
export const authenticateTenantApiKey = async (req, res, next) => {
  try {
    // Extract API key from headers
    const apiKey = req.headers['x-api-key'] || 
                   req.headers['X-API-Key'] ||
                   (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                     ? req.headers.authorization.substring(7) 
                     : null);
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required',
        code: 'MISSING_API_KEY'
      });
    }

    // Validate the API key
    const validation = await validateApiKey(apiKey);
    
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired API key',
        code: 'INVALID_API_KEY'
      });
    }

    // Set tenant ID from validated key
    req.tenantId = validation.tenant.tenant_id;
    
    next();
  } catch (error) {
    console.error('[testing] Error in tenant API key authentication:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

