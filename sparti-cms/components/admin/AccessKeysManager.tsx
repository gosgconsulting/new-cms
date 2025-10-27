import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../../../src/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../src/components/ui/alert-dialog';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Key, 
  Calendar, 
  Clock,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../auth/AuthProvider';

interface AccessKey {
  id: number;
  key_name: string;
  access_key: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

interface GenerateKeyData {
  key_name: string;
  access_key: string;
  created_at: string;
}

export const AccessKeysManager: React.FC = () => {
  const { user } = useAuth();
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showGeneratedKey, setShowGeneratedKey] = useState(false);
  const [generatedKeyData, setGeneratedKeyData] = useState<GenerateKeyData | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showFullKeys, setShowFullKeys] = useState<{ [key: number]: boolean }>({});

  // Load access keys on component mount
  useEffect(() => {
    loadAccessKeys();
  }, []);

  const loadAccessKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/access-keys');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load access keys: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAccessKeys(data.access_keys || []);
    } catch (error) {
      console.error('Error loading access keys:', error);
      setError(error instanceof Error ? error.message : 'Failed to load access keys');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Key name is required');
      return;
    }

    try {
      setError(null);
      
      const response = await api.post('/api/access-keys/generate', {
        key_name: newKeyName.trim()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate access key: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedKeyData({
        key_name: data.key_name,
        access_key: data.access_key,
        created_at: data.created_at
      });
      setShowGeneratedKey(true);
      setNewKeyName('');
      setShowGenerateDialog(false);
      
      // Reload the list
      loadAccessKeys();
    } catch (error) {
      console.error('Error generating access key:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate access key');
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    try {
      const response = await api.delete(`/api/access-keys/${keyId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to revoke access key: ${response.status} ${response.statusText}`);
      }

      // Reload the list
      loadAccessKeys();
    } catch (error) {
      console.error('Error revoking access key:', error);
      setError(error instanceof Error ? error.message : 'Failed to revoke access key');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const toggleKeyVisibility = (keyId: number) => {
    setShowFullKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmbedCode = (accessKey: string) => {
    const baseUrl = window.location.origin;
    return `<iframe src="${baseUrl}/embed/pages?access_key=${accessKey}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading access keys...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Access Keys</h2>
            <p className="text-sm text-gray-600 mt-1">
              Generate API keys to embed PagesManager in iframes with full editing capabilities
            </p>
          </div>
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate New Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Access Key</DialogTitle>
                <DialogDescription>
                  Create a new access key for iframe embedding. Give it a descriptive name to identify its purpose.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Website, Development Testing"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateKey}>
                  Generate Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Generated Key Display */}
      {showGeneratedKey && generatedKeyData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Access Key Generated Successfully!
              </h3>
              <p className="text-sm text-green-700 mb-4">
                <strong>Important:</strong> Save this key now - it won't be shown again.
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-green-800">Key Name</Label>
                  <p className="text-sm text-green-700">{generatedKeyData.key_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-800">Access Key</Label>
                  <div className="flex items-center gap-2">
                    <code className="bg-green-100 px-3 py-2 rounded text-sm font-mono text-green-800 flex-1">
                      {generatedKeyData.access_key}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedKeyData.access_key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-800">Iframe Embed Code</Label>
                  <div className="flex items-center gap-2">
                    <code className="bg-green-100 px-3 py-2 rounded text-sm font-mono text-green-800 flex-1 text-xs">
                      {getEmbedCode(generatedKeyData.access_key)}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(getEmbedCode(generatedKeyData.access_key))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGeneratedKey(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Access Keys List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Access Keys</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your access keys. Click on a key to copy it to clipboard.
          </p>
        </div>
        
        <div className="p-6">
          {accessKeys.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No access keys found</p>
              <p className="text-sm text-gray-400">Generate your first access key to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accessKeys.map((key) => (
                <Card key={key.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{key.key_name}</h4>
                        <Badge 
                          variant={key.is_active ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {key.is_active ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-700">
                          {showFullKeys[key.id] ? key.access_key : key.access_key}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {showFullKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(key.access_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {formatDate(key.created_at)}</span>
                        </div>
                        {key.last_used_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Last used: {formatDate(key.last_used_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/embed/pages?access_key=${key.access_key}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      {key.is_active && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Access Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke "{key.key_name}"? This action cannot be undone and will immediately disable the key.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeKey(key.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Revoke Key
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Use Access Keys</h3>
        <div className="space-y-3 text-sm text-blue-700">
          <p>
            <strong>1. Generate a Key:</strong> Click "Generate New Key" and give it a descriptive name.
          </p>
          <p>
            <strong>2. Copy the Key:</strong> Save the generated access key securely - it won't be shown again.
          </p>
          <p>
            <strong>3. Embed in Iframe:</strong> Use the provided embed code or create your own iframe with the access key as a query parameter.
          </p>
          <p>
            <strong>4. Full Access:</strong> The iframe will have full editing capabilities as if the user was logged in normally.
          </p>
          <p>
            <strong>5. Security:</strong> Access keys are permanent until manually revoked. Keep them secure and revoke unused keys.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessKeysManager;
