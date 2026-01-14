#!/usr/bin/env node

/**
 * Sync Products from WooCommerce using MCP Database Tools
 * This script fetches products from WooCommerce and inserts them directly into the database
 */

import dotenv from 'dotenv';
import { WooCommerceClient } from '../server/services/woocommerceClient.js';
import {
  mapWooCommerceProduct,
  mapWooCommerceVariants,
  mapWooCommerceCategories,
} from '../server/services/woocommerceMapper.js';

dotenv.config();

const TENANT_ID = 'tenant-8361048f';
const WOOCOMMERCE_CONFIG = {
  store_url: 'https://cms.juliaparis.fr',
  consumer_key: 'ck_39475d128c1bd7262eb3f6635ee761cc207b57a8',
  consumer_secret: 'cs_257b9bd0af45c286958327ac9dc1d92b0ac00f3a',
  api_version: 'wc/v3',
};

// Database operations using query function
import { query } from '../sparti-cms/db/index.js';

async function syncProducts() {
  console.log('[testing] Starting WooCommerce product sync for Julia Paris B2B...');
  console.log(`[testing] Tenant ID: ${TENANT_ID}\n`);

  try {
    // Initialize WooCommerce client
    const client = new WooCommerceClient(WOOCOMMERCE_CONFIG);
    
    // Test connection first
    console.log('[testing] Testing WooCommerce connection...');
    const testResult = await client.testConnection();
    if (!testResult.success) {
      console.error('[testing] ❌ Connection test failed:', testResult.error);
      return;
    }
    console.log('[testing] ✓ Connection successful!\n');

    // Fetch products in batches
    let page = 1;
    let perPage = 50;
    let totalSynced = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let hasMore = true;

    console.log('[testing] Starting product sync...\n');

    while (hasMore) {
      console.log(`[testing] Fetching page ${page} (${perPage} products per page)...`);

      try {
        const wcProducts = await client.getProducts(page, perPage, { status: 'publish' });

        if (!Array.isArray(wcProducts) || wcProducts.length === 0) {
          console.log('[testing] No more products to sync.');
          hasMore = false;
          break;
        }

        console.log(`[testing] Found ${wcProducts.length} products on page ${page}`);

        // Process each product
        for (const wcProduct of wcProducts) {
          try {
            const mappedProduct = mapWooCommerceProduct(wcProduct, TENANT_ID);

            // Check if product already exists by external_id (if migration was run)
            // Otherwise check by handle
            let existingProduct;
            
            try {
              existingProduct = await query(`
                SELECT id FROM products
                WHERE tenant_id = $1 
                  AND (external_id = $2 OR handle = $3)
                LIMIT 1
              `, [TENANT_ID, mappedProduct.external_id, mappedProduct.handle]);
            } catch (e) {
              // If external_id column doesn't exist, check by handle only
              existingProduct = await query(`
                SELECT id FROM products
                WHERE tenant_id = $1 AND handle = $2
                LIMIT 1
              `, [TENANT_ID, mappedProduct.handle]);
            }

            let productId;

            if (existingProduct.rows.length > 0) {
              // Update existing product
              productId = existingProduct.rows[0].id;
              
              let updateQuery;
              try {
                // Try with external_id if column exists
                updateQuery = `
                  UPDATE products
                  SET name = $1,
                      description = $2,
                      handle = $3,
                      status = $4,
                      featured_image = $5,
                      external_id = $6,
                      external_source = $7,
                      updated_at = NOW()
                  WHERE id = $8
                `;
                await query(updateQuery, [
                  mappedProduct.name,
                  mappedProduct.description,
                  mappedProduct.handle,
                  mappedProduct.status,
                  mappedProduct.featured_image,
                  mappedProduct.external_id,
                  mappedProduct.external_source,
                  productId
                ]);
              } catch (e) {
                // Fallback without external_id columns
                updateQuery = `
                  UPDATE products
                  SET name = $1,
                      description = $2,
                      handle = $3,
                      status = $4,
                      featured_image = $5,
                      updated_at = NOW()
                  WHERE id = $6
                `;
                await query(updateQuery, [
                  mappedProduct.name,
                  mappedProduct.description,
                  mappedProduct.handle,
                  mappedProduct.status,
                  mappedProduct.featured_image,
                  productId
                ]);
              }
              
              totalUpdated++;
            } else {
              // Create new product
              let insertQuery;
              let insertParams;
              
              try {
                // Try with external_id if columns exist
                insertQuery = `
                  INSERT INTO products (
                    name, description, handle, status, featured_image,
                    tenant_id, external_id, external_source
                  )
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                  RETURNING id
                `;
                insertParams = [
                  mappedProduct.name,
                  mappedProduct.description,
                  mappedProduct.handle,
                  mappedProduct.status,
                  mappedProduct.featured_image,
                  mappedProduct.tenant_id,
                  mappedProduct.external_id,
                  mappedProduct.external_source
                ];
              } catch (e) {
                // Fallback without external_id columns
                insertQuery = `
                  INSERT INTO products (
                    name, description, handle, status, featured_image, tenant_id
                  )
                  VALUES ($1, $2, $3, $4, $5, $6)
                  RETURNING id
                `;
                insertParams = [
                  mappedProduct.name,
                  mappedProduct.description,
                  mappedProduct.handle,
                  mappedProduct.status,
                  mappedProduct.featured_image,
                  mappedProduct.tenant_id
                ];
              }
              
              const insertResult = await query(insertQuery, insertParams);
              productId = insertResult.rows[0].id;
              totalCreated++;
            }

            // Sync variants
            const variants = mapWooCommerceVariants(wcProduct, productId, TENANT_ID);
            for (const variant of variants) {
              if (variant.sku) {
                const existingVariant = await query(`
                  SELECT id FROM product_variants
                  WHERE product_id = $1 AND sku = $2
                  LIMIT 1
                `, [productId, variant.sku]);

                if (existingVariant.rows.length > 0) {
                  await query(`
                    UPDATE product_variants
                    SET title = $1,
                        price = $2,
                        compare_at_price = $3,
                        inventory_quantity = $4,
                        inventory_management = $5,
                        updated_at = NOW()
                    WHERE id = $6
                  `, [
                    variant.title,
                    variant.price,
                    variant.compare_at_price,
                    variant.inventory_quantity,
                    variant.inventory_management,
                    existingVariant.rows[0].id
                  ]);
                } else {
                  await query(`
                    INSERT INTO product_variants (
                      product_id, sku, title, price, compare_at_price,
                      inventory_quantity, inventory_management, tenant_id
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                  `, [
                    variant.product_id,
                    variant.sku,
                    variant.title,
                    variant.price,
                    variant.compare_at_price,
                    variant.inventory_quantity,
                    variant.inventory_management,
                    variant.tenant_id
                  ]);
                }
              }
            }

            // Also sync to pern_products table for compatibility
            try {
              const variantPrice = variants.length > 0 ? variants[0].price : parseFloat(wcProduct.price || 0);
              
              const pernCheck = await query(`
                SELECT product_id FROM pern_products
                WHERE slug = $1 AND tenant_id = $2
                LIMIT 1
              `, [mappedProduct.handle, TENANT_ID]);

              if (pernCheck.rows.length === 0) {
                await query(`
                  INSERT INTO pern_products (name, slug, price, description, image_url, tenant_id)
                  VALUES ($1, $2, $3, $4, $5, $6)
                  ON CONFLICT (slug, tenant_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    price = EXCLUDED.price,
                    description = EXCLUDED.description,
                    image_url = EXCLUDED.image_url,
                    updated_at = NOW()
                `, [
                  mappedProduct.name,
                  mappedProduct.handle,
                  variantPrice,
                  mappedProduct.description || '',
                  mappedProduct.featured_image,
                  TENANT_ID
                ]);
              } else {
                await query(`
                  UPDATE pern_products
                  SET name = $1,
                      price = $2,
                      description = $3,
                      image_url = $4,
                      updated_at = NOW()
                  WHERE product_id = $5
                `, [
                  mappedProduct.name,
                  variantPrice,
                  mappedProduct.description || '',
                  mappedProduct.featured_image,
                  pernCheck.rows[0].product_id
                ]);
              }
            } catch (pernError) {
              console.warn(`[testing] Could not sync to pern_products for product ${wcProduct.id}:`, pernError.message);
            }

            totalSynced++;
          } catch (error) {
            console.error(`[testing] Error syncing product ${wcProduct.id}:`, error.message);
          }
        }

        // If we got fewer products than requested, we're done
        if (wcProducts.length < perPage) {
          hasMore = false;
        } else {
          page++;
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Safety limit
        if (page > 100) {
          console.log('[testing] ⚠️  Reached safety limit of 100 pages. Stopping.');
          hasMore = false;
        }

      } catch (error) {
        console.error(`[testing] Error fetching page ${page}:`, error.message);
        hasMore = false;
      }
    }

    // Update last sync time
    try {
      await query(`
        UPDATE tenant_integrations
        SET config = jsonb_set(
          COALESCE(config, '{}'::jsonb),
          '{last_sync_at}',
          to_jsonb(NOW()::text)
        ),
        updated_at = NOW()
        WHERE tenant_id = $1 AND integration_type = 'woocommerce'
      `, [TENANT_ID]);
    } catch (e) {
      console.warn('[testing] Could not update last_sync_at:', e.message);
    }

    console.log(`\n[testing] ✓ Sync complete!`);
    console.log(`[testing]   Total Created: ${totalCreated}`);
    console.log(`[testing]   Total Updated: ${totalUpdated}`);
    console.log(`[testing]   Total Synced: ${totalSynced}`);
    console.log('\n[testing] Products should now appear in Shop → Products page.\n');

  } catch (error) {
    console.error('[testing] ❌ Sync failed:', error.message);
    console.error(error);
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
