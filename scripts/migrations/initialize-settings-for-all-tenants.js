/**
 * Initialize Settings for All Tenants Script
 * 
 * This script retroactively initializes settings for all existing tenants
 * by copying master settings (tenant_id IS NULL) to each tenant.
 * 
 * This fixes the issue where existing tenants don't have settings and can't save.
 * The script is safe to run multiple times due to ON CONFLICT DO NOTHING clauses.
 */

import dotenv from 'dotenv';
import { query } from '../../sparti-cms/db/index.js';
import { initializeTenantDefaults } from '../../sparti-cms/db/tenant-initialization.js';

// Load environment variables
dotenv.config();

async function initializeSettingsForAllTenants() {
  console.log('[testing] ==========================================');
  console.log('[testing] Starting Settings Initialization for All Tenants');
  console.log('[testing] ==========================================');

  try {
    // Get all tenants
    const tenantsResult = await query(`
      SELECT id, name, created_at
      FROM tenants
      ORDER BY created_at ASC
    `);

    if (tenantsResult.rows.length === 0) {
      console.log('[testing] No tenants found in database');
      return;
    }

    console.log(`[testing] Found ${tenantsResult.rows.length} tenant(s)`);

    // Check if master settings exist
    const masterSettingsCheck = await query(`
      SELECT COUNT(*) as count
      FROM site_settings
      WHERE tenant_id IS NULL
    `);

    const masterSettingsCount = parseInt(masterSettingsCheck.rows[0]?.count || 0);
    
    if (masterSettingsCount === 0) {
      console.log('[testing] WARNING: No master settings found (tenant_id IS NULL)');
      console.log('[testing] Please ensure master settings exist before running this script');
    } else {
      console.log(`[testing] Found ${masterSettingsCount} master settings to copy`);
    }

    const results = {
      total: tenantsResult.rows.length,
      initialized: 0,
      failed: 0,
      details: []
    };

    // Process each tenant
    for (const tenant of tenantsResult.rows) {
      const tenantId = tenant.id;
      const tenantName = tenant.name;

      console.log(`[testing] Processing tenant: ${tenantName} (${tenantId})`);

      try {
        // Check current settings count for this tenant
        const currentSettingsCheck = await query(`
          SELECT COUNT(*) as count
          FROM site_settings
          WHERE tenant_id = $1
        `, [tenantId]);
        
        const currentSettingsCount = parseInt(currentSettingsCheck.rows[0]?.count || 0);
        console.log(`[testing] Tenant ${tenantName} currently has ${currentSettingsCount} settings`);

        // Initialize tenant defaults (this will copy settings from master)
        // ON CONFLICT DO NOTHING ensures we don't create duplicates
        console.log(`[testing] Initializing settings for tenant ${tenantName}...`);
        const initializationSummary = await initializeTenantDefaults(tenantId);

        // Check new settings count
        const newSettingsCheck = await query(`
          SELECT COUNT(*) as count
          FROM site_settings
          WHERE tenant_id = $1
        `, [tenantId]);
        
        const newSettingsCount = parseInt(newSettingsCheck.rows[0]?.count || 0);
        const settingsAdded = newSettingsCount - currentSettingsCount;

        console.log(`[testing] Tenant ${tenantName} now has ${newSettingsCount} settings (added ${settingsAdded})`);

        const totalInitialized = 
          (initializationSummary.settings?.inserted || 0) +
          (initializationSummary.sitemap?.inserted || 0) +
          (initializationSummary.robots?.inserted || 0) +
          (initializationSummary.blog?.categories?.inserted || 0) +
          (initializationSummary.blog?.tags?.inserted || 0);

        results.initialized++;
        results.details.push({
          tenantId,
          tenantName,
          status: 'success',
          settingsBefore: currentSettingsCount,
          settingsAfter: newSettingsCount,
          settingsAdded: settingsAdded,
          summary: {
            settings: initializationSummary.settings?.inserted || 0,
            sitemap: initializationSummary.sitemap?.inserted || 0,
            robots: initializationSummary.robots?.inserted || 0,
            categories: initializationSummary.blog?.categories?.inserted || 0,
            tags: initializationSummary.blog?.tags?.inserted || 0,
            total: totalInitialized
          }
        });

        if (initializationSummary.errors && initializationSummary.errors.length > 0) {
          console.log(`[testing] WARNING: Tenant ${tenantName} had ${initializationSummary.errors.length} errors during initialization`);
          results.details[results.details.length - 1].warnings = initializationSummary.errors;
        }
      } catch (error) {
        console.error(`[testing] Error initializing tenant ${tenantName} (${tenantId}):`, error);
        results.failed++;
        results.details.push({
          tenantId,
          tenantName,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Print summary
    console.log('[testing] ==========================================');
    console.log('[testing] Initialization Summary');
    console.log('[testing] ==========================================');
    console.log(`[testing] Total tenants: ${results.total}`);
    console.log(`[testing] Successfully initialized: ${results.initialized}`);
    console.log(`[testing] Failed: ${results.failed}`);
    console.log('[testing] ==========================================');

    // Print details for each tenant
    if (results.details.length > 0) {
      console.log('[testing] Details:');
      results.details.forEach((detail, index) => {
        console.log(`[testing] ${index + 1}. ${detail.tenantName} (${detail.tenantId}): ${detail.status}`);
        if (detail.status === 'success') {
          console.log(`[testing]    - Settings before: ${detail.settingsBefore}`);
          console.log(`[testing]    - Settings after: ${detail.settingsAfter}`);
          console.log(`[testing]    - Settings added: ${detail.settingsAdded}`);
          if (detail.summary) {
            console.log(`[testing]    - Settings inserted: ${detail.summary.settings}`);
            console.log(`[testing]    - Sitemap entries: ${detail.summary.sitemap}`);
            console.log(`[testing]    - Robots rules: ${detail.summary.robots}`);
            console.log(`[testing]    - Categories: ${detail.summary.categories}`);
            console.log(`[testing]    - Tags: ${detail.summary.tags}`);
            console.log(`[testing]    - Total records: ${detail.summary.total}`);
          }
          if (detail.warnings && detail.warnings.length > 0) {
            console.log(`[testing]    - Warnings: ${detail.warnings.length}`);
            detail.warnings.forEach((warning, i) => {
              console.log(`[testing]      ${i + 1}. ${warning}`);
            });
          }
        } else if (detail.status === 'failed') {
          console.log(`[testing]    - Error: ${detail.error}`);
        }
      });
    }

    return results;
  } catch (error) {
    console.error('[testing] Error during settings initialization:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
  initializeSettingsForAllTenants()
    .then((results) => {
      console.log('[testing] Settings initialization completed');
      process.exit(results?.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('[testing] Settings initialization failed:', error);
      process.exit(1);
    });
}

export { initializeSettingsForAllTenants };

