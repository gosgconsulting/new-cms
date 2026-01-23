/**
 * Ecommerce Database Module (PERN-Store Schema)
 * 
 * Provides CRUD operations for PERN-Store ecommerce tables:
 * - Products (pern_products)
 * - Cart (pern_cart, pern_cart_item)
 * - Orders (pern_orders, pern_order_item)
 * - Reviews (pern_reviews)
 * 
 * All functions include tenant_id isolation for multi-tenant support.
 */

import { query } from '../index.js';

// Helper function to handle table not found errors
function handleTableError(error) {
  if (error.code === '42P01' || error.message?.includes('does not exist')) {
    console.error('[testing] PERN-Store tables do not exist. Run migration: npm run sequelize:migrate');
    throw new Error('Ecommerce tables not found. Please run database migrations.');
  }
  throw error;
}

// ===== PRODUCTS =====

/**
 * Get all products for a tenant (from products table with variants and categories)
 * @param {string} tenantId - Tenant ID
 * @param {Object} filters - Optional filters (status, search)
 * @returns {Promise<Array>} Array of products with inventory and category data
 */
export async function getProductsWithDetails(tenantId, filters = {}) {
  try {
    let sql = `
      SELECT 
        p.id,
        p.name,
        p.handle as slug,
        p.status,
        p.featured_image as image_url,
        p.description,
        p.created_at,
        p.updated_at,
        COALESCE(SUM(pv.inventory_quantity), 0)::integer as inventory_total,
        COUNT(pv.id)::integer as variant_count,
        pc.name as category_name
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN product_category_relations pcr ON p.id = pcr.product_id
      LEFT JOIN product_categories pc ON pcr.category_id = pc.id
      WHERE p.tenant_id = $1
    `;
    const params = [tenantId];

    if (filters.status) {
      sql += ` AND p.status = $${params.length + 1}`;
      params.push(filters.status);
    }

    if (filters.search) {
      sql += ` AND (p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`;
      params.push(`%${filters.search}%`);
    }

    sql += ` GROUP BY p.id, p.name, p.handle, p.status, p.featured_image, p.description, p.created_at, p.updated_at, pc.name`;
    sql += ` ORDER BY p.created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('[testing] Error getting products with details:', error);
    return handleTableError(error);
  }
}

/**
 * Get all products for a tenant (legacy PERN-Store table)
 * @param {string} tenantId - Tenant ID
 * @param {Object} filters - Optional filters (status, search)
 * @returns {Promise<Array>} Array of products
 */
export async function getProducts(tenantId, filters = {}) {
  try {
    let sql = `
      SELECT product_id, name, slug, price, description, image_url, 
             created_at, updated_at
      FROM pern_products
      WHERE tenant_id = $1
    `;
    const params = [tenantId];

    if (filters.search) {
      sql += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
      params.push(`%${filters.search}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('[testing] Error getting products:', error);
    return handleTableError(error);
  }
}

/**
 * Get a single product by ID from products table
 * @param {number} productId - Product ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Product object or null
 */
export async function getProductFromProductsTable(productId, tenantId) {
  try {
    const result = await query(`
      SELECT 
        id as product_id,
        name,
        handle as slug,
        status,
        featured_image as image_url,
        description,
        created_at,
        updated_at,
        COALESCE(
          (SELECT MIN(pv.price) FROM product_variants pv WHERE pv.product_id = id),
          0
        ) as price
      FROM products
      WHERE id = $1 AND tenant_id = $2
    `, [productId, tenantId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error getting product from products table:', error);
    return handleTableError(error);
  }
}

/**
 * Get a single product by ID (legacy PERN-Store table)
 * @param {number} productId - Product ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Product object or null
 */
export async function getProduct(productId, tenantId) {
  try {
    const result = await query(`
      SELECT product_id, name, slug, price, description, image_url, 
             created_at, updated_at
      FROM pern_products
      WHERE product_id = $1 AND tenant_id = $2
    `, [productId, tenantId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error getting product:', error);
    return handleTableError(error);
  }
}

/**
 * Get a product by slug
 * @param {string} slug - Product slug
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Product object or null
 */
export async function getProductBySlug(slug, tenantId) {
  try {
    const result = await query(`
      SELECT product_id, name, slug, price, description, image_url, 
             created_at, updated_at
      FROM pern_products
      WHERE slug = $1 AND tenant_id = $2
    `, [slug, tenantId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error getting product by slug:', error);
    return handleTableError(error);
  }
}

/**
 * Create a new product
 * @param {Object} productData - Product data (name, slug, price, description, image_url)
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Created product
 */
export async function createProduct(productData, tenantId) {
  try {
    const { name, slug, price, description, image_url, is_subscription, subscription_frequency } = productData;

    // Check if subscription columns exist
    const hasSubscriptionColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pern_products' 
      AND column_name = 'is_subscription'
    `).then(result => result.rows.length > 0).catch(() => false);

    if (hasSubscriptionColumns) {
      const result = await query(`
        INSERT INTO pern_products (name, slug, price, description, image_url, tenant_id, is_subscription, subscription_frequency)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING product_id, name, slug, price, description, image_url, 
                  is_subscription, subscription_frequency, created_at, updated_at
      `, [name, slug, price, description || '', image_url || null, tenantId, is_subscription || false, subscription_frequency || null]);

      return result.rows[0];
    } else {
      // Fallback for older schema - check if description can be null
      const descriptionValue = description || '';
      const result = await query(`
        INSERT INTO pern_products (name, slug, price, description, image_url, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING product_id, name, slug, price, description, image_url, 
                  created_at, updated_at
      `, [name, slug, price, descriptionValue, image_url || null, tenantId]);

      return result.rows[0];
    }
  } catch (error) {
    console.error('[testing] Error creating product:', error);
    return handleTableError(error);
  }
}

/**
 * Update a product
 * @param {number} productId - Product ID
 * @param {Object} productData - Updated product data
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Updated product or null
 */
export async function updateProduct(productId, productData, tenantId) {
  try {
    const { name, slug, price, description, image_url } = productData;
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramIndex++}`);
      params.push(slug);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      params.push(price);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      params.push(image_url);
    }

    if (updates.length === 0) {
      return await getProduct(productId, tenantId);
    }

    params.push(productId, tenantId);
    const result = await query(`
      UPDATE pern_products
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE product_id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING product_id, name, slug, price, description, image_url, 
                created_at, updated_at
    `, params);

    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error updating product:', error);
    return handleTableError(error);
  }
}

/**
 * Delete a product
 * @param {number} productId - Product ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteProduct(productId, tenantId) {
  try {
    const result = await query(`
      DELETE FROM pern_products
      WHERE product_id = $1 AND tenant_id = $2
    `, [productId, tenantId]);

    return result.rowCount > 0;
  } catch (error) {
    console.error('[testing] Error deleting product:', error);
    return handleTableError(error);
  }
}

// ===== CART =====

/**
 * Get cart by cart ID
 * @param {number} cartId - Cart ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Cart with items or null
 */
export async function getCartById(cartId, tenantId) {
  try {
    // Get cart
    const cartResult = await query(`
      SELECT id, user_id FROM pern_cart
      WHERE id = $1 AND tenant_id = $2
      LIMIT 1
    `, [cartId, tenantId]);

    if (cartResult.rows.length === 0) {
      return null;
    }

    const cart = cartResult.rows[0];

    // Get cart items with product details
    const itemsResult = await query(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.name as product_name,
        p.slug as product_slug,
        p.price,
        p.image_url
      FROM pern_cart_item ci
      JOIN pern_products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = $1 AND ci.tenant_id = $2
      ORDER BY ci.created_at DESC
    `, [cartId, tenantId]);

    return {
      id: cart.id,
      user_id: cart.user_id,
      items: itemsResult.rows
    };
  } catch (error) {
    console.error('[testing] Error getting cart by ID:', error);
    return handleTableError(error);
  }
}

/**
 * Get or create guest cart (user_id = null)
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Cart with items
 */
export async function getOrCreateGuestCart(tenantId) {
  try {
    // Try to get existing guest cart (user_id is null)
    let cartResult = await query(`
      SELECT id FROM pern_cart
      WHERE user_id IS NULL AND tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [tenantId]);

    let cartId;
    if (cartResult.rows.length === 0) {
      // Create new guest cart
      const newCart = await query(`
        INSERT INTO pern_cart (user_id, tenant_id)
        VALUES (NULL, $1)
        RETURNING id
      `, [tenantId]);
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    // Get cart items with product details
    const itemsResult = await query(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.name as product_name,
        p.slug as product_slug,
        p.price,
        p.image_url
      FROM pern_cart_item ci
      JOIN pern_products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = $1 AND ci.tenant_id = $2
      ORDER BY ci.created_at DESC
    `, [cartId, tenantId]);

    return {
      id: cartId,
      user_id: null,
      items: itemsResult.rows
    };
  } catch (error) {
    console.error('[testing] Error getting/creating guest cart:', error);
    return handleTableError(error);
  }
}

/**
 * Associate cart with user (when guest logs in)
 * @param {number} cartId - Cart ID
 * @param {number} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Updated cart or null
 */
export async function associateCartWithUser(cartId, userId, tenantId) {
  try {
    const result = await query(`
      UPDATE pern_cart
      SET user_id = $1
      WHERE id = $2 AND tenant_id = $3 AND user_id IS NULL
      RETURNING id, user_id
    `, [userId, cartId, tenantId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error associating cart with user:', error);
    return handleTableError(error);
  }
}

/**
 * Get user's cart
 * @param {number} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Cart with items or null
 */
export async function getCart(userId, tenantId) {
  try {
    // Get or create cart
    let cartResult = await query(`
      SELECT id FROM pern_cart
      WHERE user_id = $1 AND tenant_id = $2
      LIMIT 1
    `, [userId, tenantId]);

    let cartId;
    if (cartResult.rows.length === 0) {
      // Create cart
      const newCart = await query(`
        INSERT INTO pern_cart (user_id, tenant_id)
        VALUES ($1, $2)
        RETURNING id
      `, [userId, tenantId]);
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    // Get cart items with product details
    const itemsResult = await query(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.name as product_name,
        p.slug as product_slug,
        p.price,
        p.image_url
      FROM pern_cart_item ci
      JOIN pern_products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = $1 AND ci.tenant_id = $2
      ORDER BY ci.created_at DESC
    `, [cartId, tenantId]);

    return {
      id: cartId,
      user_id: userId,
      items: itemsResult.rows
    };
  } catch (error) {
    console.error('[testing] Error getting cart:', error);
    return handleTableError(error);
  }
}

/**
 * Add item to cart by cart ID (for guest carts)
 * @param {number} cartId - Cart ID
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Cart item
 */
export async function addToCartById(cartId, productId, quantity, tenantId) {
  try {
    // Verify cart exists
    const cartCheck = await query(`
      SELECT id FROM pern_cart
      WHERE id = $1 AND tenant_id = $2
    `, [cartId, tenantId]);

    if (cartCheck.rows.length === 0) {
      throw new Error('Cart not found');
    }

    // Check if item already exists in cart
    const existing = await query(`
      SELECT id, quantity FROM pern_cart_item
      WHERE cart_id = $1 AND product_id = $2 AND tenant_id = $3
    `, [cartId, productId, tenantId]);

    if (existing.rows.length > 0) {
      // Update quantity
      const result = await query(`
        UPDATE pern_cart_item
        SET quantity = quantity + $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
        RETURNING id, cart_id, product_id, quantity
      `, [quantity, existing.rows[0].id, tenantId]);
      return result.rows[0];
    } else {
      // Add new item
      const result = await query(`
        INSERT INTO pern_cart_item (cart_id, product_id, quantity, tenant_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, cart_id, product_id, quantity
      `, [cartId, productId, quantity, tenantId]);
      return result.rows[0];
    }
  } catch (error) {
    console.error('[testing] Error adding to cart by ID:', error);
    return handleTableError(error);
  }
}

/**
 * Add item to cart
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Cart item
 */
export async function addToCart(userId, productId, quantity, tenantId) {
  try {
    // Get or create cart
    const cart = await getCart(userId, tenantId);
    const cartId = cart.id;

    // Check if item already exists in cart
    const existing = await query(`
      SELECT id, quantity FROM pern_cart_item
      WHERE cart_id = $1 AND product_id = $2 AND tenant_id = $3
    `, [cartId, productId, tenantId]);

    if (existing.rows.length > 0) {
      // Update quantity
      const result = await query(`
        UPDATE pern_cart_item
        SET quantity = quantity + $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
        RETURNING id, cart_id, product_id, quantity
      `, [quantity, existing.rows[0].id, tenantId]);
      return result.rows[0];
    } else {
      // Add new item
      const result = await query(`
        INSERT INTO pern_cart_item (cart_id, product_id, quantity, tenant_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, cart_id, product_id, quantity
      `, [cartId, productId, quantity, tenantId]);
      return result.rows[0];
    }
  } catch (error) {
    console.error('[testing] Error adding to cart:', error);
    return handleTableError(error);
  }
}

/**
 * Update cart item quantity
 * @param {number} cartItemId - Cart item ID
 * @param {number} quantity - New quantity
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Updated cart item or null
 */
export async function updateCartItem(cartItemId, quantity, tenantId) {
  try {
    if (quantity <= 0) {
      return await removeFromCart(cartItemId, tenantId);
    }

    const result = await query(`
      UPDATE pern_cart_item
      SET quantity = $1, updated_at = NOW()
      WHERE id = $2 AND tenant_id = $3
      RETURNING id, cart_id, product_id, quantity
    `, [quantity, cartItemId, tenantId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error updating cart item:', error);
    return handleTableError(error);
  }
}

/**
 * Remove item from cart
 * @param {number} cartItemId - Cart item ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} True if removed
 */
export async function removeFromCart(cartItemId, tenantId) {
  try {
    const result = await query(`
      DELETE FROM pern_cart_item
      WHERE id = $1 AND tenant_id = $2
    `, [cartItemId, tenantId]);

    return result.rowCount > 0;
  } catch (error) {
    console.error('[testing] Error removing from cart:', error);
    return handleTableError(error);
  }
}

// ===== ORDERS =====

/**
 * Get all orders for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {Object} filters - Optional filters (status, userId, dateRange)
 * @returns {Promise<Array>} Array of orders
 */
export async function getOrders(tenantId, filters = {}) {
  try {
    let sql = `
      SELECT 
        o.order_id,
        o.user_id,
        o.status,
        o.date,
        o.amount,
        o.total,
        o.ref,
        o.payment_method,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
      FROM pern_orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.tenant_id = $1
    `;
    const params = [tenantId];

    if (filters.status) {
      sql += ` AND o.status = $${params.length + 1}`;
      params.push(filters.status);
    }

    if (filters.userId) {
      sql += ` AND o.user_id = $${params.length + 1}`;
      params.push(filters.userId);
    }

    if (filters.dateFrom) {
      sql += ` AND o.date >= $${params.length + 1}`;
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      sql += ` AND o.date <= $${params.length + 1}`;
      params.push(filters.dateTo);
    }

    sql += ` ORDER BY o.date DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('[testing] Error getting orders:', error);
    return handleTableError(error);
  }
}

/**
 * Get a single order by ID
 * @param {number} orderId - Order ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Order with items or null
 */
export async function getOrder(orderId, tenantId) {
  try {
    // Get order
    const orderResult = await query(`
      SELECT 
        o.order_id,
        o.user_id,
        o.status,
        o.date,
        o.amount,
        o.total,
        o.ref,
        o.payment_method,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
      FROM pern_orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.order_id = $1 AND o.tenant_id = $2
    `, [orderId, tenantId]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(`
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        p.name as product_name,
        p.slug as product_slug,
        p.price
      FROM pern_order_item oi
      JOIN pern_products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1 AND oi.tenant_id = $2
    `, [orderId, tenantId]);

    return {
      ...order,
      items: itemsResult.rows
    };
  } catch (error) {
    console.error('[testing] Error getting order:', error);
    return handleTableError(error);
  }
}

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Created order
 */
export async function createOrder(orderData, tenantId) {
  try {
    const {
      user_id,
      status = 'pending',
      amount,
      total,
      ref,
      payment_method,
      items
    } = orderData;

    // Start transaction
    await query('BEGIN');

    try {
      // Create order
      const orderResult = await query(`
        INSERT INTO pern_orders (user_id, status, amount, total, ref, payment_method, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING order_id, user_id, status, date, amount, total, ref, payment_method
      `, [user_id, status, amount, total, ref, payment_method, tenantId]);

      const order = orderResult.rows[0];
      const orderId = order.order_id;

      // Create order items
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await query(`
            INSERT INTO pern_order_item (order_id, product_id, quantity, tenant_id)
            VALUES ($1, $2, $3, $4)
          `, [orderId, item.product_id, item.quantity, tenantId]);
        }
      }

      await query('COMMIT');

      // Return order with items
      return await getOrder(orderId, tenantId);
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('[testing] Error creating order:', error);
    return handleTableError(error);
  }
}

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Updated order or null
 */
export async function updateOrderStatus(orderId, status, tenantId) {
  try {
    const result = await query(`
      UPDATE pern_orders
      SET status = $1, updated_at = NOW()
      WHERE order_id = $2 AND tenant_id = $3
      RETURNING order_id, user_id, status, date, amount, total, ref, payment_method
    `, [status, orderId, tenantId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error updating order status:', error);
    return handleTableError(error);
  }
}

// ===== REVIEWS =====

/**
 * Get reviews for a product
 * @param {number} productId - Product ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} Array of reviews
 */
export async function getReviews(productId, tenantId) {
  try {
    const result = await query(`
      SELECT 
        r.id,
        r.product_id,
        r.user_id,
        r.content,
        r.rating,
        r.date,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
      FROM pern_reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.tenant_id = $2
      ORDER BY r.date DESC
    `, [productId, tenantId]);

    return result.rows;
  } catch (error) {
    console.error('[testing] Error getting reviews:', error);
    return handleTableError(error);
  }
}

/**
 * Create a review
 * @param {Object} reviewData - Review data (product_id, user_id, content, rating)
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Created review
 */
export async function createReview(reviewData, tenantId) {
  try {
    const { product_id, user_id, content, rating } = reviewData;

    // Check if user already reviewed this product
    const existing = await query(`
      SELECT id FROM pern_reviews
      WHERE product_id = $1 AND user_id = $2 AND tenant_id = $3
    `, [product_id, user_id, tenantId]);

    if (existing.rows.length > 0) {
      throw new Error('User has already reviewed this product');
    }

    const result = await query(`
      INSERT INTO pern_reviews (product_id, user_id, content, rating, tenant_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, product_id, user_id, content, rating, date
    `, [product_id, user_id, content, rating, tenantId]);

    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating review:', error);
    if (error.message === 'User has already reviewed this product') {
      throw error;
    }
    return handleTableError(error);
  }
}

/**
 * Delete a review
 * @param {number} reviewId - Review ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteReview(reviewId, tenantId) {
  try {
    const result = await query(`
      DELETE FROM pern_reviews
      WHERE id = $1 AND tenant_id = $2
    `, [reviewId, tenantId]);

    return result.rowCount > 0;
  } catch (error) {
    console.error('[testing] Error deleting review:', error);
    return handleTableError(error);
  }
}
