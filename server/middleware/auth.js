import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';

// Authentication middleware
export const authenticateUser = (req, res, next) => {
  // Check if user is already authenticated via access key
  if (req.user) {
    // Set tenant for access key users
    if (req.user.is_super_admin) {
      req.tenantId = req.query.tenantId || req.headers['x-tenant-id'] || req.user.tenant_id;
    } else {
      req.tenantId = req.user.tenant_id;
    }
    return next();
  }

  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    // Set tenant based on user type
    if (req.user.is_super_admin) {
      req.tenantId = req.query.tenantId || req.headers['x-tenant-id'] || req.user.tenant_id;
    } else {
      req.tenantId = req.user.tenant_id; // Force user's own tenant
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

