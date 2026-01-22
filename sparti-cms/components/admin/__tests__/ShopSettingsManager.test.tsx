/**
 * ShopSettingsManager Stripe Connect Tests
 * 
 * Tests for Stripe Connect functionality in ShopSettingsManager component
 * 
 * NOTE: This test requires @testing-library/react and @testing-library/jest-dom
 * Install with: npm install --save-dev @testing-library/react @testing-library/jest-dom jsdom
 * Also update vitest.config.js to use 'jsdom' environment for React tests
 * 
 * For now, this test is skipped until dependencies are installed.
 * To enable: Install dependencies and uncomment the test code below.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// TODO: Uncomment when @testing-library/react is installed
// import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ShopSettingsManager from '../ShopSettingsManager';

// Mock API
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock('../../utils/api', () => ({
  api: mockApi,
}));

// Mock window.location
const mockLocation = {
  href: '',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Skip frontend tests until @testing-library/react is installed
// To enable: npm install --save-dev @testing-library/react @testing-library/jest-dom jsdom
describe.skip('ShopSettingsManager - Stripe Connect', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    mockLocation.href = '';
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ShopSettingsManager
            currentTenantId="test-tenant-id"
            activeTab="stripe-connect"
            {...props}
          />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Stripe Connect Tab Rendering', () => {
    it('should show loading state initially', async () => {
      mockApi.get.mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      renderComponent();

      // Should show loading text
      expect(screen.getByText(/Loading Stripe status/i)).toBeInTheDocument();
    });

    it('should show "Not Connected" badge when not connected', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: null,
            onboardingCompleted: false,
            accountDetails: null,
          },
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Not Connected/i)).toBeInTheDocument();
      });
    });

    it('should show "Connected" badge when connected', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: 'acct_test123',
            onboardingCompleted: true,
            accountDetails: {
              charges_enabled: true,
              payouts_enabled: true,
              country: 'US',
              email: 'test@example.com',
            },
          },
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Connected/i)).toBeInTheDocument();
      });
    });

    it('should display account details when connected', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: 'acct_test123',
            onboardingCompleted: true,
            accountDetails: {
              charges_enabled: true,
              payouts_enabled: true,
              country: 'US',
              email: 'test@example.com',
            },
          },
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Charges Enabled/i)).toBeInTheDocument();
        expect(screen.getByText(/Payouts Enabled/i)).toBeInTheDocument();
        expect(screen.getByText(/Country/i)).toBeInTheDocument();
        expect(screen.getByText(/Email/i)).toBeInTheDocument();
      });
    });

    it('should show connect button when not connected', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: null,
            onboardingCompleted: false,
            accountDetails: null,
          },
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Connect Stripe Account/i)).toBeInTheDocument();
      });
    });
  });

  describe('Connect Flow', () => {
    it('should call connect mutation on button click', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: null,
            onboardingCompleted: false,
            accountDetails: null,
          },
        }),
      });

      mockApi.post.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            url: 'https://connect.stripe.com/setup/s/test123',
            accountId: 'acct_test123',
            onboardingCompleted: false,
          },
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Connect Stripe Account/i)).toBeInTheDocument();
      });

      const connectButton = screen.getByText(/Connect Stripe Account/i);
      connectButton.click();

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/api/shop/stripe/connect');
      });
    });

    it('should redirect to Stripe URL on success', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: null,
            onboardingCompleted: false,
            accountDetails: null,
          },
        }),
      });

      const stripeUrl = 'https://connect.stripe.com/setup/s/test123';
      mockApi.post.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            url: stripeUrl,
            accountId: 'acct_test123',
            onboardingCompleted: false,
          },
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Connect Stripe Account/i)).toBeInTheDocument();
      });

      const connectButton = screen.getByText(/Connect Stripe Account/i);
      connectButton.click();

      await waitFor(() => {
        expect(mockLocation.href).toBe(stripeUrl);
      });
    });

    it('should show error message on failure', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: null,
            onboardingCompleted: false,
            accountDetails: null,
          },
        }),
      });

      mockApi.post.mockResolvedValue({
        ok: false,
        status: 500,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Connect Stripe Account/i)).toBeInTheDocument();
      });

      const connectButton = screen.getByText(/Connect Stripe Account/i);
      connectButton.click();

      await waitFor(() => {
        expect(screen.getByText(/Failed to connect Stripe account/i)).toBeInTheDocument();
      });
    });

    it('should disable button while connecting', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: null,
            onboardingCompleted: false,
            accountDetails: null,
          },
        }),
      });

      // Make post hang
      mockApi.post.mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Connect Stripe Account/i)).toBeInTheDocument();
      });

      const connectButton = screen.getByText(/Connect Stripe Account/i);
      connectButton.click();

      await waitFor(() => {
        expect(screen.getByText(/Connecting/i)).toBeInTheDocument();
        expect(connectButton).toBeDisabled();
      });
    });
  });

  describe('Status Refresh', () => {
    it('should refetch status when refresh button is clicked', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: 'acct_test123',
            onboardingCompleted: true,
            accountDetails: {
              charges_enabled: true,
              payouts_enabled: true,
            },
          },
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Refresh Status/i)).toBeInTheDocument();
      });

      const refreshButton = screen.getByText(/Refresh Status/i);
      refreshButton.click();

      // Should call API again
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Query Integration', () => {
    it('should fetch status on component mount', async () => {
      mockApi.get.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            accountId: 'acct_test123',
            onboardingCompleted: true,
            accountDetails: null,
          },
        }),
      });

      renderComponent();

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/shop/stripe/status');
      });
    });

    it('should handle query errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      renderComponent();

      // Should not crash, just show error state
      await waitFor(() => {
        // Component should still render
        expect(screen.getByText(/Stripe Connect/i)).toBeInTheDocument();
      });
    });
  });
});
