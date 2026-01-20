import { createBrowserRouter, Navigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import React from "react";
import AdminTopBar from "@/components/AdminTopBar";
import { useSEO } from "@/hooks/useSEO";
import { AuthProvider } from "../sparti-cms/components/auth/AuthProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import EmbedPagesManager from "../sparti-cms/components/embed/EmbedPagesManager";
import SuperAdminRoute from "../sparti-cms/components/auth/SuperAdminRoute";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import DatabaseViewer from "./pages/DatabaseViewer";
import PublicDashboard from "./pages/PublicDashboard";
import TenantLandingPage from "./pages/TenantLandingPage";
import TenantPage from "./pages/TenantPage";
import ThankYou from "./pages/ThankYou";
import Shop from "./pages/Shop";
import DemoHero from "./pages/DemoHero";
import TemplateWebsite from "./pages/TemplateWebsite";
import TemplateDynamic from "./pages/TemplateDynamic";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DesignSystems from "./pages/DesignSystems";
import Kanban from "./pages/Kanban";
import FeatureKanban from "./pages/FeatureKanban";

// Component to handle theme sub-routes - checks if it's a known theme
const ThemeRouteHandler: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  
  // Known themes that handle their own routing
  const knownThemes = ['sissonne', 'landingpage', 'sparti-seo-landing', 'gosgconsulting', 'gosgconsulting.com', 'storefront', 'moondk', 'str', 'optimalconsulting', 'master', 'e-shop', 'hotel', 'nail-queen'];
  
  if (tenantSlug && knownThemes.includes(tenantSlug)) {
    // Route to theme component which handles sub-routes
    return <TenantLandingPage />;
  }
  
  // Otherwise, use TenantPage for database-driven pages
  return <TenantPage />;
};

// Simple alias route: /master/* -> /theme/master/*
const MasterAliasRoute: React.FC = () => {
  const location = useLocation();
  const rest = location.pathname.replace(/^\/master/, "");
  return <Navigate to={`/theme/master${rest}${location.search}${location.hash}`} replace />;
};

// Component to conditionally load SEO based on current route
const ConditionalSEO = () => {
  const location = useLocation();
  
  // Don't load SEO on auth/login pages
  const isAuthPage = location.pathname === '/auth' || 
                    (location.pathname.startsWith('/theme/') && location.pathname.endsWith('/auth'));
  
  // Initialize SEO management only if not on auth page
  const { error: seoError } = useSEO({ skip: isAuthPage });

  if (seoError) {
    console.warn('[testing] SEO initialization error (non-blocking):', seoError);
  }
  
  return null;
};

// Root layout component
const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ConditionalSEO />
      <AdminTopBar />
      {children}
    </AuthProvider>
  );
};

// Root redirect component that checks for theme deployment
const RootRedirect: React.FC = () => {
  // Check if we're in theme deployment mode (standalone theme build)
  const isThemeDeployment = typeof window !== 'undefined' && (window as any).__THEME_DEPLOYMENT__ === true;

  if (isThemeDeployment) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Theme deployment mode detected. This App.tsx should not be loaded.</p>
        <p>If you see this, the theme build may not be using the standalone entry point.</p>
      </div>
    );
  }

  return <Navigate to="/admin" replace />;
};

// Create router with future flags to eliminate v7 warnings
export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout><RootRedirect /></RootLayout>,
    },
    {
      path: "/master/*",
      element: <RootLayout><MasterAliasRoute /></RootLayout>,
    },
    {
      path: "/admin/*",
      element: <RootLayout><Admin /></RootLayout>,
    },
    {
      path: "/dashboard/*",
      element: <RootLayout><PublicDashboard /></RootLayout>,
    },
    {
      path: "/theme/template/:templateName",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <TemplateDynamic />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/theme/template/:templateName/*",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <TemplateDynamic />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/embed/pages",
      element: <RootLayout><EmbedPagesManager /></RootLayout>,
    },
    {
      path: "/blog",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <TenantLandingPage />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/blog/:slug",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <TenantLandingPage />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/theme/:tenantSlug/product/:productname",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <ThemeRouteHandler />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/theme/:tenantSlug/blog/:slug",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <ThemeRouteHandler />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/theme/:tenantSlug",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <TenantLandingPage />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/theme/:tenantSlug/:pageSlug",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <TenantLandingPage />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/theme/:tenantSlug/*",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <TenantLandingPage />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/tenant/:tenantSlug/:pageSlug",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <TenantPage />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/theme/:themeSlug/auth",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <Auth />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/auth",
      element: <RootLayout><Auth /></RootLayout>,
    },
    {
      path: "/privacy",
      element: <RootLayout><Privacy /></RootLayout>,
    },
    {
      path: "/terms",
      element: <RootLayout><Terms /></RootLayout>,
    },
    {
      path: "/thank-you",
      element: <RootLayout><ThankYou /></RootLayout>,
    },
    {
      path: "/shop",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <Shop />
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/database-viewer",
      element: <RootLayout><DatabaseViewer /></RootLayout>,
    },
    {
      path: "/design-systems",
      element: <RootLayout><DesignSystems /></RootLayout>,
    },
    {
      path: "/components-viewer",
      element: <RootLayout><Navigate to="/design-systems" replace /></RootLayout>,
    },
    {
      path: "/dev",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <SuperAdminRoute>
              <Kanban />
            </SuperAdminRoute>
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/dev/:featureId",
      element: (
        <RootLayout>
          <ErrorBoundary>
            <SuperAdminRoute>
              <FeatureKanban />
            </SuperAdminRoute>
          </ErrorBoundary>
        </RootLayout>
      ),
    },
    {
      path: "/demo-hero",
      element: <RootLayout><DemoHero /></RootLayout>,
    },
    {
      path: "*",
      element: <RootLayout><NotFound /></RootLayout>,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true,
    },
  }
);