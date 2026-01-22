import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, CheckCircle, XCircle, ExternalLink, RefreshCw, Settings, Truck, Puzzle } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check for Stripe return parameters
  useEffect(() => {
    const stripeParam = searchParams.get('stripe');
    if (stripeParam === 'success' || stripeParam === 'refresh') {
      // Wait a moment for Stripe webhook to process (if configured)
      // Then refetch status - the endpoint will check Stripe directly anyway
      setTimeout(async () => {
        try {
          await queryClient.invalidateQueries({ queryKey: ['stripe-status', currentTenantId] });
          await queryClient.refetchQueries({ queryKey: ['stripe-status', currentTenantId] });
        } catch (error) {
          console.error('[testing] Error refetching Stripe status after return:', error);
        }
      }, 1000);
      
      // Remove the parameter from URL
      searchParams.delete('stripe');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, queryClient, currentTenantId, setSearchParams]);

  const { data: stripeStatus, isLoading } = useQuery({
    queryKey: ['stripe-status', currentTenantId],
    queryFn: async () => {
      const response = await api.get('/api/shop/stripe/status', { tenantId: currentTenantId });
      if (!response.ok) {
        throw new Error('Failed to fetch Stripe status');
      }
      const result = await response.json();
      return result.data;
    },
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/shop/stripe/connect', undefined, { tenantId: currentTenantId });
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
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
    { id: 'shipping-methods', label: 'Shipping Methods', icon: Truck },
    { id: 'stripe-connect', label: 'Stripe Connect', icon: CreditCard },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'integrations':
        return renderIntegrations();
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

  const renderIntegrations = () => {
    const [eshopProvider, setEshopProvider] = useState<string>('sparti');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [woocommerceStatus, setWooCommerceStatus] = useState<{ is_active: boolean; is_configured: boolean } | null>(null);

    // Fetch current e-shop provider setting
    const { data: settings = [], isLoading: isLoadingSettings } = useQuery({
      queryKey: ['shop-integrations-settings', currentTenantId],
      queryFn: async () => {
        if (!currentTenantId) return [];
        const response = await api.get(`/api/settings/site-settings-by-tenant/${currentTenantId}`, { tenantId: currentTenantId });
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const result = await response.json();
        return result.data || [];
      },
      enabled: !!currentTenantId,
    });

    // Fetch WooCommerce integration status
    const { data: woocommerceIntegration } = useQuery({
      queryKey: ['woocommerce-integration', currentTenantId],
      queryFn: async () => {
        if (!currentTenantId) return null;
        try {
          const token = localStorage.getItem('sparti-user-session');
          const authToken = token ? JSON.parse(token).token : null;
          const response = await fetch(`/api/tenants/${currentTenantId}/integrations/woocommerce`, {
            headers: {
              ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            }
          });
          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch (error) {
          console.error('[testing] Error fetching WooCommerce status:', error);
          return null;
        }
      },
      enabled: !!currentTenantId,
    });

    // Update provider from settings
    useEffect(() => {
      if (settings && settings.length > 0) {
        const providerSetting = settings.find((s: any) => s.setting_key === 'shop_eshop_provider');
        if (providerSetting) {
          setEshopProvider(providerSetting.setting_value || 'sparti');
        }
      }
    }, [settings]);

    // Update WooCommerce status
    useEffect(() => {
      if (woocommerceIntegration) {
        setWooCommerceStatus({
          is_active: woocommerceIntegration.is_active || false,
          is_configured: !!woocommerceIntegration.config,
        });
      } else {
        setWooCommerceStatus({ is_active: false, is_configured: false });
      }
    }, [woocommerceIntegration]);

    const handleSave = async () => {
      setIsSaving(true);
      setSaveMessage(null);

      try {
        const response = await api.post('/api/settings/site-settings', {
          tenantId: currentTenantId,
          settings: [
            {
              setting_key: 'shop_eshop_provider',
              setting_value: eshopProvider,
              setting_type: 'text',
              setting_category: 'shop',
              is_public: false,
            },
          ],
        });

        if (response.ok) {
          setSaveMessage({ type: 'success', text: 'E-shop provider saved successfully' });
          queryClient.invalidateQueries({ queryKey: ['shop-integrations-settings', currentTenantId] });
        } else {
          const error = await response.json();
          setSaveMessage({ type: 'error', text: error.error || 'Failed to save settings' });
        }
      } catch (error: any) {
        setSaveMessage({ type: 'error', text: error.message || 'Failed to save settings' });
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Puzzle className="h-6 w-6" />
              <div>
                <CardTitle>E-shop Integration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose which e-commerce platform to use for products and orders
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSettings ? (
              <div className="text-center py-4">Loading settings...</div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    E-shop Provider
                  </label>
                  <select
                    value={eshopProvider}
                    onChange={(e) => setEshopProvider(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                  >
                    <option value="sparti">Sparti (Default)</option>
                    <option value="woocommerce">WooCommerce</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {eshopProvider === 'sparti' 
                      ? 'Using the built-in Sparti e-commerce system'
                      : 'Using WooCommerce REST API for products and orders'}
                  </p>
                </div>

                {eshopProvider === 'woocommerce' && (
                  <Alert className={woocommerceStatus?.is_active ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}>
                    {woocommerceStatus?.is_active ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          WooCommerce integration is active and configured. Products and orders will be fetched from your WooCommerce store.
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          WooCommerce integration is not active. Please configure it in the Developer → Integrations section first.
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                )}

                {saveMessage && (
                  <Alert variant={saveMessage.type === 'error' ? 'destructive' : 'default'} className={saveMessage.type === 'success' ? 'bg-green-50 border-green-200' : ''}>
                    <AlertDescription className={saveMessage.type === 'success' ? 'text-green-800' : ''}>
                      {saveMessage.text}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </>
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
                  onClick={async () => {
                    setIsRefreshing(true);
                    try {
                      await queryClient.invalidateQueries({ queryKey: ['stripe-status', currentTenantId] });
                      await queryClient.refetchQueries({ queryKey: ['stripe-status', currentTenantId] });
                    } catch (error) {
                      console.error('[testing] Error refreshing Stripe status:', error);
                    } finally {
                      setTimeout(() => setIsRefreshing(false), 500);
                    }
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
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
