import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
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
import ComponentsViewer from "./pages/ComponentsViewer";
import PublicDashboard from "./pages/PublicDashboard";
import TenantLandingPage from "./pages/TenantLandingPage";
import TenantPage from "./pages/TenantPage";
import ErrorBoundary from "./components/ErrorBoundary";
import EmbedPagesManager from "../sparti-cms/components/embed/EmbedPagesManager";
import ThemeAdminRedirect from "./components/ThemeAdminRedirect";

const queryClient = new QueryClient();

const App = () => {
  // Initialize SEO management
  const { loading: seoLoading, error: seoError } = useSEO();

  if (seoError) {
    console.warn('[testing] SEO initialization error:', seoError);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AdminTopBar />
            <Routes>
            {/* Redirect root to admin */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            
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