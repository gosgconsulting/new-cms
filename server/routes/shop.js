import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getCart,
  addToCart,
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

// ===== PRODUCTS ROUTES (PERN-Store Schema) =====

// Get all products
router.get('/products', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { search, limit } = req.query;

    const filters = {};
    if (search) filters.search = search;
    if (limit) filters.limit = parseInt(limit);

    const products = await getProducts(tenantId, filters);

    res.json({ 
      success: true, 
      data: products 
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

    const product = await getProduct(productId, tenantId);

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

// Create product
router.post('/products', authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, slug, price, description, image_url } = req.body;

    if (!name || !slug || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, slug, and price are required' 
      });
    }

    const product = await createProduct({
      name,
      slug,
      price: parseFloat(price),
      description: description || '',
      image_url: image_url || null
    }, tenantId);

    res.json({ 
      success: true, 
      data: product 
    });
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
    const { status, userId, dateFrom, dateTo, limit } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (userId) filters.userId = parseInt(userId);
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (limit) filters.limit = parseInt(limit);

    const orders = await getOrders(tenantId, filters);

    res.json({ 
      success: true, 
      data: orders 
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
    const userId = req.user.id;
    const {
      items,
      amount,
      total,
      ref,
      payment_method
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

    const order = await createOrder({
      user_id: userId,
      status: 'pending',
      amount: amount || null,
      total: total || null,
      ref: ref || null,
      payment_method: payment_method || null,
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity)
      }))
    }, tenantId);

    res.json({ 
      success: true, 
      data: order 
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

