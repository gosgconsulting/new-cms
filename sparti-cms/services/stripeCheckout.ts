/**
 * Shared Stripe Checkout Service
 * Provides reusable functions for Stripe payment integration across all themes
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { api } from '../utils/api';

let stripeInstance: Promise<Stripe | null> | null = null;

/**
 * Initialize Stripe with a publishable key
 * @param publishableKey - Stripe publishable key (pk_test_... or pk_live_...)
 * @returns Promise resolving to Stripe instance or null if initialization fails
 */
export async function initializeStripe(publishableKey: string): Promise<Stripe | null> {
  if (!publishableKey) {
    console.error('[testing] Stripe publishable key is required');
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = loadStripe(publishableKey);
  }

  return stripeInstance;
}

/**
 * Get Stripe publishable key for a tenant
 * @param tenantId - Tenant ID
 * @returns Promise resolving to publishable key string or null if not configured
 */
export async function getStripePublishableKey(tenantId: string): Promise<string | null> {
  try {
    const response = await api.get('/api/shop/stripe/publishable-key', { tenantId });
    if (!response.ok) {
      throw new Error('Failed to fetch Stripe publishable key');
    }
    const result = await response.json();
    return result.data?.publishable_key || null;
  } catch (error) {
    console.error('[testing] Error fetching Stripe publishable key:', error);
    return null;
  }
}

/**
 * Create an order with Stripe payment intent
 * @param orderData - Order data including items, amount, total, and payment method
 * @param tenantId - Tenant ID
 * @returns Promise resolving to order data with client_secret and payment_intent_id
 */
export async function createOrderWithPayment(
  orderData: {
    items: Array<{ product_id: number; quantity: number }>;
    amount: number;
    total: number;
    payment_method: 'STRIPE';
    ref?: string;
  },
  tenantId: string
): Promise<{
  order: any;
  clientSecret: string | null;
  paymentIntentId: string | null;
}> {
  try {
    const response = await api.post('/api/shop/orders', orderData, { tenantId });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create order');
    }
    const result = await response.json();
    return {
      order: result.data,
      clientSecret: result.data.stripe_client_secret || null,
      paymentIntentId: result.data.stripe_payment_intent_id || null,
    };
  } catch (error: any) {
    console.error('[testing] Error creating order with payment:', error);
    throw error;
  }
}
