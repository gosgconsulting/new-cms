import { query } from './postgres.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

/**
 * Get all tenants
 */
export async function getAllTenants() {
  try {
    const result = await query(`
      SELECT id, name, created_at as "createdAt", updated_at
      FROM tenants
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('[testing] Error getting all tenants:', error);
    throw error;
  }
}

/**
 * Get tenant by ID
 */
export async function getTenantById(id) {
  try {
    // Get tenant details
    const tenantResult = await query(`
      SELECT t.id, t.name, t.created_at as "createdAt", t.updated_at, t.database_url, t.api_key
      FROM tenants t
      WHERE t.id = $1
    `, [id]);
    
    if (tenantResult.rows.length === 0) {
      return null;
    }
    
    const tenant = tenantResult.rows[0];
    
    // Get database details
    const dbResult = await query(`
      SELECT host, port, database_name, username, ssl
      FROM tenant_databases
      WHERE tenant_id = $1
    `, [id]);
    
    if (dbResult.rows.length > 0) {
      tenant.database = dbResult.rows[0];
    }
    
    // Get API keys
    const apiKeysResult = await query(`
      SELECT id, api_key, description, expires_at, created_at
      FROM tenant_api_keys
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `, [id]);
    
    if (apiKeysResult.rows.length > 0) {
      tenant.apiKeys = apiKeysResult.rows;
    }
    
    return tenant;
  } catch (error) {
    console.error(`[testing] Error getting tenant with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new tenant
 */
export async function createTenant(tenantData) {
  try {
    const { name } = tenantData;
    const id = `tenant-${uuidv4().split('-')[0]}`;
    
    const result = await query(`
      INSERT INTO tenants (id, name)
      VALUES ($1, $2)
      RETURNING id, name, created_at as "createdAt", updated_at
    `, [id, name]);
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating tenant:', error);
    throw error;
  }
}

/**
 * Update an existing tenant
 */
export async function updateTenant(id, tenantData) {
  try {
    const { name } = tenantData;
    
    const result = await query(`
      UPDATE tenants
      SET name = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, created_at as "createdAt", updated_at
    `, [id, name]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error(`[testing] Error updating tenant with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a tenant
 */
export async function deleteTenant(id) {
  try {
    // First, check if the tenant exists
    const tenantExists = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [id]);
    
    if (tenantExists.rows.length === 0) {
      return { success: false, message: 'Tenant not found' };
    }
    
    // Delete the tenant (cascade will delete related records)
    await query(`
      DELETE FROM tenants
      WHERE id = $1
    `, [id]);
    
    return { success: true };
  } catch (error) {
    console.error(`[testing] Error deleting tenant with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get database details for a tenant
 */
export async function getTenantDatabaseDetails(tenantId) {
  try {
    const result = await query(`
      SELECT td.host, td.port, td.database_name, td.username, td.ssl
      FROM tenant_databases td
      WHERE td.tenant_id = $1
    `, [tenantId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error(`[testing] Error getting database details for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Set database details for a tenant
 */
export async function setTenantDatabaseDetails(tenantId, dbDetails) {
  try {
    const { host, port, database_name, username, password, ssl } = dbDetails;
    
    // Check if tenant exists
    const tenantExists = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    
    if (tenantExists.rows.length === 0) {
      return { success: false, message: 'Tenant not found' };
    }
    
    // Check if database details already exist for this tenant
    const dbExists = await query(`
      SELECT tenant_id FROM tenant_databases WHERE tenant_id = $1
    `, [tenantId]);
    
    let result;
    
    if (dbExists.rows.length === 0) {
      // Insert new database details
      result = await query(`
        INSERT INTO tenant_databases (tenant_id, host, port, database_name, username, password, ssl)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING tenant_id, host, port, database_name, username, ssl
      `, [tenantId, host, port, database_name, username, password, ssl]);
    } else {
      // Update existing database details
      result = await query(`
        UPDATE tenant_databases
        SET host = $2, port = $3, database_name = $4, username = $5, password = $6, ssl = $7, updated_at = NOW()
        WHERE tenant_id = $1
        RETURNING tenant_id, host, port, database_name, username, ssl
      `, [tenantId, host, port, database_name, username, password, ssl]);
    }
    
    // Update the database_url in the tenants table
    const dbUrl = `postgresql://${username}:${password}@${host}:${port}/${database_name}`;
    await query(`
      UPDATE tenants
      SET database_url = $2, updated_at = NOW()
      WHERE id = $1
    `, [tenantId, dbUrl]);
    
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error(`[testing] Error setting database details for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Generate API key for a tenant
 */
export async function generateTenantApiKey(tenantId, description = 'API Access Key') {
  try {
    // Check if tenant exists
    const tenantExists = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    
    if (tenantExists.rows.length === 0) {
      return { success: false, message: 'Tenant not found' };
    }
    
    // Generate a new API key
    const apiKey = `tenant_${tenantId}_${uuidv4().replace(/-/g, '')}`;
    
    // Store the API key in the tenant_api_keys table
    await query(`
      INSERT INTO tenant_api_keys (tenant_id, api_key, description)
      VALUES ($1, $2, $3)
    `, [tenantId, apiKey, description]);
    
    return { success: true, apiKey };
  } catch (error) {
    console.error(`[testing] Error generating API key for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Get API keys for a tenant
 */
export async function getTenantApiKeys(tenantId) {
  try {
    const result = await query(`
      SELECT id, api_key, description, expires_at, created_at, updated_at
      FROM tenant_api_keys
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `, [tenantId]);
    
    return result.rows;
  } catch (error) {
    console.error(`[testing] Error getting API keys for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Delete an API key
 */
export async function deleteTenantApiKey(keyId) {
  try {
    await query(`
      DELETE FROM tenant_api_keys
      WHERE id = $1
    `, [keyId]);
    
    return { success: true };
  } catch (error) {
    console.error(`[testing] Error deleting API key with ID ${keyId}:`, error);
    throw error;
  }
}

/**
 * Validate an API key
 */
export async function validateApiKey(apiKey) {
  try {
    const result = await query(`
      SELECT tak.tenant_id, t.name
      FROM tenant_api_keys tak
      JOIN tenants t ON tak.tenant_id = t.id
      WHERE tak.api_key = $1
      AND (tak.expires_at IS NULL OR tak.expires_at > NOW())
    `, [apiKey]);
    
    if (result.rows.length === 0) {
      return { valid: false };
    }
    
    return { valid: true, tenant: result.rows[0] };
  } catch (error) {
    console.error(`[testing] Error validating API key:`, error);
    throw error;
  }
}
