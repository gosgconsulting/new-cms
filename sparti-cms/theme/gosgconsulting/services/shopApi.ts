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
    console.log('[testing] getProductBySlug called with:', { slug, tenantId });
    const response = await api.get(`/api/shop/products/slug/${encodeURIComponent(slug)}`, { tenantId });
    console.log('[testing] API response status:', response.status, response.ok);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[testing] Product not found (404)');
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('[testing] API error response:', errorData);
      throw new Error(errorData.error || `Failed to fetch product: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    console.log('[testing] Product data received:', result);
    return result.data || null;
  } catch (error: any) {
    console.error('[testing] Error fetching product by slug:', error);
    throw error;
  }
}

/**
 * Get or create guest cart
 * @param tenantId - Tenant ID
 * @returns Promise resolving to cart with cart_id
 */
export async function getOrCreateGuestCart(tenantId: string = TENANT_ID) {
  try {
    const response = await api.get('/api/shop/cart/guest', { tenantId });
    if (!response.ok) {
      throw new Error('Failed to fetch guest cart');
    }
    const result = await response.json();
    return result.data || { id: null, user_id: null, items: [] };
  } catch (error) {
    console.error('[testing] Error fetching guest cart:', error);
    throw error;
  }
}

/**
 * Get cart by cart ID
 * @param cartId - Cart ID
 * @param tenantId - Tenant ID
 * @returns Promise resolving to cart
 */
export async function getCartById(cartId: number, tenantId: string = TENANT_ID) {
  try {
    const response = await api.get(`/api/shop/cart/${cartId}`, { tenantId });
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    const result = await response.json();
    return result.data || { id: cartId, user_id: null, items: [] };
  } catch (error) {
    console.error('[testing] Error fetching cart by ID:', error);
    throw error;
  }
}

/**
 * Associate guest cart with user (when guest logs in)
 * @param cartId - Cart ID
 * @param tenantId - Tenant ID
 * @returns Promise resolving to updated cart
 */
export async function associateCartWithUser(cartId: number, tenantId: string = TENANT_ID) {
  try {
    const response = await api.post(`/api/shop/cart/${cartId}/associate`, {}, { tenantId });
    if (!response.ok) {
      throw new Error('Failed to associate cart with user');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('[testing] Error associating cart with user:', error);
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
 * Add item to guest cart (by cart_id)
 * @param cartId - Cart ID
 * @param productId - Product ID
 * @param quantity - Quantity
 * @param tenantId - Tenant ID
 * @returns Promise resolving to cart item
 */
export async function addToGuestCart(
  cartId: number,
  productId: number,
  quantity: number,
  tenantId: string = TENANT_ID
) {
  try {
    const response = await api.post(
      `/api/shop/cart/guest/${cartId}`,
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
    console.error('[testing] Error adding to guest cart:', error);
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
 * Update guest cart item quantity
 * @param cartItemId - Cart item ID
 * @param quantity - New quantity
 * @param tenantId - Tenant ID
 * @returns Promise resolving to updated cart item
 */
export async function updateGuestCartItem(
  cartItemId: number,
  quantity: number,
  tenantId: string = TENANT_ID
) {
  try {
    const response = await api.put(
      `/api/shop/cart/guest/${cartItemId}`,
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
    console.error('[testing] Error updating guest cart item:', error);
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
 * Remove item from guest cart
 * @param cartItemId - Cart item ID
 * @param tenantId - Tenant ID
 * @returns Promise resolving to true if successful
 */
export async function removeFromGuestCart(cartItemId: number, tenantId: string = TENANT_ID) {
  try {
    const response = await api.delete(`/api/shop/cart/guest/${cartItemId}`, { tenantId });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to remove item from cart');
    }
    return true;
  } catch (error) {
    console.error('[testing] Error removing from guest cart:', error);
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
