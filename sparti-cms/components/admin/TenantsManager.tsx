import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Database, 
  Key,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

// Tenant type definition
interface Tenant {
  id: string;
  name: string;
  plan: string;
  status: 'active' | 'maintenance' | 'suspended';
  createdAt: string;
  description?: string;
  databaseUrl?: string;
  apiKey?: string;
}

// Sample tenant data (in a real app, this would come from an API)
const initialTenants: Tenant[] = [
  { 
    id: 'tenant-1', 
    name: 'Main Website', 
    plan: 'Standard', 
    status: 'active',
    createdAt: '2023-10-15',
    description: 'Main company website with blog and contact forms'
  },
  { 
    id: 'tenant-2', 
    name: 'E-commerce Store', 
    plan: 'Premium', 
    status: 'active',
    createdAt: '2023-11-20',
    description: 'Online store with product catalog and checkout'
  },
  { 
    id: 'tenant-3', 
    name: 'Blog Platform', 
    plan: 'Basic', 
    status: 'active',
    createdAt: '2024-01-05',
    description: 'Content publishing platform for the marketing team'
  },
  { 
    id: 'tenant-4', 
    name: 'Marketing Site', 
    plan: 'Standard', 
    status: 'maintenance',
    createdAt: '2024-02-10',
    description: 'Campaign landing pages and marketing materials'
  },
];

const TenantsManager: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
    name: '',
    plan: 'Standard',
    status: 'active',
    description: ''
  });
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input change for new tenant form
  const handleInputChange = (field: string, value: any) => {
    setNewTenant(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new tenant
  const handleAddTenant = () => {
    if (!newTenant.name) return;
    
    const tenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: newTenant.name || '',
      plan: newTenant.plan || 'Standard',
      status: newTenant.status as 'active' | 'maintenance' | 'suspended' || 'active',
      createdAt: new Date().toISOString().split('T')[0],
      description: newTenant.description
    };
    
    setTenants([...tenants, tenant]);
    setShowAddTenantModal(false);
    setNewTenant({
      name: '',
      plan: 'Standard',
      status: 'active',
      description: ''
    });
  };

  // Delete tenant
  const handleDeleteTenant = () => {
    if (!selectedTenant) return;
    
    setTenants(tenants.filter(tenant => tenant.id !== selectedTenant.id));
    setShowDeleteConfirmModal(false);
    setSelectedTenant(null);
  };

  // Generate API key
  const generateApiKey = () => {
    if (!selectedTenant) return;
    
    setIsGenerating(true);
    
    // Simulate API key generation
    setTimeout(() => {
      const newApiKey = `tenant_${selectedTenant.id}_${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(newApiKey);
      setIsGenerating(false);
    }, 800);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // View database details
  const handleViewDatabase = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDatabaseModal(true);
  };

  // View API key
  const handleViewApiKey = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowApiKeyModal(true);
    setApiKey(''); // Reset API key
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-300';
      case 'maintenance':
        return 'bg-amber-500/10 text-amber-700 border-amber-300';
      case 'suspended':
        return 'bg-red-500/10 text-red-700 border-red-300';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tenant Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your tenants, databases, and API keys
          </p>
        </div>
        <Button onClick={() => setShowAddTenantModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-brandTeal" />
                  <CardTitle className="text-lg">{tenant.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(tenant.status)}>
                  {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                </Badge>
              </div>
              <CardDescription className="mt-1.5">
                {tenant.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 mb-4">
                <div>
                  <span className="font-medium">Plan:</span> {tenant.plan}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {tenant.createdAt}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleViewDatabase(tenant)}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleViewApiKey(tenant)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  API Key
                </Button>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedTenant(tenant);
                      setNewTenant(tenant);
                      setShowAddTenantModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setSelectedTenant(tenant);
                      setShowDeleteConfirmModal(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Tenant Modal */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedTenant ? 'Edit Tenant' : 'Add New Tenant'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tenant-name">Tenant Name</Label>
                <Input 
                  id="tenant-name"
                  value={newTenant.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter tenant name"
                />
              </div>
              
              <div>
                <Label htmlFor="tenant-description">Description</Label>
                <Input 
                  id="tenant-description"
                  value={newTenant.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter tenant description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenant-plan">Plan</Label>
                  <select
                    id="tenant-plan"
                    value={newTenant.plan}
                    onChange={(e) => handleInputChange('plan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="tenant-status">Status</Label>
                  <select
                    id="tenant-status"
                    value={newTenant.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddTenantModal(false);
                  setSelectedTenant(null);
                  setNewTenant({
                    name: '',
                    plan: 'Standard',
                    status: 'active',
                    description: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTenant}>
                {selectedTenant ? 'Update Tenant' : 'Add Tenant'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the tenant "{selectedTenant?.name}"? 
              This action cannot be undone and will delete all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setSelectedTenant(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteTenant}
              >
                Delete Tenant
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Database Modal */}
      {showDatabaseModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Database Details: {selectedTenant.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Database Type</Label>
                <div className="mt-1 flex items-center">
                  <Database className="h-4 w-4 mr-2 text-brandTeal" />
                  <span>PostgreSQL</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <div className="mt-1 flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${selectedTenant.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span>{selectedTenant.status.charAt(0).toUpperCase() + selectedTenant.status.slice(1)}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Connection String</Label>
                <div className="mt-1 flex">
                  <Input
                    type="text"
                    readOnly
                    value={selectedTenant.databaseUrl || `postgresql://user:password@database.railway.app:5432/${selectedTenant.name.toLowerCase().replace(/\s+/g, '_')}`}
                    className="w-full rounded-r-none"
                  />
                  <Button 
                    className="rounded-l-none"
                    onClick={() => copyToClipboard(selectedTenant.databaseUrl || `postgresql://user:password@database.railway.app:5432/${selectedTenant.name.toLowerCase().replace(/\s+/g, '_')}`)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Database Information</Label>
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Host:</span> database.railway.app
                  </div>
                  <div>
                    <span className="font-medium">Port:</span> 5432
                  </div>
                  <div>
                    <span className="font-medium">Database:</span> {selectedTenant.name.toLowerCase().replace(/\s+/g, '_')}
                  </div>
                  <div>
                    <span className="font-medium">User:</span> postgres
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDatabaseModal(false);
                  setSelectedTenant(null);
                }}
              >
                Close
              </Button>
              <Button onClick={() => {
                setShowDatabaseModal(false);
                handleViewApiKey(selectedTenant);
              }}>
                <Key className="h-4 w-4 mr-2" />
                View API Key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              API Key for {selectedTenant.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate an API key to establish a secure connection between the CMS and this tenant's database.
            </p>

            {apiKey ? (
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Your API Key
                </Label>
                <div className="flex">
                  <Input
                    type="text"
                    readOnly
                    value={apiKey}
                    className="w-full rounded-r-none"
                  />
                  <Button 
                    className="rounded-l-none"
                    onClick={() => copyToClipboard(apiKey)}
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
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate API Key'
                  )}
                </Button>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setSelectedTenant(null);
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
    </div>
  );
};

export default TenantsManager;
