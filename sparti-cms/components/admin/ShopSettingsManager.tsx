import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, CheckCircle, XCircle, ExternalLink, RefreshCw, Settings, Truck, Puzzle, Eye, EyeOff, Key } from 'lucide-react';
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
    // Stripe Configuration state
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch current Stripe configuration
    const { data: stripeConfig, isLoading: isLoadingConfig } = useQuery({
      queryKey: ['stripe-config', currentTenantId],
      queryFn: async () => {
        const response = await api.get('/api/shop/stripe/config', { tenantId: currentTenantId });
        if (!response.ok) {
          throw new Error('Failed to fetch Stripe configuration');
        }
        const result = await response.json();
        return result.data;
      },
      enabled: !!currentTenantId,
    });

    // Update form fields when config is loaded
    useEffect(() => {
      if (stripeConfig) {
        // Don't populate actual values for security, just show placeholder if configured
        setStripeSecretKey('');
        setStripeWebhookSecret('');
      }
    }, [stripeConfig]);

    // Mutation to update Stripe configuration
    const updateConfigMutation = useMutation({
      mutationFn: async (data: { stripe_secret_key?: string; stripe_webhook_secret?: string }) => {
        const response = await api.put('/api/shop/stripe/config', data, { tenantId: currentTenantId });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update Stripe configuration');
        }
        return response.json();
      },
      onSuccess: () => {
        setConfigMessage({ type: 'success', text: 'Stripe configuration updated successfully' });
        queryClient.invalidateQueries({ queryKey: ['stripe-config', currentTenantId] });
        queryClient.invalidateQueries({ queryKey: ['stripe-status', currentTenantId] });
        // Clear form fields after successful save
        setStripeSecretKey('');
        setStripeWebhookSecret('');
        // Clear message after 3 seconds
        setTimeout(() => setConfigMessage(null), 3000);
      },
      onError: (error: Error) => {
        setConfigMessage({ type: 'error', text: error.message });
      },
    });

    const handleSaveConfig = async () => {
      if (!stripeSecretKey && !stripeWebhookSecret) {
        setConfigMessage({ type: 'error', text: 'Please provide at least one key to update' });
        return;
      }

      setIsSavingConfig(true);
      setConfigMessage(null);

      try {
        const updateData: { stripe_secret_key?: string; stripe_webhook_secret?: string } = {};
        if (stripeSecretKey) {
          updateData.stripe_secret_key = stripeSecretKey;
        }
        if (stripeWebhookSecret) {
          updateData.stripe_webhook_secret = stripeWebhookSecret;
        }

        await updateConfigMutation.mutateAsync(updateData);
      } catch (error) {
        // Error handled by mutation onError
      } finally {
        setIsSavingConfig(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Stripe Configuration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Key className="h-6 w-6" />
              <div>
                <CardTitle>Stripe Configuration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure your Stripe API keys for this tenant
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingConfig ? (
              <div className="text-center py-4">Loading configuration...</div>
            ) : (
              <>
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800">
                    <strong>Note:</strong> Enter your Stripe secret key and webhook secret here. 
                    These keys are stored securely in the database and are specific to this tenant.
                    {stripeConfig?.has_stripe_secret_key && (
                      <div className="mt-2">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Secret key is configured
                      </div>
                    )}
                    {stripeConfig?.has_stripe_webhook_secret && (
                      <div className="mt-1">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Webhook secret is configured
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Stripe Secret Key
                    </label>
                    <div className="relative">
                      <input
                        type={showSecretKey ? 'text' : 'password'}
                        value={stripeSecretKey}
                        onChange={(e) => setStripeSecretKey(e.target.value)}
                        placeholder={stripeConfig?.has_stripe_secret_key ? 'Enter new key to update (or leave blank)' : 'sk_test_... or sk_live_...'}
                        className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your Stripe secret key (starts with sk_test_ or sk_live_)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Stripe Webhook Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showWebhookSecret ? 'text' : 'password'}
                        value={stripeWebhookSecret}
                        onChange={(e) => setStripeWebhookSecret(e.target.value)}
                        placeholder={stripeConfig?.has_stripe_webhook_secret ? 'Enter new secret to update (or leave blank)' : 'whsec_...'}
                        className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your Stripe webhook signing secret (starts with whsec_)
                    </p>
                  </div>

                  {configMessage && (
                    <Alert 
                      variant={configMessage.type === 'error' ? 'destructive' : 'default'} 
                      className={configMessage.type === 'success' ? 'bg-green-50 border-green-200' : ''}
                    >
                      <AlertDescription className={configMessage.type === 'success' ? 'text-green-800' : ''}>
                        {configMessage.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveConfig}
                      disabled={isSavingConfig || (!stripeSecretKey && !stripeWebhookSecret)}
                    >
                      {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stripe Connect Status Card */}
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
                {!stripeConfig?.has_stripe_secret_key && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Stripe is not configured.</strong> Please set your Stripe secret key above before connecting your account.
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-muted-foreground">
                  Connect your Stripe account to start accepting payments. You'll be redirected to
                  Stripe to complete the onboarding process.
                </p>
                <Button
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending || !stripeConfig?.has_stripe_secret_key}
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
