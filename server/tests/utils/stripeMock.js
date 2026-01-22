/**
 * Stripe Mock Utilities
 * 
 * Reusable Stripe SDK mock helpers for testing
 */

import { vi } from 'vitest';

/**
 * Creates a mock Stripe account object
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Mock Stripe account
 */
export function mockAccount(overrides = {}) {
  return {
    id: 'acct_test123',
    object: 'account',
    charges_enabled: false,
    payouts_enabled: false,
    details_submitted: false,
    email: 'test@example.com',
    country: 'US',
    type: 'express',
    ...overrides,
  };
}

/**
 * Creates a mock Stripe account link object
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Mock Stripe account link
 */
export function mockAccountLink(overrides = {}) {
  return {
    object: 'account_link',
    created: Math.floor(Date.now() / 1000),
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    url: 'https://connect.stripe.com/setup/s/test123',
    ...overrides,
  };
}

/**
 * Creates a mock Stripe webhook event
 * @param {string} type - Event type (e.g., 'account.updated')
 * @param {Object} accountData - Account data for the event
 * @returns {Object} Mock Stripe webhook event
 */
export function mockWebhookEvent(type = 'account.updated', accountData = {}) {
  return {
    id: 'evt_test123',
    object: 'event',
    type,
    data: {
      object: mockAccount(accountData),
    },
    created: Math.floor(Date.now() / 1000),
  };
}

/**
 * Creates a mock Stripe SDK instance
 * @param {Object} options - Mock configuration
 * @returns {Object} Mocked Stripe instance
 */
export function createStripeMock(options = {}) {
  const {
    accountId = 'acct_test123',
    accountReady = false,
    accountExists = true,
    shouldThrow = false,
    throwOnRetrieve = false,
    throwOnCreate = false,
    throwOnAccountLink = false,
  } = options;

  const mockAccountInstance = mockAccount({
    id: accountId,
    charges_enabled: accountReady,
    payouts_enabled: accountReady,
    details_submitted: accountReady,
  });

  const mockStripe = {
    accounts: {
      create: vi.fn().mockImplementation(async (params) => {
        if (throwOnCreate) {
          throw new Error('Stripe API error: Failed to create account');
        }
        return mockAccount({
          id: accountId,
          type: params.type || 'express',
          country: params.country || 'US',
          email: params.email,
        });
      }),
      retrieve: vi.fn().mockImplementation(async (id) => {
        if (throwOnRetrieve) {
          const error = new Error('No such account');
          error.code = 'resource_missing';
          throw error;
        }
        if (!accountExists) {
          const error = new Error('No such account');
          error.code = 'resource_missing';
          throw error;
        }
        return mockAccountInstance;
      }),
    },
    accountLinks: {
      create: vi.fn().mockImplementation(async (params) => {
        if (throwOnAccountLink) {
          throw new Error('Stripe API error: Failed to create account link');
        }
        return mockAccountLink({
          account: params.account,
        });
      }),
    },
    webhooks: {
      constructEvent: vi.fn().mockImplementation((body, sig, secret) => {
        if (shouldThrow) {
          throw new Error('Invalid webhook signature');
        }
        return mockWebhookEvent('account.updated', mockAccountInstance);
      }),
    },
  };

  return mockStripe;
}

/**
 * Creates a Stripe error object
 * @param {string} code - Error code (e.g., 'resource_missing')
 * @param {string} message - Error message
 * @returns {Error} Stripe error
 */
export function createStripeError(code, message) {
  const error = new Error(message);
  error.code = code;
  error.type = 'StripeInvalidRequestError';
  return error;
}
