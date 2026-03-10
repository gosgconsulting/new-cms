import { useState, useEffect } from 'react';

export interface CustomCodeSettings {
  head: string;
  body: string;
  gtmId: string;
  gaId: string;
  gscVerification: string;
}

/**
 * Hook to fetch custom code settings from CMS
 * Note: This requires a public API endpoint. If the endpoint requires auth,
 * you may need to pass customCode as a prop or use server-side injection.
 */
export const useCustomCode = (tenantId?: string): {
  customCode: CustomCodeSettings | null;
  loading: boolean;
  error: string | null;
} => {
  const [customCode, setCustomCode] = useState<CustomCodeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    const fetchCustomCode = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from public API endpoint
        // If this endpoint requires auth, you may need to use server-side injection instead
        const response = await fetch(`/api/custom-code?tenantId=${encodeURIComponent(tenantId)}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          // If unauthorized, that's okay - custom code might be injected server-side
          if (response.status === 401 || response.status === 403) {
            console.log('[testing] Custom code API requires authentication, skipping client-side fetch');
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch custom code: ${response.statusText}`);
        }

        const data = await response.json();
        setCustomCode({
          head: data.head || '',
          body: data.body || '',
          gtmId: data.gtmId || '',
          gaId: data.gaId || '',
          gscVerification: data.gscVerification || '',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch custom code';
        console.error('[testing] Error fetching custom code:', errorMessage);
        // Don't set error state - custom code might be injected server-side
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomCode();
  }, [tenantId]);

  return { customCode, loading, error };
};
