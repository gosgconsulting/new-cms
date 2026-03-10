import { useEffect } from 'react';

/**
 * Hook to listen for tenant changes and execute a callback
 * @param callback Function to execute when tenant changes
 */
export const useTenantChangeEffect = (callback: (tenantId: string) => void) => {
  useEffect(() => {
    const handleTenantChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ tenantId: string }>;
      callback(customEvent.detail.tenantId);
    };

    document.addEventListener('tenant-changed', handleTenantChange);
    
    return () => {
      document.removeEventListener('tenant-changed', handleTenantChange);
    };
  }, [callback]);
};

export default useTenantChangeEffect;

