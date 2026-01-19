/**
 * Validation Middleware
 * Provides request validation utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate slug format
 */
export function isValidSlug(slug) {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Sanitize string input
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Remove potentially dangerous characters
  return str.trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Validate required fields middleware
 */
export function validateRequired(...fields) {
  return (req, res, next) => {
    const missing = [];
    
    for (const field of fields) {
      const value = req.body[field];
      if (value === undefined || value === null || value === '') {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          errors: missing.map(field => ({
            field,
            message: `${field} is required`
          }))
        }
      });
    }
    
    next();
  };
}

/**
 * Validate email field middleware
 */
export function validateEmail(field = 'email') {
  return (req, res, next) => {
    const email = req.body[field];
    
    if (!email) {
      return next();
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid email format',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          errors: [{
            field,
            message: 'Invalid email format'
          }]
        }
      });
    }
    
    next();
  };
}

/**
 * Validate UUID parameter middleware
 */
export function validateUUIDParam(param = 'id') {
  return (req, res, next) => {
    const value = req.params[param];
    
    if (!value) {
      return next();
    }
    
    if (!isValidUUID(value)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid ID format',
          code: 'VALIDATION_ERROR',
          statusCode: 400
        }
      });
    }
    
    next();
  };
}

/**
 * Validate slug middleware
 */
export function validateSlugField(field = 'slug') {
  return (req, res, next) => {
    const slug = req.body[field];
    
    if (!slug) {
      return next();
    }
    
    if (!isValidSlug(slug)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          errors: [{
            field,
            message: 'Invalid slug format'
          }]
        }
      });
    }
    
    next();
  };
}

/**
 * Sanitize body middleware
 */
export function sanitizeBody(...fields) {
  return (req, res, next) => {
    if (fields.length === 0) {
      // Sanitize all string fields
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      }
    } else {
      // Sanitize specific fields
      for (const field of fields) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = sanitizeString(req.body[field]);
        }
      }
    }
    
    next();
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(req, res, next) {
  if (req.query.page) {
    const page = parseInt(req.query.page);
    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid page parameter',
          code: 'VALIDATION_ERROR',
          statusCode: 400
        }
      });
    }
  }
  
  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid limit parameter (must be between 1 and 100)',
          code: 'VALIDATION_ERROR',
          statusCode: 400
        }
      });
    }
  }
  
  next();
}
