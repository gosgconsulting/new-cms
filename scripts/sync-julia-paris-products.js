#!/usr/bin/env node

/**
 * Sync Products from WooCommerce for Julia Paris B2B (tenant-8361048f)
 * This script syncs all products from WooCommerce to the database
 */

import dotenv from 'dotenv';
dotenv.config();

const TENANT_ID = 'tenant-8361048f';
const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:4173';

async function syncProducts() {
  console.log('[testing] Syncing products from WooCommerce...');
  console.log(`[testing] Tenant ID: ${TENANT_ID}`);
  console.log(`[testing] API Base: ${API_BASE}\n`);

  try {
    // Get auth token from localStorage (if running in browser context)
    // Otherwise, you'll need to provide it as environment variable
    let authToken = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('sparti-user-session');
        authToken = token ? JSON.parse(token).token : null;
      }
    } catch (e) {
      // localStorage not available
    }

    // Try to get from environment variable
    if (!authToken && process.env.AUTH_TOKEN) {
      authToken = process.env.AUTH_TOKEN;
    }

    if (!authToken) {
      console.log('[testing] ⚠️  No auth token found. Will try with tenant API key...');
    }

    // Sync products in batches
    let page = 1;
    let perPage = 50;
    let totalSynced = 0;
    let hasMore = true;
    let totalCreated = 0;
    let totalUpdated = 0;

    console.log('[testing] Starting product sync...\n');

    while (hasMore) {
      console.log(`[testing] Syncing page ${page} (${perPage} products per page)...`);

      const response = await fetch(`${API_BASE}/api/woocommerce/sync/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          'X-API-Key': authToken || '',
          'X-Tenant-Id': TENANT_ID,
        },
        body: JSON.stringify({
          page: page,
          per_page: perPage,
          status: 'publish', // Only sync published products
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText };
        }
        console.error(`[testing] ❌ Failed to sync page ${page}:`, error);
        
        if (response.status === 401) {
          console.error('[testing] Authentication failed. Please provide AUTH_TOKEN environment variable.');
        }
        break;
      }

      const result = await response.json();
      
      if (result.success) {
        const data = result.data || {};
        totalCreated += data.created || 0;
        totalUpdated += data.updated || 0;
        totalSynced += (data.created || 0) + (data.updated || 0);
        
        console.log(`[testing]   Created: ${data.created || 0}, Updated: ${data.updated || 0}, Skipped: ${data.skipped || 0}`);
        
        if (data.errors && data.errors.length > 0) {
          console.log(`[testing]   Errors: ${data.errors.length}`);
          data.errors.forEach(err => {
            console.log(`[testing]     - Product ${err.product_id}: ${err.error}`);
          });
        }

        // Check if there are more products
        // If we got fewer products than requested, we're done
        const productsInBatch = (data.created || 0) + (data.updated || 0) + (data.skipped || 0);
        if (productsInBatch === 0) {
          hasMore = false;
        } else {
          page++;
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        console.error(`[testing] ❌ Sync failed for page ${page}:`, result.error);
        break;
      }

      // Safety limit
      if (page > 100) {
        console.log('[testing] ⚠️  Reached safety limit of 100 pages. Stopping.');
        hasMore = false;
      }
    }

    console.log(`\n[testing] ✓ Sync complete!`);
    console.log(`[testing]   Total Created: ${totalCreated}`);
    console.log(`[testing]   Total Updated: ${totalUpdated}`);
    console.log(`[testing]   Total Synced: ${totalSynced}`);
    console.log('\n[testing] Products should now appear in Shop → Products page.\n');

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
