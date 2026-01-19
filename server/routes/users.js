import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { getDatabaseState } from '../utils/database.js';
import { query } from '../../sparti-cms/db/index.js';
// Lazy-load Sequelize models and utilities inside handlers to avoid boot-time crashes
// when DATABASE_URL is not set. This keeps the server up for health and auth routes.
// Helper to load models and Op on demand.
const loadSequelize = async () => {
  const modelsModule = await import('../../sparti-cms/db/sequelize/models/index.js');
  const sequelizePkg = await import('sequelize');
  return { models: modelsModule.default, Op: sequelizePkg.Op };
};

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
    console.log(`[testing] API: User is_super_admin: ${req.user.is_super_admin}`);
    
    // Build query based on user permissions
    let usersQuery;
    let queryParams = [];
    
    // If user is not a super admin, filter by tenant
    if (!req.user.is_super_admin) {
      const tenantId = req.tenantId || req.user.tenant_id;
      usersQuery = `
        SELECT 
          id, first_name, last_name, email, role, status, 
          is_active, tenant_id, 
          COALESCE(is_super_admin, false) as is_super_admin,
          created_at, updated_at
        FROM users
        WHERE tenant_id = $1
        ORDER BY created_at DESC
      `;
      queryParams = [tenantId];
    } else {
      // Super admins can see all users, including those with tenant_id = NULL
      usersQuery = `
        SELECT 
          id, first_name, last_name, email, role, status, 
          is_active, tenant_id, 
          COALESCE(is_super_admin, false) as is_super_admin,
          created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `;
    }
    
    // Fetch users using raw SQL query
    const result = await query(usersQuery, queryParams);
    const users = result.rows;
    
    console.log(`[testing] API: Found ${users.length} user(s)`);
    
    res.json({
      success: true,
      users: users,
      total: users.length,
      tenantId: req.tenantId || req.user.tenant_id
    });
  } catch (error) {
    console.error('[testing] API: Error fetching users:', error);
    console.error('[testing] API: Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
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
    
    // Build query based on user permissions
    let userQuery;
    let queryParams = [userId];
    
    // If user is not a super admin, filter by tenant
    if (!req.user.is_super_admin) {
      const tenantId = req.tenantId || req.user.tenant_id;
      userQuery = `
        SELECT 
          id, first_name, last_name, email, role, status, 
          is_active, tenant_id, 
          COALESCE(is_super_admin, false) as is_super_admin,
          created_at, updated_at
        FROM users
        WHERE id = $1 AND tenant_id = $2
      `;
      queryParams = [userId, tenantId];
    } else {
      // Super admins can see any user
      userQuery = `
        SELECT 
          id, first_name, last_name, email, role, status, 
          is_active, tenant_id, 
          COALESCE(is_super_admin, false) as is_super_admin,
          created_at, updated_at
        FROM users
        WHERE id = $1
      `;
    }
    
    // Fetch user using raw SQL query
    const result = await query(userQuery, queryParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
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

// Create new user
router.post('/users', authenticateUser, async (req, res) => {
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

    const {
      first_name,
      last_name,
      email,
      password,
      role,
      status,
      tenant_id,
      is_super_admin,
      is_active
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'first_name, last_name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    console.log(`[testing] API: Creating user for tenant: ${req.tenantId || req.user.tenant_id}`);

    // Hash password
    const bcrypt = await import('bcrypt');
    const password_hash = await bcrypt.hash(password, 10);

    // Determine tenant_id based on permissions
    let finalTenantId = tenant_id;
    if (!req.user.is_super_admin) {
      // Non-super-admins can only create users for their own tenant
      finalTenantId = req.tenantId || req.user.tenant_id;
    }
    // Super admins can create users for any tenant or no tenant

    // Create user using Sequelize
    const { models } = await loadSequelize();
    const user = await models.User.create({
      first_name,
      last_name,
      email,
      password_hash,
      role: role || 'user',
      status: status || 'active',
      tenant_id: finalTenantId,
      is_super_admin: is_super_admin || false,
      is_active: is_active !== undefined ? is_active : true
    });

    // Fetch the created user without password hash
    const createdUser = await models.User.findByPk(user.id, {
      attributes: {
        exclude: ['password_hash']
      }
    });

    res.status(201).json({
      success: true,
      user: createdUser.toJSON()
    });
  } catch (error) {
    console.error('[testing] API: Error creating user:', error);
    
    // Handle unique constraint violations (duplicate email)
    if (error.name === 'SequelizeUniqueConstraintError' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists',
        message: 'A user with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// Update user by ID
router.put('/users/:id', authenticateUser, async (req, res) => {
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

    const {
      first_name,
      last_name,
      email,
      password,
      role,
      status,
      tenant_id,
      is_super_admin,
      is_active
    } = req.body;

    console.log(`[testing] API: Updating user ${userId} for tenant: ${req.tenantId || req.user.tenant_id}`);

    // Build where clause based on user permissions
    const whereClause = { id: userId };
    
    // If user is not a super admin, filter by tenant
    if (!req.user.is_super_admin) {
      whereClause.tenant_id = req.tenantId || req.user.tenant_id;
    }
    // Super admins can update any user, so no tenant filter
    
    // Find the user
    const { models } = await loadSequelize();
    const user = await models.User.findOne({ where: whereClause });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Build update data
    const updateData = {};
    
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
      updateData.email = email;
    }
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    // Handle password update if provided
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long'
        });
      }
      const bcrypt = await import('bcrypt');
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    
    // Handle tenant_id and is_super_admin based on permissions
    if (req.user.is_super_admin) {
      // Super admins can change tenant_id and is_super_admin
      if (tenant_id !== undefined) updateData.tenant_id = tenant_id;
      if (is_super_admin !== undefined) updateData.is_super_admin = is_super_admin;
    } else {
      // Non-super-admins cannot change tenant_id or is_super_admin
      // They can only update users in their own tenant
    }

    // Update the user
    await user.update(updateData);

    // Fetch the updated user without password hash
    const updatedUser = await models.User.findByPk(user.id, {
      attributes: {
        exclude: ['password_hash']
      }
    });

    res.json({
      success: true,
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('[testing] API: Error updating user:', error);
    
    // Handle unique constraint violations (duplicate email)
    if (error.name === 'SequelizeUniqueConstraintError' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists',
        message: 'A user with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// Change user password
router.put('/users/:id/password', authenticateUser, async (req, res) => {
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

    const { current_password, new_password } = req.body;

    // Validate required fields
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'current_password and new_password are required'
      });
    }

    // Validate new password length
    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    console.log(`[testing] API: Changing password for user ${userId}`);

    // Find the user - users can only change their own password unless they're super admin
    const whereClause = { id: userId };
    
    // Regular users can only change their own password
    if (!req.user.is_super_admin && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only change your own password'
      });
    }
    
    const { models } = await loadSequelize();
    const user = await models.User.findOne({ where: whereClause });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const bcrypt = await import('bcrypt');
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid current password',
        message: 'The current password is incorrect'
      });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    await user.update({ password_hash });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('[testing] API: Error changing password:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
      message: error.message
    });
  }
});

// Delete user by ID
router.delete('/users/:id', authenticateUser, async (req, res) => {
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

    // Prevent users from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete own account',
        message: 'You cannot delete your own account'
      });
    }

    console.log(`[testing] API: Deleting user ${userId} for tenant: ${req.tenantId || req.user.tenant_id}`);

    // Build where clause based on user permissions
    const whereClause = { id: userId };
    
    // If user is not a super admin, filter by tenant
    if (!req.user.is_super_admin) {
      whereClause.tenant_id = req.tenantId || req.user.tenant_id;
    }
    // Super admins can delete any user, so no tenant filter
    
    // Find and delete the user
    const { models } = await loadSequelize();
    const user = await models.User.findOne({ where: whereClause });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('[testing] API: Error deleting user:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

export default router;