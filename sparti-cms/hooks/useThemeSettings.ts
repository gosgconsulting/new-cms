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

      const response = await fetch(apiUrl);

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
  tenantSlug?: string
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

    const apiUrl = tenantSlug 
      ? `/api/v1/theme/${themeSlug}/branding?tenantId=${encodeURIComponent(tenantSlug)}`
      : `/api/v1/theme/${themeSlug}/branding`;

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch branding: ${res.statusText}`);
        return res.json();
      })
      .then(result => {
        if (!result.success) throw new Error(result.error || 'Failed to fetch branding');
        setBranding(result.data || {});
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branding';
        console.error('[useThemeBranding] Error:', errorMessage);
        setError(errorMessage);
        setBranding(null);
      })
      .finally(() => setLoading(false));
  }, [themeSlug, tenantSlug]);

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

    fetch(apiUrl)
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

