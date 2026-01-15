import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { authenticateTenantApiKey } from '../middleware/tenantApiKey.js';
import { createWooCommerceClient } from '../services/woocommerceClient.js';
import {
  mapWooCommerceProduct,
  mapWooCommerceVariants,
  mapWooCommerceCategories,
  mapWooCommerceOrder,
  mapWooCommerceOrderItems,
  createProductMap,
} from '../services/woocommerceMapper.js';
import { getDatabaseState } from '../utils/database.js';

const router = express.Router();

/**
 * Helper to get WooCommerce client for current tenant
 */
async function getWooCommerceClientForTenant(tenantId) {
  return await createWooCommerceClient(tenantId, query);
}

/**
 * POST /api/woocommerce/test-connection
 * Test WooCommerce API connection
 */
router.post('/test-connection', authenticateTenantApiKey, async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          success: false,
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        success: false,
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    const tenantId = req.tenantId;
    const client = await getWooCommerceClientForTenant(tenantId);
    const result = await client.testConnection();

    if (result.success) {
      res.json({
        success: true,
        message: 'Connection successful',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Connection failed',
        data: result
      });
    }
  } catch (error) {
    console.error('[testing] Error testing WooCommerce connection:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test connection'
    });
  }
});

/**
 * GET /api/woocommerce/sync/status
 * Get sync status and last sync time
 */
router.get('/sync/status', authenticateTenantApiKey, async (req, res) => {
  try {
    const { dbInitialized } = getDatabaseState();
    
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Database is initializing'
      });
    }

    const tenantId = req.tenantId;

    // Get integration config
    const integrationResult = await query(`
      SELECT config, is_active, updated_at
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'woocommerce'
      LIMIT 1
    `, [tenantId]);

    if (integrationResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          is_configured: false,
          is_active: false,
          last_sync_at: null
        }
      });
    }

    const integration = integrationResult.rows[0];
    const config = integration.config || {};
    const lastSyncAt = config.last_sync_at || null;

    // Count synced products and orders
    const productsCount = await query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE tenant_id = $1 AND external_source = 'woocommerce'
    `, [tenantId]);

    const ordersCount = await query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE tenant_id = $1 AND external_source = 'woocommerce'
    `, [tenantId]);

    res.json({
      success: true,
      data: {
        is_configured: true,
        is_active: integration.is_active,
        last_sync_at: lastSyncAt,
        synced_products: parseInt(productsCount.rows[0].count),
        synced_orders: parseInt(ordersCount.rows[0].count),
        store_url: config.store_url || null
      }
    });
  } catch (error) {
    console.error('[testing] Error getting sync status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sync status'
    });
  }
});

/**
 * POST /api/woocommerce/sync/products
 * Sync products from WooCommerce
 */
router.post('/sync/products', authenticateTenantApiKey, async (req, res) => {
  try {
    const { dbInitialized } = getDatabaseState();
    
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Database is initializing'
      });
    }

    const tenantId = req.tenantId;
    const { page = 1, per_page = 10, status = 'publish' } = req.body;

    const client = await getWooCommerceClientForTenant(tenantId);

    // Fetch products from WooCommerce
    const wcProducts = await client.getProducts(page, per_page, { status });

    if (!Array.isArray(wcProducts)) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response from WooCommerce API'
      });
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    // Process each product
    for (const wcProduct of wcProducts) {
      try {
        const mappedProduct = mapWooCommerceProduct(wcProduct, tenantId);

        // Check if product already exists by external_id
        const existingProduct = await query(`
          SELECT id FROM products
          WHERE tenant_id = $1 AND external_id = $2 AND external_source = 'woocommerce'
          LIMIT 1
        `, [tenantId, mappedProduct.external_id]);

        let productId;

        if (existingProduct.rows.length > 0) {
          // Update existing product
          productId = existingProduct.rows[0].id;
          await query(`
            UPDATE products
            SET name = $1,
                description = $2,
                handle = $3,
                status = $4,
                featured_image = $5,
                updated_at = NOW()
            WHERE id = $6
          `, [
            mappedProduct.name,
            mappedProduct.description,
            mappedProduct.handle,
            mappedProduct.status,
            mappedProduct.featured_image,
            productId
          ]);
          results.updated++;
        } else {
          // Create new product
          const insertResult = await query(`
            INSERT INTO products (
              name, description, handle, status, featured_image,
              tenant_id, external_id, external_source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `, [
            mappedProduct.name,
            mappedProduct.description,
            mappedProduct.handle,
            mappedProduct.status,
            mappedProduct.featured_image,
            mappedProduct.tenant_id,
            mappedProduct.external_id,
            mappedProduct.external_source
          ]);
          productId = insertResult.rows[0].id;
          results.created++;
        }

        // Sync variants first (needed for price)
        const variants = mapWooCommerceVariants(wcProduct, productId, tenantId);
        for (const variant of variants) {
          // Check if variant exists by SKU
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

        // Also sync to pern_products table for compatibility with ProductsManager
        try {
          const pernProductCheck = await query(`
            SELECT product_id FROM pern_products
            WHERE slug = $1 AND tenant_id = $2
            LIMIT 1
          `, [mappedProduct.handle, tenantId]);

          // Get price from first variant or use WooCommerce price
          const variantPrice = variants.length > 0 ? variants[0].price : parseFloat(wcProduct.price || 0);

          if (pernProductCheck.rows.length === 0) {
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
              tenantId
            ]);
          } else {
            // Update existing pern_product
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
              pernProductCheck.rows[0].product_id
            ]);
          }
        } catch (pernError) {
          // If pern_products table doesn't exist, that's okay - we'll use products table
          console.warn('[testing] Could not sync to pern_products table:', pernError.message);
        }

        // Sync categories
        if (wcProduct.categories && Array.isArray(wcProduct.categories)) {
          const categories = mapWooCommerceCategories(wcProduct.categories, tenantId);
          for (const category of categories) {
            // Check if category exists
            const existingCategory = await query(`
              SELECT id FROM product_categories
              WHERE tenant_id = $1 AND slug = $2
              LIMIT 1
            `, [tenantId, category.slug]);

            let categoryId;
            if (existingCategory.rows.length > 0) {
              categoryId = existingCategory.rows[0].id;
            } else {
              const catResult = await query(`
                INSERT INTO product_categories (name, slug, description, tenant_id)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (slug, tenant_id) DO NOTHING
                RETURNING id
              `, [category.name, category.slug, category.description, category.tenant_id]);
              categoryId = catResult.rows.length > 0 ? catResult.rows[0].id : null;
            }

            // Link product to category
            if (categoryId) {
              await query(`
                INSERT INTO product_category_relations (product_id, category_id)
                VALUES ($1, $2)
                ON CONFLICT (product_id, category_id) DO NOTHING
              `, [productId, categoryId]);
            }
          }
        }
      } catch (error) {
        console.error(`[testing] Error syncing product ${wcProduct.id}:`, error);
        results.errors.push({
          product_id: wcProduct.id,
          error: error.message
        });
        results.skipped++;
      }
    }

    // Update last sync time
    await query(`
      UPDATE tenant_integrations
      SET config = jsonb_set(
        COALESCE(config, '{}'::jsonb),
        '{last_sync_at}',
        to_jsonb(NOW()::text)
      ),
      updated_at = NOW()
      WHERE tenant_id = $1 AND integration_type = 'woocommerce'
    `, [tenantId]);

    res.json({
      success: true,
      message: `Synced ${wcProducts.length} products`,
      data: results
    });
  } catch (error) {
    console.error('[testing] Error syncing products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync products'
    });
  }
});

/**
 * POST /api/woocommerce/sync/orders
 * Sync orders from WooCommerce
 */
router.post('/sync/orders', authenticateTenantApiKey, async (req, res) => {
  try {
    const { dbInitialized } = getDatabaseState();
    
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Database is initializing'
      });
    }

    const tenantId = req.tenantId;
    const { page = 1, per_page = 10, status, after, before } = req.body;

    const client = await getWooCommerceClientForTenant(tenantId);

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (after) filters.after = after;
    if (before) filters.before = before;

    // Fetch orders from WooCommerce
    const wcOrders = await client.getOrders(page, per_page, filters);

    if (!Array.isArray(wcOrders)) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response from WooCommerce API'
      });
    }

    // Get product map for order items
    const wcProductIds = [];
    wcOrders.forEach(order => {
      if (order.line_items) {
        order.line_items.forEach(item => {
          if (item.product_id) wcProductIds.push(item.product_id);
          if (item.variation_id) wcProductIds.push(item.variation_id);
        });
      }
    });
    const productMap = await createProductMap(wcProductIds, tenantId, query);

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    // Process each order
    for (const wcOrder of wcOrders) {
      try {
        const mappedOrder = mapWooCommerceOrder(wcOrder, tenantId);

        // Check if order already exists by external_id
        const existingOrder = await query(`
          SELECT id FROM orders
          WHERE tenant_id = $1 AND external_id = $2 AND external_source = 'woocommerce'
          LIMIT 1
        `, [tenantId, mappedOrder.external_id]);

        let orderId;

        if (existingOrder.rows.length > 0) {
          // Update existing order
          orderId = existingOrder.rows[0].id;
          await query(`
            UPDATE orders
            SET order_number = $1,
                customer_email = $2,
                customer_first_name = $3,
                customer_last_name = $4,
                status = $5,
                subtotal = $6,
                tax_amount = $7,
                shipping_amount = $8,
                total_amount = $9,
                shipping_address = $10,
                billing_address = $11,
                updated_at = NOW()
            WHERE id = $12
          `, [
            mappedOrder.order_number,
            mappedOrder.customer_email,
            mappedOrder.customer_first_name,
            mappedOrder.customer_last_name,
            mappedOrder.status,
            mappedOrder.subtotal,
            mappedOrder.tax_amount,
            mappedOrder.shipping_amount,
            mappedOrder.total_amount,
            mappedOrder.shipping_address ? JSON.stringify(mappedOrder.shipping_address) : null,
            mappedOrder.billing_address ? JSON.stringify(mappedOrder.billing_address) : null,
            orderId
          ]);
          results.updated++;

          // Delete existing order items
          await query(`
            DELETE FROM order_items WHERE order_id = $1
          `, [orderId]);
        } else {
          // Create new order
          const insertResult = await query(`
            INSERT INTO orders (
              order_number, customer_email, customer_first_name, customer_last_name,
              status, subtotal, tax_amount, shipping_amount, total_amount,
              shipping_address, billing_address, tenant_id, external_id, external_source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id
          `, [
            mappedOrder.order_number,
            mappedOrder.customer_email,
            mappedOrder.customer_first_name,
            mappedOrder.customer_last_name,
            mappedOrder.status,
            mappedOrder.subtotal,
            mappedOrder.tax_amount,
            mappedOrder.shipping_amount,
            mappedOrder.total_amount,
            mappedOrder.shipping_address ? JSON.stringify(mappedOrder.shipping_address) : null,
            mappedOrder.billing_address ? JSON.stringify(mappedOrder.billing_address) : null,
            mappedOrder.tenant_id,
            mappedOrder.external_id,
            mappedOrder.external_source
          ]);
          orderId = insertResult.rows[0].id;
          results.created++;
        }

        // Sync order items (only if product exists)
        const orderItems = mapWooCommerceOrderItems(wcOrder, orderId, productMap);
        for (const item of orderItems) {
          // Skip items without a valid product_id (product not synced yet)
          if (!item.product_id) {
            console.warn(`[testing] Skipping order item for WooCommerce product ${wcOrder.line_items?.find(li => li.product_id && !productMap[li.product_id])?.product_id} - product not found in database`);
            continue;
          }
          await query(`
            INSERT INTO order_items (
              order_id, product_id, variant_id, quantity, unit_price, total_price
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            item.order_id,
            item.product_id,
            item.variant_id,
            item.quantity,
            item.unit_price,
            item.total_price
          ]);
        }
      } catch (error) {
        console.error(`[testing] Error syncing order ${wcOrder.id}:`, error);
        results.errors.push({
          order_id: wcOrder.id,
          error: error.message
        });
        results.skipped++;
      }
    }

    // Update last sync time
    await query(`
      UPDATE tenant_integrations
      SET config = jsonb_set(
        COALESCE(config, '{}'::jsonb),
        '{last_sync_at}',
        to_jsonb(NOW()::text)
      ),
      updated_at = NOW()
      WHERE tenant_id = $1 AND integration_type = 'woocommerce'
    `, [tenantId]);

    res.json({
      success: true,
      message: `Synced ${wcOrders.length} orders`,
      data: results
    });
  } catch (error) {
    console.error('[testing] Error syncing orders:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync orders'
    });
  }
});

export default router;
