#!/usr/bin/env node

/**
 * Activate WooCommerce via API
 * This script uses the API endpoint to activate WooCommerce integration
 * 
 * Usage: 
 *   1. Set AUTH_TOKEN environment variable with your admin token
 *   2. Set TENANT_ID environment variable with Julia Paris B2B tenant ID
 *   3. Run: node scripts/activate-woocommerce-api.js
 * 
 * Or run with: AUTH_TOKEN=your_token TENANT_ID=tenant_id node scripts/activate-woocommerce-api.js
 */

import dotenv from 'dotenv';
dotenv.config();

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const TENANT_ID = process.env.TENANT_ID || process.argv[2];
const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:4173';

if (!TENANT_ID) {
  console.error('[testing] ❌ Error: Tenant ID is required');
  console.log('[testing] Usage: node scripts/activate-woocommerce-api.js <tenant_id>');
  console.log('[testing] Or set TENANT_ID environment variable');
  process.exit(1);
}

if (!AUTH_TOKEN) {
  console.warn('[testing] ⚠️  Warning: AUTH_TOKEN not set. Will try without authentication.');
}

async function activateWooCommerce() {
  console.log('[testing] Activating WooCommerce for tenant:', TENANT_ID);
  console.log('[testing] API Base:', API_BASE, '\n');

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

  try {
    const response = await fetch(`${API_BASE}/api/tenants/${TENANT_ID}/integrations/woocommerce`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(AUTH_TOKEN && { 'Authorization': `Bearer ${AUTH_TOKEN}` })
      },
      body: JSON.stringify({
        is_active: true,
        config: config,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[testing] ❌ Failed to activate:', error);
      console.error('[testing] Status:', response.status);
      return;
    }

    const result = await response.json();
    console.log('[testing] ✓ WooCommerce integration activated successfully!\n');
    console.log('[testing] Result:', JSON.stringify(result, null, 2));

    // Verify
    const verifyResponse = await fetch(`${API_BASE}/api/tenants/${TENANT_ID}/integrations/woocommerce`, {
      headers: {
        ...(AUTH_TOKEN && { 'Authorization': `Bearer ${AUTH_TOKEN}` })
      }
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('\n[testing] Verification:');
      console.log('[testing]   is_active:', verifyData.is_active);
      console.log('[testing]   store_url:', verifyData.config?.store_url);
    }

  } catch (error) {
    console.error('[testing] ❌ Error:', error.message);
    throw error;
  }
}

activateWooCommerce()
  .then(() => {
    console.log('\n[testing] ✓ Activation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n[testing] ❌ Activation failed:', error);
    process.exit(1);
  });
