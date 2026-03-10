import { useState, useEffect } from 'react';

// Type definitions
interface BrandingSettings {
  site_name?: string;
  site_tagline?: string;
  site_logo?: string;
  site_favicon?: string;
}

type Status = 'idle' | 'loading' | 'error';

interface ComponentData {
  name: string;
  type: string;
  content: string;
  isPublished?: boolean;
  tenantId?: string;
}

interface ComponentService {
  getByName: (name: string) => Promise<any | null>;
  update: (id: string | number, data: ComponentData) => Promise<void>;
  create: (data: ComponentData) => Promise<void>;
}

interface DatabaseHook {
  // Branding methods
  getBranding: () => Promise<BrandingSettings>;
  updateBranding: (key: string, value: string) => Promise<void>;
  updateMultipleBranding: (settings: Record<string, string>) => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  status: Status;

  // Components API used by ContentEditPanel
  components: ComponentService;
}

const useDatabase = (): DatabaseHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status: Status = loading ? 'loading' : (error ? 'error' : 'idle');

  // Branding methods using API calls
  const getBranding = async (): Promise<BrandingSettings> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branding');
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      const settings = await response.json();
      return settings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branding settings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBranding = async (key: string, value: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update branding setting';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMultipleBranding = async (settings: Record<string, string>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update branding settings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const components: ComponentService = {
    getByName: async (name: string) => {
      const res = await fetch(`/api/components?name=${encodeURIComponent(name)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) ? (data[0] ?? null) : data;
    },
    update: async (id: string | number, data: ComponentData) => {
      const res = await fetch(`/api/components/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(`Failed to update component: ${res.statusText}`);
      }
    },
    create: async (data: ComponentData) => {
      const res = await fetch(`/api/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(`Failed to create component: ${res.statusText}`);
      }
    },
  };

  return {
    getBranding,
    updateBranding,
    updateMultipleBranding,
    loading,
    error,
    status,
    components,
  };
};

// Named export for compatibility
export { useDatabase };

export default useDatabase;