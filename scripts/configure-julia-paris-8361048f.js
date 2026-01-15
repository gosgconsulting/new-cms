#!/usr/bin/env node

/**
 * Configure WooCommerce for Julia Paris B2B Tenant (tenant-8361048f)
 * This script:
 * 1. Activates WooCommerce integration
 * 2. Sets e-shop provider to WooCommerce
 * 3. Tests connection
 */

import dotenv from 'dotenv';
import { query } from '../sparti-cms/db/index.js';
import { WooCommerceClient } from '../server/services/woocommerceClient.js';

dotenv.config();

const TENANT_ID = 'tenant-8361048f';
const WOOCOMMERCE_CONFIG = {
  store_url: 'https://cms.juliaparis.fr',
  consumer_key: 'ck_39475d128c1bd7262eb3f6635ee761cc207b57a8',
  consumer_secret: 'cs_257b9bd0af45c286958327ac9dc1d92b0ac00f3a',
  api_version: 'wc/v3',
};

async function configureWooCommerce() {
  console.log('[testing] Configuring WooCommerce for Julia Paris B2B...');
  console.log(`[testing] Tenant ID: ${TENANT_ID}\n`);

  try {
    // Step 1: Verify tenant exists
    console.log('[testing] Step 1: Verifying tenant exists...');
    const tenantResult = await query(`
      SELECT id, name, slug
      FROM tenants
      WHERE id = $1
    `, [TENANT_ID]);

    if (tenantResult.rows.length === 0) {
      console.error(`[testing] ❌ Tenant ${TENANT_ID} not found!`);
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`[testing] ✓ Tenant found: ${tenant.name} (${tenant.id})\n`);

    // Step 2: Activate WooCommerce integration
    console.log('[testing] Step 2: Activating WooCommerce integration...');
    const config = {
      ...WOOCOMMERCE_CONFIG,
      last_sync_at: null,
      sync_settings: {
        auto_sync: false,
        sync_interval: 'daily',
      },
    };

    const integrationResult = await query(`
      INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
      VALUES ($1, 'woocommerce', true, $2::jsonb)
      ON CONFLICT (tenant_id, integration_type)
      DO UPDATE SET
        is_active = true,
        config = EXCLUDED.config,
        updated_at = NOW()
      RETURNING is_active, config, updated_at
    `, [TENANT_ID, JSON.stringify(config)]);

    console.log('[testing] ✓ WooCommerce integration activated');
    console.log(`[testing]   Status: ${integrationResult.rows[0].is_active ? 'Active' : 'Inactive'}\n`);

    // Step 3: Set e-shop provider to WooCommerce
    console.log('[testing] Step 3: Setting e-shop provider to WooCommerce...');
    await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, tenant_id, is_public)
      VALUES ('shop_eshop_provider', 'woocommerce', 'text', 'shop', $1, false)
      ON CONFLICT (setting_key, tenant_id, theme_id)
      DO UPDATE SET
        setting_value = 'woocommerce',
        updated_at = NOW()
    `, [TENANT_ID]);

    console.log('[testing] ✓ E-shop provider set to WooCommerce\n');

    // Step 4: Test connection
    console.log('[testing] Step 4: Testing WooCommerce connection...');
    try {
      const client = new WooCommerceClient(WOOCOMMERCE_CONFIG);
      const testResult = await client.testConnection();

      if (testResult.success) {
        console.log('[testing] ✓ Connection successful!');
        console.log(`[testing]   Store: ${testResult.store_name || WOOCOMMERCE_CONFIG.store_url}`);
        console.log(`[testing]   API Version: ${testResult.api_version || WOOCOMMERCE_CONFIG.api_version}\n`);
      } else {
        console.log('[testing] ⚠️  Connection test returned:', testResult);
      }
    } catch (error) {
      console.error('[testing] ❌ Connection test failed:', error.message);
      console.log('[testing] Please verify:');
      console.log('[testing]   1. Store URL is correct');
      console.log('[testing]   2. Consumer Key and Secret are valid');
      console.log('[testing]   3. WooCommerce REST API is enabled\n');
    }

    // Step 5: Verify configuration
    console.log('[testing] Step 5: Verifying configuration...');
    const verifyResult = await query(`
      SELECT 
        ti.is_active as integration_active,
        ti.config->>'store_url' as store_url,
        ss.setting_value as eshop_provider
      FROM tenant_integrations ti
      LEFT JOIN site_settings ss ON ss.tenant_id = ti.tenant_id 
        AND ss.setting_key = 'shop_eshop_provider'
      WHERE ti.tenant_id = $1 AND ti.integration_type = 'woocommerce'
    `, [TENANT_ID]);

    if (verifyResult.rows.length > 0) {
      const config = verifyResult.rows[0];
      console.log('[testing] ✓ Configuration verified:');
      console.log(`[testing]   Integration Active: ${config.integration_active}`);
      console.log(`[testing]   Store URL: ${config.store_url}`);
      console.log(`[testing]   E-shop Provider: ${config.eshop_provider || 'not set'}\n`);
    }

    console.log('[testing] ✓ Configuration complete!');
    console.log('\n[testing] Next steps:');
    console.log('[testing] 1. Go to Developer → Integrations → WooCommerce');
    console.log('[testing] 2. Click "Sync Products" to fetch all products from WooCommerce');
    console.log('[testing] 3. Products will appear in Shop → Products page\n');

  } catch (error) {
    console.error('[testing] ❌ Error:', error.message);
    console.error(error);
    throw error;
  }
}

configureWooCommerce()
  .then(() => {
    console.log('[testing] ✓ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[testing] ❌ Script failed:', error);
    process.exit(1);
  });
