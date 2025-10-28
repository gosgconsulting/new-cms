import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../src/components/ui/dropdown-menu';
import { api } from '../../utils/api';

interface Tenant {
  id: string;
  name: string;
}

interface TenantSelectorProps {
  currentTenantId: string;
  onTenantChange: (tenantId: string) => void;
  isSuperAdmin: boolean;
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({
  currentTenantId,
  onTenantChange,
  isSuperAdmin
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.get('/api/tenants');
        if (response.ok) {
          const data = await response.json();
          setTenants(data);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const currentTenant = tenants.find(t => t.id === currentTenantId);

  if (!isSuperAdmin) {
    // For non-super-admins, just show their tenant name
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
        <Building2 className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentTenant?.name || currentTenantId}
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
        <Building2 className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentTenant?.name || currentTenantId}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => onTenantChange(tenant.id)}
            className={tenant.id === currentTenantId ? 'bg-gray-100' : ''}
          >
            <Building2 className="h-4 w-4 mr-2" />
            <span className="text-sm">{tenant.name}</span>
            {tenant.id === currentTenantId && (
              <span className="ml-auto text-xs text-gray-500">Current</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TenantSelector;
