import { logSecurityEvent, AuditEventType } from '../services/auditService.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides fine-grained permission control for API endpoints
 */

// Define permission constants
export const Permission = {
  // User permissions
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',
  
  // Content permissions
  CONTENT_READ: 'content:read',
  CONTENT_CREATE: 'content:create',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  
  // Media permissions
  MEDIA_READ: 'media:read',
  MEDIA_UPLOAD: 'media:upload',
  MEDIA_DELETE: 'media:delete',
  
  // Tenant permissions
  TENANT_READ: 'tenant:read',
  TENANT_CREATE: 'tenant:create',
  TENANT_UPDATE: 'tenant:update',
  TENANT_DELETE: 'tenant:delete',
  
  // Settings permissions
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  
  // Theme permissions
  THEME_READ: 'theme:read',
  THEME_UPDATE: 'theme:update',
  
  // System permissions
  SYSTEM_ADMIN: 'system:admin',
  AUDIT_READ: 'audit:read'
};

// Define role permissions mapping
export const RolePermissions = {
  super_admin: [
    // Super admin has all permissions
    ...Object.values(Permission)
  ],
  
  admin: [
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    Permission.MEDIA_READ,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_DELETE,
    Permission.TENANT_READ,
    Permission.TENANT_UPDATE,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
    Permission.THEME_READ,
    Permission.THEME_UPDATE,
    Permission.AUDIT_READ
  ],
  
  editor: [
    Permission.USER_READ,
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_PUBLISH,
    Permission.MEDIA_READ,
    Permission.MEDIA_UPLOAD,
    Permission.SETTINGS_READ,
    Permission.THEME_READ
  ],
  
  author: [
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.MEDIA_READ,
    Permission.MEDIA_UPLOAD,
    Permission.SETTINGS_READ,
    Permission.THEME_READ
  ],
  
  contributor: [
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.MEDIA_READ,
    Permission.SETTINGS_READ,
    Permission.THEME_READ
  ],
  
  viewer: [
    Permission.CONTENT_READ,
    Permission.MEDIA_READ,
    Permission.SETTINGS_READ,
    Permission.THEME_READ
  ]
};

/**
 * Check if user has a specific permission
 */
export function hasPermission(user, permission) {
  if (!user) {
    return false;
  }

  // Super admin has all permissions
  if (user.is_super_admin) {
    return true;
  }

  // Get user's role permissions
  const userRole = user.role || 'viewer';
  const rolePermissions = RolePermissions[userRole] || [];

  return rolePermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user, permissions) {
  if (!user) {
    return false;
  }

  if (user.is_super_admin) {
    return true;
  }

  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user, permissions) {
  if (!user) {
    return false;
  }

  if (user.is_super_admin) {
    return true;
  }

  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        await logSecurityEvent(
          AuditEventType.UNAUTHORIZED_ACCESS,
          null,
          { permission, path: req.path },
          req
        );
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!hasPermission(req.user, permission)) {
        await logSecurityEvent(
          AuditEventType.PERMISSION_DENIED,
          req.user.id,
          { permission, path: req.path },
          req
        );
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Middleware to require any of the specified permissions
 */
export function requireAnyPermission(...permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        await logSecurityEvent(
          AuditEventType.UNAUTHORIZED_ACCESS,
          null,
          { permissions, path: req.path },
          req
        );
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!hasAnyPermission(req.user, permissions)) {
        await logSecurityEvent(
          AuditEventType.PERMISSION_DENIED,
          req.user.id,
          { permissions, path: req.path },
          req
        );
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Middleware to require all of the specified permissions
 */
export function requireAllPermissions(...permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        await logSecurityEvent(
          AuditEventType.UNAUTHORIZED_ACCESS,
          null,
          { permissions, path: req.path },
          req
        );
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!hasAllPermissions(req.user, permissions)) {
        await logSecurityEvent(
          AuditEventType.PERMISSION_DENIED,
          req.user.id,
          { permissions, path: req.path },
          req
        );
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Middleware to require super admin role
 */
export function requireSuperAdmin() {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        await logSecurityEvent(
          AuditEventType.UNAUTHORIZED_ACCESS,
          null,
          { requiredRole: 'super_admin', path: req.path },
          req
        );
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!req.user.is_super_admin) {
        await logSecurityEvent(
          AuditEventType.PERMISSION_DENIED,
          req.user.id,
          { requiredRole: 'super_admin', path: req.path },
          req
        );
        return res.status(403).json({
          success: false,
          error: 'Super admin access required'
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Super admin check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Middleware to enforce tenant isolation
 * Ensures users can only access resources from their own tenant
 */
export function requireTenantAccess() {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Super admin can access all tenants
      if (req.user.is_super_admin) {
        return next();
      }

      // Get tenant ID from request (body, params, or query)
      const requestTenantId = req.body.tenant_id || 
                             req.params.tenantId || 
                             req.query.tenant_id;

      // If no tenant ID in request, allow (will use user's tenant)
      if (!requestTenantId) {
        return next();
      }

      // Check if user has access to the requested tenant
      if (req.user.tenant_id !== requestTenantId) {
        await logSecurityEvent(
          AuditEventType.PERMISSION_DENIED,
          req.user.id,
          { 
            reason: 'tenant_isolation_violation',
            userTenantId: req.user.tenant_id,
            requestedTenantId: requestTenantId,
            path: req.path
          },
          req
        );
        return res.status(403).json({
          success: false,
          error: 'Access denied to this tenant'
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Tenant access check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Tenant access check failed'
      });
    }
  };
}

/**
 * Middleware to check resource ownership
 * Ensures users can only modify their own resources
 */
export function requireResourceOwnership(resourceUserIdField = 'author_id') {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Super admin and admin can access all resources
      if (req.user.is_super_admin || req.user.role === 'admin') {
        return next();
      }

      // Get resource owner ID from request body or resource data
      const resourceOwnerId = req.body[resourceUserIdField] || 
                             req.resource?.[resourceUserIdField];

      // If no owner ID, allow (will be set to current user)
      if (!resourceOwnerId) {
        return next();
      }

      // Check if user owns the resource
      if (req.user.id !== resourceOwnerId) {
        await logSecurityEvent(
          AuditEventType.PERMISSION_DENIED,
          req.user.id,
          { 
            reason: 'resource_ownership_violation',
            resourceOwnerId,
            path: req.path
          },
          req
        );
        return res.status(403).json({
          success: false,
          error: 'You can only modify your own resources'
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Resource ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Resource ownership check failed'
      });
    }
  };
}
