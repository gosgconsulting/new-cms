#!/usr/bin/env node
/**
 * Docker startup script (Node.js version for better error handling)
 * If DEPLOY_THEME_SLUG is set, serve standalone theme frontend (no backend, no CMS)
 * Otherwise, start the full CMS server
 */

const deployThemeSlug = process.env.DEPLOY_THEME_SLUG;
const port = process.env.PORT || 4173;

if (deployThemeSlug) {
  console.log('[testing] Starting standalone theme deployment: Theme at / (no admin/CMS)');
  console.log('[testing] Theme slug:', deployThemeSlug);
  console.log('[testing] PORT:', port);
  console.log('[testing] Current directory:', process.cwd());
  console.log('[testing] Node version:', process.version);
  
  // Import and execute the serve script directly
  // This ensures proper signal handling and process management
  import('./serve-theme-static.js').catch((error) => {
    console.error('[testing] ❌ Failed to start theme server:', error);
    process.exit(1);
  });
} else {
  console.log('[testing] Starting full CMS server');
  // Import and execute the entrypoint script directly
  import('./docker-entrypoint.js').catch((error) => {
    console.error('[testing] ❌ Failed to start CMS server:', error);
    process.exit(1);
  });
}

