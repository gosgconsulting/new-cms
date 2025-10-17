/**
 * Generic SMTP Configuration Component
 * Allows configuration of any SMTP provider
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Settings, 
  Save, 
  TestTube, 
  Copy, 
  Check, 
  AlertCircle, 
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  security: 'none' | 'tls' | 'ssl';
  enabled: boolean;
}

export const SMTPConfiguration: React.FC = () => {
  const [config, setConfig] = useState<SMTPConfig>({
    host: '',
    port: 587,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    security: 'tls',
    enabled: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string>('');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      console.log('[testing] Loading SMTP configuration...');
      const response = await fetch('/api/smtp-config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        console.log('[testing] SMTP configuration loaded');
      } else {
        console.log('[testing] No existing SMTP configuration found');
      }
    } catch (error) {
      console.error('[testing] Error loading SMTP configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      console.log('[testing] Saving SMTP configuration...');
      const response = await fetch('/api/smtp-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        console.log('[testing] SMTP configuration saved successfully');
        setTestResult({ success: true, message: 'Configuration saved successfully!' });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('[testing] Error saving SMTP configuration:', error);
      setTestResult({ success: false, message: 'Failed to save configuration' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      console.log('[testing] Testing SMTP connection...');
      const response = await fetch('/api/smtp-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResult({ success: true, message: 'SMTP connection successful!' });
        console.log('[testing] SMTP test successful');
      } else {
        setTestResult({ success: false, message: result.error || 'Connection test failed' });
        console.error('[testing] SMTP test failed:', result.error);
      }
    } catch (error) {
      console.error('[testing] Error testing SMTP connection:', error);
      setTestResult({ success: false, message: 'Failed to test connection' });
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('[testing] Failed to copy to clipboard:', err);
    }
  };

  const handleInputChange = (field: keyof SMTPConfig, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSecurityDescription = (security: string) => {
    switch (security) {
      case 'tls':
        return 'STARTTLS (Recommended for port 587)';
      case 'ssl':
        return 'SSL/TLS (Recommended for port 465)';
      case 'none':
        return 'No encryption (Not recommended)';
      default:
        return '';
    }
  };

  const getCommonProviders = () => [
    {
      name: 'Resend',
      host: 'smtp.resend.com',
      port: 587,
      security: 'tls' as const,
      note: 'Username: resend, Password: Your API Key'
    },
    {
      name: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      security: 'tls' as const,
      note: 'Use App Password, not regular password'
    },
    {
      name: 'Outlook/Hotmail',
      host: 'smtp-mail.outlook.com',
      port: 587,
      security: 'tls' as const,
      note: 'Use your Microsoft account credentials'
    },
    {
      name: 'SendGrid',
      host: 'smtp.sendgrid.net',
      port: 587,
      security: 'tls' as const,
      note: 'Username: apikey, Password: Your API Key'
    },
    {
      name: 'Mailgun',
      host: 'smtp.mailgun.org',
      port: 587,
      security: 'tls' as const,
      note: 'Use your Mailgun SMTP credentials'
    }
  ];

  const applyProviderSettings = (provider: ReturnType<typeof getCommonProviders>[0]) => {
    setConfig(prev => ({
      ...prev,
      host: provider.host,
      port: provider.port,
      security: provider.security
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>Configure your email sending service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure your email sending service using SMTP
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {config.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="smtp-enabled"
              checked={config.enabled}
              onChange={(e) => handleInputChange('enabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="smtp-enabled" className="text-sm font-medium text-gray-700">
              Enable SMTP email sending
            </label>
          </div>

          {config.enabled && (
            <>
              {/* Server Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Server Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host *
                    </label>
                    <Input
                      type="text"
                      value={config.host}
                      onChange={(e) => handleInputChange('host', e.target.value)}
                      placeholder="smtp.example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port *
                    </label>
                    <Input
                      type="number"
                      value={config.port}
                      onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                      placeholder="587"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <Input
                      type="text"
                      value={config.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="your-username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={config.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="your-password"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security
                  </label>
                  <select
                    value={config.security}
                    onChange={(e) => handleInputChange('security', e.target.value as 'none' | 'tls' | 'ssl')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="tls">STARTTLS</option>
                    <option value="ssl">SSL/TLS</option>
                    <option value="none">None</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {getSecurityDescription(config.security)}
                  </p>
                </div>
              </div>

              {/* Email Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Email Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email *
                    </label>
                    <Input
                      type="email"
                      value={config.fromEmail}
                      onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                      placeholder="noreply@yourdomain.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Name
                    </label>
                    <Input
                      type="text"
                      value={config.fromName}
                      onChange={(e) => handleInputChange('fromName', e.target.value)}
                      placeholder="Your Company Name"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button onClick={saveConfiguration} disabled={isSaving}>
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
                
                <Button variant="outline" onClick={testConnection} disabled={isTesting || !config.host}>
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`p-3 rounded-lg border ${
                  testResult.success 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm">{testResult.message}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Common Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Common SMTP Providers</CardTitle>
          <CardDescription>
            Quick setup for popular email service providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCommonProviders().map((provider) => (
              <div key={provider.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{provider.name}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyProviderSettings(provider)}
                  >
                    Use
                  </Button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Host: {provider.host}</p>
                  <p>Port: {provider.port}</p>
                  <p>Security: {provider.security.toUpperCase()}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">{provider.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      {config.enabled && config.host && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
            <CardDescription>
              Current SMTP configuration details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Host:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900">{config.host}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.host, 'host')}
                    >
                      {copiedText === 'host' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Port:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900">{config.port}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.port.toString(), 'port')}
                    >
                      {copiedText === 'port' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Username:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900">{config.username}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.username, 'username')}
                    >
                      {copiedText === 'username' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Security:</span>
                  <span className="ml-2 text-gray-900">{config.security.toUpperCase()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">From Email:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900">{config.fromEmail}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.fromEmail, 'fromEmail')}
                    >
                      {copiedText === 'fromEmail' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">From Name:</span>
                  <span className="ml-2 text-gray-900">{config.fromName || 'Not set'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
