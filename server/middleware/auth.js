import { 
  verifyAccessToken, 
  extractTokenFromHeader, 
  createAuthErrorResponse 
} from '../services/authService.js';

/**
 * Authentication middleware
 * Verifies JWT access tokens and attaches user to request
 */
export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json(createAuthErrorResponse('Not authenticated'));
    }

    // Verify JWT token using auth service
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      return next();
    } catch (error) {
      const errorMessage = error.message || 'Invalid or expired token';
      return res.status(401).json(createAuthErrorResponse(errorMessage));
    }
  } catch (error) {
    console.error('[auth] Authentication middleware error:', error);
    return res.status(500).json(createAuthErrorResponse('Authentication middleware error', 500));
  }
};

/**
 * Development-only authentication middleware
 * Allows dev shortcuts for local development
 * NEVER use in production
 */
export const authenticateUserDev = (req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return authenticateUser(req, res, next);
  }

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json(createAuthErrorResponse('Not authenticated'));
    }

    // Development shortcut: accept a special dev super admin token
    if (token === 'dev-super-admin-token') {
      req.user = {
        id: 'dev-super-admin',
        first_name: 'Dev',
        last_name: 'Admin',
        email: 'admin@local.dev',
        role: 'admin',
        tenant_id: null,
        is_super_admin: true
      };
      return next();
    }

    // Normal JWT verification
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      return next();
    } catch (error) {
      const errorMessage = error.message || 'Invalid or expired token';
      return res.status(401).json(createAuthErrorResponse(errorMessage));
    }
  } catch (error) {
    console.error('[auth] Authentication middleware error:', error);
    return res.status(500).json(createAuthErrorResponse('Authentication middleware error', 500));
  }
};