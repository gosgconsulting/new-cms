#!/usr/bin/env node

/**
 * Fetch all products from WooCommerce and generate batch INSERT statements
 * These can be executed via MCP PostgreSQL write_query
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

function escapeSQL(str) {
  if (!str) return 'NULL';
  if (typeof str !== 'string') str = String(str);
  return `'${str.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

async function generateBatchInserts() {
  const client = new WooCommerceClient(WOOCOMMERCE_CONFIG);
  const batches = [];
  
  let page = 1;
  let perPage = 50;
  let hasMore = true;
  let currentBatch = [];
  const BATCH_SIZE = 50; // Products per SQL batch
  
  while (hasMore && page <= 20) {
    console.error(`[testing] Fetching page ${page}...`);
    const wcProducts = await client.getProducts(page, perPage, { status: 'publish' });
    
    if (!Array.isArray(wcProducts) || wcProducts.length === 0) {
      hasMore = false;
      break;
    }
    
    for (const wcProduct of wcProducts) {
      const mapped = mapWooCommerceProduct(wcProduct, TENANT_ID);
      const variants = mapWooCommerceVariants(wcProduct, null, TENANT_ID);
      
      currentBatch.push({ product: mapped, variants, wcProduct });
      
      if (currentBatch.length >= BATCH_SIZE) {
        // Generate SQL for this batch
        const values = currentBatch.map(({ product }) => 
          `(${escapeSQL(product.name)}, ${escapeSQL(product.description)}, ${escapeSQL(product.handle)}, ${escapeSQL(product.status)}, ${escapeSQL(product.featured_image)}, ${escapeSQL(product.tenant_id)})`
        ).join(',\n  ');
        
        const sql = `INSERT INTO products (name, description, handle, status, featured_image, tenant_id)
VALUES
  ${values}
ON CONFLICT (handle, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  featured_image = EXCLUDED.featured_image,
  updated_at = NOW();`;
        
        batches.push({ batch: currentBatch.slice(), sql });
        currentBatch = [];
      }
    }
    
    if (wcProducts.length < perPage) {
      hasMore = false;
    } else {
      page++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Handle remaining products
  if (currentBatch.length > 0) {
    const values = currentBatch.map(({ product }) => 
      `(${escapeSQL(product.name)}, ${escapeSQL(product.description)}, ${escapeSQL(product.handle)}, ${escapeSQL(product.status)}, ${escapeSQL(product.featured_image)}, ${escapeSQL(product.tenant_id)})`
    ).join(',\n  ');
    
    const sql = `INSERT INTO products (name, description, handle, status, featured_image, tenant_id)
VALUES
  ${values}
ON CONFLICT (handle, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  featured_image = EXCLUDED.featured_image,
  updated_at = NOW();`;
    
    batches.push({ batch: currentBatch.slice(), sql });
  }
  
  return batches;
}

const batches = await generateBatchInserts();
console.log(JSON.stringify(batches.map(b => ({ count: b.batch.length, sql: b.sql })), null, 2));
