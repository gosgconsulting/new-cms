import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';

// Dynamic theme imports
const LandingPageTheme = lazy(() => import('../../sparti-cms/theme/landingpage'));
const SpartiSEOLandingTheme = lazy(() => import('../../sparti-cms/theme/sparti-seo-landing'));
const GosgConsultingTheme = lazy(() => import('../../sparti-cms/theme/gosgconsulting'));

/**
 * Client-side React component for tenant landing pages
 * Dynamically loads themes based on tenantSlug
 */
const TenantLandingPage: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  
  const slug = tenantSlug || 'landingpage';
  
  // Map theme slugs to their display names and components
  const themeConfig = {
    'landingpage': {
      name: 'ACATR Business Services',
      component: LandingPageTheme
    },
    'sparti-seo-landing': {
      name: 'Sparti',
      component: SpartiSEOLandingTheme
    },
    'gosgconsulting': {
      name: 'GO SG Consulting',
      component: GosgConsultingTheme
    }
  };
  
  // Get theme config or fallback to landingpage
  const currentTheme = themeConfig[slug as keyof typeof themeConfig] || themeConfig['landingpage'];
  const ThemeComponent = currentTheme.component;
  
  // Loading component
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading theme...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThemeComponent 
        tenantName={currentTheme.name} 
        tenantSlug={slug} 
      />
    </Suspense>
  );
};

export default TenantLandingPage;

