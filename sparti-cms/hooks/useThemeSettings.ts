import { useState, useEffect } from 'react';

// Type definitions for theme settings
export interface ThemeBrandingSettings {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  site_logo?: string;
  site_favicon?: string;
}

export interface ThemeLocalizationSettings {
  country?: string;
  timezone?: string;
  language?: string;
}

export interface ThemeStyleSettings {
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  accent?: string;
  accentForeground?: string;
  muted?: string;
  mutedForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  destructive?: string;
  destructiveForeground?: string;
  typography?: {
    fontSans?: string;
    fontSerif?: string;
    fontMono?: string;
    baseFontSize?: string;
    headingScale?: string;
    lineHeight?: string;
  };
}

export interface ThemeSettings {
  branding: ThemeBrandingSettings;
  localization: ThemeLocalizationSettings;
  styles: ThemeStyleSettings;
  [key: string]: any; // Allow other categories
}

export interface UseThemeSettingsResult {
  settings: ThemeSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch theme settings from the public API
 * 
 * @param themeSlug - The theme slug (e.g., 'landingpage')
 * @param tenantSlug - Optional tenant slug (if not provided, will use current tenant from context/subdomain)
 * @returns Theme settings, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { settings, loading, error } = useThemeSettings('landingpage');
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * 
 * return <div>{settings?.branding.site_name}</div>;
 * ```
 */
export const useThemeSettings = (
  themeSlug: string,
  tenantSlug?: string
): UseThemeSettingsResult => {
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!themeSlug) {
      setError('Theme slug is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build API URL - use public API endpoint
      const apiUrl = tenantSlug 
        ? `/api/v1/theme/${themeSlug}/settings?tenantId=${encodeURIComponent(tenantSlug)}`
        : `/api/v1/theme/${themeSlug}/settings`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch theme settings: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch theme settings');
      }

      // Transform the response to match our interface
      const transformedSettings: ThemeSettings = {
        branding: result.data.branding || {},
        localization: result.data.localization || {},
        styles: result.data.theme || result.data.styles || {},
        ...result.data // Include any other categories
      };

      setSettings(transformedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch theme settings';
      console.error('[useThemeSettings] Error:', errorMessage);
      setError(errorMessage);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [themeSlug, tenantSlug]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings
  };
};

/**
 * Hook to fetch only branding settings for a theme
 */
export const useThemeBranding = (
  themeSlug: string,
  tenantId?: string
): { branding: ThemeBrandingSettings | null; loading: boolean; error: string | null } => {
  const [branding, setBranding] = useState<ThemeBrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!themeSlug) {
      setError('Theme slug is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // First, check if branding settings are already injected in the HTML
    // Use a small delay to ensure window object and injected scripts are available
    const checkInjectedData = () => {
      if (typeof window !== 'undefined') {
        const injectedBranding = (window as any).__BRANDING_SETTINGS__;
        console.log('[useThemeBranding] Checking for injected branding:', {
          exists: !!injectedBranding,
          type: typeof injectedBranding,
          keys: injectedBranding && typeof injectedBranding === 'object' ? Object.keys(injectedBranding) : 'N/A'
        });
        
        if (injectedBranding && typeof injectedBranding === 'object' && Object.keys(injectedBranding).length > 0) {
          console.log('[useThemeBranding] ✅ Using injected branding settings from HTML:', Object.keys(injectedBranding));
          setBranding(injectedBranding);
          setLoading(false);
          return true;
        } else {
          console.log('[useThemeBranding] ⚠️ Injected branding not found or empty, will fetch from API');
        }
      } else {
        console.log('[useThemeBranding] ⚠️ Window object not available, will fetch from API');
      }
      return false;
    };

    // Check immediately
    if (checkInjectedData()) {
      return;
    }

    // Also check after a small delay (in case script hasn't executed yet)
    const timeoutId = setTimeout(() => {
      if (checkInjectedData()) {
        return;
      }
      // If still not found, proceed with API call
      proceedWithApiCall();
    }, 100);

    const proceedWithApiCall = () => {
      clearTimeout(timeoutId);

      // Get tenant ID from parameter, window object, or use default
      const effectiveTenantId = tenantId || 
        (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) || 
        null;

      // Build API URL with tenant ID in query params
      const apiUrl = effectiveTenantId
        ? `/api/v1/theme/${themeSlug}/branding?tenantId=${encodeURIComponent(effectiveTenantId)}`
        : `/api/v1/theme/${themeSlug}/branding?tenantId=tenant-gosg`; // Default fallback

      console.log('[useThemeBranding] Fetching branding from API:', apiUrl);

      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // Don't set Accept-Encoding - let the browser handle it automatically
        }
      })
        .then(async (res) => {
          console.log('[useThemeBranding] Response status:', res.status);
          const contentType = res.headers.get('content-type') || '';
          console.log('[useThemeBranding] Response content-type:', contentType);
          
          if (!res.ok) {
            // Try to get error message from response
            const text = await res.text();
            let errorData;
            try {
              errorData = JSON.parse(text);
            } catch {
              errorData = { error: text || `HTTP ${res.status}: ${res.statusText}` };
            }
            throw new Error(errorData.error || `Failed to fetch branding: ${res.statusText}`);
          }
          
          // Check if response is JSON
          if (!contentType.includes('application/json')) {
            const text = await res.text();
            console.error('[useThemeBranding] Non-JSON response:', text.substring(0, 200));
            throw new Error(`Expected JSON but received ${contentType}`);
          }
          
          // Use .json() directly - it handles decompression automatically
          const result = await res.json();
          console.log('[useThemeBranding] Response data:', result);
          
          return result;
        })
        .then(result => {
          // Handle response format: { success: true, data: {...} } or direct branding object
          let brandingData;
          if (result.success && result.data) {
            brandingData = result.data;
          } else if (result.branding) {
            brandingData = result.branding;
          } else {
            brandingData = result;
          }
          
          setBranding(brandingData || {});
        })
        .catch(err => {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branding';
          console.error('[useThemeBranding] Error:', errorMessage, err);
          setError(errorMessage);
          setBranding(null);
        })
        .finally(() => setLoading(false));
    };

    // If not found immediately, proceed with API call after delay
    if (!checkInjectedData()) {
      proceedWithApiCall();
    }
  }, [themeSlug, tenantId]);

  return { branding, loading, error };
};

/**
 * Hook to fetch only style settings for a theme
 */
export const useThemeStyles = (
  themeSlug: string,
  tenantSlug?: string
): { styles: ThemeStyleSettings | null; loading: boolean; error: string | null } => {
  const [styles, setStyles] = useState<ThemeStyleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!themeSlug) {
      setError('Theme slug is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const apiUrl = tenantSlug 
      ? `/api/v1/theme/${themeSlug}/styles?tenantId=${encodeURIComponent(tenantSlug)}`
      : `/api/v1/theme/${themeSlug}/styles`;

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch styles: ${res.statusText}`);
        return res.json();
      })
      .then(result => {
        if (!result.success) throw new Error(result.error || 'Failed to fetch styles');
        setStyles(result.data || {});
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch styles';
        console.error('[useThemeStyles] Error:', errorMessage);
        setError(errorMessage);
        setStyles(null);
      })
      .finally(() => setLoading(false));
  }, [themeSlug, tenantSlug]);

  return { styles, loading, error };
};

