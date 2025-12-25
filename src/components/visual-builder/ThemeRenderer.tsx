import React, { lazy, Suspense, useMemo, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import ThemeSectionList from './ThemeSectionList';

interface ThemeRendererProps {
  themeId: string | null;
  tenantId?: string;
  pageSlug?: string;
}

// Dynamic theme imports - themes with hardcoded content
const LandingPageTheme = lazy(() => import('../../../sparti-cms/theme/landingpage'));
const SpartiSEOLandingTheme = lazy(() => import('../../../sparti-cms/theme/sparti-seo-landing'));
const GosgConsultingTheme = lazy(() => import('../../../sparti-cms/theme/gosgconsulting'));
const CustomTheme = lazy(() => import('../../../sparti-cms/theme/custom'));

/**
 * Map theme slugs to their display names and components
 * Themes have hardcoded content but are ready to integrate with tenant database
 */
const themeConfig: Record<string, { name: string; component: React.LazyExoticComponent<React.ComponentType<any>> }> = {
  'landingpage': {
    name: 'ACATR Business Services',
    component: LandingPageTheme
  },
  'sparti-seo-landing': {
    name: 'Sparti SEO Landing',
    component: SpartiSEOLandingTheme
  },
  'gosgconsulting': {
    name: 'GO SG Consulting',
    component: GosgConsultingTheme
  },
  'custom': {
    name: 'Custom',
    component: CustomTheme
  }
};

/**
 * ThemeRenderer Component
 * Renders the actual theme component with hardcoded content
 * This shows the theme exactly as it appears when deployed
 */
const ThemeRenderer: React.FC<ThemeRendererProps> = ({ 
  themeId, 
  tenantId,
  pageSlug 
}) => {
  const effectiveThemeId = themeId || 'landingpage';
  
  // Get theme config or fallback
  const currentTheme = useMemo(() => {
    return themeConfig[effectiveThemeId] || themeConfig['landingpage'];
  }, [effectiveThemeId]);
  
  const ThemeComponent = currentTheme.component;
  const isKnownTheme = effectiveThemeId in themeConfig;

  // Loading fallback
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Loading theme...</p>
      </div>
    </div>
  );

  // Error component for unknown themes
  const ThemeNotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Theme Not Found</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Theme <code className="bg-muted px-1 py-0.5 rounded">{effectiveThemeId}</code> was not found.
          </p>
          <p className="text-sm mt-2">
            Available themes: {Object.keys(themeConfig).join(', ')}
          </p>
          <p className="text-sm mt-2">
            To add a new theme, create a folder at <code className="bg-muted px-1 py-0.5 rounded">sparti-cms/theme/{effectiveThemeId}/</code> with an <code className="bg-muted px-1 py-0.5 rounded">index.tsx</code> file.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );

  // Show error if theme is not found (and not using fallback)
  if (!isKnownTheme && effectiveThemeId !== 'landingpage') {
    return <ThemeNotFound />;
  }

  const containerRef = useRef<HTMLDivElement>(null);

  // Render the theme component with appropriate props
  return (
    <div className="flex w-full h-full">
      {/* Left: Sections list */}
      <ThemeSectionList containerRef={containerRef} />

      {/* Right: Theme content */}
      <div className="flex-1 min-w-0 overflow-auto" ref={containerRef}>
        <Suspense fallback={<LoadingFallback />}>
          <div className="w-full">
            <ThemeComponent 
              tenantName={currentTheme.name} 
              tenantSlug={effectiveThemeId}
            />
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default ThemeRenderer;

