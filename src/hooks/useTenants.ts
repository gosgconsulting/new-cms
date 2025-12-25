/**
 * useTenants Hook
 * Fetches and manages tenant list state
 */

import { useState, useEffect, useCallback } from "react";
import { fetchTenants, type Tenant } from "../services/tenantService";

export interface UseTenantsResult {
  tenants: Tenant[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage tenants
 * @param enabled - Whether to fetch tenants (default: true)
 * @returns Tenant list, loading state, error, and refetch function
 */
export function useTenants(enabled: boolean = true): UseTenantsResult {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTenants = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch tenants");
      setError(error);
      console.error("[testing] Error fetching tenants:", error);
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  return {
    tenants,
    isLoading,
    error,
    refetch: loadTenants,
  };
}

