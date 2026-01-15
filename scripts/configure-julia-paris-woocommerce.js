#!/usr/bin/env node

/**
 * Configure WooCommerce Integration for Julia Paris B2B Tenant
 * 
 * This script:
 * 1. Finds the Julia Paris B2B tenant
 * 2. Configures WooCommerce integration with provided credentials
 * 3. Tests the connection
 * 
 * Usage: node scripts/configure-julia-paris-woocommerce.js
 */

import dotenv from 'dotenv';
import { query } from '../sparti-cms/db/index.js';
import { WooCommerceClient } from '../server/services/woocommerceClient.js';

// Load environment variables
dotenv.config();

async function configureJuliaParisWooCommerce() {
  console.log('[testing] Starting WooCommerce configuration for Julia Paris B2B...\n');

  try {
    // WooCommerce credentials
    const credentials = {
      store_url: 'https://cms.juliaparis.fr',
      consumer_key: 'ck_39475d128c1bd7262eb3f6635ee761cc207b57a8',
      consumer_secret: 'cs_257b9bd0af45c286958327ac9dc1d92b0ac00f3a',
      api_version: 'wc/v3',
    };

    // Find Julia Paris B2B tenant
    console.log('[testing] Searching for Julia Paris B2B tenant...');
    const tenantResult = await query(`
      SELECT id, name, slug
      FROM tenants
      WHERE LOWER(name) LIKE '%julia%paris%b2b%' 
         OR LOWER(name) LIKE '%julia paris b2b%'
         OR id LIKE '%julia%paris%b2b%'
      LIMIT 1
    `);

    if (tenantResult.rows.length === 0) {
      console.error('[testing] ❌ Julia Paris B2B tenant not found!');
      console.log('[testing] Available tenants:');
      const allTenants = await query('SELECT id, name FROM tenants ORDER BY name');
      allTenants.rows.forEach(t => {
        console.log(`  - ${t.id}: ${t.name}`);
      });
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`[testing] ✓ Found tenant: ${tenant.name} (${tenant.id})\n`);

    // Check if tenant_integrations table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenant_integrations'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.error('[testing] ❌ tenant_integrations table does not exist!');
      console.log('[testing] Please run database migrations first:');
      console.log('[testing]   npx sequelize-cli db:migrate');
      return;
    }

    // Configure WooCommerce integration
    console.log('[testing] Configuring WooCommerce integration...');
    const config = {
      store_url: credentials.store_url,
      consumer_key: credentials.consumer_key,
      consumer_secret: credentials.consumer_secret,
      api_version: credentials.api_version,
      last_sync_at: null,
      sync_settings: {
        auto_sync: false,
        sync_interval: 'daily',
      },
    };

    const result = await query(`
      INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
      VALUES ($1, 'woocommerce', true, $2::jsonb)
      ON CONFLICT (tenant_id, integration_type)
      DO UPDATE SET
        is_active = true,
        config = EXCLUDED.config,
        updated_at = NOW()
      RETURNING is_active, config, created_at, updated_at
    `, [tenant.id, JSON.stringify(config)]);

    console.log('[testing] ✓ WooCommerce integration configured successfully\n');

    // Test connection
    console.log('[testing] Testing WooCommerce connection...');
    try {
      const client = new WooCommerceClient(credentials);
      const testResult = await client.testConnection();

      if (testResult.success) {
        console.log('[testing] ✓ Connection successful!');
        console.log(`[testing]   Store: ${testResult.store_name || credentials.store_url}`);
        console.log(`[testing]   API Version: ${testResult.api_version || credentials.api_version}\n`);
      } else {
        console.log('[testing] ⚠️  Connection test returned:', testResult);
      }
    } catch (error) {
      console.error('[testing] ❌ Connection test failed:', error.message);
      console.log('[testing] Please verify:');
      console.log('[testing]   1. Store URL is correct (should be WordPress site URL, not CMS URL)');
      console.log('[testing]   2. Consumer Key and Secret are valid');
      console.log('[testing]   3. WooCommerce REST API is enabled on the store');
      console.log('[testing]   4. API credentials have read permissions\n');
    }

    // Summary
    console.log('[testing] Configuration Summary:');
    console.log(`[testing]   Tenant ID: ${tenant.id}`);
    console.log(`[testing]   Tenant Name: ${tenant.name}`);
    console.log(`[testing]   Store URL: ${credentials.store_url}`);
    console.log(`[testing]   Consumer Key: ${credentials.consumer_key.substring(0, 20)}...`);
    console.log(`[testing]   Integration Status: Active\n`);

    console.log('[testing] ✓ Configuration complete!');
    console.log('[testing] You can now use the admin UI to sync products and orders.');

  } catch (error) {
    console.error('[testing] ❌ Error configuring WooCommerce:', error);
    throw error;
  }
}

// Run the configuration
configureJuliaParisWooCommerce()
  .then(() => {
    console.log('[testing] Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[testing] Script failed:', error);
    process.exit(1);
  });
