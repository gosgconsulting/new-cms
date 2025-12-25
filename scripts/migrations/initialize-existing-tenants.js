/**
 * Initialize Existing Tenants Script
 * 
 * This script backfills existing tenants with default data from master records.
 * It checks which tenants don't have default data and initializes them.
 */

import dotenv from 'dotenv';
import { query } from '../../sparti-cms/db/index.js';
import { initializeTenantDefaults, isTenantInitialized } from '../../sparti-cms/db/tenant-initialization.js';

// Load environment variables
dotenv.config();

async function initializeExistingTenants() {
  console.log('[testing] ==========================================');
  console.log('[testing] Starting Existing Tenants Initialization');
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

    const results = {
      total: tenantsResult.rows.length,
      initialized: 0,
      skipped: 0,
      failed: 0,
      details: []
    };

    // Process each tenant
    for (const tenant of tenantsResult.rows) {
      const tenantId = tenant.id;
      const tenantName = tenant.name;

      console.log(`[testing] Processing tenant: ${tenantName} (${tenantId})`);

      try {
        // Check if tenant is already initialized
        const alreadyInitialized = await isTenantInitialized(tenantId);

        if (alreadyInitialized) {
          console.log(`[testing] Tenant ${tenantName} already has default data, skipping...`);
          results.skipped++;
          results.details.push({
            tenantId,
            tenantName,
            status: 'skipped',
            reason: 'Already initialized'
          });
          continue;
        }

        // Initialize tenant defaults
        console.log(`[testing] Initializing defaults for tenant ${tenantName}...`);
        const initializationSummary = await initializeTenantDefaults(tenantId);

        const totalInitialized = 
          (initializationSummary.settings?.inserted || 0) +
          (initializationSummary.sitemap?.inserted || 0) +
          (initializationSummary.robots?.inserted || 0) +
          (initializationSummary.blog?.categories?.inserted || 0) +
          (initializationSummary.blog?.tags?.inserted || 0);

        console.log(`[testing] Tenant ${tenantName} initialized with ${totalInitialized} records`);

        results.initialized++;
        results.details.push({
          tenantId,
          tenantName,
          status: 'success',
          summary: {
            settings: initializationSummary.settings?.inserted || 0,
            sitemap: initializationSummary.sitemap?.inserted || 0,
            robots: initializationSummary.robots?.inserted || 0,
            categories: initializationSummary.blog?.categories?.inserted || 0,
            tags: initializationSummary.blog?.tags?.inserted || 0,
            total: totalInitialized
          }
        });
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
    console.log(`[testing] Initialized: ${results.initialized}`);
    console.log(`[testing] Skipped (already initialized): ${results.skipped}`);
    console.log(`[testing] Failed: ${results.failed}`);
    console.log('[testing] ==========================================');

    // Print details for each tenant
    if (results.details.length > 0) {
      console.log('[testing] Details:');
      results.details.forEach((detail, index) => {
        console.log(`[testing] ${index + 1}. ${detail.tenantName} (${detail.tenantId}): ${detail.status}`);
        if (detail.summary) {
          console.log(`[testing]    - Settings: ${detail.summary.settings}`);
          console.log(`[testing]    - Sitemap: ${detail.summary.sitemap}`);
          console.log(`[testing]    - Robots: ${detail.summary.robots}`);
          console.log(`[testing]    - Categories: ${detail.summary.categories}`);
          console.log(`[testing]    - Tags: ${detail.summary.tags}`);
          console.log(`[testing]    - Total: ${detail.summary.total}`);
        }
        if (detail.error) {
          console.log(`[testing]    - Error: ${detail.error}`);
        }
      });
    }

    return results;
  } catch (error) {
    console.error('[testing] Error during existing tenants initialization:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeExistingTenants()
    .then((results) => {
      console.log('[testing] Existing tenants initialization completed');
      process.exit(results?.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('[testing] Existing tenants initialization failed:', error);
      process.exit(1);
    });
}

export { initializeExistingTenants };

