#!/usr/bin/env node

/**
 * Fetch products from WooCommerce and prepare for MCP insertion
 * This script fetches products and outputs them in a format that can be inserted via MCP
 */

import dotenv from 'dotenv';
import { WooCommerceClient } from '../server/services/woocommerceClient.js';
import {
  mapWooCommerceProduct,
  mapWooCommerceVariants,
} from '../server/services/woocommerceMapper.js';

dotenv.config();

const TENANT_ID = 'tenant-8361048f';
const WOOCOMMERCE_CONFIG = {
  store_url: 'https://cms.juliaparis.fr',
  consumer_key: 'ck_39475d128c1bd7262eb3f6635ee761cc207b57a8',
  consumer_secret: 'cs_257b9bd0af45c286958327ac9dc1d92b0ac00f3a',
  api_version: 'wc/v3',
};

async function fetchProducts() {
  console.log('[testing] Fetching products from WooCommerce...');
  
  const client = new WooCommerceClient(WOOCOMMERCE_CONFIG);
  const products = [];
  
  let page = 1;
  let perPage = 50;
  let hasMore = true;
  
  while (hasMore) {
    console.log(`[testing] Fetching page ${page}...`);
    const wcProducts = await client.getProducts(page, perPage, { status: 'publish' });
    
    if (!Array.isArray(wcProducts) || wcProducts.length === 0) {
      hasMore = false;
      break;
    }
    
    for (const wcProduct of wcProducts) {
      const mapped = mapWooCommerceProduct(wcProduct, TENANT_ID);
      const variants = mapWooCommerceVariants(wcProduct, null, TENANT_ID);
      products.push({ product: mapped, variants, wcProduct });
    }
    
    if (wcProducts.length < perPage) {
      hasMore = false;
    } else {
      page++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (page > 20) break; // Limit for initial sync
  }
  
  console.log(`[testing] Fetched ${products.length} products`);
  return products;
}

// Export for use
const products = await fetchProducts();
console.log(`[testing] Ready to sync ${products.length} products`);
console.log('[testing] Use MCP tools to insert these products');

// Output first few for verification
console.log('\n[testing] Sample products:');
products.slice(0, 3).forEach((p, i) => {
  console.log(`[testing] ${i + 1}. ${p.product.name} (${p.product.handle})`);
});

export { products, TENANT_ID };
