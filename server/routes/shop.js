import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { authenticateTenantApiKey } from '../middleware/tenantApiKey.js';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe (will be undefined if STRIPE_SECRET_KEY is not set)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

// Helper function to generate order number
function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// ===== PRODUCTS ROUTES =====

// Get all products
router.get('/products', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status, search } = req.query;

    let queryText = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pv.id,
              'title', pv.title,
              'price', pv.price,
              'compare_at_price', pv.compare_at_price,
              'sku', pv.sku,
              'inventory_quantity', pv.inventory_quantity,
              'inventory_management', pv.inventory_management
            )
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'::json
        ) as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.tenant_id = $1
    `;

    const params = [tenantId];
    let paramIndex = 2;

    if (status) {
      queryText += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const result = await query(queryText, params);

    res.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('[testing] Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get single product
router.get('/products/:id', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = req.params.id;

    const productResult = await query(`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pv.id,
              'title', pv.title,
              'price', pv.price,
              'compare_at_price', pv.compare_at_price,
              'sku', pv.sku,
              'inventory_quantity', pv.inventory_quantity,
              'inventory_management', pv.inventory_management
            )
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'::json
        ) as variants,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pc.id,
              'name', pc.name,
              'slug', pc.slug
            )
          ) FILTER (WHERE pc.id IS NOT NULL),
          '[]'::json
        ) as categories
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN product_category_relations pcr ON p.id = pcr.product_id
      LEFT JOIN product_categories pc ON pcr.category_id = pc.id
      WHERE p.id = $1 AND p.tenant_id = $2
      GROUP BY p.id
    `, [productId, tenantId]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      data: productResult.rows[0] 
    });
  } catch (error) {
    console.error('[testing] Error fetching product:', error);
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
    const { name, description, handle, status, featured_image, variants, category_ids } = req.body;

    if (!name || !handle) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and handle are required' 
      });
    }

    // Start transaction
    const client = await query('BEGIN');
    
    try {
      // Create product
      const productResult = await query(`
        INSERT INTO products (name, description, handle, status, featured_image, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [name, description || null, handle, status || 'draft', featured_image || null, tenantId]);

      const product = productResult.rows[0];

      // Create variants if provided
      if (variants && Array.isArray(variants)) {
        for (const variant of variants) {
          await query(`
            INSERT INTO product_variants 
            (product_id, sku, title, price, compare_at_price, inventory_quantity, inventory_management, tenant_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            product.id,
            variant.sku || null,
            variant.title || 'Default',
            variant.price || 0,
            variant.compare_at_price || null,
            variant.inventory_quantity || 0,
            variant.inventory_management !== false,
            tenantId
          ]);
        }
      }

      // Link categories if provided
      if (category_ids && Array.isArray(category_ids)) {
        for (const categoryId of category_ids) {
          await query(`
            INSERT INTO product_category_relations (product_id, category_id)
            VALUES ($1, $2)
            ON CONFLICT (product_id, category_id) DO NOTHING
          `, [product.id, categoryId]);
        }
      }

      await query('COMMIT');

      // Fetch complete product with relations
      const completeProduct = await query(`
        SELECT 
          p.*,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'id', pv.id,
              'title', pv.title,
              'price', pv.price,
              'sku', pv.sku,
              'inventory_quantity', pv.inventory_quantity
            )) FILTER (WHERE pv.id IS NOT NULL),
            '[]'::json
          ) as variants
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [product.id]);

      res.json({ 
        success: true, 
        data: completeProduct.rows[0] 
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('[testing] Error creating product:', error);
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
    const productId = req.params.id;
    const { name, description, handle, status, featured_image } = req.body;

    const result = await query(`
      UPDATE products 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          handle = COALESCE($3, handle),
          status = COALESCE($4, status),
          featured_image = COALESCE($5, featured_image)
      WHERE id = $6 AND tenant_id = $7
      RETURNING *
    `, [name, description, handle, status, featured_image, productId, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('[testing] Error updating product:', error);
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
    const productId = req.params.id;

    const result = await query(`
      DELETE FROM products 
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
    `, [productId, tenantId]);

    if (result.rows.length === 0) {
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

// ===== CATEGORIES ROUTES =====

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

// ===== ORDERS ROUTES =====

// Get all orders
router.get('/orders', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.tenant_id = $1
    `;

    const params = [tenantId];
    let paramIndex = 2;

    if (status) {
      queryText += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    queryText += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({ 
      success: true, 
      data: result.rows 
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
    const orderId = req.params.id;

    const orderResult = await query(`
      SELECT * FROM orders
      WHERE id = $1 AND tenant_id = $2
    `, [orderId, tenantId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    const order = orderResult.rows[0];

    const itemsResult = await query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.handle as product_handle,
        pv.title as variant_title
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE oi.order_id = $1
    `, [orderId]);

    order.items = itemsResult.rows;

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
router.post('/orders', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      customer_email,
      customer_first_name,
      customer_last_name,
      items,
      shipping_address,
      billing_address,
      subtotal,
      tax_amount,
      shipping_amount,
      total_amount
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order must have at least one item' 
      });
    }

    const orderNumber = generateOrderNumber();

    // Start transaction
    await query('BEGIN');

    try {
      const orderResult = await query(`
        INSERT INTO orders (
          order_number, customer_email, customer_first_name, customer_last_name,
          subtotal, tax_amount, shipping_amount, total_amount,
          shipping_address, billing_address, tenant_id, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
        RETURNING *
      `, [
        orderNumber,
        customer_email || null,
        customer_first_name || null,
        customer_last_name || null,
        subtotal || 0,
        tax_amount || 0,
        shipping_amount || 0,
        total_amount || 0,
        shipping_address ? JSON.stringify(shipping_address) : null,
        billing_address ? JSON.stringify(billing_address) : null,
        tenantId
      ]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of items) {
        await query(`
          INSERT INTO order_items 
          (order_id, product_id, variant_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          order.id,
          item.product_id,
          item.variant_id || null,
          item.quantity,
          item.unit_price,
          item.total_price
        ]);
      }

      await query('COMMIT');

      res.json({ 
        success: true, 
        data: order 
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
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
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status is required' 
      });
    }

    const result = await query(`
      UPDATE orders 
      SET status = $1
      WHERE id = $2 AND tenant_id = $3
      RETURNING *
    `, [status, orderId, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('[testing] Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== STRIPE CONNECT ROUTES =====

// Initiate Stripe Connect onboarding
router.post('/stripe/connect', authenticateTenantApiKey, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        success: false, 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' 
      });
    }

    const tenantId = req.tenantId;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Check if tenant already has a Stripe account
    const tenantResult = await query(`
      SELECT stripe_connect_account_id, stripe_connect_onboarding_completed
      FROM tenants
      WHERE id = $1
    `, [tenantId]);

    let accountId = tenantResult.rows[0]?.stripe_connect_account_id;

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
        SET stripe_connect_account_id = $1 
        WHERE id = $2
      `, [accountId, tenantId]);
    }

    // Check if onboarding is already completed
    if (tenantResult.rows[0]?.stripe_connect_onboarding_completed) {
      return res.json({
        success: true,
        data: {
          accountId,
          onboardingCompleted: true,
          message: 'Stripe account is already connected'
        }
      });
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

    // If account exists, fetch details from Stripe
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
      } catch (stripeError) {
        console.error('[testing] Error fetching Stripe account:', stripeError);
      }
    }

    res.json({
      success: true,
      data: {
        accountId: tenant.stripe_connect_account_id,
        onboardingCompleted: tenant.stripe_connect_onboarding_completed,
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
    if (!stripe) {
      return res.status(500).json({ 
        success: false, 
        error: 'Stripe is not configured' 
      });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('[testing] STRIPE_WEBHOOK_SECRET not set, skipping webhook verification');
      return res.json({ received: true });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[testing] Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle account.updated event (onboarding completion)
    if (event.type === 'account.updated') {
      const account = event.data.object;
      
      // Update tenant's onboarding status
      await query(`
        UPDATE tenants 
        SET stripe_connect_onboarding_completed = $1
        WHERE stripe_connect_account_id = $2
      `, [account.details_submitted && account.charges_enabled, account.id]);
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

export default router;

