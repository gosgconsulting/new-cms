#!/usr/bin/env node
/**
 * Docker startup script (Node.js version for better error handling)
 * If DEPLOY_THEME_SLUG is set, serve standalone theme frontend (no backend, no CMS)
 * Otherwise, start the full CMS server
 */

// Check environment variable - be explicit about checking for truthy values
const deployThemeSlug = process.env.DEPLOY_THEME_SLUG;
const port = process.env.PORT || 4173;

// Log all environment variables for debugging (but not sensitive ones)
console.log('[testing] ========================================');
console.log('[testing] Docker Theme Start Script');
console.log('[testing] ========================================');
console.log('[testing] DEPLOY_THEME_SLUG:', deployThemeSlug || '(not set)');
console.log('[testing] PORT:', port);
console.log('[testing] NODE_ENV:', process.env.NODE_ENV || '(not set)');
console.log('[testing] Current directory:', process.cwd());
console.log('[testing] Node version:', process.version);
console.log('[testing] ========================================');

// Check if DEPLOY_THEME_SLUG is set and not empty
if (deployThemeSlug && deployThemeSlug.trim() !== '') {
  console.log('[testing] ✅ DEPLOY_THEME_SLUG detected - Starting standalone theme deployment');
  console.log('[testing] Theme slug:', deployThemeSlug);
  console.log('[testing] Theme will be served at: / (root path)');
  console.log('[testing] No admin/CMS routes will be available');
  
  // Import and execute the serve script directly
  // This ensures proper signal handling and process management
  import('./serve-theme-static.js').catch((error) => {
    console.error('[testing] ❌ Failed to start theme server:', error);
    console.error('[testing] Error details:', error.message);
    console.error('[testing] Stack:', error.stack);
    process.exit(1);
  });
} else {
  console.log('[testing] ⚠️  DEPLOY_THEME_SLUG not set - Starting full CMS server');
  console.log('[testing] Full CMS with admin routes will be available');
  // Import and execute the entrypoint script directly
  import('./docker-entrypoint.js').catch((error) => {
    console.error('[testing] ❌ Failed to start CMS server:', error);
    console.error('[testing] Error details:', error.message);
    console.error('[testing] Stack:', error.stack);
    process.exit(1);
  });
}

