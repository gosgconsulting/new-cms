/**
 * Tenant Service
 * Centralized API calls for tenant-related operations with consistent error handling
 */

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
}

// Re-export ComponentSchema from schema types for consistency
import type { ComponentSchema } from "../../sparti-cms/types/schema";

// Re-export for convenience
export type { ComponentSchema };

/**
 * Fetch all tenants from the API
 * Tries multiple endpoints with fallback logic
 */
export async function fetchTenants(): Promise<Tenant[]> {
  const urls = ["/api/tenants", "/api/public/tenants"];
  
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        let data: any[] = [];
        
        if (Array.isArray(json)) {
          data = json;
        } else if (Array.isArray(json?.data)) {
          data = json.data;
        }
        
        if (data.length > 0) {
          // Normalize tenant data to consistent format
          return data.map((t: any) => ({
            id: String(t.id ?? t.tenantId ?? t.slug ?? t.name ?? Math.random()),
            name: String(t.name ?? t.slug ?? t.id ?? "Tenant"),
            slug: t.slug ?? t.name ?? t.id,
          }));
        }
      }
    } catch (error) {
      console.error(`[testing] Failed to fetch tenants from ${url}:`, error);
      // Continue to next URL
    }
  }
  
  return [];
}

/**
 * Fetch component schema for a specific tenant
 * Tries multiple endpoint patterns with fallback logic
 */
export async function fetchTenantComponent(
  tenantId: string,
  componentId: string,
  componentKey?: string
): Promise<ComponentSchema | null> {
  if (!tenantId || !componentId) {
    return null;
  }

  // Build list of URLs to try
  const urls: string[] = [
    `/api/tenants/${encodeURIComponent(tenantId)}/components/${encodeURIComponent(componentId)}`,
  ];

  // Add schema-based URLs if componentKey is provided
  if (componentKey) {
    urls.push(
      `/api/tenants/${encodeURIComponent(tenantId)}/schemas/${encodeURIComponent(componentKey)}`,
      `/api/public/tenants/${encodeURIComponent(tenantId)}/schemas/${encodeURIComponent(componentKey)}`
    );
  }

  // Try each URL in order
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        // Accept schema under common keys
        const found = data?.schema ?? data?.component ?? data?.schema_value ?? data ?? null;
        if (found) {
          return found;
        }
      }
    } catch (error) {
      console.error(`[testing] Failed to fetch component from ${url}:`, error);
      // Continue to next URL
    }
  }

  return null;
}

