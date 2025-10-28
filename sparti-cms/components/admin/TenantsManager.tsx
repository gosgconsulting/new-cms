import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit, 
  Database, 
  Key,
  Loader2,
  AlertCircle,
  CheckCircle,
  Bug,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '../auth/AuthProvider';

// Simplified Tenant type definition
interface Tenant {
  id: string;
  name: string;
  createdAt: string;
}

const TenantsManager: React.FC = () => {
  const { currentTenantId, user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({ name: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch tenants on component mount
  useEffect(() => {
    if (!user?.is_super_admin) {
      if (currentTenantId) {
        // Fetch the single forced tenant
        const fetchForcedTenant = async () => {
          try {
            setIsLoading(true);
            const response = await fetch(`/api/tenants/${currentTenantId}`);
            if (response.ok) {
              const tenantData = await response.json();
              setTenants([tenantData]);
            } else {
              setFetchError(`Failed to load forced tenant with ID ${currentTenantId}.`);
              setTenants([]);
            }
          } catch (error) {
            setFetchError(error instanceof Error ? error.message : 'Unknown error');
            setTenants([]);
          } finally {
            setIsLoading(false);
          }
        };
        fetchForcedTenant();
      } else {
        setIsLoading(false);
        setTenants([]);
      }
    } else {
      fetchTenants();
    }
  }, [currentTenantId]);

  // Fetch all tenants from the API
  const fetchTenants = async () => {
    if (!user?.is_super_admin) return;
    try {
      setIsLoading(true);
      setFetchError(null);
      
      const response = await fetch('/api/tenants');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch tenants:', response.status, errorText);
        
        const errorMessage = `Failed to load tenants (${response.status}). Please check database connection.`;
        setFetchError(errorMessage);
        
        toast({
          title: "Database Connection Error",
          description: errorMessage,
          variant: "destructive"
        });
        
        // Set empty tenants array
        setTenants([]);
        return;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Expected array of tenants but got:', data);
        setFetchError('Invalid response format. Expected array of tenants.');
        setTenants([]);
        return;
      }
      
      setTenants(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Error",
        description: "Failed to load tenants. Please try again or check console for details.",
        variant: "destructive"
      });
      
      // Set empty tenants array
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change for new tenant form
  const handleInputChange = (field: string, value: string) => {
    setNewTenant(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new tenant
  const handleAddTenant = async () => {
    if (!newTenant.name) {
      toast({
        title: "Validation Error",
        description: "Tenant name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newTenant.name
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tenant');
      }
      
      const createdTenant = await response.json();

      // Add the new tenant to the list
      setTenants(prev => [...prev, createdTenant]);

      // Reset form and close modal
      setNewTenant({ name: '' });
      setShowAddTenantModal(false);
      
      toast({
        title: "Success",
        description: "Tenant created successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tenant",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing tenant
  const handleUpdateTenant = async () => {
    if (!selectedTenant || !newTenant.name) {
      toast({
        title: "Validation Error",
        description: "Tenant name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/tenants/${selectedTenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newTenant.name
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tenant');
      }
      
      const updatedTenant = await response.json();
      
      // Update the tenant in the list
      setTenants(prev => 
        prev.map(tenant => 
          tenant.id === updatedTenant.id ? updatedTenant : tenant
        )
      );
      
      // Reset form and close modal
      setNewTenant({ name: '' });
      setSelectedTenant(null);
      setShowAddTenantModal(false);
      
      toast({
        title: "Success",
        description: "Tenant updated successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tenant",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete tenant
  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      const response = await fetch(`/api/tenants/${selectedTenant.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tenant');
      }
      
      // Remove the tenant from the list
      setTenants(prev => prev.filter(tenant => tenant.id !== selectedTenant.id));
      
      // Close modal and reset selected tenant
      setShowDeleteConfirmModal(false);
      setSelectedTenant(null);
      
      toast({
        title: "Success",
        description: "Tenant deleted successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete tenant",
        variant: "destructive"
      });
    }
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  // Create default tenant
  const createDefaultTenant = async () => {
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'GO SG CONSULTING'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create default tenant');
      }
      
      const createdTenant = await response.json();
      
      // Add the new tenant to the list and refresh
      fetchTenants();
      
      toast({
        title: "Success",
        description: "Default tenant created successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error creating default tenant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create default tenant",
        variant: "destructive"
      });
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
        <div className="flex gap-2">
          <Button onClick={() => fetchTenants()} variant="outline" size="icon" title="Refresh" disabled={!user?.is_super_admin}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowAddTenantModal(true)} disabled={!user?.is_super_admin}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Tenant
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading tenants...</span>
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No tenants found</h3>
          <p className="text-muted-foreground mb-6">Create your first tenant to get started</p>
          <div className="flex flex-col gap-2 items-center">
            <Button onClick={() => setShowAddTenantModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Tenant
            </Button>
            <Button onClick={createDefaultTenant} variant="outline">
              Create Default Tenant (GO SG CONSULTING)
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-brandTeal" />
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-4">
                  <div>
                    <span className="font-medium">Created:</span> {tenant.createdAt}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span> {tenant.id}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setNewTenant({ name: tenant.name });
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
      )}

      {/* Debug Mode Toggle */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleDebugMode}
          >
            <Bug className="h-4 w-4 mr-2" />
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
          </Button>
        </div>
        
        {/* Debug Information */}
        {debugMode && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono overflow-auto">
            <h4 className="font-bold mb-2">Debug Information:</h4>
            <div className="space-y-2">
              <div><strong>API Endpoint:</strong> /api/tenants</div>
              <div><strong>Loading State:</strong> {isLoading ? 'true' : 'false'}</div>
              <div><strong>Error State:</strong> {fetchError ? fetchError : 'none'}</div>
              <div><strong>Tenants Count:</strong> {tenants.length}</div>
              <div><strong>Selected Tenant:</strong> {selectedTenant ? JSON.stringify(selectedTenant) : 'none'}</div>
              <div>
                <strong>Tenants Data:</strong>
                <pre className="mt-1 p-2 bg-gray-200 rounded overflow-auto max-h-40">
                  {JSON.stringify(tenants, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => fetchTenants()}
                >
                  Refresh Data
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={createDefaultTenant}
                >
                  Create Default Tenant
                </Button>
              </div>
            </div>
          </div>
        )}
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
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddTenantModal(false);
                  setSelectedTenant(null);
                  setNewTenant({
                    name: ''
                  });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={selectedTenant ? handleUpdateTenant : handleAddTenant}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {selectedTenant ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  selectedTenant ? 'Update Tenant' : 'Add Tenant'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
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
    </div>
  );
};

export default TenantsManager;
