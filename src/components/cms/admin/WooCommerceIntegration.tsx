import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Key, Settings, RefreshCw, CheckCircle2, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Tenant } from './PostgresIntegration';

interface WooCommerceIntegrationProps {
  tenant: Tenant;
}

interface SyncStatus {
  is_configured: boolean;
  is_active: boolean;
  last_sync_at: string | null;
  synced_products: number;
  synced_orders: number;
  store_url: string | null;
}

/**
 * WooCommerce Integration component that displays integration status and allows configuration
 */
export const WooCommerceIntegration: React.FC<WooCommerceIntegrationProps> = ({ tenant }) => {
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  // Form state
  const [config, setConfig] = useState({
    store_url: '',
    consumer_key: '',
    consumer_secret: '',
  });

  // Check integration status
  useEffect(() => {
    console.log('[testing] WooCommerceIntegration - Tenant:', tenant);
    
    if (!tenant) {
      console.log('[testing] WooCommerceIntegration - No tenant provided');
      setIsActive(false);
      setIsLoading(false);
      return;
    }

    if (tenant.isTheme) {
      console.log('[testing] WooCommerceIntegration - Tenant is a theme, skipping');
      setIsActive(false);
      setIsLoading(false);
      return;
    }

    if (!tenant.id) {
      console.error('[testing] WooCommerceIntegration - Tenant has no ID:', tenant);
      setIsActive(false);
      setIsLoading(false);
      return;
    }

    const checkIntegrationStatus = async () => {
      try {
        const token = localStorage.getItem('sparti-user-session');
        const authToken = token ? JSON.parse(token).token : null;
        
        console.log('[testing] Checking WooCommerce status for tenant:', tenant.id);
        
        const [statusResponse, syncResponse] = await Promise.all([
          fetch(`/api/tenants/${tenant.id}/integrations/woocommerce`, {
            headers: {
              ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            }
          }),
          fetch(`/api/woocommerce/sync/status`, {
            headers: {
              ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
              'X-API-Key': authToken || '',
            }
          })
        ]);
        
        console.log('[testing] Status response:', statusResponse.status, statusResponse.ok);
        
        if (statusResponse.ok) {
          const data = await statusResponse.json();
          console.log('[testing] Integration data:', data);
          setIsActive(data.is_active || false);
          
          // Load config if exists
          if (data.config) {
            setConfig({
              store_url: data.config.store_url || '',
              consumer_key: data.config.consumer_key ? '••••••••' : '',
              consumer_secret: data.config.consumer_secret ? '••••••••' : '',
            });
          }
        } else {
          const errorText = await statusResponse.text();
          console.error('[testing] Failed to fetch integration status:', statusResponse.status, errorText);
          setIsActive(false);
        }

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          setSyncStatus(syncData.data);
        } else {
          console.warn('[testing] Failed to fetch sync status:', syncResponse.status);
        }
      } catch (error) {
        console.error('[testing] Error checking WooCommerce integration status:', error);
        setIsActive(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkIntegrationStatus();
  }, [tenant]);

  const handleSaveConfig = async () => {
    try {
      const token = localStorage.getItem('sparti-user-session');
      const authToken = token ? JSON.parse(token).token : null;

      // Prepare config - don't send masked passwords
      const configToSave: any = {
        store_url: config.store_url,
        api_version: 'wc/v3',
      };

      // Only include credentials if they're not masked
      if (config.consumer_key && !config.consumer_key.startsWith('••••')) {
        configToSave.consumer_key = config.consumer_key;
      }
      if (config.consumer_secret && !config.consumer_secret.startsWith('••••')) {
        configToSave.consumer_secret = config.consumer_secret;
      }

      const response = await fetch(`/api/tenants/${tenant.id}/integrations/woocommerce`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          is_active: true,
          config: configToSave,
        })
      });

      if (response.ok) {
        setIsActive(true);
        setShowConfig(false);
        setConnectionTestResult(null);
        // Reload status
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to save configuration: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[testing] Error saving WooCommerce config:', error);
      alert('Failed to save configuration');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const token = localStorage.getItem('sparti-user-session');
      const authToken = token ? JSON.parse(token).token : null;

      // First save config if needed
      if (config.store_url && config.consumer_key && config.consumer_secret) {
        await handleSaveConfig();
        // Wait a bit for config to be saved
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const response = await fetch(`/api/woocommerce/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          'X-API-Key': authToken || '',
        }
      });

      const data = await response.json();
      setConnectionTestResult({
        success: data.success,
        message: data.message || data.error
      });
    } catch (error: any) {
      setConnectionTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSync = async (type: 'products' | 'orders') => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const token = localStorage.getItem('sparti-user-session');
      const authToken = token ? JSON.parse(token).token : null;

      const response = await fetch(`/api/woocommerce/sync/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          'X-API-Key': authToken || '',
        },
        body: JSON.stringify({
          page: 1,
          per_page: 10,
        })
      });

      const data = await response.json();
      if (data.success) {
        setSyncMessage(`${type === 'products' ? 'Products' : 'Orders'} synced successfully: ${data.message}`);
        // Reload sync status
        const syncResponse = await fetch(`/api/woocommerce/sync/status`, {
          headers: {
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            'X-API-Key': authToken || '',
          }
        });
        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          setSyncStatus(syncData.data);
        }
      } else {
        setSyncMessage(`Sync failed: ${data.error}`);
      }
    } catch (error: any) {
      setSyncMessage(`Sync error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!tenant) {
    return (
      <div className="border rounded-lg p-4 flex items-start justify-between opacity-60">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-700">WooCommerce</h3>
              <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                Inactive
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              E-commerce platform integration for product management and orders
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Type: E-commerce</span>
              <span>Provider: WooCommerce</span>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              Select a tenant to activate WooCommerce integration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">WooCommerce</h3>
              {tenant.isTheme ? (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300">
                  Theme: {tenant.name}
                </Badge>
              ) : (
                <>
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                    Tenant: {tenant.name}
                  </Badge>
                  {isLoading ? (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                      Checking...
                    </Badge>
                  ) : isActive ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                      Inactive
                    </Badge>
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              E-commerce platform integration for product management and orders
            </p>
            {syncStatus && (
              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                <span>Products: {syncStatus.synced_products}</span>
                <span>Orders: {syncStatus.synced_orders}</span>
                {syncStatus.last_sync_at && (
                  <span>Last sync: {new Date(syncStatus.last_sync_at).toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-4 w-4 mr-1" />
            {showConfig ? 'Hide' : isActive ? 'Configure' : 'Setup'}
          </Button>
        </div>
      </div>

      {(!isActive || showConfig) && !tenant.isTheme && (
        <div className="border-t pt-4 space-y-4">
          {!isActive && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                WooCommerce integration is not configured. Please enter your credentials below to activate it.
              </p>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Store URL
              </label>
              <input
                type="text"
                value={config.store_url}
                onChange={(e) => setConfig(prev => ({ ...prev, store_url: e.target.value }))}
                placeholder="https://yourstore.com"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Consumer Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={config.consumer_key}
                  onChange={(e) => setConfig(prev => ({ ...prev, consumer_key: e.target.value }))}
                  placeholder="ck_..."
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Consumer Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={config.consumer_secret}
                  onChange={(e) => setConfig(prev => ({ ...prev, consumer_secret: e.target.value }))}
                  placeholder="cs_..."
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {connectionTestResult && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                connectionTestResult.success 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {connectionTestResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{connectionTestResult.message}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testingConnection || !config.store_url || !config.consumer_key || !config.consumer_secret}
              >
                {testingConnection ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-1" />
                )}
                Test Connection
              </Button>
              <Button
                size="sm"
                onClick={handleSaveConfig}
                disabled={!config.store_url || !config.consumer_key || !config.consumer_secret}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}

      {isActive && !tenant.isTheme && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Sync Data</h4>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSync('products')}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Sync Products
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSync('orders')}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Sync Orders
            </Button>
          </div>
          {syncMessage && (
            <p className={`text-xs mt-2 ${syncMessage.includes('failed') || syncMessage.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
              {syncMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * WooCommerce Integration list item for modals
 */
export const WooCommerceIntegrationListItem: React.FC<{ tenant?: Tenant }> = ({ tenant }) => {
  if (!tenant) {
    return <li>• WooCommerce (No tenant selected)</li>;
  }
  
  return (
    <li>• WooCommerce (Tenant: {tenant.name})</li>
  );
};

export default WooCommerceIntegration;

