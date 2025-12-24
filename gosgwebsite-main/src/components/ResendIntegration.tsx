/**
 * Resend Integration Component
 * Manages Resend domains, DNS records, and SMTP configuration
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  resendDomainsClient, 
  type ResendDomain, 
  type DNSRecord, 
  type SMTPConfig,
  type CreateDomainRequest 
} from '@/integrations';
import { 
  Mail, 
  Globe, 
  Plus, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle, 
  Settings, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

export const ResendIntegration: React.FC = () => {
  const [domains, setDomains] = useState<ResendDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [showSMTPConfig, setShowSMTPConfig] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<ResendDomain | null>(null);
  const [copiedText, setCopiedText] = useState<string>('');

  const isConfigured = resendDomainsClient.isConfigured();
  const smtpConfig = resendDomainsClient.getSMTPConfig();

  useEffect(() => {
    if (isConfigured) {
      loadDomains();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const loadDomains = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('[testing] Loading Resend domains...');
      const domainsData = await resendDomainsClient.getDomains();
      setDomains(domainsData);
      console.log('[testing] Domains loaded:', domainsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load domains';
      setError(errorMessage);
      console.error('[testing] Error loading domains:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      console.log('[testing] Verifying domain:', domainId);
      await resendDomainsClient.verifyDomain(domainId);
      await loadDomains(); // Refresh the list
      console.log('[testing] Domain verification initiated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify domain';
      setError(errorMessage);
      console.error('[testing] Error verifying domain:', err);
    }
  };

  const handleDeleteDomain = async (domainId: string, domainName: string) => {
    if (!confirm(`Are you sure you want to delete the domain "${domainName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('[testing] Deleting domain:', domainId);
      await resendDomainsClient.deleteDomain(domainId);
      await loadDomains(); // Refresh the list
      console.log('[testing] Domain deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete domain';
      setError(errorMessage);
      console.error('[testing] Error deleting domain:', err);
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

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Resend Integration
          </CardTitle>
          <CardDescription>
            Email delivery service with domain management and SMTP support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">API Key Required</h3>
            <p className="text-gray-600 mb-4">
              Configure your Resend API key to manage domains and SMTP settings.
            </p>
            <p className="text-sm text-gray-500">
              Set the <code className="bg-gray-100 px-2 py-1 rounded">VITE_RESEND_API_KEY</code> environment variable.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Resend Integration
          </h3>
          <p className="text-sm text-gray-600">
            Manage domains, DNS records, and SMTP configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSMTPConfig(true)}>
            <Settings className="h-4 w-4 mr-2" />
            SMTP Config
          </Button>
          <Button variant="outline" size="sm" onClick={loadDomains} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domains List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Domains</CardTitle>
              <CardDescription>
                Manage your sending domains and DNS verification
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDomain(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Domains Added</h3>
              <p className="text-gray-600 mb-4">
                Add your first domain to start sending emails with Resend.
              </p>
              <Button onClick={() => setShowAddDomain(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Domain
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <DomainCard
                  key={domain.id}
                  domain={domain}
                  onVerify={() => handleVerifyDomain(domain.id)}
                  onDelete={() => handleDeleteDomain(domain.id, domain.name)}
                  onViewDetails={() => setSelectedDomain(domain)}
                  onCopy={copyToClipboard}
                  copiedText={copiedText}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Domain Modal */}
      {showAddDomain && (
        <AddDomainModal
          onClose={() => setShowAddDomain(false)}
          onSuccess={() => {
            setShowAddDomain(false);
            loadDomains();
          }}
        />
      )}

      {/* SMTP Configuration Modal */}
      {showSMTPConfig && (
        <SMTPConfigModal
          config={smtpConfig}
          onClose={() => setShowSMTPConfig(false)}
          onCopy={copyToClipboard}
          copiedText={copiedText}
        />
      )}

      {/* Domain Details Modal */}
      {selectedDomain && (
        <DomainDetailsModal
          domain={selectedDomain}
          onClose={() => setSelectedDomain(null)}
          onCopy={copyToClipboard}
          copiedText={copiedText}
        />
      )}
    </div>
  );
};

// Domain Card Component
const DomainCard: React.FC<{
  domain: ResendDomain;
  onVerify: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onCopy: (text: string, label: string) => void;
  copiedText: string;
}> = ({ domain, onVerify, onDelete, onViewDetails, onCopy, copiedText }) => {
  const statusColor = resendDomainsClient.getStatusColor(domain.status);
  const statusText = resendDomainsClient.getStatusText(domain.status);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{domain.name}</h3>
            <p className="text-sm text-gray-500">
              Added {new Date(domain.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge className={statusColor}>
          {statusText}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span>Region: {domain.region}</span>
          {domain.dns_records && (
            <span className="ml-4">
              DNS Records: {domain.dns_records.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>
          {domain.status !== 'verified' && (
            <Button variant="outline" size="sm" onClick={onVerify}>
              Verify
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Add Domain Modal Component
const AddDomainModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateDomainRequest>({
    name: '',
    region: 'us-east-1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('[testing] Creating domain:', formData);
      await resendDomainsClient.createDomain(formData);
      console.log('[testing] Domain created successfully');
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create domain';
      setError(errorMessage);
      console.error('[testing] Error creating domain:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Domain</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain Name *
            </label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="mail.yourdomain.com"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: Use a subdomain like mail.yourdomain.com
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value as 'us-east-1' | 'eu-west-1' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="eu-west-1">EU West (Ireland)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Domain'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// SMTP Configuration Modal Component
const SMTPConfigModal: React.FC<{
  config: SMTPConfig;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
  copiedText: string;
}> = ({ config, onClose, onCopy, copiedText }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">SMTP Configuration</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-6">
          {/* SMTP Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">SMTP Settings</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                  <div className="flex items-center gap-2">
                    <Input value={config.host} readOnly className="bg-white" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCopy(config.host, 'host')}
                    >
                      {copiedText === 'host' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <Input value={config.username} readOnly className="bg-white" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCopy(config.username, 'username')}
                    >
                      {copiedText === 'username' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (API Key)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={config.password}
                    readOnly
                    className="bg-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(config.password, 'password')}
                  >
                    {copiedText === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Ports</label>
                <div className="flex flex-wrap gap-2">
                  {config.port.map((port) => (
                    <Badge key={port} variant="outline" className="cursor-pointer"
                      onClick={() => onCopy(port.toString(), `port-${port}`)}>
                      {port} {copiedText === `port-${port}` && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security</label>
                <div className="flex flex-wrap gap-2">
                  {config.security.map((sec) => (
                    <Badge key={sec} variant="outline">
                      {sec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Usage Examples</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">Node.js (Nodemailer)</p>
                <pre className="bg-white p-3 rounded border text-xs overflow-x-auto mt-1">
{`const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: '${config.host}',
  port: 587,
  secure: false,
  auth: {
    user: '${config.username}',
    pass: '${config.password.substring(0, 8)}...'
  }
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Domain Details Modal Component
const DomainDetailsModal: React.FC<{
  domain: ResendDomain;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
  copiedText: string;
}> = ({ domain, onClose, onCopy, copiedText }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{domain.name}</h3>
            <p className="text-sm text-gray-600">Domain Details & DNS Records</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-6">
          {/* Domain Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Domain Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Badge className={resendDomainsClient.getStatusColor(domain.status)}>
                  {resendDomainsClient.getStatusText(domain.status)}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <p className="text-sm text-gray-900">{domain.region}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(domain.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Domain ID</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900 font-mono">{domain.id.substring(0, 8)}...</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(domain.id, 'domain-id')}
                  >
                    {copiedText === 'domain-id' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* DNS Records */}
          {domain.dns_records && domain.dns_records.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">DNS Records</h4>
              <p className="text-sm text-gray-600 mb-4">
                Add these DNS records to your domain's DNS settings to verify ownership and enable email sending.
              </p>
              <div className="space-y-3">
                {domain.dns_records.map((record, index) => (
                  <div key={index} className="bg-white rounded border p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{record.type}</Badge>
                        <Badge className={resendDomainsClient.getStatusColor(record.status)}>
                          {resendDomainsClient.getStatusText(record.status)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(resendDomainsClient.formatDNSRecord(record), `dns-${index}`)}
                      >
                        {copiedText === `dns-${index}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 font-mono text-gray-900">{record.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Value:</span>
                        <span className="ml-2 font-mono text-gray-900 break-all">{record.value}</span>
                      </div>
                      {record.priority && (
                        <div>
                          <span className="font-medium text-gray-700">Priority:</span>
                          <span className="ml-2 text-gray-900">{record.priority}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Copy the DNS records above</li>
              <li>Add them to your domain's DNS settings (e.g., Cloudflare, Route 53)</li>
              <li>Wait for DNS propagation (usually 5-30 minutes)</li>
              <li>Click "Verify" to check the records</li>
              <li>Once verified, you can start sending emails from this domain</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
