#!/usr/bin/env node

/**
 * Activate WooCommerce Integration for Julia Paris B2B Tenant
 * 
 * This script finds the tenant and activates WooCommerce with the provided credentials
 */

import dotenv from 'dotenv';
import { query } from '../sparti-cms/db/index.js';

dotenv.config();

async function activateWooCommerce() {
  console.log('[testing] Activating WooCommerce for Julia Paris B2B...\n');

  try {
    // Find Julia Paris B2B tenant
    console.log('[testing] Searching for Julia Paris B2B tenant...');
    const tenantResult = await query(`
      SELECT id, name, slug
      FROM tenants
      WHERE LOWER(name) LIKE '%julia%paris%b2b%' 
         OR LOWER(name) LIKE '%julia paris b2b%'
         OR id LIKE '%julia%paris%b2b%'
         OR slug LIKE '%julia%paris%b2b%'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (tenantResult.rows.length === 0) {
      // Try broader search
      console.log('[testing] Trying broader search...');
      const broaderResult = await query(`
        SELECT id, name, slug
        FROM tenants
        WHERE LOWER(name) LIKE '%julia%' OR LOWER(name) LIKE '%paris%'
        ORDER BY created_at DESC
      `);
      
      if (broaderResult.rows.length > 0) {
        console.log('[testing] Found potential tenants:');
        broaderResult.rows.forEach(t => {
          console.log(`  - ${t.id}: ${t.name} (slug: ${t.slug})`);
        });
      }
      
      console.error('\n[testing] ❌ Julia Paris B2B tenant not found!');
      console.log('[testing] Please provide the exact tenant ID or name.');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`[testing] ✓ Found tenant: ${tenant.name} (ID: ${tenant.id})\n`);

    // WooCommerce configuration
    const config = {
      store_url: 'https://cms.juliaparis.fr',
      consumer_key: 'ck_39475d128c1bd7262eb3f6635ee761cc207b57a8',
      consumer_secret: 'cs_257b9bd0af45c286958327ac9dc1d92b0ac00f3a',
      api_version: 'wc/v3',
      last_sync_at: null,
      sync_settings: {
        auto_sync: false,
        sync_interval: 'daily',
      },
    };

    // Check if integration exists
    const existingResult = await query(`
      SELECT is_active, config
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'woocommerce'
    `, [tenant.id]);

    if (existingResult.rows.length > 0) {
      console.log('[testing] Integration exists, updating...');
    } else {
      console.log('[testing] Creating new integration...');
    }

    // Upsert integration
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

    console.log('[testing] ✓ WooCommerce integration activated!\n');
    console.log('[testing] Configuration details:');
    console.log(`[testing]   Tenant ID: ${tenant.id}`);
    console.log(`[testing]   Tenant Name: ${tenant.name}`);
    console.log(`[testing]   Status: ${result.rows[0].is_active ? 'Active' : 'Inactive'}`);
    console.log(`[testing]   Store URL: ${config.store_url}`);
    console.log(`[testing]   Consumer Key: ${config.consumer_key.substring(0, 20)}...`);
    console.log(`[testing]   Updated: ${result.rows[0].updated_at}\n`);

    // Verify
    const verifyResult = await query(`
      SELECT is_active, config->>'store_url' as store_url
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'woocommerce'
    `, [tenant.id]);

    if (verifyResult.rows[0].is_active) {
      console.log('[testing] ✓ Verification successful - Integration is ACTIVE');
    } else {
      console.log('[testing] ⚠️  Warning - Integration shows as inactive');
    }

  } catch (error) {
    console.error('[testing] ❌ Error:', error.message);
    console.error(error);
    throw error;
  }
}

activateWooCommerce()
  .then(() => {
    console.log('\n[testing] Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n[testing] Script failed:', error);
    process.exit(1);
  });
