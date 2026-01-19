/**
 * Request Logger Middleware
 * Logs incoming requests for debugging and monitoring
 */

/**
 * Simple request logger
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
                       res.statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
                       '\x1b[32m'; // Green for success
    
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ` +
      `${statusColor}${res.statusCode}\x1b[0m ${duration}ms`
    );
  });

  next();
}

/**
 * Detailed request logger with user info
 */
export function detailedRequestLogger(req, res, next) {
  const start = Date.now();
  
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id || null
  };

  console.log('[Request]', JSON.stringify(logData));

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log('[Response]', JSON.stringify({
      ...logData,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    }));
  });

  next();
}

/**
 * Request ID middleware
 * Adds a unique ID to each request for tracking
 */
export function requestId(req, res, next) {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
}
