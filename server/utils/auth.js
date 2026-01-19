// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/utils/auth.js:1',message:'Starting utils/auth.js imports',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'Q'})}).catch(()=>{});
// #endregion

// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/utils/auth.js:4',message:'About to import jsonwebtoken',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'Q'})}).catch(()=>{});
// #endregion
import jwt from 'jsonwebtoken';
// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/utils/auth.js:7',message:'jsonwebtoken imported successfully',data:{hasJwt:!!jwt},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'Q'})}).catch(()=>{});
// #endregion

// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/utils/auth.js:10',message:'About to import config/constants.js',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'R'})}).catch(()=>{});
// #endregion
import { JWT_SECRET } from '../config/constants.js';
// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/utils/auth.js:13',message:'config/constants.js imported successfully',data:{hasJwtSecret:!!JWT_SECRET},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'R'})}).catch(()=>{});
// #endregion

/**
 * Centralized JWT token generation
 * Single source of truth for token creation
 */
export function generateToken(userData) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    return jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });
  } catch (error) {
    console.error('[auth] Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Centralized JWT token verification
 * Single source of truth for token verification
 */
export function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Standardized error response for auth failures
 */
export function createAuthErrorResponse(message, statusCode = 401) {
  return {
    success: false,
    error: message,
    statusCode
  };
}

/**
 * Standardized success response for auth operations
 */
export function createAuthSuccessResponse(data) {
  return {
    success: true,
    ...data
  };
}
