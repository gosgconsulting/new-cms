/**
 * Migration Script: Initialize Branding Settings for All Tenants
 * 
 * This script initializes default branding settings (site_name, site_tagline, site_description)
 * for all existing tenants that don't already have these settings.
 * 
 * Run with: node sparti-cms/db/migrations/initialize-branding-settings-for-all-tenants.js
 */

import dotenv from 'dotenv';
import { query } from '../index.js';

// Load environment variables
dotenv.config();

async function initializeBrandingSettingsForAllTenants() {
  console.log('[migration] Starting branding settings initialization for all tenants...');
  
  try {
    // Get all tenants
    const tenantsResult = await query(`
      SELECT id, name FROM tenants ORDER BY created_at
    `);
    
    const tenants = tenantsResult.rows;
    console.log(`[migration] Found ${tenants.length} tenant(s) to process`);
    
    let totalInitialized = 0;
    let totalSkipped = 0;
    
    for (const tenant of tenants) {
      const tenantId = tenant.id;
      const tenantName = tenant.name;
      
      console.log(`[migration] Processing tenant: ${tenantName} (${tenantId})`);
      
      // Default branding settings
      const defaultBrandingSettings = [
        {
          key: 'site_name',
          value: tenantName,
          type: 'text',
          category: 'branding'
        },
        {
          key: 'site_tagline',
          value: '',
          type: 'text',
          category: 'branding'
        },
        {
          key: 'site_description',
          value: '',
          type: 'textarea',
          category: 'branding'
        }
      ];
      
      let tenantInitialized = 0;
      let tenantSkipped = 0;
      
      for (const setting of defaultBrandingSettings) {
        // Check if setting already exists
        const existing = await query(`
          SELECT id, setting_value FROM site_settings 
          WHERE setting_key = $1 AND tenant_id = $2 AND theme_id IS NULL
          LIMIT 1
        `, [setting.key, tenantId]);
        
        if (existing.rows.length === 0) {
          // Insert new setting
          await query(`
            INSERT INTO site_settings (
              setting_key, setting_value, setting_type, setting_category,
              is_public, tenant_id, theme_id, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, true, $5, NULL, NOW(), NOW())
          `, [
            setting.key,
            setting.value,
            setting.type,
            setting.category,
            tenantId
          ]);
          tenantInitialized++;
          console.log(`  [migration] ✓ Created ${setting.key} = "${setting.value}"`);
        } else {
          // Update existing setting if it's empty and we have a value
          const currentValue = existing.rows[0].setting_value || '';
          if (currentValue.trim() === '' && setting.value.trim() !== '') {
            await query(`
              UPDATE site_settings 
              SET setting_value = $1, updated_at = NOW()
              WHERE id = $2
            `, [setting.value, existing.rows[0].id]);
            console.log(`  [migration] ✓ Updated ${setting.key} = "${setting.value}" (was empty)`);
            tenantInitialized++;
          } else {
            tenantSkipped++;
            console.log(`  [migration] - Skipped ${setting.key} (already exists with value: "${currentValue.substring(0, 50)}${currentValue.length > 50 ? '...' : ''}")`);
          }
        }
      }
      
      totalInitialized += tenantInitialized;
      totalSkipped += tenantSkipped;
      
      console.log(`[migration] Tenant ${tenantName}: ${tenantInitialized} initialized, ${tenantSkipped} skipped\n`);
    }
    
    console.log('[migration] ========================================');
    console.log(`[migration] Migration complete!`);
    console.log(`[migration] Total initialized: ${totalInitialized}`);
    console.log(`[migration] Total skipped: ${totalSkipped}`);
    console.log(`[migration] ========================================`);
    
  } catch (error) {
    console.error('[migration] Error during migration:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1]?.includes('initialize-branding-settings-for-all-tenants')) {
  initializeBrandingSettingsForAllTenants()
    .then(() => {
      console.log('[migration] Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[migration] Migration script failed:', error);
      process.exit(1);
    });
}

export { initializeBrandingSettingsForAllTenants };

