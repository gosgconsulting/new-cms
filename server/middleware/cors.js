// CORS middleware to handle OPTIONS requests and CORS headers
export const corsMiddleware = (req, res, next) => {
  try {
    // Get the origin from the request, or use '*' if not present
    // Note: If credentials are needed, we must use the specific origin, not '*'
    const origin = req.headers.origin || '*';
    
    // Set CORS headers - use res.header() which works consistently in Express
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Tenant-Id, X-Access-Key, X-API-Key, x-api-key');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Authorization, X-Requested-With');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Only set credentials if we have a specific origin (not '*')
    // Browsers reject credentials with wildcard origin
    if (origin !== '*') {
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    // Handle preflight OPTIONS requests - must return before any other middleware
    if (req.method === 'OPTIONS') {
      console.log('[testing] CORS: Handling OPTIONS preflight request for', req.path, 'from origin', origin);
      // Send 200 OK with no body for preflight requests
      return res.status(200).send();
    }
    
    next();
  } catch (error) {
    console.error('[testing] CORS middleware error:', error);
    // Even if there's an error, continue to next middleware
    next();
  }
};

