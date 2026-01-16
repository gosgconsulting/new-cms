import React, { useMemo, useEffect, useState } from 'react';
import './theme.css';
import { useThemeBranding, useThemeStyles } from '../../hooks/useThemeSettings';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string | null;
}

/**
 * Master Theme
 * Minimal, tenant-aware base theme intended for duplication/migrations.
 * - Uses useThemeBranding/useThemeStyles with explicit tenantId when available
 * - No hardcoded tenant IDs or assets
 * - Simple sections: Header, Hero, Footer
 */
const MasterTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'Master Theme',
  tenantSlug = 'master',
  tenantId
}) => {
  // Simple local CTA modal state (placeholder)
  // IMPORTANT: hooks must be declared unconditionally (before any early returns)
  const [contactOpen, setContactOpen] = useState(false);

  // Determine effective tenant ID: prefer prop, then window injection, then null
  const effectiveTenantId = useMemo(() => {
    if (tenantId) return tenantId;
    if (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) {
      return (window as any).__CMS_TENANT__;
    }
    return null;
  }, [tenantId]);

  // Tenant-aware branding and style settings
  const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding(
    tenantSlug,
    effectiveTenantId ?? undefined
  );
  const { styles, loading: stylesLoading, error: stylesError } = useThemeStyles(
    tenantSlug,
    effectiveTenantId ?? undefined
  );

  // Derived presentation values with safe fallbacks
  const siteName = branding?.site_name || tenantName;
  const siteTagline = branding?.site_tagline || 'A tenant-aware base theme';
  const logoSrc = branding?.site_logo || null;

  // Optional favicon application
  useEffect(() => {
    const favicon = branding?.site_favicon || null;
    if (!favicon) return;

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [branding?.site_favicon]);

  // Loading state
  if (brandingLoading || stylesLoading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 theme-primary-border"></div>
          <p className="text-muted-foreground">Loading theme...</p>
        </div>
      </div>
    );
  }

  // Proceed even if branding/styles errors occur (use fallbacks)
  if (brandingError || stylesError) {
    if (brandingError) console.warn('[master-theme] Branding load error:', brandingError);
    if (stylesError) console.warn('[master-theme] Styles load error:', stylesError);
  }

  return (
    <div className="min-h-screen theme-bg text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <img src={logoSrc} alt={siteName} className="h-8 w-auto" />
            ) : (
              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                {siteName.substring(0, 1)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold">{siteName}</span>
              <span className="text-xs text-muted-foreground">{siteTagline}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContactOpen(true)}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            >
              Contact
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-4xl font-bold mb-3">{siteName}</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Tenant-aware base theme for fast migrations.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/admin"
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                >
                  Go to CMS
                </a>
                <a
                  href={`/theme/${tenantSlug}`}
                  className="px-4 py-2 rounded-md border border-border hover:bg-muted text-sm"
                >
                  Preview Theme
                </a>
                <a
                  href="/theme/landingpage"
                  className="px-4 py-2 rounded-md border border-border hover:bg-muted text-sm"
                >
                  View another theme
                </a>
              </div>
              {effectiveTenantId && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Tenant ID: {effectiveTenantId}
                </p>
              )}
              {stylesError && (
                <p className="mt-2 text-xs text-destructive">
                  Styles could not be loaded for this tenant/theme (showing defaults).
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Master theme preview</p>
                <span className="text-xs text-muted-foreground">/theme/master</span>
              </div>
              <div className="mt-4 rounded-xl overflow-hidden border border-border bg-background">
                <img
                  src="/theme/master/assets/hero.svg"
                  alt="Master theme illustration"
                  className="w-full h-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <ul className="mt-4 text-sm text-muted-foreground space-y-1">
                <li>• Branding via public API (site name, logo, favicon)</li>
                <li>• Theme styles via public API (colors, typography)</li>
                <li>• Minimal layout: header, hero, footer</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/60 bg-background">
        <div className="max-w-6xl mx-auto p-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>

      {/* Simple placeholder for contact modal */}
      {contactOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="bg-background rounded-lg p-6 w-full max-w-md border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Replace this with your contact form component when needed.
            </p>
            <button
              onClick={() => setContactOpen(false)}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterTheme;