import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Tenant type definition
export interface Tenant {
  id: string;
  name: string;
  plan: string;
  status: 'active' | 'maintenance' | 'suspended';
  createdAt: string;
  description?: string;
  databaseUrl?: string;
  apiKey?: string;
}

interface PostgresIntegrationProps {
  tenant: Tenant;
  onViewClick?: () => void;
}

/**
 * PostgreSQL Integration component that displays tenant information
 */
export const PostgresIntegration: React.FC<PostgresIntegrationProps> = ({ tenant, onViewClick }) => {
  const navigate = useNavigate();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick();
    } else {
      navigate('/database-viewer');
    }
  };

  const handleApiClick = () => {
    setShowApiKeyModal(true);
  };

  const generateApiKey = () => {
    setIsGenerating(true);
    
    // Simulate API key generation
    setTimeout(() => {
      const newApiKey = `tenant_${tenant.id}_${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(newApiKey);
      setIsGenerating(false);
    }, 800);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    // You could add a toast notification here
  };
  
  return (
    <>
      <div className="border rounded-lg p-4 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">PostgreSQL Database</h3>
              <Badge variant="outline" className={`${tenant.status === 'active' ? 'bg-green-500/10 text-green-700 border-green-300' : 'bg-amber-500/10 text-amber-700 border-amber-300'}`}>
                Tenant: {tenant.name}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {tenant.description || 'Database for storing project data, user information, and content'}
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Type: Database</span>
              <span>Provider: Railway</span>
              <span>Plan: {tenant.plan}</span>
              <span>Status: {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleApiClick}>
            <Key className="h-4 w-4 mr-1" />
            API
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewClick}>
            View
          </Button>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create API Key for {tenant.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate an API key to establish a secure connection between the CMS and this tenant's database.
            </p>

            {apiKey ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your API Key
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={apiKey}
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                  />
                  <Button 
                    onClick={copyToClipboard}
                    className="rounded-l-none"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Store this key securely. For security reasons, it won't be displayed again.
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Click the button below to generate a new API key.
                </p>
                <Button 
                  onClick={generateApiKey}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate API Key'}
                </Button>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setApiKey('');
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * PostgreSQL Integration list item for modals
 */
export const PostgresIntegrationListItem: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  return (
    <li>• PostgreSQL Database (Active - Tenant: {tenant.name})</li>
  );
};

export default PostgresIntegration;
