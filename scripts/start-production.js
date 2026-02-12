#!/usr/bin/env node
/**
 * Production startup script (Docker-agnostic).
 * If DEPLOY_THEME_SLUG is set, serve standalone theme frontend (no backend, no CMS).
 * Otherwise, start the full CMS server via entrypoint.js.
 */

// Load environment variables from .env file first
import 'dotenv/config';

// Check environment variable - be explicit about checking for truthy values
// Check DEPLOY_THEME_SLUG first, then fall back to VITE_DEPLOY_THEME_SLUG
const deployThemeSlug = process.env.DEPLOY_THEME_SLUG || process.env.VITE_DEPLOY_THEME_SLUG;
const port = process.env.PORT || 4173;

// Log all environment variables for debugging (but not sensitive ones)
console.log('[testing] ========================================');
console.log('[testing] Production Start Script');
console.log('[testing] ========================================');
console.log('[testing] DEPLOY_THEME_SLUG:', deployThemeSlug || '(not set)');
console.log('[testing] CMS_TENANT:', process.env.CMS_TENANT || '(not set)');
console.log('[testing] process.env.DEPLOY_THEME_SLUG:', process.env.DEPLOY_THEME_SLUG || '(not set)');
console.log('[testing] process.env.VITE_DEPLOY_THEME_SLUG:', process.env.VITE_DEPLOY_THEME_SLUG || '(not set)');
console.log('[testing] PORT:', port);
console.log('[testing] NODE_ENV:', process.env.NODE_ENV || '(not set)');
console.log('[testing] Current directory:', process.cwd());
console.log('[testing] Node version:', process.version);
console.log('[testing] ========================================');

// Check if DEPLOY_THEME_SLUG is set and not empty
(async () => {
  try {
    if (deployThemeSlug && deployThemeSlug.trim() !== '') {
      console.log('[testing] ✅ DEPLOY_THEME_SLUG detected - Starting standalone theme deployment');
      console.log('[testing] Theme slug:', deployThemeSlug);
      console.log('[testing] Theme will be served at: / (root path)');
      console.log('[testing] No admin/CMS routes will be available');
      
      // Import and execute the serve script directly
      await import('./serve-theme-static.js');
    } else {
      console.log('[testing] ⚠️  DEPLOY_THEME_SLUG not set - Starting full CMS server');
      console.log('[testing] Full CMS with admin routes will be available');
      await import('./entrypoint.js');
    }
  } catch (error) {
    console.error('[testing] ❌ Failed to start server:', error);
    console.error('[testing] Error details:', error.message);
    console.error('[testing] Stack:', error.stack);
    process.exit(1);
  }
})();
