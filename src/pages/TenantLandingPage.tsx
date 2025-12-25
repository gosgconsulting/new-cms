import React, { lazy, Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dynamic theme imports - themes with hardcoded content, ready for database integration
const LandingPageTheme = lazy(() => import('../../sparti-cms/theme/landingpage'));
const SpartiSEOLandingTheme = lazy(() => import('../../sparti-cms/theme/sparti-seo-landing'));
const GosgConsultingTheme = lazy(() => import('../../sparti-cms/theme/gosgconsulting'));

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
  }
};

/**
 * Client-side React component for tenant landing pages
 * Dynamically loads themes based on tenantSlug (which is actually the theme slug)
 * 
 * Each theme has:
 * - Hardcoded content, images, pages, etc.
 * - Ready to integrate with tenant database via useThemeSettings hook
 * - Can replace hardcoded values with database values when tenant is assigned
 */
const TenantLandingPage: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  
  const slug = tenantSlug || 'landingpage';
  
  // Get theme config or fallback
  const currentTheme = useMemo(() => {
    return themeConfig[slug] || themeConfig['landingpage'];
  }, [slug]);
  
  const ThemeComponent = currentTheme.component;
  const isKnownTheme = slug in themeConfig;

  // Error component for unknown themes
  const ThemeNotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Theme Not Found</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Theme <code className="bg-muted px-1 py-0.5 rounded">{slug}</code> was not found.
          </p>
          <p className="text-sm mt-2">
            Available themes: {Object.keys(themeConfig).join(', ')}
          </p>
          <p className="text-sm mt-2">
            To add a new theme, create a folder at <code className="bg-muted px-1 py-0.5 rounded">sparti-cms/theme/{slug}/</code> with an <code className="bg-muted px-1 py-0.5 rounded">index.tsx</code> file.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );

  // Show error if theme is not found (and not using fallback)
  if (!isKnownTheme && slug !== 'landingpage') {
    return <ThemeNotFound />;
  }

  // Use null fallback - let each theme handle its own loading state
  return (
    <Suspense fallback={null}>
      <ThemeComponent 
        tenantName={currentTheme.name} 
        tenantSlug={slug} 
      />
    </Suspense>
  );
};

export default TenantLandingPage;

