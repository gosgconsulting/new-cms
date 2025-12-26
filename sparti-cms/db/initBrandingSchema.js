import { query } from './index.js';
import { brandingSettingsSchema } from './schemas/brandingSchema.js';

/**
 * Initialize or update branding schema for a tenant
 * @param {string|null} tenantId - Tenant ID or null for global
 * @param {string} language - Language code (default: 'default')
 */
export async function initBrandingSchema(tenantId = null, language = 'default') {
  try {
    console.log('[Schema Init] Initializing branding schema for tenant:', tenantId, 'language:', language);
    
    // Use a special tenant_id for global schemas
    const schemaTenantId = tenantId || '_global';
    
    // Check if schema already exists
    const existing = await query(
      'SELECT id FROM site_schemas WHERE tenant_id = $1 AND schema_key = $2 AND language = $3',
      [schemaTenantId, 'branding_settings', language]
    );
    
    if (existing.rows.length > 0) {
      // Update existing schema
      await query(
        `UPDATE site_schemas 
         SET schema_value = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE tenant_id = $2 AND schema_key = $3 AND language = $4`,
        [JSON.stringify(brandingSettingsSchema), schemaTenantId, 'branding_settings', language]
      );
      console.log('[Schema Init] Updated existing branding schema');
    } else {
      // Insert new schema
      await query(
        `INSERT INTO site_schemas (tenant_id, schema_key, schema_value, language) 
         VALUES ($1, $2, $3, $4)`,
        [schemaTenantId, 'branding_settings', JSON.stringify(brandingSettingsSchema), language]
      );
      console.log('[Schema Init] Created new branding schema');
    }
    
    return { success: true };
  } catch (error) {
    console.error('[Schema Init] Error initializing branding schema:', error);
    throw error;
  }
}

/**
 * Get branding schema for a tenant
 */
export async function getBrandingSchema(tenantId = null, language = 'default') {
  try {
    const schemaTenantId = tenantId || '_global';
    
    const result = await query(
      'SELECT schema_value FROM site_schemas WHERE tenant_id = $1 AND schema_key = $2 AND language = $3',
      [schemaTenantId, 'branding_settings', language]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].schema_value;
    }
    
    // If not found, initialize it
    await initBrandingSchema(tenantId, language);
    return brandingSettingsSchema;
  } catch (error) {
    console.error('[Schema] Error getting branding schema:', error);
    return brandingSettingsSchema; // Return default schema on error
  }
}

/**
 * Initialize branding schemas for all existing tenants
 */
export async function initAllTenantBrandingSchemas() {
  try {
    console.log('[Schema Init] Initializing branding schemas for all tenants...');
    
    // Get all tenants
    const tenants = await query('SELECT id FROM tenants');
    
    // Initialize global schema
    await initBrandingSchema(null, 'default');
    
    // Initialize for each tenant
    for (const tenant of tenants.rows) {
      await initBrandingSchema(tenant.id, 'default');
    }
    
    console.log(`[Schema Init] Initialized branding schemas for ${tenants.rows.length} tenants + global`);
    return { success: true, count: tenants.rows.length + 1 };
  } catch (error) {
    console.error('[Schema Init] Error initializing all tenant schemas:', error);
    throw error;
  }
}