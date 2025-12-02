import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { getDatabaseState } from '../utils/database.js';
import models from '../../sparti-cms/db/sequelize/models/index.js';
import { Op } from 'sequelize';

const { User } = models;

const router = express.Router();

// ===== USERS ROUTES =====

// Get all users
router.get('/users', authenticateUser, async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          success: false,
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        success: false,
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    console.log(`[testing] API: Fetching all users for tenant: ${req.tenantId}`);
    
    // Build where clause based on user permissions
    const whereClause = {};
    
    // If user is not a super admin, filter by tenant
    if (!req.user.is_super_admin) {
      whereClause.tenant_id = req.tenantId || req.user.tenant_id;
    }
    // Super admins can see all users, so no tenant filter
    
    // Fetch users using Sequelize
    const users = await User.findAll({
      where: whereClause,
      attributes: {
        exclude: ['password_hash'] // Never return password hash
      },
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      users: users.map(user => user.toJSON()),
      total: users.length,
      tenantId: req.tenantId || req.user.tenant_id
    });
  } catch (error) {
    console.error('[testing] API: Error fetching users:', error);
    
    // Handle database not ready errors
    const { dbInitialized } = getDatabaseState();
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      if (!dbInitialized) {
        return res.status(503).json({
          success: false,
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Get user by ID
router.get('/users/:id', authenticateUser, async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          success: false,
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        success: false,
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    console.log(`[testing] API: Fetching user ${userId} for tenant: ${req.tenantId}`);
    
    // Build where clause based on user permissions
    const whereClause = { id: userId };
    
    // If user is not a super admin, filter by tenant
    if (!req.user.is_super_admin) {
      whereClause.tenant_id = req.tenantId || req.user.tenant_id;
    }
    // Super admins can see any user, so no tenant filter
    
    // Fetch user using Sequelize
    const user = await User.findOne({
      where: whereClause,
      attributes: {
        exclude: ['password_hash'] // Never return password hash
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('[testing] API: Error fetching user:', error);
    
    // Handle database not ready errors
    const { dbInitialized } = getDatabaseState();
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      if (!dbInitialized) {
        return res.status(503).json({
          success: false,
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

export default router;
