/**
 * Stripe Connect Routes Tests
 * 
 * Tests for Stripe Connect endpoints: connect, status, webhook
 */

import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { query } from '../../sparti-cms/db/index.js';

// Mock Stripe SDK before importing shop routes
// Use global to store mock instance (vi.mock is hoisted)
global.mockStripeInstance = null;

vi.mock('stripe', () => {
  const StripeConstructor = vi.fn(() => {
    const instance = {
      accounts: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
      accountLinks: {
        create: vi.fn(),
      },
      webhooks: {
        constructEvent: vi.fn(),
      },
    };
    // Store instance globally for test access
    global.mockStripeInstance = instance;
    return instance;
  });
  return {
    default: StripeConstructor,
  };
});

// Mock database query - store globally for access after module reset
// Use a singleton pattern so the same mock instance is always returned
// Initialize the singleton BEFORE the mock factory runs
if (!global.mockQuerySingleton) {
  global.mockQuerySingleton = vi.fn();
  global.mockQueryInstance = global.mockQuerySingleton;
}

vi.mock('../../sparti-cms/db/index.js', () => {
  // Always return the same singleton instance
  // This ensures shop routes and tests use the same mock
  if (!global.mockQuerySingleton) {
    global.mockQuerySingleton = vi.fn();
    global.mockQueryInstance = global.mockQuerySingleton;
  }
  return {
    query: global.mockQuerySingleton,
  };
});

// Mock tenant API key middleware
vi.mock('../middleware/tenantApiKey.js', () => ({
  authenticateTenantApiKey: (req, res, next) => {
    req.tenantId = 'test-tenant-id';
    req.user = { email: 'test@example.com' };
    next();
  },
}));

// Helper to create app with current shop routes
let shopRoutes;
let app;

const createApp = async () => {
  // Reset modules to get fresh Stripe instance based on current env vars
  // Note: vi.mock is hoisted, so mocks persist, but we need to re-import to get fresh references
  vi.resetModules();
  
  // Import shop routes first (this will import query from the mocked module)
  const shopModule = await import('../routes/shop.js');
  shopRoutes = shopModule.default;
  
  // CRITICAL: Re-import query AFTER shop routes has imported it
  // The singleton pattern ensures this is the same instance shop routes uses
  const dbModule = await import('../../sparti-cms/db/index.js');
  const queryInstance = dbModule.query;
  
  // Verify it's the singleton instance
  if (global.mockQuerySingleton && queryInstance !== global.mockQuerySingleton) {
    console.warn('[testing] WARNING: Query instance mismatch - singleton not working correctly');
  }
  
  // Store the query mock instance that shop routes is using
  // This is the instance we need to mock in our tests
  global.testQueryMock = queryInstance;
  
  const testApp = express();
  testApp.use(express.json());
  testApp.use('/api/shop', shopRoutes);
  return testApp;
};

// Test tenant data
const testTenant = {
  id: 'test-tenant-id',
  stripe_connect_account_id: 'acct_test123',
  stripe_connect_onboarding_completed: false,
};

describe('Stripe Connect Routes', () => {
  let mockStripeInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Reset environment
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.FRONTEND_URL;
    
    // Create fresh app (this will reset modules)
    app = await createApp();
    
    // Get mock instance from global
    mockStripeInstance = global.mockStripeInstance;
    
    // If not set, create a new one
    if (!mockStripeInstance) {
      mockStripeInstance = {
        accounts: {
          create: vi.fn(),
          retrieve: vi.fn(),
        },
        accountLinks: {
          create: vi.fn(),
        },
        webhooks: {
          constructEvent: vi.fn(),
        },
      };
      global.mockStripeInstance = mockStripeInstance;
    }
    
    // Re-import query after module reset to get the mocked version
    // This ensures we're using the same mock instance that shop routes uses
    const dbModule = await import('../../sparti-cms/db/index.js');
    const queryMock = dbModule.query;
    
    // Setup default mock query responses for tests that don't reset modules
    // Tests that reset modules will set up their own mocks
    if (!process.env.STRIPE_SECRET_KEY) {
      queryMock.mockResolvedValue({
        rows: [testTenant],
      });
    }
  });

  describe('POST /api/shop/stripe/connect', () => {
    it('should return 500 if Stripe is not configured', async () => {
      const response = await request(app)
        .post('/api/shop/stripe/connect')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Stripe is not configured');
    });

    it('should create new Stripe account if tenant has none', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.FRONTEND_URL = 'http://localhost:5173';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;

      // Setup mock Stripe responses
      const mockAccount = { id: 'acct_new123', type: 'express', country: 'US', email: 'test@example.com' };
      const mockAccountLink = { url: 'https://connect.stripe.com/setup/s/test123' };
      
      mockStripeInstance.accounts.create.mockResolvedValue(mockAccount);
      mockStripeInstance.accountLinks.create.mockResolvedValue(mockAccountLink);

      // Mock tenant with no Stripe account
      query.mockResolvedValueOnce({
        rows: [{ ...testTenant, stripe_connect_account_id: null }],
      });

      // Mock account creation update
      query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .post('/api/shop/stripe/connect')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBeDefined();
      expect(response.body.data.accountId).toBe('acct_new123');
      expect(mockStripeInstance.accounts.create).toHaveBeenCalled();
      expect(mockStripeInstance.accountLinks.create).toHaveBeenCalled();
    });

    it('should reuse existing account if tenant has one', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.FRONTEND_URL = 'http://localhost:5173';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;

      // Setup mock Stripe responses
      const mockAccount = { 
        id: testTenant.stripe_connect_account_id,
        details_submitted: false,
        charges_enabled: false,
      };
      const mockAccountLink = { url: 'https://connect.stripe.com/setup/s/test123' };
      
      mockStripeInstance.accounts.retrieve.mockResolvedValue(mockAccount);
      mockStripeInstance.accountLinks.create.mockResolvedValue(mockAccountLink);

      // Mock tenant with existing account
      query.mockResolvedValueOnce({
        rows: [testTenant],
      });

      const response = await request(app)
        .post('/api/shop/stripe/connect')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBeDefined();
      expect(mockStripeInstance.accounts.create).not.toHaveBeenCalled();
      expect(mockStripeInstance.accounts.retrieve).toHaveBeenCalledWith(testTenant.stripe_connect_account_id);
      expect(mockStripeInstance.accountLinks.create).toHaveBeenCalled();
    });

    it('should return success if account is already connected', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;

      // Setup mock Stripe with ready account
      const mockAccount = { 
        id: testTenant.stripe_connect_account_id,
        details_submitted: true,
        charges_enabled: true,
      };
      
      mockStripeInstance.accounts.retrieve.mockResolvedValue(mockAccount);

      // Mock tenant with completed onboarding
      query.mockResolvedValueOnce({
        rows: [{ ...testTenant, stripe_connect_onboarding_completed: true }],
      });

      // Mock status update query
      query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .post('/api/shop/stripe/connect')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.onboardingCompleted).toBe(true);
      expect(response.body.data.message).toContain('already connected');
      expect(mockStripeInstance.accountLinks.create).not.toHaveBeenCalled();
    });

    it('should handle missing Stripe account (clear from DB)', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.FRONTEND_URL = 'http://localhost:5173';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;
      
      // Re-setup query mock after module reset
      const dbModule = await import('../../sparti-cms/db/index.js');
      const queryMock = dbModule.query;

      // Mock Stripe to throw resource_missing error
      const error = new Error('No such account');
      error.code = 'resource_missing';
      mockStripeInstance.accounts.retrieve.mockRejectedValue(error);

      // Setup new account creation
      const mockAccount = { id: 'acct_new123', type: 'express', country: 'US', email: 'test@example.com' };
      const mockAccountLink = { url: 'https://connect.stripe.com/setup/s/test123' };
      mockStripeInstance.accounts.create.mockResolvedValue(mockAccount);
      mockStripeInstance.accountLinks.create.mockResolvedValue(mockAccountLink);

      // Mock tenant with account that doesn't exist in Stripe
      queryMock.mockResolvedValueOnce({
        rows: [testTenant],
      });

      // Mock cleanup query
      queryMock.mockResolvedValueOnce({
        rows: [],
      });

      // Mock account creation update
      queryMock.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .post('/api/shop/stripe/connect')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Should have cleared the invalid account and created a new one
      // Check that cleanup query was called
      const cleanupCalls = queryMock.mock.calls.filter(call => 
        call && call[0] && typeof call[0] === 'string' && 
        call[0].includes('UPDATE tenants') && 
        (call[0].includes('stripe_connect_account_id = NULL') || call[0].includes('stripe_connect_account_id = $1'))
      );
      expect(cleanupCalls.length).toBeGreaterThan(0);
    });

    it('should handle Stripe API errors gracefully', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;

      // Mock Stripe to throw error
      mockStripeInstance.accounts.create.mockRejectedValue(new Error('Stripe API error'));

      // Mock tenant with no account
      query.mockResolvedValueOnce({
        rows: [{ ...testTenant, stripe_connect_account_id: null }],
      });

      const response = await request(app)
        .post('/api/shop/stripe/connect')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/shop/stripe/status', () => {
    it('should return 404 if tenant not found', async () => {
      query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .get('/api/shop/stripe/status')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Tenant not found');
    });

    it('should return status from database if no Stripe account', async () => {
      query.mockResolvedValueOnce({
        rows: [{ ...testTenant, stripe_connect_account_id: null }],
      });

      const response = await request(app)
        .get('/api/shop/stripe/status')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accountId).toBeNull();
      expect(response.body.data.onboardingCompleted).toBe(false);
    });

    it('should fetch account details from Stripe API', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;

      // Setup mock Stripe account
      const mockAccount = {
        id: testTenant.stripe_connect_account_id,
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
        email: 'test@example.com',
        country: 'US',
      };
      
      mockStripeInstance.accounts.retrieve.mockResolvedValue(mockAccount);
      
      // Use the query mock instance that shop routes is using (set by createApp)
      // This is the EXACT same instance that shop routes imported
      const queryMock = global.testQueryMock;
      if (!queryMock) {
        throw new Error('Query mock not set by createApp');
      }
      
      queryMock.mockClear();
      queryMock.mockResolvedValueOnce({
        rows: [testTenant],
      });

      const response = await request(app)
        .get('/api/shop/stripe/status')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accountId).toBe(testTenant.stripe_connect_account_id);
      expect(response.body.data.accountDetails).toBeDefined();
      expect(response.body.data.accountDetails.charges_enabled).toBe(true);
      expect(mockStripeInstance.accounts.retrieve).toHaveBeenCalledWith(testTenant.stripe_connect_account_id);
      
      // Verify query was called
      expect(queryMock).toHaveBeenCalled();
    });

    it('should update DB if Stripe status differs (self-healing)', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;
      
      // Use the query mock instance that shop routes is using (set by createApp)
      const queryMock = global.testQueryMock;
      if (!queryMock) {
        throw new Error('Query mock not set by createApp');
      }
      queryMock.mockClear();
      
      // Setup mock Stripe with ready account
      const mockAccount = {
        id: testTenant.stripe_connect_account_id,
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
        email: 'test@example.com',
        country: 'US',
      };
      
      mockStripeInstance.accounts.retrieve.mockResolvedValue(mockAccount);

      // DB says not ready - first call returns tenant with false
      queryMock.mockResolvedValueOnce({
        rows: [{ ...testTenant, stripe_connect_onboarding_completed: false }],
      });

      // Mock update query - second call is the UPDATE
      queryMock.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .get('/api/shop/stripe/status')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // The self-healing should update the DB and return true
      // Verify that an UPDATE query was made
      const updateCalls = queryMock.mock.calls.filter(call => 
        call && call[0] && typeof call[0] === 'string' && 
        call[0].includes('UPDATE tenants') && 
        call[0].includes('stripe_connect_onboarding_completed')
      );
      expect(updateCalls.length).toBeGreaterThan(0);
      // Response should show updated status
      expect(response.body.data.onboardingCompleted).toBe(true);
    });

    it('should handle missing Stripe account (clear from DB)', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;
      
      // Use the query mock instance that shop routes is using (set by createApp)
      const queryMock = global.testQueryMock;
      if (!queryMock) {
        throw new Error('Query mock not set by createApp');
      }
      queryMock.mockClear();

      // Mock Stripe to throw resource_missing error
      const error = new Error('No such account');
      error.code = 'resource_missing';
      mockStripeInstance.accounts.retrieve.mockRejectedValue(error);

      queryMock.mockResolvedValueOnce({
        rows: [testTenant],
      });

      // Mock cleanup query
      queryMock.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .get('/api/shop/stripe/status')
        .set('x-tenant-api-key', 'test-key');

      expect(response.status).toBe(200);
      expect(response.body.data.onboardingCompleted).toBe(false);
      // Should have cleared the invalid account
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tenants'),
        expect.arrayContaining(['test-tenant-id'])
      );
    });

    it('should handle Stripe API errors gracefully', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;
      
      // Use the query mock instance that shop routes is using (set by createApp)
      const queryMock = global.testQueryMock;
      if (!queryMock) {
        throw new Error('Query mock not set by createApp');
      }
      queryMock.mockClear();

      // Mock Stripe to throw error
      mockStripeInstance.accounts.retrieve.mockRejectedValue(new Error('Stripe API error'));

      // Mock tenant query - must be set up after app creation since resetModules clears mocks
      queryMock.mockResolvedValueOnce({
        rows: [testTenant],
      });

      const response = await request(app)
        .get('/api/shop/stripe/status')
        .set('x-tenant-api-key', 'test-key');

      // Should still return 200 with DB status (even if Stripe API fails)
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accountId).toBe(testTenant.stripe_connect_account_id);
      
      // Verify query was called
      expect(queryMock).toHaveBeenCalled();
    });
  });

  describe('POST /api/shop/stripe/webhook', () => {
    it('should return 500 if Stripe is not configured', async () => {
      const response = await request(app)
        .post('/api/shop/stripe/webhook')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Stripe is not configured');
    });

    it('should return 400 if webhook signature is invalid', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;

      // Mock Stripe to throw signature error
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid webhook signature');
      });

      const response = await request(app)
        .post('/api/shop/stripe/webhook')
        .set('stripe-signature', 'invalid-signature')
        .send({});

      expect(response.status).toBe(400);
      expect(response.text).toContain('Webhook Error');
    });

    it('should update tenant status on account.updated event', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;

      // Mock webhook event
      const mockEvent = {
        type: 'account.updated',
        data: {
          object: {
            id: testTenant.stripe_connect_account_id,
            details_submitted: true,
            charges_enabled: true,
          },
        },
      };

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

      // Mock update query
      query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .post('/api/shop/stripe/webhook')
        .set('stripe-signature', 'valid-signature')
        .send(JSON.stringify(mockEvent));

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tenants'),
        expect.arrayContaining([true, testTenant.stripe_connect_account_id])
      );
    });

    it('should handle webhook errors gracefully', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123';
      
      // Reload app with Stripe configured
      app = await createApp();
      mockStripeInstance = global.mockStripeInstance;

      // Mock Stripe to throw error
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid webhook signature');
      });

      const response = await request(app)
        .post('/api/shop/stripe/webhook')
        .set('stripe-signature', 'valid-signature')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
