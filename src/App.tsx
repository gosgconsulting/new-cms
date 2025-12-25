import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import AdminTopBar from "@/components/AdminTopBar";
import { useSEO } from "@/hooks/useSEO";
import { AuthProvider } from "../sparti-cms/components/auth/AuthProvider";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ThemeAdmin from "./pages/ThemeAdmin";
import DatabaseViewer from "./pages/DatabaseViewer";
import PublicDashboard from "./pages/PublicDashboard";
import TenantLandingPage from "./pages/TenantLandingPage";
import TenantPage from "./pages/TenantPage";
import ErrorBoundary from "./components/ErrorBoundary";
import EmbedPagesManager from "../sparti-cms/components/embed/EmbedPagesManager";
import ThemeAdminRedirect from "./components/ThemeAdminRedirect";
import ComponentsViewer from "./pages/ComponentsViewer";

const queryClient = new QueryClient();

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

const App = () => {

  // Check if we're in theme deployment mode (standalone theme build)
  // When DEPLOY_THEME_SLUG is set, the build creates a standalone entry point (theme-standalone.tsx)
  // that doesn't use this App.tsx. This check is only a safeguard in case App.tsx is somehow loaded.
  // In normal CMS operation, this flag will be undefined/false, so the redirect to /admin will work.
  const isThemeDeployment = typeof window !== 'undefined' && (window as any).__THEME_DEPLOYMENT__ === true;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ConditionalSEO />
            <AdminTopBar />
            <Routes>
            {/* Redirect root to admin - always redirect for CMS, theme deployments use separate entry point */}
            <Route path="/" element={
              isThemeDeployment ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p>Theme deployment mode detected. This App.tsx should not be loaded.</p>
                  <p>If you see this, the theme build may not be using the standalone entry point.</p>
                </div>
              ) : (
                <Navigate to="/admin" replace />
              )
            } />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={<Admin />} />
            
            {/* Public dashboard route - no authentication required */}
            <Route path="/dashboard/*" element={<PublicDashboard />} />
            
            {/* Blog routes */}
            <Route path="/blog" element={
              <ErrorBoundary>
                <Blog />
              </ErrorBoundary>
            } />
            <Route path="/blog/:slug" element={
              <ErrorBoundary>
                <BlogPost />
              </ErrorBoundary>
            } />
            
            {/* Embed route for iframe access */}
            <Route path="/embed/pages" element={<EmbedPagesManager />} />
            
            {/* Theme routes */}
            <Route path="/theme/:tenantSlug/:pageSlug" element={
              <ErrorBoundary>
                <TenantPage />
              </ErrorBoundary>
            } />
            <Route path="/theme/:tenantSlug" element={
              <ErrorBoundary>
                <TenantLandingPage />
              </ErrorBoundary>
            } />
            
            {/* Theme admin/auth routes */}
            <Route path="/theme/:themeSlug/admin" element={
              <ErrorBoundary>
                <ThemeAdmin />
              </ErrorBoundary>
            } />
            <Route path="/theme/:themeSlug/auth" element={
              <ErrorBoundary>
                <Auth />
              </ErrorBoundary>
            } />
            
            {/* Other routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/database-viewer" element={<DatabaseViewer />} />
            <Route path="/components-viewer" element={<ComponentsViewer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;