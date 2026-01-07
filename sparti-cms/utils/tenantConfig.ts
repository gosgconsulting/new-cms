/**
 * Tenant Configuration Utility
 * 
 * Gets the tenant ID from environment variables or window object
 * Used for theme deployments where CMS_TENANT is set
 */

/**
 * Get the tenant ID from environment
 * Priority:
 * 1. window.__CMS_TENANT__ (injected at build time for theme deployments)
 * 2. import.meta.env.CMS_TENANT (Vite environment variable)
 * 3. null (fallback)
 */
export function getTenantId(): string | null {
  // Check window object (injected at build time for theme deployments)
  if (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) {
    return (window as any).__CMS_TENANT__;
  }
  
  // Check Vite environment variable
  if (import.meta.env.CMS_TENANT) {
    return import.meta.env.CMS_TENANT;
  }
  
  return null;
}

/**
 * Get the tenant ID with fallback
 */
export function getTenantIdWithFallback(fallback: string): string {
  return getTenantId() || fallback;
}

