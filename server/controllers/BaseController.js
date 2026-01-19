import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Base Controller Class
 * Provides common controller methods and utilities
 */
export class BaseController {
  /**
   * Wrap async handler
   */
  wrap(fn) {
    return asyncHandler(fn.bind(this));
  }

  /**
   * Send success response
   */
  success(res, data = null, message = null, statusCode = 200) {
    const response = { success: true };
    
    if (message) {
      response.message = message;
    }
    
    if (data !== null) {
      response.data = data;
    }
    
    return res.status(statusCode).json(response);
  }

  /**
   * Send created response
   */
  created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  noContent(res) {
    return res.status(204).send();
  }

  /**
   * Send error response
   */
  error(res, message, statusCode = 500, code = null) {
    const response = {
      success: false,
      error: {
        message,
        statusCode
      }
    };
    
    if (code) {
      response.error.code = code;
    }
    
    return res.status(statusCode).json(response);
  }

  /**
   * Send bad request response
   */
  badRequest(res, message = 'Bad request', errors = null) {
    const response = {
      success: false,
      error: {
        message,
        statusCode: 400,
        code: 'BAD_REQUEST'
      }
    };
    
    if (errors) {
      response.error.errors = errors;
    }
    
    return res.status(400).json(response);
  }

  /**
   * Send unauthorized response
   */
  unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401, 'UNAUTHORIZED');
  }

  /**
   * Send forbidden response
   */
  forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403, 'FORBIDDEN');
  }

  /**
   * Send not found response
   */
  notFound(res, resource = 'Resource') {
    return this.error(res, `${resource} not found`, 404, 'NOT_FOUND');
  }

  /**
   * Send conflict response
   */
  conflict(res, message = 'Resource already exists') {
    return this.error(res, message, 409, 'CONFLICT');
  }

  /**
   * Get pagination params from request
   */
  getPagination(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100
    const offset = (page - 1) * limit;
    
    return { page, limit, offset };
  }

  /**
   * Get sort params from request
   */
  getSort(req, defaultField = 'created_at', defaultDirection = 'DESC') {
    const orderBy = req.query.sort || defaultField;
    const orderDirection = (req.query.order || defaultDirection).toUpperCase();
    
    // Validate direction
    const validDirections = ['ASC', 'DESC'];
    const direction = validDirections.includes(orderDirection) ? orderDirection : 'DESC';
    
    return { orderBy, orderDirection: direction };
  }

  /**
   * Get filter params from request
   */
  getFilters(req, allowedFields = []) {
    const filters = {};
    
    for (const field of allowedFields) {
      if (req.query[field] !== undefined) {
        filters[field] = req.query[field];
      }
    }
    
    return filters;
  }

  /**
   * Build paginated response
   */
  paginated(res, data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    
    return this.success(res, {
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  }

  /**
   * Validate required fields
   */
  validateRequired(data, requiredFields) {
    const missing = [];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Extract user from request
   */
  getUser(req) {
    return req.user || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(req) {
    return !!req.user;
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(req) {
    return req.user?.is_super_admin === true;
  }

  /**
   * Get tenant ID from request
   */
  getTenantId(req) {
    // Try to get from user first, then from params/body
    return req.user?.tenant_id || 
           req.params.tenantId || 
           req.body.tenant_id || 
           req.query.tenant_id || 
           null;
  }

  /**
   * Check if user has access to tenant
   */
  canAccessTenant(req, tenantId) {
    if (!req.user) {
      return false;
    }
    
    // Super admin can access all tenants
    if (req.user.is_super_admin) {
      return true;
    }
    
    // User can only access their own tenant
    return req.user.tenant_id === tenantId;
  }

  /**
   * Sanitize output (remove sensitive fields)
   */
  sanitize(data, fieldsToRemove = ['password', 'password_hash']) {
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item, fieldsToRemove));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      for (const field of fieldsToRemove) {
        delete sanitized[field];
      }
      
      return sanitized;
    }
    
    return data;
  }
}
