import { query } from './index.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

/**
 * Get all tenants with full data (including database details and API keys)
 */
export async function getAllTenants() {
  try {
    // Get all tenant basic details with database info
    const tenantsResult = await query(`
      SELECT 
        t.id, 
        t.name, 
        t.created_at as "createdAt", 
        t.updated_at, 
        t.database_url, 
        t.api_key,
        t.theme_id,
        t.slug,
        td.host as db_host,
        td.port as db_port,
        td.database_name as db_database_name,
        td.username as db_username,
        td.ssl as db_ssl
      FROM tenants t
      LEFT JOIN tenant_databases td ON t.id = td.tenant_id
      ORDER BY t.created_at DESC
    `);
    
    // Group tenants and their database info
    const tenantMap = new Map();
    
    for (const row of tenantsResult.rows) {
      if (!tenantMap.has(row.id)) {
        tenantMap.set(row.id, {
          id: row.id,
          name: row.name,
          createdAt: row.createdAt,
          updated_at: row.updated_at,
          database_url: row.database_url,
          api_key: row.api_key,
          theme_id: row.theme_id,
          slug: row.slug,
        });
        
        // Add database details if available
        if (row.db_host) {
          tenantMap.get(row.id).database = {
            host: row.db_host,
            port: row.db_port,
            database_name: row.db_database_name,
            username: row.db_username,
            ssl: row.db_ssl,
          };
        }
      }
    }
    
    const tenants = Array.from(tenantMap.values());
    
    // Get all API keys for all tenants in one query
    const apiKeysResult = await query(`
      SELECT 
        tenant_id,
        id,
        api_key,
        description,
        expires_at,
        created_at
      FROM tenant_api_keys
      ORDER BY tenant_id, created_at DESC
    `);
    
    // Group API keys by tenant_id
    const apiKeysByTenant = new Map();
    for (const key of apiKeysResult.rows) {
      if (!apiKeysByTenant.has(key.tenant_id)) {
        apiKeysByTenant.set(key.tenant_id, []);
      }
      apiKeysByTenant.get(key.tenant_id).push({
        id: key.id,
        api_key: key.api_key,
        description: key.description,
        expires_at: key.expires_at,
        created_at: key.created_at,
      });
    }
    
    // Attach API keys to tenants
    for (const tenant of tenants) {
      if (apiKeysByTenant.has(tenant.id)) {
        tenant.apiKeys = apiKeysByTenant.get(tenant.id);
      }
    }
    
    return tenants;
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
      SELECT t.id, t.name, t.created_at as "createdAt", t.updated_at, t.database_url, t.api_key, t.theme_id, t.slug
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
    const { name, theme_id } = tenantData;
    const id = `tenant-${uuidv4().split('-')[0]}`;
    
    const result = await query(`
      INSERT INTO tenants (id, name, theme_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, created_at as "createdAt", updated_at, theme_id
    `, [id, name, theme_id || null]);
    
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
    const { name, theme_id } = tenantData;
    
    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    
    if (theme_id !== undefined) {
      updates.push(`theme_id = $${paramIndex++}`);
      values.push(theme_id || null);
    }
    
    if (updates.length === 0) {
      // No updates provided, just return the tenant
      return await getTenantById(id);
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const result = await query(`
      UPDATE tenants
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, created_at as "createdAt", updated_at, theme_id
    `, values);
    
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
 * Generate API key for a theme
 * Uses tenant_api_keys table with special tenant_id format: theme-{themeId}
 */
export async function generateThemeApiKey(themeId, description = 'API Access Key') {
  try {
    console.log(`[testing] generateThemeApiKey called with themeId: ${themeId}`);
    
    // Check if theme exists
    const themeExists = await query(`
      SELECT id, slug FROM themes WHERE id = $1 OR slug = $1
    `, [themeId]);
    
    console.log(`[testing] Theme query result:`, themeExists.rows);
    
    if (themeExists.rows.length === 0) {
      console.log(`[testing] Theme ${themeId} not found in database`);
      return { success: false, message: `Theme '${themeId}' not found in database. Please sync themes first.` };
    }
    
    // Use theme slug or id as the identifier
    const themeIdentifier = themeExists.rows[0].slug || themeExists.rows[0].id;
    const themeTenantId = `theme-${themeIdentifier}`;
    
    console.log(`[testing] Using theme identifier: ${themeIdentifier}, tenant_id: ${themeTenantId}`);
    
    // Generate a new API key
    const apiKey = `theme_${themeIdentifier}_${uuidv4().replace(/-/g, '')}`;
    
    console.log(`[testing] Generated API key: ${apiKey.substring(0, 20)}...`);
    
    // Store the API key in the tenant_api_keys table with special tenant_id format
    // Note: This may fail if there's a foreign key constraint. We'll handle that.
    try {
      await query(`
        INSERT INTO tenant_api_keys (tenant_id, api_key, description)
        VALUES ($1, $2, $3)
      `, [themeTenantId, apiKey, description]);
    } catch (insertError) {
      // Check if it's a foreign key constraint error
      if (insertError.code === '23503' || insertError.constraint === 'tenant_api_keys_tenant_id_fkey') {
        // Foreign key constraint violation - we need to create a virtual tenant entry
        // or modify the constraint. For now, let's try to insert without the constraint check.
        console.log(`[testing] Foreign key constraint detected, attempting workaround...`);
        
        // Try to temporarily disable the constraint or use a workaround
        // Option 1: Create a minimal tenant entry for the theme
        try {
          await query(`
            INSERT INTO tenants (id, name, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, [themeTenantId, `Theme: ${themeIdentifier}`]);
          
          // Now try inserting the API key again
          await query(`
            INSERT INTO tenant_api_keys (tenant_id, api_key, description)
            VALUES ($1, $2, $3)
          `, [themeTenantId, apiKey, description]);
        } catch (tenantError) {
          console.error(`[testing] Error creating virtual tenant or inserting API key:`, tenantError);
          throw new Error(`Failed to create API key: Database constraint violation. Please ensure the theme exists in the database.`);
        }
      } else {
        // Re-throw other errors
        throw insertError;
      }
    }
    
    console.log(`[testing] API key stored successfully`);
    
    return { success: true, apiKey };
  } catch (error) {
    console.error(`[testing] Error generating API key for theme ${themeId}:`, error);
    console.error(`[testing] Error details:`, {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
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
