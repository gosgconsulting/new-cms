// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/middleware/auth.js:1',message:'About to import utils/auth.js',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'P'})}).catch(()=>{});
// #endregion
import { verifyToken, extractTokenFromHeader, createAuthErrorResponse } from '../utils/auth.js';
// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/middleware/auth.js:4',message:'utils/auth.js imported successfully',data:{hasVerifyToken:!!verifyToken,hasExtractToken:!!extractTokenFromHeader,hasCreateError:!!createAuthErrorResponse},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'P'})}).catch(()=>{});
// #endregion

/**
 * Authentication middleware
 * Uses centralized auth utilities for consistency
 */
export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json(createAuthErrorResponse('Not authenticated'));
    }

    // Development shortcut: accept a special dev super admin token
    if (process.env.NODE_ENV === 'development' && token === 'dev-super-admin-token') {
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

    // Normal JWT verification using centralized utility
    try {
      const decoded = verifyToken(token);
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