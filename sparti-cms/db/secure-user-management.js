import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimiterPkg from 'rate-limiter-flexible';
const { RateLimiterPostgreSQL } = rateLimiterPkg;
import { query } from './index.js';
import pool from './postgres.js';

// Security configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_TIME = parseInt(process.env.LOCKOUT_TIME) || 15; // minutes
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT) || 24; // hours

// Rate limiter for login attempts
let rateLimiter;

// Initialize secure user management tables using Sequelize migrations
export async function initializeSecureUsersTables() {
  try {
    console.log('[testing] Initializing secure users management tables...');

    // Run user tables migration
    const { runMigrations } = await import('../sequelize/run-migrations.js');
    await runMigrations(['20241202000002-create-user-tables.js']);

    // Initialize rate limiter
    try {
      rateLimiter = new RateLimiterPostgreSQL({
        storeClient: pool,
        keyPrefix: 'login_fail',
        points: MAX_LOGIN_ATTEMPTS,
        duration: LOCKOUT_TIME * 60, // Convert minutes to seconds
        tableName: 'rate_limiter_login'
      });
    } catch (error) {
      console.warn('[testing] Rate limiter initialization failed, using fallback:', error.message);
    }

    // Insert default admin user with secure password
    const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdmin123!';
    const adminSalt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const adminPasswordHash = await bcrypt.hash(adminPassword, adminSalt);

    await query(`
      INSERT INTO users (
        first_name, last_name, email, password_hash, password_salt, 
        role, status, is_active, email_verified, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        password_salt = EXCLUDED.password_salt,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        is_active = EXCLUDED.is_active,
        email_verified = EXCLUDED.email_verified,
        updated_at = NOW()
    `, [
      'System',
      'Administrator',
      'admin@gosg.com',
      adminPasswordHash,
      adminSalt,
      'admin',
      'active',
      true,
      true
    ]);

    console.log('[testing] Secure users management tables initialized successfully');
    console.log(`[testing] Default admin credentials: admin@gosg.com / ${adminPassword}`);
    return true;
  } catch (error) {
    console.error('[testing] Secure users management tables initialization failed:', error);
    throw error;
  }
}

// Utility functions for password security
export function generateSecurePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

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
    errors,
    score: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, password.length >= minLength].filter(Boolean).length
  };
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
}

export async function verifyPassword(password, hash, salt = null) {
  try {
    // If salt is provided, it's the new format
    if (salt) {
      const testHash = await bcrypt.hash(password, salt);
      return testHash === hash;
    }
    // Otherwise, use bcrypt compare for backward compatibility
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('[testing] Password verification error:', error);
    return false;
  }
}

// JWT token management
export function generateJWT(user, sessionId) {
  const payload = {
    userId: user.id,
    uuid: user.uuid,
    email: user.email,
    role: user.role,
    sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (SESSION_TIMEOUT * 3600)
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('[testing] JWT verification error:', error);
    return null;
  }
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

// Session management
export async function createUserSession(userId, ipAddress, userAgent, deviceInfo = {}) {
  try {
    const sessionId = crypto.randomUUID();
    const user = await getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const jwtToken = generateJWT(user, sessionId);
    const refreshToken = generateRefreshToken();
    
    const jwtTokenHash = crypto.createHash('sha256').update(jwtToken).digest('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const expiresAt = new Date(Date.now() + (SESSION_TIMEOUT * 60 * 60 * 1000));
    
    const result = await query(`
      INSERT INTO user_sessions (
        session_id, user_id, jwt_token_hash, refresh_token_hash, 
        ip_address, user_agent, device_info, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      sessionId, userId, jwtTokenHash, refreshTokenHash,
      ipAddress, userAgent, JSON.stringify(deviceInfo), expiresAt
    ]);
    
    // Update user's last login
    await query(`
      UPDATE users 
      SET last_login = NOW(), last_login_ip = $2, last_activity = NOW()
      WHERE id = $1
    `, [userId, ipAddress]);
    
    // Log the login
    await logUserActivity(userId, 'user_login', 'session', sessionId, {
      ip_address: ipAddress,
      user_agent: userAgent,
      device_info: deviceInfo
    }, ipAddress, userAgent);
    
    console.log('[testing] User session created:', sessionId);
    
    return {
      sessionId,
      jwtToken,
      refreshToken,
      expiresAt,
      user: {
        id: user.id,
        uuid: user.uuid,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    };
  } catch (error) {
    console.error('[testing] Error creating user session:', error);
    throw error;
  }
}

export async function validateUserSession(sessionId, jwtToken) {
  try {
    const jwtTokenHash = crypto.createHash('sha256').update(jwtToken).digest('hex');
    
    const result = await query(`
      SELECT s.*, u.id as user_id, u.uuid, u.first_name, u.last_name, 
             u.email, u.role, u.status, u.is_active
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_id = $1 AND s.jwt_token_hash = $2 
        AND s.is_active = true AND s.expires_at > NOW()
        AND u.is_active = true AND u.status = 'active'
    `, [sessionId, jwtTokenHash]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const session = result.rows[0];
    
    // Update last activity
    await query(`
      UPDATE user_sessions 
      SET last_activity = NOW() 
      WHERE session_id = $1
    `, [sessionId]);
    
    await query(`
      UPDATE users 
      SET last_activity = NOW() 
      WHERE id = $1
    `, [session.user_id]);
    
    return {
      sessionId: session.session_id,
      user: {
        id: session.user_id,
        uuid: session.uuid,
        first_name: session.first_name,
        last_name: session.last_name,
        email: session.email,
        role: session.role,
        status: session.status
      }
    };
  } catch (error) {
    console.error('[testing] Error validating user session:', error);
    return null;
  }
}

export async function invalidateUserSession(sessionId) {
  try {
    await query(`
      UPDATE user_sessions 
      SET is_active = false 
      WHERE session_id = $1
    `, [sessionId]);
    
    console.log('[testing] User session invalidated:', sessionId);
    return true;
  } catch (error) {
    console.error('[testing] Error invalidating user session:', error);
    return false;
  }
}

export async function invalidateAllUserSessions(userId) {
  try {
    await query(`
      UPDATE user_sessions 
      SET is_active = false 
      WHERE user_id = $1
    `, [userId]);
    
    console.log('[testing] All user sessions invalidated for user:', userId);
    return true;
  } catch (error) {
    console.error('[testing] Error invalidating all user sessions:', error);
    return false;
  }
}

// Activity logging
export async function logUserActivity(userId, action, resourceType = null, resourceId = null, details = {}, ipAddress = null, userAgent = null, success = true, errorMessage = null) {
  try {
    await query(`
      INSERT INTO user_activity_log (
        user_id, action, resource_type, resource_id, details, 
        ip_address, user_agent, success, error_message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      userId, action, resourceType, resourceId, JSON.stringify(details),
      ipAddress, userAgent, success, errorMessage
    ]);
    
    console.log('[testing] User activity logged:', { userId, action, success });
  } catch (error) {
    console.error('[testing] Error logging user activity:', error);
  }
}

export async function logSecurityEvent(userId, eventType, severity, description, ipAddress = null, userAgent = null, additionalData = {}) {
  try {
    await query(`
      INSERT INTO security_events (
        user_id, event_type, severity, description, 
        ip_address, user_agent, additional_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId, eventType, severity, description,
      ipAddress, userAgent, JSON.stringify(additionalData)
    ]);
    
    console.log('[testing] Security event logged:', { userId, eventType, severity });
  } catch (error) {
    console.error('[testing] Error logging security event:', error);
  }
}

export { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS, MAX_LOGIN_ATTEMPTS, LOCKOUT_TIME, SESSION_TIMEOUT };
