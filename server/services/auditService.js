import { query } from '../../sparti-cms/db/index.js';

/**
 * Audit Service
 * Handles logging of security-relevant events and user actions
 */

// Audit event types
export const AuditEventType = {
  // Authentication events
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILURE: 'auth.login.failure',
  LOGOUT: 'auth.logout',
  TOKEN_REFRESH: 'auth.token.refresh',
  PASSWORD_RESET_REQUEST: 'auth.password.reset.request',
  PASSWORD_RESET_SUCCESS: 'auth.password.reset.success',
  PASSWORD_CHANGE: 'auth.password.change',
  
  // User management
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ROLE_CHANGE: 'user.role.change',
  
  // Content management
  POST_CREATE: 'content.post.create',
  POST_UPDATE: 'content.post.update',
  POST_DELETE: 'content.post.delete',
  POST_PUBLISH: 'content.post.publish',
  PAGE_CREATE: 'content.page.create',
  PAGE_UPDATE: 'content.page.update',
  PAGE_DELETE: 'content.page.delete',
  
  // Media management
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',
  
  // Tenant management
  TENANT_CREATE: 'tenant.create',
  TENANT_UPDATE: 'tenant.update',
  TENANT_DELETE: 'tenant.delete',
  
  // Settings
  SETTINGS_UPDATE: 'settings.update',
  
  // Security events
  UNAUTHORIZED_ACCESS: 'security.unauthorized.access',
  PERMISSION_DENIED: 'security.permission.denied',
  SUSPICIOUS_ACTIVITY: 'security.suspicious.activity'
};

/**
 * Log an audit event
 * @param {string} eventType - Type of event (use AuditEventType constants)
 * @param {object} options - Event options
 * @param {string} options.userId - User who performed the action
 * @param {string} options.tenantId - Tenant context
 * @param {string} options.resourceType - Type of resource affected
 * @param {string} options.resourceId - ID of resource affected
 * @param {object} options.metadata - Additional event data
 * @param {string} options.ipAddress - IP address of request
 * @param {string} options.userAgent - User agent string
 * @param {string} options.status - Event status (success/failure)
 */
export async function logAuditEvent(eventType, options = {}) {
  try {
    const {
      userId = null,
      tenantId = null,
      resourceType = null,
      resourceId = null,
      metadata = {},
      ipAddress = null,
      userAgent = null,
      status = 'success'
    } = options;

    // Ensure audit_logs table exists
    await ensureAuditTableExists();

    // Insert audit log
    await query(
      `INSERT INTO audit_logs (
        event_type,
        user_id,
        tenant_id,
        resource_type,
        resource_id,
        metadata,
        ip_address,
        user_agent,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        eventType,
        userId,
        tenantId,
        resourceType,
        resourceId,
        JSON.stringify(metadata),
        ipAddress,
        userAgent,
        status
      ]
    );

    console.log(`[AuditService] Logged event: ${eventType} by user ${userId || 'anonymous'}`);
  } catch (error) {
    // Don't throw errors for audit logging failures
    // Log to console but don't break the application
    console.error('[AuditService] Failed to log audit event:', error);
  }
}

/**
 * Log authentication event
 */
export async function logAuthEvent(eventType, userId, success, metadata = {}, req = null) {
  await logAuditEvent(eventType, {
    userId,
    status: success ? 'success' : 'failure',
    metadata,
    ipAddress: req ? getClientIp(req) : null,
    userAgent: req ? req.headers['user-agent'] : null
  });
}

/**
 * Log user action
 */
export async function logUserAction(eventType, userId, tenantId, resourceType, resourceId, metadata = {}, req = null) {
  await logAuditEvent(eventType, {
    userId,
    tenantId,
    resourceType,
    resourceId,
    metadata,
    ipAddress: req ? getClientIp(req) : null,
    userAgent: req ? req.headers['user-agent'] : null
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(eventType, userId, metadata = {}, req = null) {
  await logAuditEvent(eventType, {
    userId,
    status: 'failure',
    metadata,
    ipAddress: req ? getClientIp(req) : null,
    userAgent: req ? req.headers['user-agent'] : null
  });
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(filters = {}) {
  try {
    const {
      userId = null,
      tenantId = null,
      eventType = null,
      startDate = null,
      endDate = null,
      limit = 100,
      offset = 0
    } = filters;

    let queryText = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (userId) {
      queryText += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (tenantId) {
      queryText += ` AND tenant_id = $${paramIndex}`;
      params.push(tenantId);
      paramIndex++;
    }

    if (eventType) {
      queryText += ` AND event_type = $${paramIndex}`;
      params.push(eventType);
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('[AuditService] Failed to retrieve audit logs:', error);
    throw error;
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStats(filters = {}) {
  try {
    const {
      userId = null,
      tenantId = null,
      startDate = null,
      endDate = null
    } = filters;

    let queryText = `
      SELECT 
        event_type,
        status,
        COUNT(*) as count
      FROM audit_logs
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (userId) {
      queryText += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (tenantId) {
      queryText += ` AND tenant_id = $${paramIndex}`;
      params.push(tenantId);
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryText += ' GROUP BY event_type, status ORDER BY count DESC';

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('[AuditService] Failed to retrieve audit stats:', error);
    throw error;
  }
}

/**
 * Ensure audit_logs table exists
 */
async function ensureAuditTableExists() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        user_id VARCHAR(255),
        tenant_id VARCHAR(255),
        resource_type VARCHAR(50),
        resource_id VARCHAR(255),
        metadata JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        status VARCHAR(20) DEFAULT 'success',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for common queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)
    `);
  } catch (error) {
    // Table might already exist, ignore errors
    if (!error.code || error.code !== '42P07') {
      console.error('[AuditService] Failed to create audit table:', error);
    }
  }
}

/**
 * Get client IP address from request
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    null
  );
}

/**
 * Clean up old audit logs
 * @param {number} daysToKeep - Number of days to keep logs
 */
export async function cleanupOldAuditLogs(daysToKeep = 90) {
  try {
    const result = await query(
      `DELETE FROM audit_logs 
       WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
       RETURNING id`
    );

    const deletedCount = result.rowCount || 0;
    console.log(`[AuditService] Cleaned up ${deletedCount} old audit logs`);
    
    return { success: true, deletedCount };
  } catch (error) {
    console.error('[AuditService] Failed to cleanup old audit logs:', error);
    throw error;
  }
}
