import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Key } from 'lucide-react';
import { Tenant } from './PostgresIntegration';

interface WooCommerceIntegrationProps {
  tenant: Tenant;
}

/**
 * WooCommerce Integration component that displays integration status
 */
export const WooCommerceIntegration: React.FC<WooCommerceIntegrationProps> = ({ tenant }) => {
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check integration status
  useEffect(() => {
    if (!tenant || tenant.isTheme) {
      setIsActive(false);
      setIsLoading(false);
      return;
    }

    const checkIntegrationStatus = async () => {
      try {
        const token = localStorage.getItem('sparti-user-session');
        const authToken = token ? JSON.parse(token).token : null;
        
        const response = await fetch(`/api/tenants/${tenant.id}/integrations/woocommerce`, {
          headers: {
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsActive(data.is_active || false);
        } else {
          setIsActive(false);
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

  if (!tenant) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
        <p>No tenant data available</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-orange-600" />
        </div>
        <div>
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
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Type: E-commerce</span>
            <span>Provider: WooCommerce</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!isActive}>
          <Key className="h-4 w-4 mr-1" />
          API
        </Button>
      </div>
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

