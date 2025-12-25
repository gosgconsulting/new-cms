/**
 * useTenantComponent Hook
 * Loads component schema for a specific tenant
 */

import { useState, useEffect } from "react";
import { fetchTenantComponent, type ComponentSchema } from "../services/tenantService";
import { getComponentKey } from "../utils/componentKeyMapper";

export interface UseTenantComponentResult {
  component: ComponentSchema | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to load component schema for a tenant
 * @param tenantId - The tenant ID
 * @param componentId - The component ID from registry
 * @param libraryId - Optional library ID for component key mapping
 * @param enabled - Whether to fetch (default: true)
 * @returns Component schema, loading state, and error
 */
export function useTenantComponent(
  tenantId: string | null,
  componentId: string | null,
  libraryId?: string,
  enabled: boolean = true
): UseTenantComponentResult {
  const [component, setComponent] = useState<ComponentSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !tenantId || !componentId) {
      setComponent(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadComponent() {
      setIsLoading(true);
      setError(null);
      setComponent(null);

      try {
        const componentKey = getComponentKey(componentId, libraryId);
        const data = await fetchTenantComponent(tenantId, componentId, componentKey);

        if (cancelled) return;

        setComponent(data);
      } catch (err) {
        if (cancelled) return;

        const error = err instanceof Error ? err : new Error("Failed to fetch tenant component");
        setError(error);
        console.error("[testing] Error fetching tenant component:", error);
        setComponent(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadComponent();

    return () => {
      cancelled = true;
    };
  }, [tenantId, componentId, libraryId, enabled]);

  return {
    component,
    isLoading,
    error,
  };
}

