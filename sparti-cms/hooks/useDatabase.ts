import { useState, useEffect } from 'react';

// Type definitions
interface BrandingSettings {
  site_name?: string;
  site_tagline?: string;
  site_logo?: string;
  site_favicon?: string;
}

interface DatabaseHook {
  // Branding methods
  getBranding: () => Promise<BrandingSettings>;
  updateBranding: (key: string, value: string) => Promise<void>;
  updateMultipleBranding: (settings: Record<string, string>) => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

const useDatabase = (): DatabaseHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Branding methods using API calls
  const getBranding = async (): Promise<BrandingSettings> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[testing] Fetching branding settings via API...');
      const response = await fetch('/api/branding');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const settings = await response.json();
      console.log('[testing] Branding settings fetched:', settings);
      return settings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branding settings';
      console.error('[testing] Error fetching branding settings:', errorMessage);
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
      console.log('[testing] Updating branding setting via API:', { key, value });
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      console.log('[testing] Branding setting updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update branding setting';
      console.error('[testing] Error updating branding setting:', errorMessage);
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
      console.log('[testing] Updating multiple branding settings via API:', settings);
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      console.log('[testing] Multiple branding settings updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update branding settings';
      console.error('[testing] Error updating multiple branding settings:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getBranding,
    updateBranding,
    updateMultipleBranding,
    loading,
    error,
  };
};

// Named export for compatibility
export { useDatabase };

export default useDatabase;