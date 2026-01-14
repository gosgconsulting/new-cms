import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShippingMethodsManagerProps {
  currentTenantId: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  type: 'flat_rate' | 'free' | 'weight_based';
  rate: number;
  enabled: boolean;
  description?: string;
}

const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'free_shipping',
    name: 'Free Shipping',
    type: 'free',
    rate: 0,
    enabled: false,
    description: 'Free shipping for all orders',
  },
  {
    id: 'flat_rate',
    name: 'Flat Rate',
    type: 'flat_rate',
    rate: 10,
    enabled: false,
    description: 'Fixed shipping rate for all orders',
  },
];

export default function ShippingMethodsManager({ currentTenantId }: ShippingMethodsManagerProps) {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(DEFAULT_SHIPPING_METHODS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState<Partial<ShippingMethod>>({
    name: '',
    type: 'flat_rate',
    rate: 0,
    enabled: true,
    description: '',
  });
  const queryClient = useQueryClient();

  // Fetch shipping method settings from site_settings
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['shipping-methods-settings', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      
      const response = await api.get(`/api/settings/site-settings-by-tenant/${currentTenantId}`, { tenantId: currentTenantId });
      if (!response.ok) {
        throw new Error('Failed to fetch shipping method settings');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!currentTenantId,
  });

  // Update shipping methods from settings
  useEffect(() => {
    if (settings && settings.length > 0) {
      try {
        const methodsSetting = settings.find((s: any) => s.setting_key === 'shop_shipping_methods');
        if (methodsSetting && methodsSetting.setting_value) {
          const methods = JSON.parse(methodsSetting.setting_value);
          setShippingMethods(methods);
        } else {
          // If no saved methods, use defaults
          setShippingMethods(DEFAULT_SHIPPING_METHODS);
        }
      } catch (error) {
        console.error('Error parsing shipping methods:', error);
        // On error, use defaults
        setShippingMethods(DEFAULT_SHIPPING_METHODS);
      }
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (methods: ShippingMethod[]) => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }

      // Save all shipping methods as JSON in site_settings using PUT endpoint
      const response = await api.put(
        '/api/settings/site-settings/shop_shipping_methods',
        {
          setting_value: JSON.stringify(methods),
          setting_type: 'json',
          setting_category: 'shop_shipping_methods',
        },
        { tenantId: currentTenantId }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save shipping methods');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods-settings', currentTenantId] });
      setShowAddForm(false);
      setEditingId(null);
    },
  });

  const handleToggle = (methodId: string) => {
    setShippingMethods(prev =>
      prev.map(method =>
        method.id === methodId
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingId(method.id);
    setNewMethod(method);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // Update existing method
        const updated = shippingMethods.map(method =>
          method.id === editingId ? { ...newMethod, id: editingId } as ShippingMethod : method
        );
        await saveMutation.mutateAsync(updated);
      } else {
        // Add new method
        const newId = `custom_${Date.now()}`;
        const methodToAdd: ShippingMethod = {
          id: newId,
          name: newMethod.name || 'New Shipping Method',
          type: newMethod.type || 'flat_rate',
          rate: newMethod.rate || 0,
          enabled: newMethod.enabled ?? true,
          description: newMethod.description,
        } as ShippingMethod;
        await saveMutation.mutateAsync([...shippingMethods, methodToAdd]);
        setNewMethod({
          name: '',
          type: 'flat_rate',
          rate: 0,
          enabled: true,
          description: '',
        });
      }
    } catch (error: any) {
      console.error('Error saving shipping method:', error);
      alert(error.message || 'Failed to save shipping method');
    }
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this shipping method?')) {
      return;
    }

    try {
      const updated = shippingMethods.filter(method => method.id !== methodId);
      await saveMutation.mutateAsync(updated);
    } catch (error: any) {
      console.error('Error deleting shipping method:', error);
      alert(error.message || 'Failed to delete shipping method');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setNewMethod({
      name: '',
      type: 'flat_rate',
      rate: 0,
      enabled: true,
      description: '',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading shipping methods...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping Methods</h1>
          <p className="text-muted-foreground mt-1">Configure shipping options for your store</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm || editingId !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Method
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          Configure shipping methods that customers can choose at checkout. You can set flat rates, free shipping, or weight-based rates.
        </AlertDescription>
      </Alert>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Shipping Method' : 'Add Shipping Method'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Method Name *</Label>
              <Input
                id="name"
                value={newMethod.name || ''}
                onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                placeholder="e.g., Standard Shipping"
              />
            </div>

            <div>
              <Label htmlFor="type">Shipping Type *</Label>
              <select
                id="type"
                value={newMethod.type || 'flat_rate'}
                onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="flat_rate">Flat Rate</option>
                <option value="free">Free Shipping</option>
                <option value="weight_based">Weight Based</option>
              </select>
            </div>

            {newMethod.type !== 'free' && (
              <div>
                <Label htmlFor="rate">Rate ($) *</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newMethod.rate || 0}
                  onChange={(e) => setNewMethod({ ...newMethod, rate: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newMethod.description || ''}
                onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            <div className="flex items-center gap-4">
              <Label htmlFor="enabled" className="cursor-pointer">
                <input
                  id="enabled"
                  type="checkbox"
                  checked={newMethod.enabled ?? true}
                  onChange={(e) => setNewMethod({ ...newMethod, enabled: e.target.checked })}
                  className="mr-2"
                />
                Enabled
              </Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saveMutation.isPending || !newMethod.name}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipping Methods List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shippingMethods.map((method) => (
          <Card key={method.id} className={method.enabled ? 'border-green-200 bg-green-50/30' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6" />
                  <CardTitle>{method.name}</CardTitle>
                </div>
                <Badge variant={method.enabled ? 'default' : 'secondary'}>
                  {method.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{method.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium">
                    {method.type === 'free' ? 'Free' : `$${method.rate.toFixed(2)}`}
                  </span>
                </div>
                {method.description && (
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Label htmlFor={`toggle-${method.id}`} className="cursor-pointer">
                  Enable {method.name}
                </Label>
                <button
                  type="button"
                  onClick={() => handleToggle(method.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    method.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(method)}
                  variant="outline"
                  size="sm"
                  disabled={editingId !== null || showAddForm}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {!method.id.startsWith('free_shipping') && method.id !== 'flat_rate' && (
                  <Button
                    onClick={() => handleDelete(method.id)}
                    variant="outline"
                    size="sm"
                    disabled={editingId !== null || showAddForm}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shippingMethods.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No shipping methods configured</p>
            <Button onClick={() => setShowAddForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add First Shipping Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
