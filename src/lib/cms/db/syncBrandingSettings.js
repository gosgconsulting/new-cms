import { query } from './index.js';
import { getDefaultBrandingSettings, brandingSettingsSchema } from './schemas/brandingSchema.js';

/**
 * Get all branding settings for a tenant
 */
export async function getTenantBrandingSettings(tenantId = null) {
  try {
    const result = await query(
      tenantId
        ? `SELECT setting_key, setting_value, setting_type 
           FROM site_settings 
           WHERE tenant_id = $1 AND setting_category = 'branding'`
        : `SELECT setting_key, setting_value, setting_type 
           FROM site_settings 
           WHERE tenant_id IS NULL AND setting_category = 'branding'`,
      tenantId ? [tenantId] : []
    );

    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return settings;
  } catch (error) {
    console.error('[Sync] Error getting tenant branding settings:', error);
    throw error;
  }
}

/**
 * Get list of all required branding setting keys from schema
 */
export function getRequiredBrandingKeys() {
  return Object.keys(brandingSettingsSchema.properties);
}

/**
 * Check which branding settings are missing for a tenant
 */
export async function getMissingBrandingSettings(tenantId = null) {
  try {
    const currentSettings = await getTenantBrandingSettings(tenantId);
    const requiredKeys = getRequiredBrandingKeys();
    const missingKeys = requiredKeys.filter(key => !(key in currentSettings));
    
    return {
      tenantId,
      total: requiredKeys.length,
      existing: Object.keys(currentSettings).length,
      missing: missingKeys.length,
      missingKeys
    };
  } catch (error) {
    console.error('[Sync] Error checking missing settings:', error);
    throw error;
  }
}

/**
 * Sync branding settings from source tenant to target tenant
 */
export async function syncBrandingSettings(sourceTenantId = null, targetTenantId, options = {}) {
  try {
    const {
      overwrite = false,  // If true, overwrite existing settings
      onlyMissing = true, // If true, only add missing settings
      excludeKeys = []    // Keys to exclude from sync
    } = options;

    console.log('[Sync] Syncing branding from', sourceTenantId || 'global', 'to', targetTenantId);
    console.log('[Sync] Options:', { overwrite, onlyMissing, excludeKeys });

    // Get source settings
    const sourceSettings = await getTenantBrandingSettings(sourceTenantId);
    
    // Get target settings
    const targetSettings = await getTenantBrandingSettings(targetTenantId);

    const updates = [];
    const inserts = [];
    const skipped = [];

    for (const [key, value] of Object.entries(sourceSettings)) {
      // Skip excluded keys
      if (excludeKeys.includes(key)) {
        skipped.push(key);
        continue;
      }

      const existsInTarget = key in targetSettings;

      if (existsInTarget) {
        if (overwrite && !onlyMissing) {
          // Update existing setting
          await query(
            `UPDATE site_settings 
             SET setting_value = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE setting_key = $2 AND tenant_id = $3 AND setting_category = 'branding'`,
            [value, key, targetTenantId]
          );
          updates.push(key);
        } else {
          skipped.push(key);
        }
      } else {
        // Insert new setting
        const settingType = brandingSettingsSchema.properties[key]?.type === 'string' ? 'text' : 'text';
        await query(
          `INSERT INTO site_settings 
           (setting_key, setting_value, setting_type, setting_category, tenant_id, is_public) 
           VALUES ($1, $2, $3, 'branding', $4, true)`,
          [key, value, settingType, targetTenantId]
        );
        inserts.push(key);
      }
    }

    console.log('[Sync] Sync complete:', { updates: updates.length, inserts: inserts.length, skipped: skipped.length });

    return {
      success: true,
      sourceTenantId,
      targetTenantId,
      updates: updates.length,
      inserts: inserts.length,
      skipped: skipped.length,
      details: { updates, inserts, skipped }
    };
  } catch (error) {
    console.error('[Sync] Error syncing branding settings:', error);
    throw error;
  }
}

/**
 * Ensure all tenants have all required branding settings
 * Adds missing settings with default values
 */
export async function ensureAllTenantsHaveDefaults() {
  try {
    console.log('[Sync] Ensuring all tenants have default branding settings...');

    // Get all tenants
    const tenantsResult = await query('SELECT id, name FROM tenants');
    const tenants = tenantsResult.rows;

    const defaults = getDefaultBrandingSettings();
    const results = [];

    // Process each tenant
    for (const tenant of tenants) {
      const missing = await getMissingBrandingSettings(tenant.id);
      
      if (missing.missing > 0) {
        console.log(`[Sync] Tenant ${tenant.name} (${tenant.id}) is missing ${missing.missing} settings`);
        
        // Add missing settings with defaults
        for (const key of missing.missingKeys) {
          const defaultValue = defaults[key] || '';
          const settingType = brandingSettingsSchema.properties[key]?.type === 'string' ? 'text' : 'text';
          
          await query(
            `INSERT INTO site_settings 
             (setting_key, setting_value, setting_type, setting_category, tenant_id, is_public) 
             VALUES ($1, $2, $3, 'branding', $4, true)
             ON CONFLICT DO NOTHING`,
            [key, defaultValue, settingType, tenant.id]
          );
        }
        
        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          added: missing.missing,
          keys: missing.missingKeys
        });
      } else {
        console.log(`[Sync] Tenant ${tenant.name} (${tenant.id}) has all settings`);
        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          added: 0,
          keys: []
        });
      }
    }

    console.log('[Sync] Defaults sync complete for', tenants.length, 'tenants');

    return {
      success: true,
      tenantsProcessed: tenants.length,
      results
    };
  } catch (error) {
    console.error('[Sync] Error ensuring defaults:', error);
    throw error;
  }
}

/**
 * Sync all tenants from a master/template tenant
 */
export async function syncAllTenantsFromMaster(masterTenantId = null, options = {}) {
  try {
    console.log('[Sync] Syncing all tenants from master:', masterTenantId || 'global');

    // Get all tenants
    const tenantsResult = await query('SELECT id, name FROM tenants');
    const tenants = tenantsResult.rows;

    const results = [];

    for (const tenant of tenants) {
      // Skip if target is the same as master
      if (tenant.id === masterTenantId) {
        console.log(`[Sync] Skipping master tenant ${tenant.name}`);
        continue;
      }

      try {
        const result = await syncBrandingSettings(masterTenantId, tenant.id, options);
        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          ...result
        });
      } catch (error) {
        console.error(`[Sync] Error syncing tenant ${tenant.name}:`, error);
        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          success: false,
          error: error.message
        });
      }
    }

    console.log('[Sync] Bulk sync complete for', results.length, 'tenants');

    return {
      success: true,
      masterTenantId,
      tenantsProcessed: results.length,
      results
    };
  } catch (error) {
    console.error('[Sync] Error in bulk sync:', error);
    throw error;
  }
}

/**
 * Get sync status for all tenants
 */
export async function getAllTenantsSyncStatus() {
  try {
    const tenantsResult = await query('SELECT id, name FROM tenants');
    const tenants = tenantsResult.rows;

    const statuses = [];

    for (const tenant of tenants) {
      const missing = await getMissingBrandingSettings(tenant.id);
      statuses.push({
        tenantId: tenant.id,
        tenantName: tenant.name,
        ...missing,
        isComplete: missing.missing === 0
      });
    }

    return {
      success: true,
      tenants: statuses,
      totalTenants: tenants.length,
      completeCount: statuses.filter(s => s.isComplete).length,
      incompleteCount: statuses.filter(s => !s.isComplete).length
    };
  } catch (error) {
    console.error('[Sync] Error getting sync status:', error);
    throw error;
  }
}