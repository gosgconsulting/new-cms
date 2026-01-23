import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import {
  getProducts,
  getProductsWithDetails,
  getProduct,
  getProductFromProductsTable,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getCart,
  getCartById,
  getOrCreateGuestCart,
  associateCartWithUser,
  addToCart,
  addToCartById,
  updateCartItem,
  removeFromCart,
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getReviews,
  createReview,
  deleteReview
} from '../../sparti-cms/db/modules/ecommerce.js';
import { authenticateTenantApiKey } from '../middleware/tenantApiKey.js';
import { authenticateUser } from '../middleware/auth.js';
import { createWooCommerceClient } from '../services/woocommerceClient.js';
import Stripe from 'stripe';

const router = express.Router();

// Cache for tenant-specific Stripe instances
const stripeInstances = new Map();

/**
 * Get or create a Stripe instance for a specific tenant
 * @param {string} tenantId - The tenant ID
 * @returns {Stripe|null} Stripe instance or null if not configured
 */
async function getTenantStripe(tenantId) {
  if (!tenantId) {
    return null;
  }

  // Check cache first
  if (stripeInstances.has(tenantId)) {
    return stripeInstances.get(tenantId);
  }

  try {
    // Get tenant's Stripe secret key from database
    const tenantResult = await query(`
      SELECT stripe_secret_key
      FROM tenants
      WHERE id = $1
    `, [tenantId]);

    const stripeSecretKey = tenantResult.rows[0]?.stripe_secret_key;

    // Fallback to global STRIPE_SECRET_KEY for backward compatibility
    const secretKey = stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return null;
    }

    // Create Stripe instance for this tenant
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Cache the instance
    stripeInstances.set(tenantId, stripe);
    return stripe;
  } catch (error) {
    console.error(`[testing] Error getting Stripe instance for tenant ${tenantId}:`, error);
    return null;
  }
}

/**
 * Get tenant's Stripe webhook secret
 * @param {string} tenantId - The tenant ID
 * @returns {string|null} Webhook secret or null if not configured
 */
async function getTenantWebhookSecret(tenantId) {
  if (!tenantId) {
    return process.env.STRIPE_WEBHOOK_SECRET || null;
  }

  try {
    const tenantResult = await query(`
      SELECT stripe_webhook_secret
      FROM tenants
      WHERE id = $1
    `, [tenantId]);

    const webhookSecret = tenantResult.rows[0]?.stripe_webhook_secret;
    
    // Fallback to global STRIPE_WEBHOOK_SECRET for backward compatibility
    return webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || null;
  } catch (error) {
    console.error(`[testing] Error getting webhook secret for tenant ${tenantId}:`, error);
    return process.env.STRIPE_WEBHOOK_SECRET || null;
  }
}

// Legacy global Stripe instance for backward compatibility (deprecated)
// Use getTenantStripe() instead
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

// Helper function to generate order number
function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Helper function to get e-shop provider setting
async function getEshopProvider(tenantId) {
  try {
    const result = await query(`
      SELECT setting_value
      FROM site_settings
      WHERE setting_key = 'shop_eshop_provider'
        AND tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [tenantId]);

    return result.rows.length > 0 ? result.rows[0].setting_value : 'sparti';
  } catch (error) {
    console.error('[testing] Error getting e-shop provider:', error);
    return 'sparti'; // Default to Sparti
  }
}

// ===== PRODUCTS ROUTES (PERN-Store Schema) =====

// Get all products
router.get('/products', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { search, limit, page = 1, per_page = 10, status, with_details } = req.query;

    // Check e-shop provider setting
    const eshopProvider = await getEshopProvider(tenantId);

    if (eshopProvider === 'woocommerce') {
      // Use WooCommerce API - but first try to get from synced database
      // If no synced products, fetch from WooCommerce API and transform
      try {
        // Check if we have synced products in database
        const syncedProducts = await query(`
          SELECT COUNT(*) as count
          FROM products
          WHERE tenant_id = $1 AND external_source = 'woocommerce'
        `, [tenantId]);

        const hasSyncedProducts = parseInt(syncedProducts.rows[0]?.count || 0) > 0;

        if (hasSyncedProducts) {
          // Use synced products from database - query products table and transform
          let sql = `
            SELECT 
              p.id,
              p.name,
              p.handle as slug,
              p.description,
              p.featured_image as image_url,
              p.status,
              p.external_id,
              p.external_source,
              p.created_at,
              p.updated_at,
              COALESCE(
                (SELECT MIN(pv.price) FROM product_variants pv WHERE pv.product_id = p.id),
                (SELECT price FROM product_variants pv WHERE pv.product_id = p.id LIMIT 1),
                0
              ) as price
            FROM products p
            WHERE p.tenant_id = $1 AND p.external_source = 'woocommerce'
          `;
          const params = [tenantId];
          let paramIndex = 2;

          if (search) {
            sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
          }

          sql += ` ORDER BY p.created_at DESC`;

          if (limit) {
            sql += ` LIMIT $${paramIndex}`;
            params.push(parseInt(limit));
          }

          const result = await query(sql, params);
          
          // Transform to match expected format
          const transformedProducts = result.rows.map(row => ({
            product_id: row.id,
            name: row.name,
            slug: row.slug,
            price: parseFloat(row.price || 0),
            description: row.description || '',
            image_url: row.image_url,
            created_at: row.created_at,
            updated_at: row.updated_at,
            external_id: row.external_id,
            external_source: row.external_source,
            status: row.status,
          }));

          res.json({
            success: true,
            data: transformedProducts,
            provider: 'woocommerce-synced'
          });
          return;
        } else {
          // No synced products yet, fetch from WooCommerce API and transform
          const client = await createWooCommerceClient(tenantId, query);
          const filters = {};
          if (search) filters.search = search;
          
          const wcProducts = await client.getProducts(
            parseInt(page) || 1,
            parseInt(per_page) || parseInt(limit) || 100,
            filters
          );

          // Transform WooCommerce products to match expected format
          const transformedProducts = Array.isArray(wcProducts) ? wcProducts.map(wcProduct => ({
            product_id: wcProduct.id,
            name: wcProduct.name || 'Unnamed Product',
            slug: wcProduct.slug || wcProduct.name?.toLowerCase().replace(/\s+/g, '-') || '',
            price: parseFloat(wcProduct.price || 0),
            description: wcProduct.description || wcProduct.short_description || '',
            image_url: wcProduct.images && wcProduct.images.length > 0 ? wcProduct.images[0].src : null,
            created_at: wcProduct.date_created || new Date().toISOString(),
            updated_at: wcProduct.date_modified || wcProduct.date_created || new Date().toISOString(),
            // Additional WooCommerce fields
            external_id: String(wcProduct.id),
            external_source: 'woocommerce',
            status: wcProduct.status,
            stock_status: wcProduct.stock_status,
            stock_quantity: wcProduct.stock_quantity,
          })) : [];

          res.json({
            success: true,
            data: transformedProducts,
            provider: 'woocommerce-api'
          });
          return;
        }
      } catch (wcError) {
        console.error('[testing] WooCommerce API error, falling back to Sparti:', wcError);
        // Fall back to Sparti if WooCommerce fails
      }
    }

    // Use Sparti (default or fallback)
    const filters = {};
    if (search) filters.search = search;
    if (limit) filters.limit = parseInt(limit);
    if (status) filters.status = status;

    // Use detailed query if requested (for admin table view)
    const products = with_details === 'true' 
      ? await getProductsWithDetails(tenantId, filters)
      : await getProducts(tenantId, filters);

    res.json({ 
      success: true, 
      data: products,
      provider: 'sparti'
    });
  } catch (error) {
    console.error('[testing] Error fetching products:', error);
    console.error('[testing] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Handle table not found errors
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('Ecommerce tables not found')) {
      return res.status(503).json({ 
        success: false, 
        error: 'Ecommerce tables not found',
        message: 'Please run database migrations: npm run sequelize:migrate',
        code: 'TABLES_NOT_FOUND'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch products',
      code: error.code
    });
  }
});

// Get single product by ID
router.get('/products/:id', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.id);

    // Check e-shop provider setting
    const eshopProvider = await getEshopProvider(tenantId);

    if (eshopProvider === 'woocommerce') {
      // Try to get from WooCommerce API for complete data
      try {
        const client = await createWooCommerceClient(tenantId, query);
        const wcProduct = await client.getProduct(productId);

        if (wcProduct) {
          // Return full WooCommerce product data
          res.json({ 
            success: true, 
            data: wcProduct,
            source: 'woocommerce'
          });
          return;
        }
      } catch (wcError) {
        console.warn('[testing] Could not fetch product from WooCommerce, falling back to local:', wcError.message);
        // Fall through to local database
      }
    }

    // Fallback to local database - try products table first, then pern_products
    let product = await getProductFromProductsTable(productId, tenantId);
    
    if (!product) {
      product = await getProduct(productId, tenantId);
    }

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      data: product,
      source: 'local'
    });
  } catch (error) {
    console.error('[testing] Error fetching product:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get product by slug
router.get('/products/slug/:slug', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const slug = req.params.slug;

    const product = await getProductBySlug(slug, tenantId);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    console.error('[testing] Error fetching product by slug:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get product variants
router.get('/products/:id/variants', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const idParam = req.params.id;
    
    let productId;
    
    // Try to parse as integer first (product ID from products table)
    const parsedId = parseInt(idParam);
    if (!isNaN(parsedId)) {
      productId = parsedId;
    } else {
      // If not a number, treat as slug and find product by slug
      const productBySlug = await query(`
        SELECT id FROM products WHERE handle = $1 AND tenant_id = $2
        LIMIT 1
      `, [idParam, tenantId]);
      
      if (productBySlug.rows.length === 0) {
        // Also check pern_products and find corresponding products table ID
        const pernProduct = await query(`
          SELECT p.id 
          FROM products p
          JOIN pern_products pp ON p.handle = pp.slug
          WHERE pp.slug = $1 AND p.tenant_id = $2
          LIMIT 1
        `, [idParam, tenantId]);
        
        if (pernProduct.rows.length > 0) {
          productId = pernProduct.rows[0].id;
        } else {
          return res.status(404).json({ 
            success: false, 
            error: 'Product not found' 
          });
        }
      } else {
        productId = productBySlug.rows[0].id;
      }
    }

    // Verify product belongs to tenant
    const productCheck = await query(`
      SELECT id FROM products WHERE id = $1 AND tenant_id = $2
    `, [productId, tenantId]);

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    // Get variants
    const variantsResult = await query(`
      SELECT 
        id,
        sku,
        title,
        price,
        compare_at_price,
        inventory_quantity,
        inventory_management
      FROM product_variants
      WHERE product_id = $1 AND tenant_id = $2
      ORDER BY title ASC, price ASC
    `, [productId, tenantId]);

    res.json({ 
      success: true, 
      data: variantsResult.rows 
    });
  } catch (error) {
    console.error('[testing] Error fetching product variants:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update product variants (bulk)
router.put('/products/:id/variants', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const idParam = req.params.id;
    const { variants } = req.body;

    if (!Array.isArray(variants)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Variants must be an array' 
      });
    }

    let productId;
    
    // Try to parse as integer first (product ID from products table)
    const parsedId = parseInt(idParam);
    if (!isNaN(parsedId)) {
      productId = parsedId;
    } else {
      // If not a number, treat as slug and find product by slug
      const productBySlug = await query(`
        SELECT id FROM products WHERE handle = $1 AND tenant_id = $2
        LIMIT 1
      `, [idParam, tenantId]);
      
      if (productBySlug.rows.length === 0) {
        // Also check pern_products and find corresponding products table ID
        const pernProduct = await query(`
          SELECT p.id 
          FROM products p
          JOIN pern_products pp ON p.handle = pp.slug
          WHERE pp.slug = $1 AND p.tenant_id = $2
          LIMIT 1
        `, [idParam, tenantId]);
        
        if (pernProduct.rows.length > 0) {
          productId = pernProduct.rows[0].id;
        } else {
          return res.status(404).json({ 
            success: false, 
            error: 'Product not found' 
          });
        }
      } else {
        productId = productBySlug.rows[0].id;
      }
    }

    // Verify product belongs to tenant
    const productCheck = await query(`
      SELECT id FROM products WHERE id = $1 AND tenant_id = $2
    `, [productId, tenantId]);

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Get existing variant IDs
      const existingVariantsResult = await query(`
        SELECT id FROM product_variants
        WHERE product_id = $1 AND tenant_id = $2
      `, [productId, tenantId]);

      const existingIds = new Set(existingVariantsResult.rows.map(row => row.id));
      const newIds = new Set(variants.filter(v => v.id).map(v => v.id));

      // Delete variants that are not in the new list
      const idsToDelete = Array.from(existingIds).filter(id => !newIds.has(id));
      if (idsToDelete.length > 0) {
        await query(`
          DELETE FROM product_variants
          WHERE id = ANY($1::int[]) AND product_id = $2 AND tenant_id = $3
        `, [idsToDelete, productId, tenantId]);
      }

      // Update or insert variants
      for (const variant of variants) {
        const {
          id,
          sku,
          title,
          price,
          compare_at_price,
          inventory_quantity,
          inventory_management
        } = variant;

        if (!title || title.trim() === '') {
          continue; // Skip variants without title
        }

        const priceNum = typeof price === 'string' ? parseFloat(price) : price;
        const comparePriceNum = compare_at_price 
          ? (typeof compare_at_price === 'string' ? parseFloat(compare_at_price) : compare_at_price)
          : null;
        const inventoryQty = typeof inventory_quantity === 'string' 
          ? parseInt(inventory_quantity) 
          : (inventory_quantity || 0);
        const manageStock = inventory_management !== false && inventory_management !== 'false';

        if (id && existingIds.has(id)) {
          // Update existing variant
          await query(`
            UPDATE product_variants
            SET sku = $1,
                title = $2,
                price = $3,
                compare_at_price = $4,
                inventory_quantity = $5,
                inventory_management = $6,
                updated_at = NOW()
            WHERE id = $7 AND product_id = $8 AND tenant_id = $9
          `, [
            sku || null,
            title,
            priceNum || 0,
            comparePriceNum,
            inventoryQty,
            manageStock,
            id,
            productId,
            tenantId
          ]);
        } else {
          // Insert new variant
          await query(`
            INSERT INTO product_variants (
              product_id, sku, title, price, compare_at_price,
              inventory_quantity, inventory_management, tenant_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `, [
            productId,
            sku || null,
            title,
            priceNum || 0,
            comparePriceNum,
            inventoryQty,
            manageStock,
            tenantId
          ]);
        }
      }

      await query('COMMIT');

      // Fetch updated variants
      const updatedVariantsResult = await query(`
        SELECT 
          id,
          sku,
          title,
          price,
          compare_at_price,
          inventory_quantity,
          inventory_management
        FROM product_variants
        WHERE product_id = $1 AND tenant_id = $2
        ORDER BY title ASC, price ASC
      `, [productId, tenantId]);

      res.json({ 
        success: true, 
        data: updatedVariantsResult.rows 
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('[testing] Error updating product variants:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create product
router.post('/products', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      name,
      slug,
      price,
      sale_price,
      description,
      short_description,
      image_url,
      gallery_images,
      sku,
      manage_stock,
      stock_quantity,
      backorders,
      categories,
      tags,
      meta_title,
      meta_description,
      weight,
      length,
      width,
      height,
      shipping_class,
      status,
      featured,
      product_type,
      is_subscription,
      subscription_frequency,
      attributes,
      variations,
    } = req.body;

    if (!name || !slug || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, slug, and price are required' 
      });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Create product in pern_products table
      const product = await createProduct({
        name,
        slug,
        price: parseFloat(price),
        description: description || '',
        image_url: image_url || null
      }, tenantId);

      const productId = product.product_id;

      // Also create in products table if it exists (for WooCommerce compatibility)
      let mainProductId = null;
      try {
        const handle = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const productStatus = status === 'publish' ? 'active' : 'draft';
        
        const mainProductResult = await query(`
          INSERT INTO products (
            name, description, handle, status, featured_image,
            tenant_id, external_source, is_subscription, subscription_frequency
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          name,
          description || '',
          handle,
          productStatus,
          image_url || null,
          tenantId,
          'local',
          is_subscription || false,
          subscription_frequency || null
        ]);
        
        mainProductId = mainProductResult.rows[0]?.id;
      } catch (err) {
        // products table might not exist, that's okay
        console.warn('[testing] Could not create product in products table:', err.message);
      }

      // Create variants
      if (variations && Array.isArray(variations) && variations.length > 0) {
        for (const variation of variations) {
          if (!variation.enabled) continue;
          
          const variantTitle = Object.entries(variation.attributes || {})
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ') || 'Default';
          
          // Use mainProductId if available, otherwise use productId from pern_products
          const variantProductId = mainProductId || productId;
          
          try {
            await query(`
              INSERT INTO product_variants (
                product_id, sku, title, price, compare_at_price,
                inventory_quantity, inventory_management, tenant_id
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              variantProductId,
              variation.sku || null,
              variantTitle,
              parseFloat(variation.price || variation.regular_price || price),
              variation.sale_price ? parseFloat(variation.sale_price) : null,
              variation.stock_quantity || stock_quantity || 0,
              manage_stock !== false,
              tenantId
            ]);
          } catch (err) {
            console.warn('[testing] Could not create variant:', err.message);
          }
        }
      } else {
        // Create default variant for simple products
        const variantProductId = mainProductId || productId;
        try {
          await query(`
            INSERT INTO product_variants (
              product_id, sku, title, price, compare_at_price,
              inventory_quantity, inventory_management, tenant_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            variantProductId,
            sku || null,
            'Default',
            parseFloat(price),
            sale_price ? parseFloat(sale_price) : null,
            stock_quantity || 0,
            manage_stock !== false,
            tenantId
          ]);
        } catch (err) {
          console.warn('[testing] Could not create default variant:', err.message);
        }
      }

      // Link categories
      if (categories && Array.isArray(categories) && categories.length > 0 && mainProductId) {
        for (const categoryId of categories) {
          try {
            await query(`
              INSERT INTO product_category_relations (product_id, category_id)
              VALUES ($1, $2)
              ON CONFLICT (product_id, category_id) DO NOTHING
            `, [mainProductId, categoryId]);
          } catch (err) {
            console.warn('[testing] Could not link category:', err.message);
          }
        }
      }

      // Check if WooCommerce integration is active and create product there
      let wooCommerceProductId = null;
      try {
        const integrationResult = await query(`
          SELECT config, is_active
          FROM tenant_integrations
          WHERE tenant_id = $1 AND integration_type = 'woocommerce' AND is_active = true
          LIMIT 1
        `, [tenantId]);

        if (integrationResult.rows.length > 0) {
          const client = await createWooCommerceClient(tenantId, query);
          
          // Map to WooCommerce format
          const wcProductData = {
            name,
            type: product_type || 'simple',
            regular_price: price.toString(),
            description: description || '',
            short_description: short_description || '',
            status: status || 'draft',
            featured: featured || false,
            sku: sku || '',
            manage_stock: manage_stock !== false,
            stock_quantity: stock_quantity || 0,
            backorders: backorders || 'no',
            weight: weight || '',
            dimensions: {
              length: length || '',
              width: width || '',
              height: height || '',
            },
            shipping_class: shipping_class || '',
            images: [],
            categories: categories || [],
            tags: tags || [],
            meta_data: [],
          };

          // Add main image
          if (image_url) {
            wcProductData.images.push({ src: image_url });
          }

          // Add gallery images
          if (gallery_images && Array.isArray(gallery_images)) {
            gallery_images.forEach((url) => {
              if (url && url !== image_url) {
                wcProductData.images.push({ src: url });
              }
            });
          }

          // Add attributes for variable products
          if (product_type === 'variable' && attributes && Array.isArray(attributes)) {
            wcProductData.attributes = attributes.map((attr) => ({
              name: attr.name,
              options: attr.options || [],
              variation: attr.variation !== false,
            }));
          }

          // Create product in WooCommerce
          const wcProduct = await client.createProduct(wcProductData);
          wooCommerceProductId = wcProduct.id;

          // Create variations in WooCommerce if variable product
          if (product_type === 'variable' && variations && Array.isArray(variations) && variations.length > 0) {
            const wcVariations = variations
              .filter((v) => v.enabled)
              .map((variation) => ({
                regular_price: (variation.price || variation.regular_price || price).toString(),
                sale_price: variation.sale_price ? variation.sale_price.toString() : '',
                sku: variation.sku || '',
                stock_quantity: variation.stock_quantity || stock_quantity || 0,
                attributes: Object.entries(variation.attributes || {}).map(([name, value]) => ({
                  name,
                  option: value,
                })),
                image: variation.image ? [{ src: variation.image }] : [],
              }));

            if (wcVariations.length > 0) {
              await client.createVariations(wooCommerceProductId, wcVariations);
            }
          }

          // Update external_id in products table
          if (mainProductId) {
            await query(`
              UPDATE products
              SET external_id = $1, external_source = 'woocommerce'
              WHERE id = $2
            `, [String(wooCommerceProductId), mainProductId]);
          }
        }
      } catch (wcError) {
        console.error('[testing] Error creating product in WooCommerce:', wcError);
        // Don't fail the whole request if WooCommerce fails
      }

      await query('COMMIT');

      res.json({ 
        success: true, 
        data: {
          ...product,
          wooCommerceId: wooCommerceProductId,
        }
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('[testing] Error creating product:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        success: false, 
        error: 'Product with this slug already exists for this tenant' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update product
router.put('/products/:id', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.id);
    const { name, slug, price, description, image_url } = req.body;

    const productData = {};
    if (name !== undefined) productData.name = name;
    if (slug !== undefined) productData.slug = slug;
    if (price !== undefined) productData.price = parseFloat(price);
    if (description !== undefined) productData.description = description;
    if (image_url !== undefined) productData.image_url = image_url;

    const product = await updateProduct(productId, productData, tenantId);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    console.error('[testing] Error updating product:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        success: false, 
        error: 'Product with this slug already exists for this tenant' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete product
router.delete('/products/:id', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.id);

    const deleted = await deleteProduct(productId, tenantId);

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('[testing] Error deleting product:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== CART ROUTES (PERN-Store Schema) =====

// Get or create guest cart (no authentication required, but needs tenant API key)
router.get('/cart/guest', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cart = await getOrCreateGuestCart(tenantId);

    res.json({ 
      success: true, 
      data: cart 
    });
  } catch (error) {
    console.error('[testing] Error fetching guest cart:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get cart by cart ID (for guest carts or logged-in users)
router.get('/cart/:cartId', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartId = parseInt(req.params.cartId);

    if (isNaN(cartId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cart ID'
      });
    }

    const cart = await getCartById(cartId, tenantId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    res.json({ 
      success: true, 
      data: cart 
    });
  } catch (error) {
    console.error('[testing] Error fetching cart by ID:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Associate guest cart with user (when guest logs in)
router.post('/cart/:cartId/associate', authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const cartId = parseInt(req.params.cartId);

    if (isNaN(cartId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cart ID'
      });
    }

    const result = await associateCartWithUser(cartId, userId, tenantId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found or already associated with a user'
      });
    }

    res.json({ 
      success: true, 
      data: result,
      message: 'Cart associated with user account'
    });
  } catch (error) {
    console.error('[testing] Error associating cart with user:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Add item to guest cart (by cart_id, no authentication required)
router.post('/cart/guest/:cartId', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartId = parseInt(req.params.cartId);
    const { product_id, quantity } = req.body;

    if (isNaN(cartId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cart ID'
      });
    }

    if (!product_id || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID and quantity are required' 
      });
    }

    const cartItem = await addToCartById(cartId, parseInt(product_id), parseInt(quantity), tenantId);

    res.json({ 
      success: true, 
      data: cartItem 
    });
  } catch (error) {
    console.error('[testing] Error adding to guest cart:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update guest cart item (no authentication required, but needs tenant API key)
router.put('/cart/guest/:itemId', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartItemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity is required' 
      });
    }

    const cartItem = await updateCartItem(cartItemId, parseInt(quantity), tenantId);

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart item not found' 
      });
    }

    res.json({ 
      success: true, 
      data: cartItem 
    });
  } catch (error) {
    console.error('[testing] Error updating guest cart item:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Remove item from guest cart (no authentication required, but needs tenant API key)
router.delete('/cart/guest/:itemId', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartItemId = parseInt(req.params.itemId);

    const deleted = await removeFromCart(cartItemId, tenantId);

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Item removed from cart' 
    });
  } catch (error) {
    console.error('[testing] Error removing from guest cart:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get user's cart
router.get('/cart', authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;

    const cart = await getCart(userId, tenantId);

    res.json({ 
      success: true, 
      data: cart 
    });
  } catch (error) {
    console.error('[testing] Error fetching cart:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Add item to cart
router.post('/cart', authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID and quantity are required' 
      });
    }

    const cartItem = await addToCart(userId, parseInt(product_id), parseInt(quantity), tenantId);

    res.json({ 
      success: true, 
      data: cartItem 
    });
  } catch (error) {
    console.error('[testing] Error adding to cart:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update cart item quantity
router.put('/cart/:itemId', authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartItemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity is required' 
      });
    }

    const cartItem = await updateCartItem(cartItemId, parseInt(quantity), tenantId);

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart item not found' 
      });
    }

    res.json({ 
      success: true, 
      data: cartItem 
    });
  } catch (error) {
    console.error('[testing] Error updating cart item:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Remove item from cart
router.delete('/cart/:itemId', authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartItemId = parseInt(req.params.itemId);

    const deleted = await removeFromCart(cartItemId, tenantId);

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Item removed from cart' 
    });
  } catch (error) {
    console.error('[testing] Error removing from cart:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== CATEGORIES ROUTES (Legacy - keeping for backward compatibility) =====

// Get all categories
router.get('/categories', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const result = await query(`
      SELECT 
        id,
        name,
        slug,
        description,
        parent_id,
        created_at,
        updated_at
      FROM product_categories
      WHERE tenant_id = $1
      ORDER BY parent_id NULLS FIRST, name ASC
    `, [tenantId]);

    res.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('[testing] Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create category
router.post('/categories', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, slug, description, parent_id } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and slug are required' 
      });
    }

    const result = await query(`
      INSERT INTO product_categories (name, slug, description, parent_id, tenant_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, slug, description || null, parent_id || null, tenantId]);

    res.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('[testing] Error creating category:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        success: false, 
        error: 'Category with this slug already exists for this tenant' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update category
router.put('/categories/:id', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const categoryId = req.params.id;
    const { name, slug, description, parent_id } = req.body;

    const result = await query(`
      UPDATE product_categories 
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          parent_id = COALESCE($4, parent_id)
      WHERE id = $5 AND tenant_id = $6
      RETURNING *
    `, [name, slug, description, parent_id, categoryId, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    res.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('[testing] Error updating category:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete category
router.delete('/categories/:id', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const categoryId = req.params.id;

    const result = await query(`
      DELETE FROM product_categories 
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
    `, [categoryId, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('[testing] Error deleting category:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== ORDERS ROUTES (PERN-Store Schema) =====

// Get all orders
router.get('/orders', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status, userId, dateFrom, dateTo, limit, page = 1, per_page = 10 } = req.query;

    // Check e-shop provider setting
    const eshopProvider = await getEshopProvider(tenantId);

    if (eshopProvider === 'woocommerce') {
      // Use WooCommerce API
      try {
        const client = await createWooCommerceClient(tenantId, query);
        const filters = {};
        if (status) filters.status = status;
        if (dateFrom) filters.after = dateFrom;
        if (dateTo) filters.before = dateTo;
        
        const wcOrders = await client.getOrders(
          parseInt(page) || 1,
          parseInt(per_page) || parseInt(limit) || 10,
          filters
        );

        // Transform WooCommerce orders to match expected format
        const transformedOrders = Array.isArray(wcOrders) ? wcOrders.map(wcOrder => {
          const billing = wcOrder.billing || {};
          const paymentMethod = wcOrder.payment_method ? wcOrder.payment_method.toUpperCase() : null;
          
          // Map WooCommerce status to our status format
          const statusMap = {
            'pending': 'pending',
            'processing': 'processing',
            'on-hold': 'pending',
            'completed': 'completed',
            'cancelled': 'cancelled',
            'refunded': 'refunded',
            'failed': 'failed',
          };
          const wcStatus = wcOrder.status?.toLowerCase() || 'pending';
          const mappedStatus = statusMap[wcStatus] || wcStatus;
          
          // Ensure numeric values are properly parsed
          const totalAmount = parseFloat(String(wcOrder.total || 0));
          
          return {
            order_id: parseInt(String(wcOrder.id || 0)),
            user_id: parseInt(String(wcOrder.customer_id || 0)),
            user_email: billing.email || null,
            user_name: billing.first_name && billing.last_name 
              ? `${billing.first_name} ${billing.last_name}`.trim()
              : billing.first_name || billing.last_name || null,
            status: mappedStatus,
            date: wcOrder.date_created || wcOrder.date_modified || new Date().toISOString(),
            amount: totalAmount,
            total: totalAmount,
            ref: wcOrder.number || `WC-${wcOrder.id}`,
            payment_method: paymentMethod === 'STRIPE' || paymentMethod === 'PAYSTACK' 
              ? paymentMethod 
              : paymentMethod ? paymentMethod : null,
            // Additional WooCommerce fields
            external_id: String(wcOrder.id),
            external_source: 'woocommerce',
            line_items: wcOrder.line_items || [],
            billing_address: billing,
            shipping_address: wcOrder.shipping || {},
          };
        }) : [];

        res.json({
          success: true,
          data: transformedOrders || [],
          provider: 'woocommerce'
        });
        return;
      } catch (wcError) {
        console.error('[testing] WooCommerce API error, falling back to Sparti:', wcError);
        // Fall back to Sparti if WooCommerce fails
        // Don't return error, let it fall through to Sparti
      }
    }

    // Use Sparti (default or fallback)
    const filters = {};
    if (status) filters.status = status;
    if (userId) filters.userId = parseInt(userId);
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (limit) filters.limit = parseInt(limit);

    const orders = await getOrders(tenantId, filters);

    res.json({ 
      success: true, 
      data: orders,
      provider: 'sparti'
    });
  } catch (error) {
    console.error('[testing] Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get single order
router.get('/orders/:id', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const orderId = parseInt(req.params.id);

    // Check e-shop provider setting
    const eshopProvider = await getEshopProvider(tenantId);

    if (eshopProvider === 'woocommerce') {
      // Use WooCommerce API to get full order details
      try {
        const client = await createWooCommerceClient(tenantId, query);
        const wcOrder = await client.getOrder(orderId);

        if (!wcOrder) {
          return res.status(404).json({ 
            success: false, 
            error: 'Order not found' 
          });
        }

        const billing = wcOrder.billing || {};
        const shipping = wcOrder.shipping || {};
        
        // Map WooCommerce status to our status format
        const statusMap = {
          'pending': 'pending',
          'processing': 'processing',
          'on-hold': 'pending',
          'completed': 'completed',
          'cancelled': 'cancelled',
          'refunded': 'refunded',
          'failed': 'failed',
        };
        const wcStatus = wcOrder.status?.toLowerCase() || 'pending';
        const mappedStatus = statusMap[wcStatus] || wcStatus;
        
        const paymentMethod = wcOrder.payment_method ? wcOrder.payment_method.toUpperCase() : null;

        // Transform WooCommerce order to match expected format
        const transformedOrder = {
          order_id: parseInt(String(wcOrder.id || 0)),
          order_number: wcOrder.number || `WC-${wcOrder.id}`,
          user_id: parseInt(String(wcOrder.customer_id || 0)),
          user_email: billing.email || null,
          user_name: billing.first_name && billing.last_name 
            ? `${billing.first_name} ${billing.last_name}`.trim()
            : billing.first_name || billing.last_name || null,
          customer_email: billing.email || null,
          customer_first_name: billing.first_name || null,
          customer_last_name: billing.last_name || null,
          status: mappedStatus,
          date: wcOrder.date_created || wcOrder.date_modified || new Date().toISOString(),
          amount: parseFloat(String(wcOrder.total || 0)),
          total: parseFloat(String(wcOrder.total || 0)),
          total_amount: parseFloat(String(wcOrder.total || 0)),
          subtotal: parseFloat(String(wcOrder.subtotal || 0)),
          tax_amount: parseFloat(String(wcOrder.total_tax || 0)),
          shipping_amount: parseFloat(String(wcOrder.shipping_total || 0)),
          ref: wcOrder.number || `WC-${wcOrder.id}`,
          payment_method: paymentMethod === 'STRIPE' || paymentMethod === 'PAYSTACK' 
            ? paymentMethod 
            : paymentMethod ? paymentMethod : null,
          external_id: String(wcOrder.id),
          external_source: 'woocommerce',
          billing_address: billing.address_1 ? {
            first_name: billing.first_name || null,
            last_name: billing.last_name || null,
            company: billing.company || null,
            address_1: billing.address_1 || null,
            address_2: billing.address_2 || null,
            city: billing.city || null,
            state: billing.state || null,
            postcode: billing.postcode || null,
            country: billing.country || null,
            email: billing.email || null,
            phone: billing.phone || null,
          } : null,
          shipping_address: shipping.address_1 ? {
            first_name: shipping.first_name || null,
            last_name: shipping.last_name || null,
            company: shipping.company || null,
            address_1: shipping.address_1 || null,
            address_2: shipping.address_2 || null,
            city: shipping.city || null,
            state: shipping.state || null,
            postcode: shipping.postcode || null,
            country: shipping.country || null,
          } : null,
          line_items: wcOrder.line_items || [],
        };

        res.json({ 
          success: true, 
          data: transformedOrder 
        });
        return;
      } catch (wcError) {
        console.error('[testing] Error fetching order from WooCommerce:', wcError);
        // Fall through to try local database
      }
    }

    // Fallback to local database
    const order = await getOrder(orderId, tenantId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      data: order 
    });
  } catch (error) {
    console.error('[testing] Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create order
router.post('/orders', authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    // Allow admins to specify user_id for manual order creation, otherwise use authenticated user
    const userId = req.body.user_id && (req.user.is_super_admin || req.user.role === 'admin') 
      ? parseInt(req.body.user_id) 
      : req.user.id;
    const {
      items,
      amount,
      total,
      ref,
      payment_method,
      status
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order must have at least one item' 
      });
    }

    // Validate payment_method enum
    if (payment_method && !['PAYSTACK', 'STRIPE'].includes(payment_method)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment method must be PAYSTACK or STRIPE' 
      });
    }

    let stripePaymentIntentId = null;
    let stripeClientSecret = null;
    let orderRef = ref || generateOrderNumber();

    // If payment method is STRIPE and Stripe is configured, create Payment Intent
    if (payment_method === 'STRIPE') {
      const stripe = await getTenantStripe(tenantId); // Get tenant-specific Stripe instance
      if (stripe) {
        try {
          // Check if tenant has Stripe Connect enabled
          const tenantResult = await query(`
            SELECT stripe_connect_account_id, stripe_connect_onboarding_completed
            FROM tenants
            WHERE id = $1
          `, [tenantId]);

          const tenant = tenantResult.rows[0];
          const hasStripeConnect = tenant?.stripe_connect_account_id && tenant?.stripe_connect_onboarding_completed;

          if (hasStripeConnect) {
            // Use Stripe Connect (for marketplace/platform scenarios)
            const paymentIntent = await stripe.paymentIntents.create({
              amount: Math.round((total || amount || 0) * 100), // Convert to cents
              currency: 'usd',
              metadata: {
                tenant_id: tenantId,
                user_id: userId.toString(),
                order_ref: orderRef,
              },
            }, {
              stripeAccount: tenant.stripe_connect_account_id, // Use connected account
            });

            stripePaymentIntentId = paymentIntent.id;
            stripeClientSecret = paymentIntent.client_secret;
            orderRef = paymentIntent.id; // Use Payment Intent ID as order reference
            
            console.log(`[testing] Created Stripe Payment Intent ${stripePaymentIntentId} for order ${orderRef} on Connect account ${tenant.stripe_connect_account_id}`);
          } else {
            // Use direct Stripe payments (standard e-commerce, no Connect needed)
            // Just need the secret key - no Connect account required
            const paymentIntent = await stripe.paymentIntents.create({
              amount: Math.round((total || amount || 0) * 100), // Convert to cents
              currency: 'usd',
              metadata: {
                tenant_id: tenantId,
                user_id: userId.toString(),
                order_ref: orderRef,
              },
            });

            stripePaymentIntentId = paymentIntent.id;
            stripeClientSecret = paymentIntent.client_secret;
            orderRef = paymentIntent.id; // Use Payment Intent ID as order reference
            
            console.log(`[testing] Created Stripe Payment Intent ${stripePaymentIntentId} for order ${orderRef} (direct payment, no Connect required)`);
          }
        } catch (stripeError) {
          console.error('[testing] Error creating Stripe Payment Intent:', stripeError);
          // Continue with order creation even if Stripe fails
          // The order will be created but without Payment Intent
        }
      } else {
        console.warn(`[testing] Stripe not configured for tenant ${tenantId}, skipping Payment Intent creation`);
      }
    }

    const order = await createOrder({
      user_id: userId,
      status: status || 'pending', // Allow status to be set for manual orders
      amount: amount || null,
      total: total || null,
      ref: orderRef, // Use Payment Intent ID if Stripe, otherwise use provided ref or generated
      payment_method: payment_method || null,
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity)
      }))
    }, tenantId);

    // If we have a Payment Intent ID, we can optionally store it separately
    // For now, it's stored in the ref field

    res.json({ 
      success: true, 
      data: {
        ...order,
        stripe_payment_intent_id: stripePaymentIntentId, // Include in response
        stripe_client_secret: stripeClientSecret, // Include client_secret for frontend payment confirmation
      }
    });
  } catch (error) {
    console.error('[testing] Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update order status
router.put('/orders/:id/status', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status is required' 
      });
    }

    const order = await updateOrderStatus(orderId, status, tenantId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      data: order 
    });
  } catch (error) {
    console.error('[testing] Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== REVIEWS ROUTES (PERN-Store Schema) =====

// Get reviews for a product
router.get('/products/:productId/reviews', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.productId);

    const reviews = await getReviews(productId, tenantId);

    res.json({ 
      success: true, 
      data: reviews 
    });
  } catch (error) {
    console.error('[testing] Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create review
router.post('/products/:productId/reviews', authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.productId);
    const userId = req.user.id;
    const { content, rating } = req.body;

    if (!content || !rating) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rating must be between 1 and 5' 
      });
    }

    const review = await createReview({
      product_id: productId,
      user_id: userId,
      content,
      rating: parseInt(rating)
    }, tenantId);

    res.json({ 
      success: true, 
      data: review 
    });
  } catch (error) {
    console.error('[testing] Error creating review:', error);
    if (error.message.includes('already reviewed')) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete review
router.delete('/reviews/:id', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const reviewId = parseInt(req.params.id);

    const deleted = await deleteReview(reviewId, tenantId);

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Review not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    console.error('[testing] Error deleting review:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== STRIPE CONNECT ROUTES =====

// Update tenant Stripe configuration
router.put('/stripe/config', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { stripe_secret_key, stripe_webhook_secret } = req.body;

    // Validate that at least one key is provided
    if (!stripe_secret_key && !stripe_webhook_secret) {
      return res.status(400).json({
        success: false,
        error: 'At least one of stripe_secret_key or stripe_webhook_secret must be provided'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (stripe_secret_key !== undefined) {
      updates.push(`stripe_secret_key = $${paramIndex}`);
      values.push(stripe_secret_key);
      paramIndex++;
      
      // Clear cached Stripe instance for this tenant
      stripeInstances.delete(tenantId);
    }

    if (stripe_webhook_secret !== undefined) {
      updates.push(`stripe_webhook_secret = $${paramIndex}`);
      values.push(stripe_webhook_secret);
      paramIndex++;
    }

    values.push(tenantId);

    await query(`
      UPDATE tenants 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `, values);

    res.json({
      success: true,
      message: 'Stripe configuration updated successfully'
    });
  } catch (error) {
    console.error('[testing] Error updating Stripe configuration:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get tenant Stripe configuration (without exposing secrets)
router.get('/stripe/config', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const result = await query(`
      SELECT 
        stripe_secret_key IS NOT NULL as has_stripe_secret_key,
        stripe_webhook_secret IS NOT NULL as has_stripe_webhook_secret,
        stripe_connect_account_id,
        stripe_connect_onboarding_completed
      FROM tenants
      WHERE id = $1
    `, [tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[testing] Error fetching Stripe configuration:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Stripe publishable key for a tenant
router.get('/stripe/publishable-key', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const tenantResult = await query(`
      SELECT stripe_secret_key
      FROM tenants
      WHERE id = $1
    `, [tenantId]);

    const stripeSecretKey = tenantResult.rows[0]?.stripe_secret_key || process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return res.status(404).json({
        success: false,
        error: 'Stripe is not configured for this tenant'
      });
    }

    // Convert secret key to publishable key format
    // sk_test_... -> pk_test_... or sk_live_... -> pk_live_...
    const publishableKey = stripeSecretKey.replace(/^sk_(test|live)_/, 'pk_$1_');
    
    res.json({
      success: true,
      data: {
        publishable_key: publishableKey
      }
    });
  } catch (error) {
    console.error('[testing] Error getting Stripe publishable key:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initiate Stripe Connect onboarding
router.post('/stripe/connect', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant-specific Stripe instance
    const stripe = await getTenantStripe(tenantId);
    if (!stripe) {
      return res.status(500).json({ 
        success: false, 
        error: 'Stripe is not configured for this tenant. Please set stripe_secret_key in tenant settings or STRIPE_SECRET_KEY environment variable.' 
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Check if tenant already has a Stripe account
    const tenantResult = await query(`
      SELECT stripe_connect_account_id, stripe_connect_onboarding_completed
      FROM tenants
      WHERE id = $1
    `, [tenantId]);

    let accountId = tenantResult.rows[0]?.stripe_connect_account_id;
    let onboardingCompleted = tenantResult.rows[0]?.stripe_connect_onboarding_completed || false;

    // If account exists, verify its actual status in Stripe
    if (accountId && stripe) {
      try {
        const account = await stripe.accounts.retrieve(accountId);
        const isActuallyReady = account.details_submitted && account.charges_enabled;
        
        // Update DB to match Stripe's actual status
        if (isActuallyReady !== onboardingCompleted) {
          await query(`
            UPDATE tenants 
            SET stripe_connect_onboarding_completed = $1
            WHERE id = $2
          `, [isActuallyReady, tenantId]);
          onboardingCompleted = isActuallyReady;
        }

        // If already completed, return success
        if (onboardingCompleted) {
          return res.json({
            success: true,
            data: {
              accountId,
              onboardingCompleted: true,
              message: 'Stripe account is already connected'
            }
          });
        }
      } catch (stripeError) {
        // If account doesn't exist in Stripe, clear it from DB
        if (stripeError.code === 'resource_missing') {
          await query(`
            UPDATE tenants 
            SET stripe_connect_account_id = NULL,
                stripe_connect_onboarding_completed = false
            WHERE id = $1
          `, [tenantId]);
          accountId = null;
        } else {
          throw stripeError;
        }
      }
    }

    // Create new account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Make this configurable
        email: req.user?.email,
      });

      accountId = account.id;

      // Save account ID to tenant
      await query(`
        UPDATE tenants 
        SET stripe_connect_account_id = $1,
            stripe_connect_onboarding_completed = false
        WHERE id = $2
      `, [accountId, tenantId]);
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${frontendUrl}/admin?tab=shop-settings&stripe=refresh`,
      return_url: `${frontendUrl}/admin?tab=shop-settings&stripe=success`,
      type: 'account_onboarding',
    });

    res.json({
      success: true,
      data: {
        url: accountLink.url,
        accountId: accountId,
        onboardingCompleted: false
      }
    });
  } catch (error) {
    console.error('[testing] Error creating Stripe Connect:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Check Stripe Connect status
router.get('/stripe/status', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const result = await query(`
      SELECT 
        stripe_connect_account_id,
        stripe_connect_onboarding_completed
      FROM tenants
      WHERE id = $1
    `, [tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tenant not found' 
      });
    }

    const tenant = result.rows[0];
    let accountDetails = null;
    let onboardingCompleted = tenant.stripe_connect_onboarding_completed || false;

    // Get tenant-specific Stripe instance
    const stripe = await getTenantStripe(tenantId);

    // If account exists, fetch details from Stripe and verify actual status
    if (tenant.stripe_connect_account_id && stripe) {
      try {
        const account = await stripe.accounts.retrieve(tenant.stripe_connect_account_id);
        accountDetails = {
          id: account.id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          email: account.email,
          country: account.country,
        };

        // 🔥 KEY FIX: Check Stripe's actual status and update database if needed
        // Account is ready if details are submitted AND charges are enabled
        const isActuallyReady = account.details_submitted && account.charges_enabled;
        
        // If Stripe says it's ready but our DB says it's not, update the DB
        if (isActuallyReady && !onboardingCompleted) {
          await query(`
            UPDATE tenants 
            SET stripe_connect_onboarding_completed = true
            WHERE id = $1
          `, [tenantId]);
          onboardingCompleted = true;
          console.log(`[testing] Updated onboarding status for tenant ${tenantId} based on Stripe account status`);
        }
        
        // If Stripe says it's NOT ready but our DB says it is, update the DB
        if (!isActuallyReady && onboardingCompleted) {
          await query(`
            UPDATE tenants 
            SET stripe_connect_onboarding_completed = false
            WHERE id = $1
          `, [tenantId]);
          onboardingCompleted = false;
          console.log(`[testing] Reset onboarding status for tenant ${tenantId} - account not ready in Stripe`);
        }
      } catch (stripeError) {
        console.error('[testing] Error fetching Stripe account:', stripeError);
        // If account doesn't exist in Stripe, reset our DB
        if (stripeError.code === 'resource_missing') {
          await query(`
            UPDATE tenants 
            SET stripe_connect_account_id = NULL,
                stripe_connect_onboarding_completed = false
            WHERE id = $1
          `, [tenantId]);
          onboardingCompleted = false;
        }
      }
    }

    res.json({
      success: true,
      data: {
        accountId: tenant.stripe_connect_account_id,
        onboardingCompleted,
        accountDetails
      }
    });
  } catch (error) {
    console.error('[testing] Error checking Stripe status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Webhook to handle Stripe Connect onboarding completion
router.post('/stripe/webhook', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    // Try to identify tenant from webhook event (before verification)
    // We'll need to verify with each tenant's webhook secret
    let event = null;
    let verifiedTenantId = null;

    // First, try to parse the event to get account ID
    let accountId = null;
    try {
      // Try with global webhook secret first (backward compatibility)
      const globalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (globalWebhookSecret) {
        const globalStripe = process.env.STRIPE_SECRET_KEY 
          ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
          : null;
        if (globalStripe) {
          try {
            event = globalStripe.webhooks.constructEvent(req.body, sig, globalWebhookSecret);
            if (event?.data?.object?.id) {
              accountId = event.data.object.id;
            }
          } catch (err) {
            // Not for global account, continue to try tenant-specific
          }
        }
      }
    } catch (err) {
      // Continue to try tenant-specific verification
    }

    // If we have an account ID, find the tenant
    if (accountId && !event) {
      const tenantResult = await query(`
        SELECT id, stripe_webhook_secret
        FROM tenants
        WHERE stripe_connect_account_id = $1
      `, [accountId]);

      if (tenantResult.rows.length > 0) {
        const tenant = tenantResult.rows[0];
        verifiedTenantId = tenant.id;
        const tenantStripe = await getTenantStripe(tenant.id);
        const tenantWebhookSecret = await getTenantWebhookSecret(tenant.id);

        if (tenantStripe && tenantWebhookSecret) {
          try {
            event = tenantStripe.webhooks.constructEvent(req.body, sig, tenantWebhookSecret);
          } catch (err) {
            console.error(`[testing] Webhook signature verification failed for tenant ${tenant.id}:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
          }
        }
      }
    }

    // If still no event, try global fallback
    if (!event) {
      const globalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!globalWebhookSecret) {
        console.warn('[testing] No webhook secret configured, skipping webhook verification');
        return res.json({ received: true });
      }

      const globalStripe = process.env.STRIPE_SECRET_KEY 
        ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
        : null;

      if (!globalStripe) {
        return res.status(500).json({ 
          success: false, 
          error: 'Stripe is not configured' 
        });
      }

      try {
        event = globalStripe.webhooks.constructEvent(req.body, sig, globalWebhookSecret);
      } catch (err) {
        console.error('[testing] Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    // Handle account.updated event (onboarding completion)
    if (event && event.type === 'account.updated') {
      const account = event.data.object;
      
      // Find tenant by account ID if not already found
      if (!verifiedTenantId && account.id) {
        const tenantResult = await query(`
          SELECT id
          FROM tenants
          WHERE stripe_connect_account_id = $1
        `, [account.id]);
        
        if (tenantResult.rows.length > 0) {
          verifiedTenantId = tenantResult.rows[0].id;
        }
      }
      
      // Update tenant's onboarding status
      if (verifiedTenantId) {
        await query(`
          UPDATE tenants 
          SET stripe_connect_onboarding_completed = $1
          WHERE id = $2
        `, [account.details_submitted && account.charges_enabled, verifiedTenantId]);
      } else if (account.id) {
        // Fallback: update by account ID
        await query(`
          UPDATE tenants 
          SET stripe_connect_onboarding_completed = $1
          WHERE stripe_connect_account_id = $2
        `, [account.details_submitted && account.charges_enabled, account.id]);
      }
    }

    // Handle payment_intent.succeeded event (payment confirmation)
    if (event && event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      
      // Find order by payment intent ID (stored in ref field or stripe_payment_intent_id column)
      const orderResult = await query(`
        SELECT id, tenant_id
        FROM orders
        WHERE ref = $1 OR stripe_payment_intent_id = $1
      `, [paymentIntentId]);

      if (orderResult.rows.length > 0) {
        const order = orderResult.rows[0];
        // Update order status to 'paid'
        await query(`
          UPDATE orders
          SET status = 'paid'
          WHERE id = $1
        `, [order.id]);
        
        console.log(`[testing] Updated order ${order.id} status to 'paid' after successful payment intent ${paymentIntentId}`);
      } else {
        console.warn(`[testing] Could not find order for payment intent ${paymentIntentId}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[testing] Error processing Stripe webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== CLIENTS ROUTES =====

// Get all clients (unique customers from orders)
router.get('/clients', authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user.tenant_id;
    
    // Check e-shop provider setting
    const eshopProvider = await getEshopProvider(tenantId);

    if (eshopProvider === 'woocommerce') {
      // Fetch customers from WooCommerce API
      try {
        const client = await createWooCommerceClient(tenantId, query);
        const wcCustomers = await client.getCustomers(1, 100, {
          orderby: 'registered_date',
          order: 'desc'
        });

        const customers = wcCustomers.map((wcCustomer) => ({
          id: `wc-${wcCustomer.id}`,
          email: wcCustomer.email || null,
          first_name: wcCustomer.first_name || null,
          last_name: wcCustomer.last_name || null,
          phone: wcCustomer.billing?.phone || null,
          company: wcCustomer.billing?.company || null,
          address: wcCustomer.billing ? {
            address_1: wcCustomer.billing.address_1 || null,
            address_2: wcCustomer.billing.address_2 || null,
            city: wcCustomer.billing.city || null,
            state: wcCustomer.billing.state || null,
            postcode: wcCustomer.billing.postcode || null,
            country: wcCustomer.billing.country || null,
          } : null,
          orders_count: wcCustomer.orders_count || 0,
          total_spent: parseFloat(wcCustomer.total_spent || 0),
          date_created: wcCustomer.date_created || null,
          external_id: String(wcCustomer.id),
          external_source: 'woocommerce'
        }));

        return res.json(customers);
      } catch (wcError) {
        console.error('[testing] Error fetching WooCommerce customers:', wcError);
        // Fallback to database if WooCommerce fails
      }
    }

    // Get unique customers from orders table
    const result = await query(`
      SELECT DISTINCT ON (COALESCE(customer_email, ''))
        customer_email as email,
        customer_first_name as first_name,
        customer_last_name as last_name,
        billing_address->>'phone' as phone,
        billing_address->>'company' as company,
        billing_address as address,
        COUNT(*) OVER (PARTITION BY COALESCE(customer_email, '')) as orders_count,
        SUM(total_amount) OVER (PARTITION BY COALESCE(customer_email, '')) as total_spent,
        MIN(created_at) OVER (PARTITION BY COALESCE(customer_email, '')) as date_created
      FROM orders
      WHERE tenant_id = $1 
        AND customer_email IS NOT NULL 
        AND customer_email != ''
      ORDER BY COALESCE(customer_email, ''), created_at DESC
    `, [tenantId]);

    const clients = result.rows.map((row) => ({
      id: `sparti-${row.email}`,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone || null,
      company: row.company || null,
      address: row.address || null,
      orders_count: parseInt(row.orders_count || 0),
      total_spent: parseFloat(row.total_spent || 0),
      date_created: row.date_created,
      external_source: 'sparti'
    }));

    res.json(clients);
  } catch (error) {
    console.error('[testing] Error getting clients:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;

