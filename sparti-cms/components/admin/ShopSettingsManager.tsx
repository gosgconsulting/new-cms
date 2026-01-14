import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, CheckCircle, XCircle, ExternalLink, RefreshCw, Settings, Truck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import PaymentMethodsManager from './PaymentMethodsManager';
import ShippingMethodsManager from './ShippingMethodsManager';

interface ShopSettingsManagerProps {
  currentTenantId: string;
  activeTab?: string;
}

export default function ShopSettingsManager({ currentTenantId, activeTab: propActiveTab }: ShopSettingsManagerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>(propActiveTab || 'general');

  // Check for Stripe return parameters
  useEffect(() => {
    const stripeParam = searchParams.get('stripe');
    if (stripeParam === 'success' || stripeParam === 'refresh') {
      // Refetch Stripe status
      queryClient.invalidateQueries({ queryKey: ['stripe-status', currentTenantId] });
      // Remove the parameter from URL
      searchParams.delete('stripe');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, queryClient, currentTenantId, setSearchParams]);

  const { data: stripeStatus, isLoading } = useQuery({
    queryKey: ['stripe-status', currentTenantId],
    queryFn: async () => {
      const response = await api.get('/api/shop/stripe/status');
      if (!response.ok) {
        throw new Error('Failed to fetch Stripe status');
      }
      const result = await response.json();
      return result.data;
    },
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/shop/stripe/connect');
      if (!response.ok) {
        throw new Error('Failed to initiate Stripe Connect');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe onboarding
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    },
  });

  const isConnected = stripeStatus?.onboardingCompleted || false;
  const accountId = stripeStatus?.accountId;

  // Update active tab when prop changes
  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab]);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
    { id: 'shipping-methods', label: 'Shipping Methods', icon: Truck },
    { id: 'stripe-connect', label: 'Stripe Connect', icon: CreditCard },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payment-methods':
        return <PaymentMethodsManager currentTenantId={currentTenantId} />;
      case 'shipping-methods':
        return <ShippingMethodsManager currentTenantId={currentTenantId} />;
      case 'stripe-connect':
        return renderStripeConnect();
      case 'general':
      default:
        return renderGeneralSettings();
    }
  };

  const renderGeneralSettings = () => {
    return (
      <div className="space-y-6">
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6" />
              <div>
                <CardTitle>Stripe Connect</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect your Stripe account to accept payments
                </p>
              </div>
            </div>
            {isConnected ? (
              <Badge className="bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-4 w-4 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading Stripe status...</div>
          ) : isConnected ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your Stripe account is connected and ready to accept payments.
                  {accountId && (
                    <div className="mt-2">
                      <strong>Account ID:</strong> <code className="text-xs">{accountId}</code>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
              {stripeStatus?.accountDetails && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Charges Enabled:</strong>{' '}
                    {stripeStatus.accountDetails.charges_enabled ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Payouts Enabled:</strong>{' '}
                    {stripeStatus.accountDetails.payouts_enabled ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Country:</strong> {stripeStatus.accountDetails.country || 'N/A'}
                  </div>
                  <div>
                    <strong>Email:</strong> {stripeStatus.accountDetails.email || 'N/A'}
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  // Refresh status
                  queryClient.invalidateQueries({ queryKey: ['stripe-status', currentTenantId] });
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Stripe account to start accepting payments. You'll be redirected to
                Stripe to complete the onboarding process.
              </p>
              <Button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
              >
                {connectMutation.isPending ? (
                  'Connecting...'
                ) : (
                  <>
                    Connect Stripe Account
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              {connectMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to connect Stripe account. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    );
  };

  const renderStripeConnect = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6" />
                <div>
                  <CardTitle>Stripe Connect</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect your Stripe account to accept payments
                  </p>
                </div>
              </div>
              {isConnected ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-4 w-4 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">Loading Stripe status...</div>
            ) : isConnected ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your Stripe account is connected and ready to accept payments.
                    {accountId && (
                      <div className="mt-2">
                        <strong>Account ID:</strong> <code className="text-xs">{accountId}</code>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
                {stripeStatus?.accountDetails && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Charges Enabled:</strong>{' '}
                      {stripeStatus.accountDetails.charges_enabled ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <strong>Payouts Enabled:</strong>{' '}
                      {stripeStatus.accountDetails.payouts_enabled ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <strong>Country:</strong> {stripeStatus.accountDetails.country || 'N/A'}
                    </div>
                    <div>
                      <strong>Email:</strong> {stripeStatus.accountDetails.email || 'N/A'}
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    // Refresh status
                    queryClient.invalidateQueries({ queryKey: ['stripe-status', currentTenantId] });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your Stripe account to start accepting payments. You'll be redirected to
                  Stripe to complete the onboarding process.
                </p>
                <Button
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                >
                  {connectMutation.isPending ? (
                    'Connecting...'
                  ) : (
                    <>
                      Connect Stripe Account
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                {connectMutation.isError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to connect Stripe account. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shop Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your e-commerce settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}
