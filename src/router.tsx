import { createBrowserRouter, Navigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import React from "react";
import AdminTopBar from "@/components/AdminTopBar";
import { useSEO } from "@/hooks/useSEO";
import { AuthProvider } from "../sparti-cms/components/auth/AuthProvider";
import { RouteErrorElement } from "./components/RouteErrorElement";
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
import ProductPage from "./pages/ProductPage";

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

const routeErrorElement = (
  <RootLayout>
    <RouteErrorElement />
  </RootLayout>
);

// Create router with future flags to eliminate v7 warnings
export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout><RootRedirect /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/master/*",
      element: <RootLayout><MasterAliasRoute /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/admin/*",
      element: <RootLayout><Admin /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/dashboard/*",
      element: <RootLayout><PublicDashboard /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/theme/template/:templateName",
      element: <RootLayout><TemplateDynamic /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/theme/template/:templateName/*",
      element: <RootLayout><TemplateDynamic /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/embed/pages",
      element: <RootLayout><EmbedPagesManager /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/blog",
      element: <RootLayout><TenantLandingPage /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/blog/:slug",
      element: <RootLayout><TenantLandingPage /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/product/:id",
      element: <RootLayout><ProductPage /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/theme/:tenantSlug/product/:productname",
      element: <RootLayout><ThemeRouteHandler /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/theme/:tenantSlug/blog/:slug",
      element: <RootLayout><ThemeRouteHandler /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/theme/:tenantSlug",
      element: <RootLayout><TenantLandingPage /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/theme/:tenantSlug/:pageSlug",
      element: <RootLayout><TenantLandingPage /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/theme/:tenantSlug/*",
      element: <RootLayout><TenantLandingPage /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/tenant/:tenantSlug/:pageSlug",
      element: <RootLayout><TenantPage /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/theme/:themeSlug/auth",
      element: <RootLayout><Auth /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/auth",
      element: <RootLayout><Auth /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/privacy",
      element: <RootLayout><Privacy /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/terms",
      element: <RootLayout><Terms /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/thank-you",
      element: <RootLayout><ThankYou /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/shop",
      element: <RootLayout><Shop /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/database-viewer",
      element: <RootLayout><DatabaseViewer /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/design-systems",
      element: <RootLayout><DesignSystems /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/components-viewer",
      element: <RootLayout><Navigate to="/design-systems" replace /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/dev",
      element: (
        <RootLayout>
          <SuperAdminRoute>
            <Kanban />
          </SuperAdminRoute>
        </RootLayout>
      ),
      errorElement: routeErrorElement,
    },
    {
      path: "/dev/:featureId",
      element: (
        <RootLayout>
          <SuperAdminRoute>
            <FeatureKanban />
          </SuperAdminRoute>
        </RootLayout>
      ),
      errorElement: routeErrorElement,
    },
    {
      path: "/demo-hero",
      element: <RootLayout><DemoHero /></RootLayout>,
      errorElement: routeErrorElement,
    },
    // Root-level routes for deployed STR theme (booking/classes, packages, etc.)
    {
      path: "/booking/*",
      element: <RootLayout><TenantLandingPage /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "/packages",
      element: <RootLayout><TenantLandingPage /></RootLayout>,
      errorElement: routeErrorElement,
    },
    {
      path: "*",
      element: <RootLayout><NotFound /></RootLayout>,
      errorElement: routeErrorElement,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);