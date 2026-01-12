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
const themeSlug = process.argv[2] || process.env.DEPLOY_THEME_SLUG || process.env.VITE_DEPLOY_THEME_SLUG;

if (!themeSlug) {
  console.error('Error: Theme slug is required');
  console.error('Usage: node scripts/build-theme-static.js <theme-slug>');
  console.error('Or set DEPLOY_THEME_SLUG environment variable');
  process.exit(1);
}

// Auto-detect VITE_API_BASE_URL from Railway if not set
let viteApiBaseUrl = process.env.VITE_API_BASE_URL;
if (!viteApiBaseUrl && process.env.RAILWAY_PUBLIC_DOMAIN) {
  viteApiBaseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  console.log(`[testing] Auto-detected VITE_API_BASE_URL from Railway: ${viteApiBaseUrl}`);
} else if (!viteApiBaseUrl) {
  console.warn('[testing] WARNING: VITE_API_BASE_URL is not set');
  console.warn('[testing] Frontend API calls may fail. Set VITE_API_BASE_URL in Railway variables.');
} else {
  console.log(`[testing] VITE_API_BASE_URL: ${viteApiBaseUrl}`);
}

// Get CMS_TENANT for tenant-specific deployment
const cmsTenant = process.env.CMS_TENANT;
if (cmsTenant) {
  console.log(`[testing] CMS_TENANT: ${cmsTenant} - Theme will use this tenant ID`);
} else {
  console.warn('[testing] WARNING: CMS_TENANT is not set');
  console.warn('[testing] Theme will need to determine tenant from URL or other means.');
}

// Helper function to fetch branding during build
async function fetchBrandingForBuild(themeSlug, tenantId) {
  // Check for branding in environment variable first
  if (process.env.BRANDING_SETTINGS_JSON) {
    try {
      const branding = JSON.parse(process.env.BRANDING_SETTINGS_JSON);
      console.log(`[testing] Using branding from BRANDING_SETTINGS_JSON env var`);
      return branding;
    } catch (error) {
      console.warn(`[testing] Failed to parse BRANDING_SETTINGS_JSON:`, error);
    }
  }

  // Try to fetch from database if tenant ID is provided
  if (tenantId) {
    try {
      console.log(`[testing] Fetching branding from database for tenant: ${tenantId}`);
      const { getBrandingSettings } = await import('../sparti-cms/db/modules/branding.js');
      const settings = await getBrandingSettings(tenantId);
      const brandingData = settings.branding || {};
      
      if (brandingData && Object.keys(brandingData).length > 0) {
        console.log(`[testing] Fetched branding from database:`, Object.keys(brandingData));
        return brandingData;
      } else {
        console.warn(`[testing] No branding data found in database for tenant: ${tenantId}`);
      }
    } catch (error) {
      console.warn(`[testing] Could not fetch branding from database (database may not be available):`, error.message);
    }
  }

  return null;
}

console.log(`[testing] Building static export for theme: ${themeSlug}`);

// Check if theme exists
const themePath = path.join(__dirname, '..', 'sparti-cms', 'theme', themeSlug);
if (!fs.existsSync(themePath)) {
  console.error(`Error: Theme "${themeSlug}" not found at ${themePath}`);
  process.exit(1);
}

// Create standalone entry point with only the theme (no admin/CMS)
const standaloneEntryPath = path.join(__dirname, '..', 'src', 'theme-standalone.tsx');
const standaloneEntryContent = `import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
          <Routes>
            {/* Root shows theme */}
            <Route path="/" element={
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <ThemeComponent 
                    tenantName={themeName} 
                    tenantSlug="${themeSlug}"
                    tenantId={typeof window !== 'undefined' ? window.__CMS_TENANT__ : null}
                  />
                </Suspense>
              </ErrorBoundary>
            } />
            
            {/* Catch all - redirect to theme */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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

// Fetch branding data and create HTML (async wrapper)
async function createStandaloneHtml() {
  // Fetch branding data before creating HTML
  let brandingData = null;
  if (cmsTenant) {
    brandingData = await fetchBrandingForBuild(themeSlug, cmsTenant);
  }

  // Build script content for injection
  let scriptContent = `
      window.__THEME_DEPLOYMENT__ = true;
      window.__THEME_SLUG__ = '${themeSlug}';`;
  if (cmsTenant) {
    scriptContent += `\n      window.__CMS_TENANT__ = '${cmsTenant.replace(/'/g, "\\'")}';`;
  }
  if (brandingData && Object.keys(brandingData).length > 0) {
    // Escape JSON for safe injection into HTML
    const brandingJson = JSON.stringify(brandingData)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/\//g, '\\/');
    scriptContent += `\n      window.__BRANDING_SETTINGS__ = ${brandingJson};`;
    console.log(`[testing] Branding will be injected into HTML:`, Object.keys(brandingData));
  }

  // Get favicon from branding or use default
  const faviconUrl = (brandingData && brandingData.site_favicon) 
    ? brandingData.site_favicon 
    : '/favicon.png';
  
  // Get title from branding or use theme title
  // Escape HTML entities for safety
  const getPageTitle = () => {
    if (brandingData && brandingData.site_name) {
      return brandingData.site_name
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    return themeTitle;
  };
  const pageTitle = getPageTitle();
  
  if (brandingData && brandingData.site_favicon) {
    console.log(`[testing] Using favicon from branding: ${faviconUrl}`);
  }

  // Create standalone HTML file that uses our theme-only entry point
  const standaloneHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle}</title>
    <link rel="icon" type="image/png" href="${faviconUrl}" />
    <link rel="apple-touch-icon" href="${faviconUrl}" />
    <!-- Allow indexing for theme deployments -->
    <meta name="robots" content="index, follow" />
    <script>${scriptContent}
    </script>
    <!-- CUSTOM_CODE_HEAD_PLACEHOLDER -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/theme-standalone.tsx"></script>
    <!-- CUSTOM_CODE_BODY_PLACEHOLDER -->
  </body>
</html>
`;

  fs.writeFileSync(originalIndexPath, standaloneHtmlContent);
  console.log(`[testing] Created standalone HTML with theme at /`);
  
  return brandingData;
}

// Create HTML with branding
const brandingData = await createStandaloneHtml();

// Build configuration for theme-only build
// Note: Branding is already injected directly into the HTML template above
// We don't need the plugin here since we're doing direct injection
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

// Cleanup function to ensure files are restored on failure
function cleanupOnFailure() {
  try {
    // Restore original index.html if backup exists
    if (fs.existsSync(backupIndexPath)) {
      fs.copyFileSync(backupIndexPath, originalIndexPath);
      fs.unlinkSync(backupIndexPath);
      console.log(`[testing] Restored original index.html after failure`);
    }
    // Remove temporary entry point
    if (fs.existsSync(standaloneEntryPath)) {
      fs.unlinkSync(standaloneEntryPath);
    }
  } catch (error) {
    console.warn(`[testing] Warning: Could not clean up temporary files:`, error);
  }
}

// Verify build output exists and is valid
function verifyBuildOutput() {
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Build failed: dist directory does not exist');
  }
  const distContents = fs.readdirSync(distPath);
  if (distContents.length === 0) {
    throw new Error('Build failed: dist directory is empty');
  }
  // Check for index.html
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Build failed: index.html not found in dist');
  }
  console.log(`[testing] Build verification passed: ${distContents.length} files in dist/`);
}

// Build the theme
(async () => {
  try {
    await build(buildConfig);
    // Verify build output
    verifyBuildOutput();
    
    console.log(`[testing] ✅ Standalone theme build completed successfully!`);
    console.log(`[testing] Output directory: dist/`);
    console.log(`[testing] Theme: ${themeSlug}`);
    console.log(`[testing] Theme available at: /`);
    console.log(`[testing] Standalone deployment - no admin/CMS routes`);
    
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
  } catch (error) {
    console.error(`[testing] Build failed:`, error);
    // Cleanup on failure
    cleanupOnFailure();
    process.exit(1);
  }
})();

