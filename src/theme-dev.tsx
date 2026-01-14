/**
 * Development entry point for theme development
 * This file allows you to develop a theme locally with hot reload
 * 
 * Usage:
 *   DEPLOY_THEME_SLUG=landingpage npm run dev:theme
 * 
 * This will:
 * - Show the theme at root path (/)
 * - Enable hot module replacement (HMR)
 * - Proxy API requests to backend (if running)
 */

import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import './index.css';
import '../sparti-cms/styles/modal-sparti-fix.css';
import '../sparti-cms/styles/rich-text-editor.css';

// Get theme slug from environment variable or URL parameter
const getThemeSlug = (): string => {
  // Check environment variable first
  if (import.meta.env.VITE_DEV_THEME_SLUG) {
    return import.meta.env.VITE_DEV_THEME_SLUG;
  }
  
  // Check window variable (set by build script or server)
  if (typeof window !== 'undefined' && (window as any).__DEV_THEME_SLUG__) {
    return (window as any).__DEV_THEME_SLUG__;
  }
  
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const themeFromUrl = urlParams.get('theme');
  if (themeFromUrl) {
    return themeFromUrl;
  }
  
  // Default to landingpage
  return 'landingpage';
};

// Theme name mapping
const themeNames: Record<string, string> = {
  'landingpage': 'ACATR Business Services',
  'sparti-seo-landing': 'Sparti SEO Landing',
  'gosgconsulting': 'GO SG Consulting'
};

// Dynamic theme import based on slug
const loadTheme = (slug: string) => {
  switch (slug) {
    case 'landingpage':
      return lazy(() => import('../sparti-cms/theme/landingpage'));
    case 'sparti-seo-landing':
      return lazy(() => import('../sparti-cms/theme/sparti-seo-landing'));
    case 'gosgconsulting':
      return lazy(() => import('../sparti-cms/theme/gosgconsulting'));
    default:
      return lazy(() => import('../sparti-cms/theme/landingpage'));
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const themeSlug = getThemeSlug();
  const themeName = themeNames[themeSlug] || themeSlug;
  const ThemeComponent = loadTheme(themeSlug);
  
  // Get tenant ID from window variable (if set by server)
  const tenantId = typeof window !== 'undefined' 
    ? ((window as any).__CMS_TENANT__ || undefined)
    : undefined;
  
  // Get branding settings from window variable (if set by server)
  const brandingSettings = typeof window !== 'undefined'
    ? ((window as any).__BRANDING_SETTINGS__ || null)
    : null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <ErrorBoundary>
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading theme...</p>
                    </div>
                  </div>
                }>
                  <ThemeComponent 
                    tenantName={themeName} 
                    tenantSlug={themeSlug}
                    tenantId={tenantId}
                  />
                </Suspense>
              </ErrorBoundary>
            } />
            
            {/* Catch all - redirect to theme */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Theme Development Mode</h1>
                  <p className="text-muted-foreground mb-4">
                    Theme: <code className="bg-muted px-2 py-1 rounded">{themeSlug}</code>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    All routes redirect to the theme at root (/)
                  </p>
                </div>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Set light mode by default
if (typeof document !== 'undefined') {
  document.documentElement.classList.add("light");
}

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('[testing] Root element not found');
}