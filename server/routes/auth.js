import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../../sparti-cms/db/index.js';
import { JWT_SECRET } from '../config/constants.js';
import { authenticateUser } from '../middleware/auth.js';
import { getDatabaseState } from '../utils/database.js';
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantDatabaseDetails,
  setTenantDatabaseDetails,
  generateTenantApiKey,
  getTenantApiKeys,
  deleteTenantApiKey,
  validateApiKey
} from '../../sparti-cms/db/tenant-management.js';

const router = express.Router();

// ===== AUTHENTICATION ROUTES =====

// Login endpoint
router.post('/auth/login', async (req, res) => {
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

    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const userResult = await query(
      'SELECT id, first_name, last_name, email, password_hash, role, is_active, tenant_id, is_super_admin FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Verify password
    const bcrypt = await import('bcrypt');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create JWT token
    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      is_super_admin: user.is_super_admin
    };
    
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });

    // Return user data with token
    res.json({
      success: true,
      user: userData,
      token: token
    });

  } catch (error) {
    console.error('[testing] Login error:', error);
    
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
      error: 'Login failed. Please try again.'
    });
  }
});

// Get current user from token
router.get('/auth/me', authenticateUser, async (req, res) => {
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

    const userId = req.user.id;
    const userResult = await query(
      'SELECT id, first_name, last_name, email, role, status, tenant_id, is_super_admin FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ success: false, error: 'Account is not active' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        is_super_admin: user.is_super_admin
      }
    });

  } catch (error) {
    console.error('[testing] Error fetching current user:', error);
    
    // Handle database not ready errors gracefully
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
      error: 'Failed to fetch user data.' 
    });
  }
});

// Verify access key and return user data
router.get('/auth/verify-access-key', async (req, res) => {
  try {
    const { access_key } = req.query;

    if (!access_key) {
      return res.status(400).json({
        success: false,
        error: 'Access key is required'
      });
    }

    // Find the access key and get user data
    const result = await query(`
      SELECT 
        uak.id as key_id,
        uak.access_key,
        uak.key_name,
        uak.last_used_at,
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.is_active,
        u.tenant_id,
        u.is_super_admin
      FROM user_access_keys uak
      JOIN users u ON uak.user_id = u.id
      WHERE uak.access_key = $1 AND uak.is_active = true
    `, [access_key]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired access key'
      });
    }

    const keyData = result.rows[0];

    // Check if user is active
    if (!keyData.is_active) {
      return res.status(401).json({
        success: false,
        error: 'User account is not active'
      });
    }

    // Update last_used_at timestamp
    await query(
      'UPDATE user_access_keys SET last_used_at = NOW() WHERE id = $1',
      [keyData.key_id]
    );

    res.json({
      success: true,
      user: {
        id: keyData.id,
        first_name: keyData.first_name,
        last_name: keyData.last_name,
        email: keyData.email,
        role: keyData.role,
        tenant_id: keyData.tenant_id,
        is_super_admin: keyData.is_super_admin
      },
      access_key_info: {
        key_name: keyData.key_name,
        last_used_at: keyData.last_used_at
      }
    });

  } catch (error) {
    console.error('[testing] Error verifying access key:', error);
    console.error('[testing] Error details:', error.message);
    console.error('[testing] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to verify access key'
    });
  }
});

// ===== ACCESS KEYS MANAGEMENT ROUTES =====

// Generate new access key
router.post('/access-keys/generate', authenticateUser, async (req, res) => {
  try {
    const { key_name } = req.body;
    const userId = req.user.id;

    if (!key_name || key_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Key name is required'
      });
    }

    // Generate a unique access key (UUID v4)
    const { v4: uuidv4 } = await import('uuid');
    const accessKey = uuidv4();

    // Insert the new access key
    const result = await query(
      'INSERT INTO user_access_keys (user_id, access_key, key_name) VALUES ($1, $2, $3) RETURNING id, access_key, key_name, created_at',
      [userId, accessKey, key_name.trim()]
    );

    const newKey = result.rows[0];

    res.json({
      success: true,
      access_key: newKey.access_key,
      key_name: newKey.key_name,
      created_at: newKey.created_at,
      message: 'Access key generated successfully. Save this key - it won\'t be shown again.'
    });

  } catch (error) {
    console.error('[testing] Error generating access key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate access key'
    });
  }
});

// List user's access keys
router.get('/access-keys', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { include_inactive } = req.query;

    let queryStr = `
      SELECT id, key_name, access_key, is_active, last_used_at, created_at, updated_at
      FROM user_access_keys 
      WHERE user_id = $1
    `;
    const queryParams = [userId];

    if (include_inactive !== 'true') {
      queryStr += ' AND is_active = true';
    }

    queryStr += ' ORDER BY created_at DESC';

    const result = await query(queryStr, queryParams);

    // Mask the access keys for security
    const maskedKeys = result.rows.map(key => ({
      ...key,
      access_key: key.access_key.length > 8 
        ? key.access_key.substring(0, 4) + '...' + key.access_key.substring(key.access_key.length - 4)
        : '****'
    }));

    res.json({
      success: true,
      access_keys: maskedKeys
    });

  } catch (error) {
    console.error('[testing] Error fetching access keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch access keys'
    });
  }
});

// Revoke access key
router.delete('/access-keys/:keyId', authenticateUser, async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.user.id;

    // Verify the key belongs to the user
    const checkResult = await query(
      'SELECT id FROM user_access_keys WHERE id = $1 AND user_id = $2',
      [keyId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Access key not found or you do not have permission to revoke it'
      });
    }

    // Revoke the key (set is_active to false)
    await query(
      'UPDATE user_access_keys SET is_active = false, updated_at = NOW() WHERE id = $1',
      [keyId]
    );

    res.json({
      success: true,
      message: 'Access key revoked successfully'
    });

  } catch (error) {
    console.error('[testing] Error revoking access key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke access key'
    });
  }
});

// ===== TENANT ROUTES =====

// Get all tenants
router.get('/tenants', authenticateUser, async (req, res) => {
  try {
    if (!req.user.is_super_admin) {
      return res.json([{ id: req.tenantId, name: req.user.tenant_id }]);
    }
    // Fetch all tenants for super admin
    const tenants = await query('SELECT DISTINCT tenant_id as id, tenant_id as name FROM users ORDER BY tenant_id');
    res.json(tenants.rows);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Get tenant by ID
router.get('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await getTenantById(id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    console.error(`[testing] Error getting tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get tenant' });
  }
});

// Create a new tenant
router.post('/tenants', async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Tenant name is required' });
    }
    
    const newTenant = await createTenant({ name });
    
    res.status(201).json(newTenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// Update an existing tenant
router.put('/tenants/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Tenant name is required' });
    }
    
    const updatedTenant = await updateTenant(req.params.id, { name });
    
    if (!updatedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(updatedTenant);
  } catch (error) {
    console.error(`[testing] Error updating tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// Delete a tenant
router.delete('/tenants/:id', async (req, res) => {
  try {
    const result = await deleteTenant(req.params.id);
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error(`[testing] Error deleting tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

// Get database details for a tenant
router.get('/tenants/:id/database', async (req, res) => {
  try {
    const dbDetails = await getTenantDatabaseDetails(req.params.id);
    
    if (!dbDetails) {
      return res.status(404).json({ error: 'Database details not found for this tenant' });
    }
    
    res.json(dbDetails);
  } catch (error) {
    console.error(`[testing] Error getting database details for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get database details' });
  }
});

// Set database details for a tenant
router.post('/tenants/:id/database', async (req, res) => {
  try {
    const { host, port, database_name, username, password, ssl } = req.body;
    
    // Validate required fields
    if (!host || !database_name || !username || !password) {
      return res.status(400).json({ error: 'Host, database name, username, and password are required' });
    }
    
    const result = await setTenantDatabaseDetails(req.params.id, {
      host,
      port: port || 5432,
      database_name,
      username,
      password,
      ssl: ssl !== undefined ? ssl : true
    });
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    res.json(result.data);
  } catch (error) {
    console.error(`[testing] Error setting database details for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to set database details' });
  }
});

// Generate API key for a tenant
router.post('/tenants/:id/api-keys', async (req, res) => {
  try {
    const { description } = req.body;
    
    const result = await generateTenantApiKey(req.params.id, description || 'API Access Key');
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    res.json({ apiKey: result.apiKey });
  } catch (error) {
    console.error(`[testing] Error generating API key for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// Get API keys for a tenant
router.get('/tenants/:id/api-keys', async (req, res) => {
  try {
    const apiKeys = await getTenantApiKeys(req.params.id);
    res.json(apiKeys);
  } catch (error) {
    console.error(`[testing] Error getting API keys for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get API keys' });
  }
});

// Delete an API key
router.delete('/tenants/:id/api-keys/:keyId', async (req, res) => {
  try {
    await deleteTenantApiKey(req.params.keyId);
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error(`[testing] Error deleting API key with ID ${req.params.keyId}:`, error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// Validate an API key
router.post('/tenants/validate-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    const result = await validateApiKey(apiKey);
    res.json(result);
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({ error: 'Failed to validate API key' });
  }
});

export default router;

