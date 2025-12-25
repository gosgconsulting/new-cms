// CORS middleware to handle OPTIONS requests and CORS headers
export const corsMiddleware = (req, res, next) => {
  // Set CORS headers using setHeader for better compatibility with Express 5
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Tenant-Id, X-Access-Key, X-API-Key, x-api-key');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight OPTIONS requests - must return before any other middleware
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

