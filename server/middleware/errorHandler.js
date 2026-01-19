/**
 * Centralized Error Handler Middleware
 * Provides consistent error responses across the application
 */

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Format error response
 */
function formatErrorResponse(error, includeStack = false) {
  const response = {
    success: false,
    error: {
      message: error.message || 'An error occurred',
      code: error.code || 'INTERNAL_ERROR',
      statusCode: error.statusCode || 500
    }
  };

  // Add validation errors if present
  if (error.errors && Array.isArray(error.errors)) {
    response.error.errors = error.errors;
  }

  // Add stack trace in development
  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
}

/**
 * Main error handler middleware
 * Should be registered last in the middleware chain
 */
export function errorHandler(err, req, res, next) {
  // Log error
  console.error('[ErrorHandler] Error caught:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack
  });

  // Determine if we should include stack trace
  const includeStack = process.env.NODE_ENV === 'development';

  // Handle known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json(formatErrorResponse(err, includeStack));
  }

  // Handle database errors
  if (err.code && err.code.startsWith('23')) {
    // PostgreSQL constraint violations
    let message = 'Database constraint violation';
    let statusCode = 400;

    switch (err.code) {
      case '23505': // unique_violation
        message = 'A record with this value already exists';
        statusCode = 409;
        break;
      case '23503': // foreign_key_violation
        message = 'Referenced record does not exist';
        break;
      case '23502': // not_null_violation
        message = 'Required field is missing';
        break;
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        code: 'DATABASE_CONSTRAINT_VIOLATION',
        statusCode,
        ...(includeStack && { details: err.message })
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN',
        statusCode: 401
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication token has expired',
        code: 'TOKEN_EXPIRED',
        statusCode: 401
      }
    });
  }

  // Handle validation errors from libraries
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        errors: err.errors
      }
    });
  }

  // Handle multer errors (file upload)
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size exceeds limit';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
    }

    return res.status(400).json({
      success: false,
      error: {
        message,
        code: 'FILE_UPLOAD_ERROR',
        statusCode: 400
      }
    });
  }

  // Handle unexpected errors
  console.error('[ErrorHandler] Unexpected error:', err);

  return res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      ...(includeStack && { stack: err.stack })
    }
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 * Should be registered before error handler
 */
export function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
}

/**
 * Validation middleware helper
 * Validates request data against a schema
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source];
    
    try {
      // If using Joi or similar validation library
      if (schema.validate) {
        const { error, value } = schema.validate(data, { abortEarly: false });
        
        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));
          
          throw new ValidationError('Validation failed', errors);
        }
        
        // Replace request data with validated/sanitized data
        req[source] = value;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}
