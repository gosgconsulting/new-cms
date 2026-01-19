/**
 * Rate Limiter Middleware
 * Prevents abuse by limiting request rates
 */

// Simple in-memory store for rate limiting
// In production, use Redis or similar
const requestCounts = new Map();

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 60000) { // 1 minute
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} keyGenerator - Function to generate rate limit key
 */
export function rateLimiter(maxRequests = 100, windowMs = 60000, keyGenerator = null) {
  return (req, res, next) => {
    // Generate key (default: IP address)
    const key = keyGenerator ? keyGenerator(req) : req.ip || req.connection?.remoteAddress || 'unknown';

    const now = Date.now();
    const data = requestCounts.get(key);

    if (!data || now - data.resetTime > windowMs) {
      // New window
      requestCounts.set(key, {
        count: 1,
        resetTime: now
      });
      
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      return next();
    }

    // Increment count
    data.count++;

    if (data.count > maxRequests) {
      // Rate limit exceeded
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(data.resetTime + windowMs).toISOString());
      res.setHeader('Retry-After', Math.ceil((data.resetTime + windowMs - now) / 1000));

      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
          statusCode: 429,
          retryAfter: Math.ceil((data.resetTime + windowMs - now) / 1000)
        }
      });
    }

    // Update headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - data.count);
    res.setHeader('X-RateLimit-Reset', new Date(data.resetTime + windowMs).toISOString());

    next();
  };
}

/**
 * Strict rate limiter for auth endpoints
 */
export function authRateLimiter() {
  return rateLimiter(5, 60000); // 5 requests per minute
}

/**
 * API rate limiter
 */
export function apiRateLimiter() {
  return rateLimiter(100, 60000); // 100 requests per minute
}

/**
 * Upload rate limiter
 */
export function uploadRateLimiter() {
  return rateLimiter(10, 60000); // 10 uploads per minute
}

/**
 * Per-user rate limiter
 */
export function userRateLimiter(maxRequests = 1000, windowMs = 60000) {
  return rateLimiter(maxRequests, windowMs, (req) => {
    return req.user?.id || req.ip || 'anonymous';
  });
}
