import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronsUpDown, Building2, Check } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../../src/components/ui/dropdown-menu';
import { api } from '../../utils/api';

interface Tenant {
  id: string;
  name: string;
  isDevelopment?: boolean;
}

interface TenantSelectorProps {
  currentTenantId: string;
  onTenantChange: (tenantId: string) => void;
  isSuperAdmin: boolean;
  onAddNewTenant?: () => void;
  mode?: 'tenants' | 'theme';
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({
  currentTenantId,
  onTenantChange,
  isSuperAdmin,
  onAddNewTenant,
  mode = 'tenants'
}) => {
  // Get themes from file system (hardcoded for now, can be enhanced with API later)
  const getThemes = (): Tenant[] => {
    // Read from sparti-cms/theme folder structure
    // For now, hardcoded since we only have landingpage
    // In the future, this could be an API call to list directories
    return [
      { id: 'landingpage', name: 'Landing Page' }
    ];
  };

  // Fetch all tenants using react-query (same as CMSDashboard)
  const { data: tenants = [], isLoading: loading } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/tenants`);
        if (response.ok) {
          const data = await response.json();
          // Add isDevelopment flag based on tenant id (same as CMSDashboard)
          return data.map((t: any) => ({
            ...t,
            isDevelopment: t.id === 'tenant-dev' || !!t.isDevelopment,
          }));
        } else {
          console.error(`Failed to fetch tenants`);
          return [];
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
        return [];
      }
    },
    enabled: mode === 'tenants',
  });

  // Get the list based on mode
  const items = mode === 'theme' ? getThemes() : tenants;
  const currentItem = items.find(t => t.id === currentTenantId);

  console.log('currentItem', currentTenantId, currentItem);

  if (!isSuperAdmin) {
    // For non-super-admins, just show their tenant/template name
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
        <Building2 className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentItem?.name || currentTenantId}
        </span>
        {currentItem?.isDevelopment && (
          <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Dev</span>
        )}
      </div>
    );
  }

  if (loading && mode === 'tenants') {
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
        <Button variant="outline" className="flex items-center justify-between gap-2 min-w-[200px]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentItem?.name || (mode === 'theme' ? 'Select Theme' : 'Select Tenant')}
            </span>
            {currentItem?.isDevelopment && (
              <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Dev</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{mode === 'theme' ? 'Switch Theme' : 'Switch Tenant'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => onTenantChange(item.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="text-sm">{item.name}</span>
              {item.isDevelopment && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Dev</span>
              )}
            </div>
            {currentTenantId === item.id && (
              <Check className="h-4 w-4 text-brandTeal ml-2" />
            )}
          </DropdownMenuItem>
        ))}
        {onAddNewTenant && mode === 'tenants' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onAddNewTenant}
              className="text-brandPurple hover:text-brandPurple/80"
            >
              + Add New Tenant
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TenantSelector;
