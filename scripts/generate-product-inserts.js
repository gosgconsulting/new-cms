#!/usr/bin/env node

/**
 * Generate SQL INSERT statements for products from WooCommerce
 * These can be executed via MCP PostgreSQL tools
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
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function generateInserts() {
  const client = new WooCommerceClient(WOOCOMMERCE_CONFIG);
  const inserts = [];
  
  let page = 1;
  let perPage = 50;
  let hasMore = true;
  let total = 0;
  
  while (hasMore && page <= 20) { // Limit to 20 pages for initial sync
    console.error(`[testing] Fetching page ${page}...`);
    const wcProducts = await client.getProducts(page, perPage, { status: 'publish' });
    
    if (!Array.isArray(wcProducts) || wcProducts.length === 0) {
      hasMore = false;
      break;
    }
    
    for (const wcProduct of wcProducts) {
      const mapped = mapWooCommerceProduct(wcProduct, TENANT_ID);
      const variants = mapWooCommerceVariants(wcProduct, null, TENANT_ID);
      
      // Generate INSERT for product
      const productSQL = `
INSERT INTO products (name, description, handle, status, featured_image, tenant_id)
VALUES (${escapeSQL(mapped.name)}, ${escapeSQL(mapped.description)}, ${escapeSQL(mapped.handle)}, ${escapeSQL(mapped.status)}, ${escapeSQL(mapped.featured_image)}, ${escapeSQL(mapped.tenant_id)})
ON CONFLICT (handle, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  featured_image = EXCLUDED.featured_image,
  updated_at = NOW()
RETURNING id;`;
      
      inserts.push({ type: 'product', sql: productSQL.trim(), product: mapped, variants, wcProduct });
      total++;
    }
    
    if (wcProducts.length < perPage) {
      hasMore = false;
    } else {
      page++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.error(`[testing] Generated ${total} product inserts`);
  return inserts;
}

const inserts = await generateInserts();
console.log(JSON.stringify(inserts, null, 2));
