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

// Create standalone entry point for theme
const standaloneEntryPath = path.join(__dirname, '..', 'src', 'theme-standalone.tsx');
const standaloneEntryContent = `import React from 'react';
import { createRoot } from 'react-dom/client';
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

const App = () => {
  const themeName = themeNames['${themeSlug}'] || '${themeSlug}';
  
  return (
    <React.Suspense fallback={
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
    </React.Suspense>
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

// Create standalone HTML file
const standaloneHtmlPath = path.join(__dirname, '..', 'index-theme.html');
const themeTitle = themeSlug.split('-').map(word => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join(' ');

const standaloneHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${themeTitle}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/theme-standalone.tsx"></script>
  </body>
</html>
`;

fs.writeFileSync(standaloneHtmlPath, standaloneHtmlContent);
console.log(`[testing] Created standalone HTML: ${standaloneHtmlPath}`);

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
    outDir: 'dist-theme',
    emptyOutDir: true,
    rollupOptions: {
      input: standaloneHtmlPath,
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
  outDir: 'dist-theme',
  input: standaloneHtmlPath
}, null, 2));

build(buildConfig)
  .then(() => {
    console.log(`[testing] ✅ Static theme build completed successfully!`);
    console.log(`[testing] Output directory: dist-theme/`);
    console.log(`[testing] Theme: ${themeSlug}`);
    console.log(`[testing] You can deploy the contents of dist-theme/ to any static hosting service.`);
    
    // Clean up temporary files
    try {
      fs.unlinkSync(standaloneEntryPath);
      fs.unlinkSync(standaloneHtmlPath);
      console.log(`[testing] Cleaned up temporary files`);
    } catch (error) {
      console.warn(`[testing] Warning: Could not clean up temporary files:`, error);
    }
  })
  .catch((error) => {
    console.error(`[testing] Build failed:`, error);
    process.exit(1);
  });

