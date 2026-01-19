import React, { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dynamic theme imports - themes with hardcoded content, ready for database integration
const LandingPageTheme = lazy(() => import('../../sparti-cms/theme/landingpage'));
const SpartiSEOLandingTheme = lazy(() => import('../../sparti-cms/theme/sparti-seo-landing'));
const GosgConsultingTheme = lazy(() => import('../../sparti-cms/theme/gosgconsulting'));
const SissonneTheme = lazy(() => import('../../sparti-cms/theme/sissonne'));
const StorefrontTheme = lazy(() => import('../../sparti-cms/theme/storefront'));
const MoondkTheme = lazy(() => import('../../sparti-cms/theme/moondk'));
const StrTheme = lazy(() => import('../../sparti-cms/theme/str'));
const OptimalConsultingTheme = lazy(() => import('../../sparti-cms/theme/optimalconsulting'));
const MasterTheme = lazy(() => import('../../sparti-cms/theme/master'));
const EShopTheme = lazy(() => import('../../sparti-cms/theme/e-shop'));
const HotelTheme = lazy(() => import('../../sparti-cms/theme/hotel'));
const NailQueenTheme = lazy(() => import('../../sparti-cms/theme/nail-queen'));

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
  'gosgconsulting.com': {
    name: 'GO SG Consulting',
    component: GosgConsultingTheme
  },
  'sissonne': {
    name: 'Sissonne Dance Academy',
    component: SissonneTheme
  },
  'storefront': {
    name: 'Storefront',
    component: StorefrontTheme
  },
  'moondk': {
    name: 'Moondk',
    component: MoondkTheme
  },
  'str': {
    name: 'STR',
    component: StrTheme
  },
  'optimalconsulting': {
    name: 'Optimal Consulting',
    component: OptimalConsultingTheme
  },
  'master': {
    name: 'Master Template',
    component: MasterTheme
  },
  'e-shop': {
    name: 'E-shop',
    component: EShopTheme
  },
  'hotel': {
    name: 'Hotel Adina',
    component: HotelTheme
  },
  'nail-queen': {
    name: 'Nail Queen',
    component: NailQueenTheme
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
  const { tenantSlug, pageSlug, productname } = useParams<{ tenantSlug: string; pageSlug?: string; productname?: string }>();
  const location = useLocation();
  const slug = tenantSlug || 'landingpage';
  const [tenantId, setTenantId] = useState<string | undefined>(undefined);
  
  // Fetch tenant ID from database based on slug
  useEffect(() => {
    const fetchTenantId = async () => {
      try {
        // Try to find tenant by slug or theme_id
        const response = await fetch(`/api/tenants/by-slug/${slug}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setTenantId(data.data.id);
            return;
          }
        }
        
        // If not found by slug, try to find by theme_id
        const themeResponse = await fetch(`/api/tenants/by-theme/${slug}`);
        if (themeResponse.ok) {
          const themeData = await themeResponse.json();
          if (themeData.success && themeData.data?.tenants?.length > 0) {
            // Use the first tenant with this theme
            setTenantId(themeData.data.tenants[0].id);
            return;
          }
        }
        
        // Fallback: check window.__CMS_TENANT__ (for theme deployments)
        if (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) {
          setTenantId((window as any).__CMS_TENANT__);
        }
      } catch (error) {
        console.error('[testing] Error fetching tenant ID:', error);
        // Fallback to window variable
        if (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) {
          setTenantId((window as any).__CMS_TENANT__);
        }
      }
    };
    
    fetchTenantId();
  }, [slug]);
  
  // Extract full page path from location for nested routes like /booking/classes
  // Always extract from pathname to handle both /theme/:tenantSlug/:pageSlug and /theme/:tenantSlug/* routes
  const fullPageSlug = useMemo(() => {
    if (productname) {
      return `product/${productname}`;
    }
    
    // Extract full path from pathname to handle nested routes
    const pathParts = location.pathname.split('/').filter(Boolean);
    const themeIndex = pathParts.indexOf('theme');
    const tenantIndex = pathParts.indexOf(tenantSlug);
    
    if (themeIndex >= 0 && tenantIndex === themeIndex + 1 && tenantIndex + 1 < pathParts.length) {
      // Get all parts after tenant slug (handles both single and nested paths)
      const remainingParts = pathParts.slice(tenantIndex + 1);
      return remainingParts.join('/');
    }
    
    // Fallback to pageSlug if pathname parsing didn't work
    return pageSlug;
  }, [pageSlug, location.pathname, tenantSlug, productname]);
  
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

  // Loading fallback with proper UI
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading theme...</p>
      </div>
    </div>
  );

  // Pass pageSlug and tenantId if it exists so theme can handle sub-routes
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThemeComponent 
        tenantName={currentTheme.name} 
        tenantSlug={slug}
        pageSlug={fullPageSlug}
        tenantId={tenantId}
      />
    </Suspense>
  );
};

export default TenantLandingPage;