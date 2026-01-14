/**
 * Shop API Service for gosgconsulting Theme
 * Handles all e-commerce API calls for PERN-Store
 */

import { api } from '../../../utils/api';

const TENANT_ID = 'tenant-gosg'; // Default tenant ID for gosgconsulting

/**
 * Get all products for the tenant
 */
export async function getProducts(tenantId: string = TENANT_ID) {
  try {
    const response = await api.get('/api/shop/products', { tenantId });
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[testing] Error fetching products:', error);
    throw error;
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string, tenantId: string = TENANT_ID) {
  try {
    const response = await api.get(`/api/shop/products/slug/${slug}`, { tenantId });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch product');
    }
    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('[testing] Error fetching product by slug:', error);
    throw error;
  }
}

/**
 * Get user's cart
 * Note: Requires user authentication
 */
export async function getCart(userId: number, tenantId: string = TENANT_ID) {
  try {
    const response = await api.get('/api/shop/cart', { tenantId });
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    const result = await response.json();
    return result.data || { id: null, user_id: userId, items: [] };
  } catch (error) {
    console.error('[testing] Error fetching cart:', error);
    throw error;
  }
}

/**
 * Add item to cart
 * Note: Requires user authentication
 */
export async function addToCart(
  userId: number,
  productId: number,
  quantity: number,
  tenantId: string = TENANT_ID
) {
  try {
    const response = await api.post(
      '/api/shop/cart',
      { product_id: productId, quantity },
      { tenantId }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add item to cart');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('[testing] Error adding to cart:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 * Note: Requires user authentication
 */
export async function updateCartItem(
  cartItemId: number,
  quantity: number,
  tenantId: string = TENANT_ID
) {
  try {
    const response = await api.put(
      `/api/shop/cart/${cartItemId}`,
      { quantity },
      { tenantId }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update cart item');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('[testing] Error updating cart item:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 * Note: Requires user authentication
 */
export async function removeFromCart(cartItemId: number, tenantId: string = TENANT_ID) {
  try {
    const response = await api.delete(`/api/shop/cart/${cartItemId}`, { tenantId });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to remove item from cart');
    }
    return true;
  } catch (error) {
    console.error('[testing] Error removing from cart:', error);
    throw error;
  }
}

/**
 * Create an order
 * Note: Requires user authentication
 */
export async function createOrder(orderData: {
  items: Array<{ product_id: number; quantity: number }>;
  amount?: number;
  total?: number;
  ref?: string;
  payment_method?: 'PAYSTACK' | 'STRIPE';
}, tenantId: string = TENANT_ID) {
  try {
    const response = await api.post('/api/shop/orders', orderData, { tenantId });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create order');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('[testing] Error creating order:', error);
    throw error;
  }
}

/**
 * Get product reviews
 */
export async function getReviews(productId: number, tenantId: string = TENANT_ID) {
  try {
    const response = await api.get(`/api/shop/products/${productId}/reviews`, { tenantId });
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[testing] Error fetching reviews:', error);
    throw error;
  }
}
