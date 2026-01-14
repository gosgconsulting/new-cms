import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, CheckCircle, XCircle, Save } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentMethodsManagerProps {
  currentTenantId: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  icon?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    enabled: false,
    description: 'Accept payments via Stripe (credit cards, debit cards, etc.)',
  },
  {
    id: 'paystack',
    name: 'Paystack',
    enabled: false,
    description: 'Accept payments via Paystack (popular in Africa)',
  },
  {
    id: 'cash',
    name: 'Cash on Delivery',
    enabled: false,
    description: 'Allow customers to pay with cash upon delivery',
  },
];

export default function PaymentMethodsManager({ currentTenantId }: PaymentMethodsManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(PAYMENT_METHODS);
  const queryClient = useQueryClient();

  // Fetch payment method settings from site_settings
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['payment-methods-settings', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      
      const response = await api.get(`/api/settings/site-settings-by-tenant/${currentTenantId}`, { tenantId: currentTenantId });
      if (!response.ok) {
        throw new Error('Failed to fetch payment method settings');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!currentTenantId,
  });

  // Update payment methods from settings
  useEffect(() => {
    if (settings && settings.length > 0) {
      const updatedMethods = paymentMethods.map(method => {
        const setting = settings.find((s: any) => s.setting_key === `shop_payment_method_${method.id}_enabled`);
        return {
          ...method,
          enabled: setting ? setting.setting_value === 'true' : false,
        };
      });
      setPaymentMethods(updatedMethods);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (method: PaymentMethod) => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }

      // Save enabled status to site_settings using PUT endpoint
      const response = await api.put(
        `/api/settings/site-settings/shop_payment_method_${method.id}_enabled`,
        {
          setting_value: method.enabled ? 'true' : 'false',
          setting_type: 'text',
          setting_category: 'shop_payment_methods',
        },
        { tenantId: currentTenantId }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save payment method setting');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods-settings', currentTenantId] });
    },
  });

  const handleToggle = (methodId: string) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === methodId
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
  };

  const handleSave = async (method: PaymentMethod) => {
    try {
      await saveMutation.mutateAsync(method);
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      alert(error.message || 'Failed to save payment method setting');
    }
  };

  const handleSaveAll = async () => {
    try {
      await Promise.all(
        paymentMethods.map(method => saveMutation.mutateAsync(method))
      );
    } catch (error: any) {
      console.error('Error saving payment methods:', error);
      alert(error.message || 'Failed to save payment method settings');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading payment methods...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">Configure available payment methods for your store</p>
        </div>
        <Button onClick={handleSaveAll} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save All
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          Enable payment methods that you want to offer to your customers. Make sure to configure Stripe Connect in Settings → Stripe Connect before enabling Stripe payments.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paymentMethods.map((method) => (
          <Card key={method.id} className={method.enabled ? 'border-green-200 bg-green-50/30' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6" />
                  <CardTitle>{method.name}</CardTitle>
                </div>
                <Badge variant={method.enabled ? 'default' : 'secondary'}>
                  {method.enabled ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Disabled
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{method.description}</p>
              
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

              <Button
                onClick={() => handleSave(method)}
                disabled={saveMutation.isPending}
                className="w-full"
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                Save {method.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
