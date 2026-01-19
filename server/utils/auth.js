/**
 * Authentication Utilities
 * Legacy compatibility layer - most auth logic moved to authService.js
 * This file is kept for backward compatibility with existing code
 * 
 * @deprecated Use authService.js for new code
 */

import { 
  generateAccessToken,
  verifyAccessToken,
  extractTokenFromHeader as extractToken,
  createAuthErrorResponse as createError,
  createAuthSuccessResponse as createSuccess
} from '../services/authService.js';

/**
 * @deprecated Use authService.generateAccessToken instead
 */
export function generateToken(userData) {
  return generateAccessToken(userData);
}

/**
 * @deprecated Use authService.verifyAccessToken instead
 */
export function verifyToken(token) {
  return verifyAccessToken(token);
}

/**
 * @deprecated Use authService.extractTokenFromHeader instead
 */
export function extractTokenFromHeader(authHeader) {
  return extractToken(authHeader);
}

/**
 * @deprecated Use authService.createAuthErrorResponse instead
 */
export function createAuthErrorResponse(message, statusCode = 401) {
  return createError(message, statusCode);
}

/**
 * @deprecated Use authService.createAuthSuccessResponse instead
 */
export function createAuthSuccessResponse(data) {
  return createSuccess(data);
}
