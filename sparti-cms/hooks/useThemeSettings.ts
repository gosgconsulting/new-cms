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
 */
export const useThemeSettings = (themeSlug: string, tenantSlug?: string): UseThemeSettingsResult => {
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
      const apiUrl = tenantSlug
        ? `/api/v1/theme/${themeSlug}/settings?tenantId=${encodeURIComponent(tenantSlug)}`
        : `/api/v1/theme/${themeSlug}/settings`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch theme settings: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch theme settings');
      }

      const transformedSettings: ThemeSettings = {
        branding: result.data.branding || {},
        localization: result.data.localization || {},
        styles: result.data.theme || result.data.styles || {},
        ...result.data,
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
    refetch: fetchSettings,
  };
};

type HookOptions = {
  /**
   * When false, the hook will not call the API.
   * Useful for themes that want to start fully hardcoded and only enable CMS later.
   */
  enabled?: boolean;
};

/**
 * Hook to fetch only branding settings for a theme
 */
export const useThemeBranding = (
  themeSlug: string,
  tenantId?: string,
  options: HookOptions = {}
): { branding: ThemeBrandingSettings | null; loading: boolean; error: string | null } => {
  const enabled = options.enabled ?? true;

  const [branding, setBranding] = useState<ThemeBrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      setBranding(null);
      return;
    }

    if (!themeSlug) {
      setError('Theme slug is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const checkInjectedData = () => {
      if (typeof window !== 'undefined') {
        const injectedBranding = (window as any).__BRANDING_SETTINGS__;

        if (
          injectedBranding &&
          typeof injectedBranding === 'object' &&
          Object.keys(injectedBranding).length > 0
        ) {
          setBranding(injectedBranding);
          setLoading(false);
          return true;
        }
      }
      return false;
    };

    if (checkInjectedData()) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (checkInjectedData()) {
        return;
      }
      proceedWithApiCall();
    }, 100);

    const proceedWithApiCall = () => {
      clearTimeout(timeoutId);

      const effectiveTenantId =
        tenantId || (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) || null;

      const apiUrl = effectiveTenantId
        ? `/api/v1/theme/${themeSlug}/branding?tenantId=${encodeURIComponent(effectiveTenantId)}`
        : `/api/v1/theme/${themeSlug}/branding`;

      const fullBrandingUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}${apiUrl}`
          : apiUrl;
      console.log('[testing] useThemeBranding: fetching branding from', fullBrandingUrl);

      fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
        .then(async (res) => {
          const contentType = res.headers.get('content-type') || '';

          if (!res.ok) {
            const text = await res.text();
            let errorData;
            try {
              errorData = JSON.parse(text);
            } catch {
              errorData = { error: text || `HTTP ${res.status}: ${res.statusText}` };
            }
            throw new Error(errorData.error || `Failed to fetch branding: ${res.statusText}`);
          }

          if (!contentType.includes('application/json')) {
            const text = await res.text();
            console.error('[useThemeBranding] Non-JSON response:', text.substring(0, 200));
            throw new Error(`Expected JSON but received ${contentType}`);
          }

          return res.json();
        })
        .then((result) => {
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
        .catch((err) => {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branding';
          console.error('[useThemeBranding] Error:', errorMessage, err);
          setError(errorMessage);
          setBranding(null);
        })
        .finally(() => setLoading(false));
    };

    if (!checkInjectedData()) {
      proceedWithApiCall();
    }
  }, [themeSlug, tenantId, enabled]);

  return { branding, loading, error };
};

/**
 * Hook to fetch only style settings for a theme
 */
export const useThemeStyles = (
  themeSlug: string,
  tenantSlug?: string,
  options: HookOptions = {}
): { styles: ThemeStyleSettings | null; loading: boolean; error: string | null } => {
  const enabled = options.enabled ?? true;

  const [styles, setStyles] = useState<ThemeStyleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      setStyles(null);
      return;
    }

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
        Accept: 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch styles: ${res.statusText}`);
        return res.json();
      })
      .then((result) => {
        if (!result.success) throw new Error(result.error || 'Failed to fetch styles');
        setStyles(result.data || {});
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch styles';
        console.error('[useThemeStyles] Error:', errorMessage);
        setError(errorMessage);
        setStyles(null);
      })
      .finally(() => setLoading(false));
  }, [themeSlug, tenantSlug, enabled]);

  return { styles, loading, error };
};