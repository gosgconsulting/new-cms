import express from 'express';
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
} from './tenant-management.js';

const router = express.Router();

/**
 * Get all tenants
 * GET /api/tenants
 */
router.get('/', async (req, res) => {
  try {
    const tenants = await getAllTenants();
    res.json(tenants);
  } catch (error) {
    console.error('Error getting tenants:', error);
    res.status(500).json({ error: 'Failed to get tenants' });
  }
});

/**
 * Get tenant by ID
 * GET /api/tenants/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const tenant = await getTenantById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    console.error(`Error getting tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get tenant' });
  }
});

/**
 * Create a new tenant
 * POST /api/tenants
 */
router.post('/', async (req, res) => {
  try {
    const { name, plan, status, description } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Tenant name is required' });
    }
    
    const newTenant = await createTenant({
      name,
      plan: plan || 'Standard',
      status: status || 'active',
      description: description || ''
    });
    
    res.status(201).json(newTenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

/**
 * Update an existing tenant
 * PUT /api/tenants/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, plan, status, description } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Tenant name is required' });
    }
    
    const updatedTenant = await updateTenant(req.params.id, {
      name,
      plan: plan || 'Standard',
      status: status || 'active',
      description: description || ''
    });
    
    if (!updatedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(updatedTenant);
  } catch (error) {
    console.error(`Error updating tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

/**
 * Delete a tenant
 * DELETE /api/tenants/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteTenant(req.params.id);
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error(`Error deleting tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

/**
 * Get database details for a tenant
 * GET /api/tenants/:id/database
 */
router.get('/:id/database', async (req, res) => {
  try {
    const dbDetails = await getTenantDatabaseDetails(req.params.id);
    
    if (!dbDetails) {
      return res.status(404).json({ error: 'Database details not found for this tenant' });
    }
    
    res.json(dbDetails);
  } catch (error) {
    console.error(`Error getting database details for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get database details' });
  }
});

/**
 * Set database details for a tenant
 * POST /api/tenants/:id/database
 */
router.post('/:id/database', async (req, res) => {
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
    console.error(`Error setting database details for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to set database details' });
  }
});

/**
 * Generate API key for a tenant
 * POST /api/tenants/:id/api-keys
 */
router.post('/:id/api-keys', async (req, res) => {
  try {
    const { description } = req.body;
    
    const result = await generateTenantApiKey(req.params.id, description || 'API Access Key');
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    res.json({ apiKey: result.apiKey });
  } catch (error) {
    console.error(`Error generating API key for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

/**
 * Get API keys for a tenant
 * GET /api/tenants/:id/api-keys
 */
router.get('/:id/api-keys', async (req, res) => {
  try {
    const apiKeys = await getTenantApiKeys(req.params.id);
    res.json(apiKeys);
  } catch (error) {
    console.error(`Error getting API keys for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get API keys' });
  }
});

/**
 * Delete an API key
 * DELETE /api/tenants/:id/api-keys/:keyId
 */
router.delete('/:id/api-keys/:keyId', async (req, res) => {
  try {
    await deleteTenantApiKey(req.params.keyId);
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error(`Error deleting API key with ID ${req.params.keyId}:`, error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

/**
 * Validate an API key
 * POST /api/tenants/validate-api-key
 */
router.post('/validate-api-key', async (req, res) => {
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
