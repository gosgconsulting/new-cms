#!/usr/bin/env node
/**
 * Build script for static theme export
 * Creates a standalone frontend build for a specific theme that can be deployed independently
 * 
 * Usage:
 *   node scripts/build-theme-static.js <theme-slug>
 * 
 * Environment variable:
 *   DEPLOY_THEME_SLUG - Theme slug to build (e.g., "landingpage")
 */

import { build } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get theme slug from command line or environment variable
const themeSlug = process.argv[2] || process.env.DEPLOY_THEME_SLUG;

if (!themeSlug) {
  console.error('Error: Theme slug is required');
  console.error('Usage: node scripts/build-theme-static.js <theme-slug>');
  console.error('Or set DEPLOY_THEME_SLUG environment variable');
  process.exit(1);
}

console.log(`[testing] Building static export for theme: ${themeSlug}`);

// Check if theme exists
const themePath = path.join(__dirname, '..', 'sparti-cms', 'theme', themeSlug);
if (!fs.existsSync(themePath)) {
  console.error(`Error: Theme "${themeSlug}" not found at ${themePath}`);
  process.exit(1);
}

// Create hybrid entry point that includes both theme and admin
const standaloneEntryPath = path.join(__dirname, '..', 'src', 'theme-standalone.tsx');
const standaloneEntryContent = `import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminTopBar from "@/components/AdminTopBar";
import { AuthProvider } from "../sparti-cms/components/auth/AuthProvider";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ErrorBoundary from "./components/ErrorBoundary";
import './index.css';
import '../sparti-cms/styles/modal-sparti-fix.css';
import '../sparti-cms/styles/rich-text-editor.css';

// Import the theme component
const ThemeComponent = React.lazy(() => import('../sparti-cms/theme/${themeSlug}'));

// Theme name mapping
const themeNames: Record<string, string> = {
  'landingpage': 'ACATR Business Services',
  'sparti-seo-landing': 'Sparti SEO Landing',
  'gosgconsulting': 'GO SG Consulting'
};

const queryClient = new QueryClient();

const App = () => {
  const themeName = themeNames['${themeSlug}'] || '${themeSlug}';
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AdminTopBar />
            <Routes>
              {/* Root shows theme */}
              <Route path="/" element={
                <ErrorBoundary>
                  <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center bg-background">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading theme...</p>
                      </div>
                    </div>
                  }>
                    <ThemeComponent 
                      tenantName={themeName} 
                      tenantSlug="${themeSlug}" 
                    />
                  </Suspense>
                </ErrorBoundary>
              } />
              
              {/* Admin routes - accessible at /admin */}
              <Route path="/admin/*" element={<Admin />} />
              
              {/* Auth route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Catch all - redirect to theme */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Set light mode by default
document.documentElement.classList.add("light");

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
`;

// Write standalone entry point
fs.writeFileSync(standaloneEntryPath, standaloneEntryContent);
console.log(`[testing] Created standalone entry point: ${standaloneEntryPath}`);

// Backup original index.html and create hybrid version
const originalIndexPath = path.join(__dirname, '..', 'index.html');
const backupIndexPath = path.join(__dirname, '..', 'index.html.backup');
const themeTitle = themeSlug.split('-').map(word => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join(' ');

// Backup original index.html if it exists
if (fs.existsSync(originalIndexPath)) {
  fs.copyFileSync(originalIndexPath, backupIndexPath);
  console.log(`[testing] Backed up original index.html`);
}

// Create hybrid HTML file that uses our standalone entry point
const hybridHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${themeTitle}</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/favicon.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/theme-standalone.tsx"></script>
  </body>
</html>
`;

fs.writeFileSync(originalIndexPath, hybridHtmlContent);
console.log(`[testing] Created hybrid HTML with theme at / and admin at /admin`);

// Build configuration for theme-only build
const buildConfig = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, '..', 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.join(__dirname, '..', 'index.html'),
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    exclude: ['pg', 'express'],
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
});

// Build the theme
console.log(`[testing] Starting build process...`);
console.log(`[testing] Theme slug: ${themeSlug}`);
console.log(`[testing] Build config:`, JSON.stringify({
  outDir: 'dist',
  input: 'index.html'
}, null, 2));

build(buildConfig)
  .then(() => {
    console.log(`[testing] ✅ Hybrid app build completed successfully!`);
    console.log(`[testing] Output directory: dist/`);
    console.log(`[testing] Theme: ${themeSlug}`);
    console.log(`[testing] Theme available at: /`);
    console.log(`[testing] Admin available at: /admin`);
    
    // Clean up temporary files and restore original index.html
    try {
      fs.unlinkSync(standaloneEntryPath);
      // Restore original index.html if backup exists
      if (fs.existsSync(backupIndexPath)) {
        fs.copyFileSync(backupIndexPath, originalIndexPath);
        fs.unlinkSync(backupIndexPath);
        console.log(`[testing] Restored original index.html`);
      }
      console.log(`[testing] Cleaned up temporary files`);
    } catch (error) {
      console.warn(`[testing] Warning: Could not clean up temporary files:`, error);
    }
  })
  .catch((error) => {
    console.error(`[testing] Build failed:`, error);
    process.exit(1);
  });

