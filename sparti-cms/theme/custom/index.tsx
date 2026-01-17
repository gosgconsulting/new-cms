import React from 'react';
import './theme.css';

interface CustomThemeProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  pageSlug?: string;
}

/**
 * Custom Theme
 * Minimal scaffold theme so the app can always load a "custom" theme.
 *
 * Asset convention:
 * - Put assets in /public/theme/custom/assets
 * - Reference via: /theme/custom/assets/<file>
 */
const CustomTheme: React.FC<CustomThemeProps> = ({
  tenantName = 'Custom Theme',
  tenantSlug = 'custom',
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href={`/theme/${tenantSlug}`} className="font-semibold">
            {tenantName}
          </a>
          <nav className="text-sm text-muted-foreground">
            <a className="hover:text-foreground" href={`/theme/${tenantSlug}`}>
              Home
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-lg border bg-card p-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to {tenantName}</h1>
          <p className="mt-3 text-muted-foreground">
            This is a minimal scaffold theme. Replace this layout and add your own components.
          </p>

          <div className="mt-6 space-y-2 text-sm">
            <p>
              Theme slug: <code className="rounded bg-muted px-1 py-0.5">{tenantSlug}</code>
            </p>
            <p>
              Assets: <code className="rounded bg-muted px-1 py-0.5">/public/theme/custom/assets</code>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-10">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {tenantName}
        </div>
      </footer>
    </div>
  );
};

export default CustomTheme;
