#!/usr/bin/env node

/**
 * Sync Products from WooCommerce for Julia Paris B2B
 * This script syncs products from WooCommerce to the local database
 * 
 * Usage: node scripts/sync-woocommerce-products.js [tenant_id]
 */

import dotenv from 'dotenv';
dotenv.config();

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:4173';
const TENANT_ID = process.argv[2];

if (!TENANT_ID) {
  console.error('[testing] ❌ Error: Tenant ID is required');
  console.log('[testing] Usage: node scripts/sync-woocommerce-products.js <tenant_id>');
  process.exit(1);
}

async function syncProducts() {
  console.log('[testing] Syncing products from WooCommerce for tenant:', TENANT_ID);
  console.log('[testing] API Base:', API_BASE, '\n');

  try {
    // Get auth token
    const token = localStorage?.getItem?.('sparti-user-session');
    const authToken = token ? JSON.parse(token).token : null;

    if (!authToken) {
      console.log('[testing] ⚠️  No auth token found. Using tenant API key...');
    }

    // Sync products in batches
    let page = 1;
    let perPage = 50; // Sync 50 products per batch
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`[testing] Syncing page ${page} (${perPage} products per page)...`);

      const response = await fetch(`${API_BASE}/api/woocommerce/sync/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          'X-API-Key': authToken || '',
        },
        body: JSON.stringify({
          page: page,
          per_page: perPage,
          status: 'publish', // Only sync published products
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`[testing] ❌ Failed to sync page ${page}:`, error);
        break;
      }

      const result = await response.json();
      console.log(`[testing] Page ${page} result:`, result.data);

      totalSynced += result.data.created + result.data.updated;
      
      // Check if there are more products
      // WooCommerce typically returns empty array when no more products
      if (result.data.created === 0 && result.data.updated === 0 && result.data.skipped === 0) {
        hasMore = false;
      } else {
        page++;
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Safety limit
      if (page > 100) {
        console.log('[testing] ⚠️  Reached safety limit of 100 pages. Stopping.');
        hasMore = false;
      }
    }

    console.log(`\n[testing] ✓ Sync complete! Total products synced: ${totalSynced}`);
    console.log('[testing] Products should now appear in the Products page.\n');

  } catch (error) {
    console.error('[testing] ❌ Error syncing products:', error.message);
    throw error;
  }
}

syncProducts()
  .then(() => {
    console.log('[testing] ✓ Sync script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[testing] ❌ Sync script failed:', error);
    process.exit(1);
  });
