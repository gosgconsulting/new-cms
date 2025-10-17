import crypto from 'crypto';
import { query } from './postgres.js';
import { 
  verifyPassword, 
  createUserSession,
  validateUserSession,
  invalidateUserSession,
  logUserActivity, 
  logSecurityEvent,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_TIME
} from './secure-user-management.js';
import { getUserByEmail, getUserById } from './user-crud-operations.js';

// Rate limiting for login attempts
const loginAttempts = new Map();

// Clean up old login attempts every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > LOCKOUT_TIME * 60 * 1000) {
      loginAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Check if IP or user is rate limited
function isRateLimited(identifier) {
  const attempts = loginAttempts.get(identifier);
  if (!attempts) return false;
  
  const now = Date.now();
  const timeSinceLastAttempt = now - attempts.lastAttempt;
  
  // Reset if lockout period has passed
  if (timeSinceLastAttempt > LOCKOUT_TIME * 60 * 1000) {
    loginAttempts.delete(identifier);
    return false;
  }
  
  return attempts.count >= MAX_LOGIN_ATTEMPTS;
}

// Record failed login attempt
function recordFailedAttempt(identifier) {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: now };
  
  attempts.count++;
  attempts.lastAttempt = now;
  
  loginAttempts.set(identifier, attempts);
  
  return attempts.count;
}

// Reset login attempts on successful login
function resetLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

// Authenticate user with comprehensive security checks
export async function authenticateUser(email, password, ipAddress = null, userAgent = null, deviceInfo = {}) {
  try {
    console.log('[testing] Authentication attempt for:', email);
    
    // Basic validation
    if (!email || !password) {
      return { 
        success: false, 
        error: 'Email and password are required',
        errorCode: 'MISSING_CREDENTIALS'
      };
    }
    
    // Rate limiting by IP
    const ipIdentifier = `ip:${ipAddress}`;
    if (ipAddress && isRateLimited(ipIdentifier)) {
      await logSecurityEvent(
        null,
        'rate_limit_exceeded',
        'medium',
        `Rate limit exceeded for IP: ${ipAddress}`,
        ipAddress,
        userAgent,
        { identifier: ipIdentifier }
      );
      
      return { 
        success: false, 
        error: 'Too many login attempts. Please try again later.',
        errorCode: 'RATE_LIMITED'
      };
    }
    
    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      // Record failed attempt for IP
      if (ipAddress) {
        recordFailedAttempt(ipIdentifier);
      }
      
      await logSecurityEvent(
        null,
        'login_failed_user_not_found',
        'low',
        `Login attempt with non-existent email: ${email}`,
        ipAddress,
        userAgent,
        { email }
      );
      
      return { 
        success: false, 
        error: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS'
      };
    }
    
    // Rate limiting by user
    const userIdentifier = `user:${user.id}`;
    if (isRateLimited(userIdentifier)) {
      await logSecurityEvent(
        user.id,
        'user_rate_limit_exceeded',
        'medium',
        `Rate limit exceeded for user: ${user.email}`,
        ipAddress,
        userAgent,
        { user_id: user.id }
      );
      
      return { 
        success: false, 
        error: 'Account temporarily locked due to multiple failed attempts',
        errorCode: 'ACCOUNT_LOCKED'
      };
    }
    
    // Check if user account is locked
    if (user.is_locked) {
      await logSecurityEvent(
        user.id,
        'login_attempt_locked_account',
        'medium',
        `Login attempt on locked account: ${user.email}`,
        ipAddress,
        userAgent
      );
      
      return { 
        success: false, 
        error: 'Account is temporarily locked',
        errorCode: 'ACCOUNT_LOCKED'
      };
    }
    
    // Check account status
    if (!user.is_active) {
      await logSecurityEvent(
        user.id,
        'login_attempt_inactive_account',
        'low',
        `Login attempt on inactive account: ${user.email}`,
        ipAddress,
        userAgent
      );
      
      return { 
        success: false, 
        error: 'Account is deactivated',
        errorCode: 'ACCOUNT_INACTIVE'
      };
    }
    
    if (user.status === 'pending') {
      return { 
        success: false, 
        error: 'Account is pending approval',
        errorCode: 'ACCOUNT_PENDING'
      };
    }
    
    if (user.status === 'rejected') {
      return { 
        success: false, 
        error: 'Account has been rejected',
        errorCode: 'ACCOUNT_REJECTED'
      };
    }
    
    if (user.status === 'suspended') {
      await logSecurityEvent(
        user.id,
        'login_attempt_suspended_account',
        'medium',
        `Login attempt on suspended account: ${user.email}`,
        ipAddress,
        userAgent
      );
      
      return { 
        success: false, 
        error: 'Account is suspended',
        errorCode: 'ACCOUNT_SUSPENDED'
      };
    }
    
    if (user.status !== 'active') {
      return { 
        success: false, 
        error: 'Account is not active',
        errorCode: 'ACCOUNT_NOT_ACTIVE'
      };
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash, user.password_salt);
    
    if (!isPasswordValid) {
      // Record failed attempt
      if (ipAddress) {
        recordFailedAttempt(ipIdentifier);
      }
      recordFailedAttempt(userIdentifier);
      
      // Update failed login attempts in database
      const newFailedAttempts = user.failed_login_attempts + 1;
      let lockUntil = null;
      
      // Lock account if too many failed attempts
      if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockUntil = new Date(Date.now() + (LOCKOUT_TIME * 60 * 1000));
        
        await logSecurityEvent(
          user.id,
          'account_locked_failed_attempts',
          'high',
          `Account locked due to ${newFailedAttempts} failed login attempts`,
          ipAddress,
          userAgent,
          { failed_attempts: newFailedAttempts }
        );
      }
      
      await query(`
        UPDATE users 
        SET failed_login_attempts = $2, locked_until = $3
        WHERE id = $1
      `, [user.id, newFailedAttempts, lockUntil]);
      
      // Log failed login
      await query(`
        INSERT INTO user_login_history (
          user_id, ip_address, user_agent, success, failure_reason
        )
        VALUES ($1, $2, $3, false, $4)
      `, [user.id, ipAddress, userAgent, 'Invalid password']);
      
      await logUserActivity(
        user.id, 
        'login_failed', 
        'authentication', 
        null, 
        { 
          reason: 'invalid_password',
          failed_attempts: newFailedAttempts,
          ip_address: ipAddress
        }, 
        ipAddress, 
        userAgent, 
        false, 
        'Invalid password'
      );
      
      return { 
        success: false, 
        error: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS'
      };
    }
    
    // Password is valid - reset failed attempts and create session
    await query(`
      UPDATE users 
      SET failed_login_attempts = 0, locked_until = NULL
      WHERE id = $1
    `, [user.id]);
    
    // Reset rate limiting
    if (ipAddress) {
      resetLoginAttempts(ipIdentifier);
    }
    resetLoginAttempts(userIdentifier);
    
    // Create user session
    const sessionData = await createUserSession(user.id, ipAddress, userAgent, deviceInfo);
    
    // Log successful login
    await query(`
      INSERT INTO user_login_history (
        user_id, ip_address, user_agent, device_type, browser, success, two_factor_used
      )
      VALUES ($1, $2, $3, $4, $5, true, $6)
    `, [
      user.id, 
      ipAddress, 
      userAgent, 
      deviceInfo.deviceType || 'unknown',
      deviceInfo.browser || 'unknown',
      user.two_factor_enabled || false
    ]);
    
    console.log('[testing] Authentication successful for:', user.email);
    
    return {
      success: true,
      user: sessionData.user,
      session: {
        sessionId: sessionData.sessionId,
        jwtToken: sessionData.jwtToken,
        refreshToken: sessionData.refreshToken,
        expiresAt: sessionData.expiresAt
      }
    };
    
  } catch (error) {
    console.error('[testing] Authentication error:', error);
    
    // Log system error
    await logSecurityEvent(
      null,
      'authentication_system_error',
      'critical',
      `Authentication system error: ${error.message}`,
      ipAddress,
      userAgent,
      { error: error.message, stack: error.stack }
    );
    
    return { 
      success: false, 
      error: 'Authentication system error',
      errorCode: 'SYSTEM_ERROR'
    };
  }
}

// Validate session and refresh if needed
export async function validateSession(sessionId, jwtToken, ipAddress = null, userAgent = null) {
  try {
    const session = await validateUserSession(sessionId, jwtToken);
    
    if (!session) {
      return { 
        success: false, 
        error: 'Invalid or expired session',
        errorCode: 'INVALID_SESSION'
      };
    }
    
    // Check if user is still active and not suspended
    const user = await getUserById(session.user.id);
    if (!user || !user.is_active || user.status !== 'active') {
      // Invalidate session
      await invalidateUserSession(sessionId);
      
      await logSecurityEvent(
        session.user.id,
        'session_invalidated_user_inactive',
        'medium',
        'Session invalidated due to user account status change',
        ipAddress,
        userAgent
      );
      
      return { 
        success: false, 
        error: 'User account is no longer active',
        errorCode: 'USER_INACTIVE'
      };
    }
    
    return {
      success: true,
      user: session.user,
      sessionId: session.sessionId
    };
    
  } catch (error) {
    console.error('[testing] Session validation error:', error);
    return { 
      success: false, 
      error: 'Session validation failed',
      errorCode: 'VALIDATION_ERROR'
    };
  }
}

// Logout user
export async function logoutUser(sessionId, userId = null, ipAddress = null, userAgent = null) {
  try {
    console.log('[testing] Logging out user session:', sessionId);
    
    const success = await invalidateUserSession(sessionId);
    
    if (success && userId) {
      await logUserActivity(
        userId, 
        'user_logout', 
        'session', 
        sessionId, 
        { ip_address: ipAddress }, 
        ipAddress, 
        userAgent
      );
      
      // Update session duration in login history
      await query(`
        UPDATE user_login_history 
        SET session_duration = NOW() - login_time
        WHERE user_id = $1 AND success = true AND session_duration IS NULL
        ORDER BY login_time DESC
        LIMIT 1
      `, [userId]);
    }
    
    return { success };
    
  } catch (error) {
    console.error('[testing] Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
}

// Logout all sessions for a user
export async function logoutAllSessions(userId, currentSessionId = null, ipAddress = null, userAgent = null) {
  try {
    console.log('[testing] Logging out all sessions for user:', userId);
    
    // Get all active sessions before invalidating
    const sessionsResult = await query(`
      SELECT session_id FROM user_sessions 
      WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
    `, [userId]);
    
    const sessionCount = sessionsResult.rows.length;
    
    // Invalidate all sessions except current one if specified
    if (currentSessionId) {
      await query(`
        UPDATE user_sessions 
        SET is_active = false 
        WHERE user_id = $1 AND session_id != $2
      `, [userId, currentSessionId]);
    } else {
      await query(`
        UPDATE user_sessions 
        SET is_active = false 
        WHERE user_id = $1
      `, [userId]);
    }
    
    await logUserActivity(
      userId, 
      'logout_all_sessions', 
      'security', 
      null, 
      { 
        sessions_invalidated: currentSessionId ? sessionCount - 1 : sessionCount,
        current_session_preserved: !!currentSessionId
      }, 
      ipAddress, 
      userAgent
    );
    
    await logSecurityEvent(
      userId,
      'all_sessions_invalidated',
      'medium',
      `All user sessions invalidated${currentSessionId ? ' except current session' : ''}`,
      ipAddress,
      userAgent,
      { sessions_count: sessionCount }
    );
    
    return { success: true, sessionsInvalidated: currentSessionId ? sessionCount - 1 : sessionCount };
    
  } catch (error) {
    console.error('[testing] Logout all sessions error:', error);
    return { success: false, error: 'Failed to logout all sessions' };
  }
}

// Get user's active sessions
export async function getUserSessions(userId) {
  try {
    const result = await query(`
      SELECT 
        session_id,
        ip_address,
        user_agent,
        device_info,
        location_info,
        last_activity,
        created_at,
        expires_at
      FROM user_sessions 
      WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
      ORDER BY last_activity DESC
    `, [userId]);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching user sessions:', error);
    throw error;
  }
}

// Get login history for a user
export async function getUserLoginHistory(userId, limit = 20, offset = 0) {
  try {
    const result = await query(`
      SELECT 
        login_time,
        ip_address,
        user_agent,
        location_country,
        location_city,
        device_type,
        browser,
        success,
        failure_reason,
        two_factor_used,
        session_duration
      FROM user_login_history 
      WHERE user_id = $1
      ORDER BY login_time DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching user login history:', error);
    throw error;
  }
}

// Check for suspicious login activity
export async function checkSuspiciousActivity(userId, ipAddress = null) {
  try {
    const checks = [];
    
    // Check for multiple failed logins in short time
    const recentFailedLogins = await query(`
      SELECT COUNT(*) as count
      FROM user_login_history 
      WHERE user_id = $1 AND success = false 
        AND login_time > NOW() - INTERVAL '1 hour'
    `, [userId]);
    
    if (parseInt(recentFailedLogins.rows[0].count) >= 3) {
      checks.push({
        type: 'multiple_failed_logins',
        severity: 'medium',
        description: 'Multiple failed login attempts in the last hour'
      });
    }
    
    // Check for logins from new IP addresses
    if (ipAddress) {
      const knownIPs = await query(`
        SELECT DISTINCT ip_address
        FROM user_login_history 
        WHERE user_id = $1 AND success = true 
          AND login_time > NOW() - INTERVAL '30 days'
      `, [userId]);
      
      const isNewIP = !knownIPs.rows.some(row => row.ip_address === ipAddress);
      
      if (isNewIP) {
        checks.push({
          type: 'new_ip_address',
          severity: 'low',
          description: 'Login from a new IP address'
        });
      }
    }
    
    // Check for concurrent sessions from different locations
    const activeSessions = await query(`
      SELECT COUNT(DISTINCT ip_address) as unique_ips
      FROM user_sessions 
      WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
    `, [userId]);
    
    if (parseInt(activeSessions.rows[0].unique_ips) > 3) {
      checks.push({
        type: 'multiple_concurrent_sessions',
        severity: 'medium',
        description: 'Multiple concurrent sessions from different locations'
      });
    }
    
    return checks;
  } catch (error) {
    console.error('[testing] Error checking suspicious activity:', error);
    return [];
  }
}

// Password reset request
export async function requestPasswordReset(email, ipAddress = null, userAgent = null) {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      // Don't reveal that email doesn't exist
      return { 
        success: true, 
        message: 'If the email exists, a password reset link has been sent.' 
      };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour
    
    await query(`
      UPDATE users 
      SET password_reset_token = $2, password_reset_expires = $3
      WHERE id = $1
    `, [user.id, resetToken, resetExpires]);
    
    await logUserActivity(
      user.id, 
      'password_reset_requested', 
      'security', 
      null, 
      { ip_address: ipAddress }, 
      ipAddress, 
      userAgent
    );
    
    // In production, send email with reset link
    console.log(`[testing] Password reset token for ${email}: ${resetToken}`);
    
    return { 
      success: true, 
      message: 'Password reset instructions have been sent to your email.',
      resetToken // Remove this in production
    };
    
  } catch (error) {
    console.error('[testing] Password reset request error:', error);
    return { 
      success: false, 
      error: 'Failed to process password reset request' 
    };
  }
}

export { isRateLimited, recordFailedAttempt, resetLoginAttempts };
