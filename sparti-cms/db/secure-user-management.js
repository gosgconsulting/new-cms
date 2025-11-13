import bcrypt from 'bcryptjs';
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

// Initialize secure user management tables
export async function initializeSecureUsersTables() {
  try {
    console.log('[testing] Initializing secure users management tables...');

    // Create users table with comprehensive security features
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified BOOLEAN DEFAULT false,
        email_verification_token VARCHAR(255),
        email_verification_expires TIMESTAMP WITH TIME ZONE,
        password_hash VARCHAR(255) NOT NULL,
        password_salt VARCHAR(255) NOT NULL,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP WITH TIME ZONE,
        password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user', 'viewer')),
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'rejected', 'suspended')),
        is_active BOOLEAN DEFAULT true,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE,
        last_login TIMESTAMP WITH TIME ZONE,
        last_login_ip INET,
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        two_factor_enabled BOOLEAN DEFAULT false,
        two_factor_secret VARCHAR(255),
        backup_codes TEXT[],
        login_notifications BOOLEAN DEFAULT true,
        security_questions JSONB,
        profile_data JSONB DEFAULT '{}',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id)
      )
    `);

    // Create user sessions table for secure session management
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        jwt_token_hash VARCHAR(255) NOT NULL,
        refresh_token_hash VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        device_info JSONB,
        location_info JSONB,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create user activity log for comprehensive audit trail
    await query(`
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        session_id VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(100),
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        risk_score INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create user permissions table for granular access control
    await query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        permission VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(100),
        granted_by INTEGER REFERENCES users(id),
        granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(user_id, permission, resource_type, resource_id)
      )
    `);

    // Create user login history for security monitoring
    await query(`
      CREATE TABLE IF NOT EXISTS user_login_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        location_country VARCHAR(100),
        location_city VARCHAR(100),
        device_type VARCHAR(50),
        browser VARCHAR(100),
        success BOOLEAN DEFAULT true,
        failure_reason VARCHAR(255),
        two_factor_used BOOLEAN DEFAULT false,
        session_duration INTERVAL
      )
    `);

    // Create password history table to prevent password reuse
    await query(`
      CREATE TABLE IF NOT EXISTS user_password_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        password_hash VARCHAR(255) NOT NULL,
        password_salt VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create security events table for threat detection
    await query(`
      CREATE TABLE IF NOT EXISTS security_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(100) NOT NULL,
        severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        description TEXT NOT NULL,
        ip_address INET,
        user_agent TEXT,
        additional_data JSONB,
        resolved BOOLEAN DEFAULT false,
        resolved_by INTEGER REFERENCES users(id),
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for performance and security
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)',
      'CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
      
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active)',
      
      'CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity_log(action)',
      'CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity_log(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_user_activity_ip_address ON user_activity_log(ip_address)',
      
      'CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission)',
      'CREATE INDEX IF NOT EXISTS idx_user_permissions_is_active ON user_permissions(is_active)',
      
      'CREATE INDEX IF NOT EXISTS idx_user_login_history_user_id ON user_login_history(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_login_history_login_time ON user_login_history(login_time)',
      'CREATE INDEX IF NOT EXISTS idx_user_login_history_ip_address ON user_login_history(ip_address)',
      
      'CREATE INDEX IF NOT EXISTS idx_user_password_history_user_id ON user_password_history(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_password_history_created_at ON user_password_history(created_at)',
      
      'CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at)'
    ];

    for (const indexQuery of indexes) {
      await query(indexQuery);
    }

    // Create triggers for updated_at timestamps
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await query(`
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // Create views for user management
    await query(`
      CREATE OR REPLACE VIEW users_management_view AS
      SELECT 
        u.id,
        u.uuid,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.status,
        u.is_active,
        u.email_verified,
        u.two_factor_enabled,
        u.last_login,
        u.last_login_ip,
        u.failed_login_attempts,
        CASE WHEN u.locked_until > NOW() THEN true ELSE false END as is_locked,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT s.id) as active_sessions,
        COUNT(DISTINCT l.id) as total_logins
      FROM users u
      LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = true AND s.expires_at > NOW()
      LEFT JOIN user_login_history l ON u.id = l.user_id AND l.success = true
      GROUP BY u.id, u.uuid, u.first_name, u.last_name, u.email, u.role, u.status, 
               u.is_active, u.email_verified, u.two_factor_enabled, u.last_login, 
               u.last_login_ip, u.failed_login_attempts, u.locked_until, u.created_at, u.updated_at
      ORDER BY u.created_at DESC
    `);

    await query(`
      CREATE OR REPLACE VIEW user_security_summary AS
      SELECT 
        u.id,
        u.email,
        u.role,
        u.status,
        u.failed_login_attempts,
        u.last_login,
        u.two_factor_enabled,
        COUNT(DISTINCT se.id) FILTER (WHERE se.severity IN ('high', 'critical') AND se.resolved = false) as critical_events,
        COUNT(DISTINCT s.id) as active_sessions,
        MAX(l.login_time) as last_successful_login
      FROM users u
      LEFT JOIN security_events se ON u.id = se.user_id
      LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = true AND s.expires_at > NOW()
      LEFT JOIN user_login_history l ON u.id = l.user_id AND l.success = true
      GROUP BY u.id, u.email, u.role, u.status, u.failed_login_attempts, u.last_login, u.two_factor_enabled
    `);

    await query(`
      CREATE OR REPLACE VIEW user_statistics AS
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'editor' THEN 1 END) as editor_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
        COUNT(CASE WHEN role = 'viewer' THEN 1 END) as viewer_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_users,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_users,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_users,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN two_factor_enabled = true THEN 1 END) as two_factor_users,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 END) as recent_logins,
        COUNT(CASE WHEN last_activity > NOW() - INTERVAL '24 hours' THEN 1 END) as active_today
      FROM users
    `);

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
