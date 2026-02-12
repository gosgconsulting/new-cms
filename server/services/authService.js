import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../config/constants.js';
import { query } from '../../sparti-cms/db/index.js';

/**
 * Authentication Service
 * Handles all authentication-related business logic
 * Separates auth logic from routes and middleware
 */

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Store refresh tokens in memory (in production, use Redis or database)
const refreshTokenStore = new Map();

/**
 * Generate access token
 * Short-lived token for API access
 */
export function generateAccessToken(userData) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    return jwt.sign(userData, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  } catch (error) {
    console.error('[AuthService] Access token generation error:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate refresh token
 * Long-lived token for obtaining new access tokens
 */
export function generateRefreshToken(userData) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const refreshToken = jwt.sign(
      { userId: userData.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    
    // Store refresh token
    refreshTokenStore.set(refreshToken, {
      userId: userData.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    return refreshToken;
  } catch (error) {
    console.error('[AuthService] Refresh token generation error:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(userData) {
  return {
    accessToken: generateAccessToken(userData),
    refreshToken: generateRefreshToken(userData),
    expiresIn: ACCESS_TOKEN_EXPIRY
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token exists in store
    if (!refreshTokenStore.has(token)) {
      throw new Error('Refresh token not found or revoked');
    }
    
    const tokenData = refreshTokenStore.get(token);
    
    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      refreshTokenStore.delete(token);
      throw new Error('Refresh token has expired');
    }
    
    return decoded;
  } catch (error) {
    if (error.message.includes('Refresh token')) {
      throw error;
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Revoke refresh token
 */
export function revokeRefreshToken(token) {
  return refreshTokenStore.delete(token);
}

/**
 * Revoke all refresh tokens for a user
 */
export function revokeAllUserTokens(userId) {
  let count = 0;
  for (const [token, data] of refreshTokenStore.entries()) {
    if (data.userId === userId) {
      refreshTokenStore.delete(token);
      count++;
    }
  }
  return count;
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

  return authHeader.substring(7);
}

/**
 * Authenticate user with email and password
 */
export async function authenticateWithCredentials(email, password) {
  try {
    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status === 'inactive') {
      throw new Error('Account is inactive');
    }

    // Return user data (without password)
    const { password: _, ...userData } = user;
    return userData;
  } catch (error) {
    console.error('[AuthService] Authentication error:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user data
    const result = await query(
      'SELECT id, email, first_name, last_name, role, tenant_id, is_super_admin FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Generate new access token
    return generateAccessToken(user);
  } catch (error) {
    console.error('[AuthService] Token refresh error:', error);
    throw error;
  }
}

/**
 * Initiate password reset
 */
export async function initiatePasswordReset(email) {
  try {
    // Find user by email
    const result = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return { success: true, message: 'If the email exists, a reset link will be sent' };
    }

    const user = result.rows[0];

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await query(
      `UPDATE users 
       SET password_reset_token = $1, 
           password_reset_expires = NOW() + INTERVAL '1 hour'
       WHERE id = $2`,
      [resetToken, user.id]
    );

    return {
      success: true,
      resetToken,
      message: 'Password reset initiated'
    };
  } catch (error) {
    console.error('[AuthService] Password reset initiation error:', error);
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(resetToken, newPassword) {
  try {
    // Verify reset token
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid reset token');
    }

    // Check if token is still valid in database
    const result = await query(
      `SELECT id FROM users 
       WHERE id = $1 
       AND password_reset_token = $2 
       AND password_reset_expires > NOW()`,
      [decoded.userId, resetToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Reset token is invalid or expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await query(
      `UPDATE users 
       SET password = $1,
           password_reset_token = NULL,
           password_reset_expires = NULL
       WHERE id = $2`,
      [hashedPassword, decoded.userId]
    );

    return { success: true, message: 'Password reset successful' };
  } catch (error) {
    console.error('[AuthService] Password reset error:', error);
    throw error;
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(userId, currentPassword, newPassword) {
  try {
    // Get user's current password
    const result = await query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    // Revoke all refresh tokens for security
    revokeAllUserTokens(userId);

    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    console.error('[AuthService] Password change error:', error);
    throw error;
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create standardized auth error response
 */
export function createAuthErrorResponse(message, statusCode = 401) {
  return {
    success: false,
    error: message,
    statusCode
  };
}

/**
 * Create standardized auth success response
 */
export function createAuthSuccessResponse(data) {
  return {
    success: true,
    ...data
  };
}
