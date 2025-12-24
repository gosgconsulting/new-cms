import { useState, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

interface CMSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCMSType: 'wordpress' | 'shopify' | 'custom-api' | '';
  onCMSTypeChange: (type: 'wordpress' | 'shopify' | 'custom-api' | '') => void;
  currentBrandName?: string;
  brandId?: string;
  onSubmit: (type: 'wordpress' | 'shopify', data: any) => void;
}

export const CMSDialog = ({ 
  open, 
  onOpenChange, 
  selectedCMSType, 
  onCMSTypeChange,
  currentBrandName,
  brandId,
  onSubmit
}: CMSDialogProps) => {
  const [wpFormData, setWpFormData] = useState({
    site_url: '',
    username: '',
    app_password: ''
  });

  const [shopifyFormData, setShopifyFormData] = useState({
    store_url: '',
    api_key: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showShopifyPassword, setShowShopifyPassword] = useState(false);
  const [apiKeyName, setApiKeyName] = useState('');
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleWordPressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('wordpress', wpFormData);
    // Don't reset form data here - let the parent handle it after successful connection
  };

  const handleShopifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('shopify', shopifyFormData);
    // Don't reset form data here - let the parent handle it after successful connection
  };

  const generateApiKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!brandId) throw new Error('Brand ID is required');
      const { data, error } = await supabase.functions.invoke('generate-api-key', {
        body: { brandId, keyName: name },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedApiKey(data.apiKey);
      toast.success('API key generated successfully');
      setApiKeyName('');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate API key: ${error.message}`);
    },
  });

  const handleGenerateApiKey = () => {
    if (!apiKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }
    generateApiKeyMutation.mutate(apiKeyName);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleClose = () => {
    onOpenChange(false);
    onCMSTypeChange('');
    setWpFormData({ site_url: '', username: '', app_password: '' });
    setShopifyFormData({ store_url: '', api_key: '' });
    setApiKeyName('');
    setGeneratedApiKey(null);
    setShowApiKey(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add CMS Integration</DialogTitle>
        </DialogHeader>
        {selectedCMSType === 'wordpress' ? (
          <form onSubmit={handleWordPressSubmit} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Setting up WordPress integration for: <strong>{currentBrandName}</strong>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_url">Site URL</Label>
              <Input
                id="site_url"
                value={wpFormData.site_url}
                onChange={(e) => setWpFormData({...wpFormData, site_url: e.target.value})}
                placeholder="https://yoursite.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={wpFormData.username}
                onChange={(e) => setWpFormData({...wpFormData, username: e.target.value})}
                placeholder="WordPress username"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="app_password">Application Password</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground rounded-full border border-muted-foreground/20">
                        <span className="text-xs">?</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-medium">How to get WordPress credentials:</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Log into WordPress admin dashboard</li>
                          <li>Go to <strong>Users → Profile</strong></li>
                          <li>Scroll to <strong>"Application Passwords"</strong> section</li>
                          <li>Enter app name (e.g., "Sparti App")</li>
                          <li>Click <strong>"Add New Application Password"</strong></li>
                          <li>Copy the generated password (shown only once)</li>
                        </ol>
                        <p className="text-xs text-muted-foreground">
                          <strong>Note:</strong> Application passwords are more secure and can be revoked anytime.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  id="app_password"
                  type={showPassword ? "text" : "password"}
                  value={wpFormData.app_password}
                  onChange={(e) => setWpFormData({...wpFormData, app_password: e.target.value})}
                  placeholder="WordPress app password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:shadow-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Connect WordPress
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : selectedCMSType === 'shopify' ? (
          <form onSubmit={handleShopifySubmit} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Setting up Shopify integration for: <strong>{currentBrandName}</strong>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_url">Store URL</Label>
              <Input
                id="store_url"
                value={shopifyFormData.store_url}
                onChange={(e) => setShopifyFormData({...shopifyFormData, store_url: e.target.value})}
                placeholder="https://yourstore.myshopify.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use your Shopify admin URL in the format: https://yourstore.myshopify.com
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="api_key">API Key (Optional)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground rounded-full border border-muted-foreground/20">
                        <span className="text-xs">?</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-medium">How to get Shopify API credentials:</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Go to your Shopify admin</li>
                          <li>Navigate to <strong>Apps → App and sales channel settings</strong></li>
                          <li>Click <strong>"Develop apps"</strong></li>
                          <li>Create a private app</li>
                          <li>Configure API scopes (read_content, write_content)</li>
                          <li>Generate API credentials</li>
                        </ol>
                        <p className="text-xs text-muted-foreground">
                          <strong>Note:</strong> API key is optional. Store connection will be tested without it.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  id="api_key"
                  type={showShopifyPassword ? "text" : "password"}
                  value={shopifyFormData.api_key}
                  onChange={(e) => setShopifyFormData({...shopifyFormData, api_key: e.target.value})}
                  placeholder="Optional: Shopify API key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:shadow-none"
                  onClick={() => setShowShopifyPassword(!showShopifyPassword)}
                >
                  {showShopifyPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Connect Shopify
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : selectedCMSType === 'custom-api' ? (
          <div className="space-y-4">
            {generatedApiKey ? (
              <>
                <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    ⚠️ Save this key now - you won't see it again!
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedApiKey}
                      readOnly
                      type={showApiKey ? "text" : "password"}
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generatedApiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm font-medium mb-2">Next Steps:</p>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Copy and securely store your API key</li>
                    <li>Visit the API Documentation to learn how to use the API</li>
                    <li>Start integrating with your custom application</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => window.open('/api', '_blank')} className="flex-1">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View API Documentation
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Custom API integration allows you to programmatically access your SEO data. 
                  Generate an API key to get started.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="apiKeyName">API Key Name</Label>
                  <Input
                    id="apiKeyName"
                    placeholder="e.g., Production API, Development"
                    value={apiKeyName}
                    onChange={(e) => setApiKeyName(e.target.value)}
                  />
                </div>
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm font-medium mb-2">Next Steps:</p>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Enter a name for your API key</li>
                    <li>Click "Generate API Key" below</li>
                    <li>Visit the API Documentation to learn how to use the API</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateApiKey}
                    disabled={generateApiKeyMutation.isPending}
                    className="flex-1"
                  >
                    {generateApiKeyMutation.isPending ? 'Generating...' : 'Generate API Key'}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
