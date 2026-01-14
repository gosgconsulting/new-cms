import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';

// Authentication middleware
export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];

    // Development shortcut: accept a special dev super admin token
    if (process.env.NODE_ENV === 'development' && token === 'dev-super-admin-token') {
      req.user = {
        id: 'dev-super-admin',
        first_name: 'Dev',
        last_name: 'Admin',
        email: 'admin@local.dev',
        role: 'admin',
        tenant_id: null,
        is_super_admin: true
      };
      return next();
    }

    // Normal JWT verification
    if (!JWT_SECRET) {
      return res.status(500).json({ success: false, error: 'Server configuration error: JWT_SECRET not set' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Authentication middleware error' });
  }
};