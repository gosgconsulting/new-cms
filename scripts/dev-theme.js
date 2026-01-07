#!/usr/bin/env node
/**
 * Development server for theme development with hot reload
 * 
 * Usage:
 *   node scripts/dev-theme.js [theme-slug]
 *   DEPLOY_THEME_SLUG=landingpage node scripts/dev-theme.js
 * 
 * This script:
 * - Uses Vite plugin to inject theme dev code at runtime (no file modification)
 * - Starts Vite dev server with hot module replacement
 * - Allows you to develop themes with instant feedback
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get theme slug from command line or environment variable
const themeSlug = process.argv[2] || process.env.VITE_DEPLOY_THEME_SLUG || 'landingpage';
// Get tenant ID from command line (3rd arg) or environment variable
const tenantId = process.argv[3] || process.env.CMS_TENANT || null;

console.log('==========================================');
console.log('Theme Development Server');
console.log('==========================================');
console.log(`Theme: ${themeSlug}`);
if (tenantId) {
  console.log(`Tenant: ${tenantId} (branding will be fetched)`);
} else {
  console.log(`Tenant: not set (branding will not be fetched)`);
}
console.log(`Port: 8080 (Vite default)`);
console.log(`URL: http://localhost:8080/`);
console.log('==========================================');
console.log('');

// Check if theme exists
const themePath = join(__dirname, '..', 'sparti-cms', 'theme', themeSlug);
if (!existsSync(themePath)) {
  console.error(`❌ Error: Theme '${themeSlug}' not found at ${themePath}`);
  console.log('');
  console.log('Available themes:');
  const themesDir = join(__dirname, '..', 'sparti-cms', 'theme');
  if (existsSync(themesDir)) {
    const themes = readdirSync(themesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== 'custom')
      .map(dirent => dirent.name);
    themes.forEach(theme => console.log(`  - ${theme}`));
  }
  process.exit(1);
}

// Set environment variables for Vite and the plugin
process.env.VITE_DEV_THEME_SLUG = themeSlug;
process.env.VITE_DEPLOY_THEME_SLUG = themeSlug;
process.env.THEME_DEV_MODE = 'true';
if (tenantId) {
  process.env.CMS_TENANT = tenantId;
}

// Set API base URL if not set (for branding fetch)
if (!process.env.VITE_API_BASE_URL && !process.env.CMS_BACKEND_URL) {
  process.env.VITE_API_BASE_URL = 'http://localhost:4173';
  process.env.CMS_BACKEND_URL = 'http://localhost:4173';
}

// Start Vite dev server
console.log('🚀 Starting Vite development server...');
console.log('');
console.log('📝 Environment variables set:');
console.log(`   - VITE_DEV_THEME_SLUG: ${themeSlug}`);
console.log(`   - DEPLOY_THEME_SLUG: ${themeSlug}`);
console.log(`   - THEME_DEV_MODE: true`);
if (tenantId) {
  console.log(`   - CMS_TENANT: ${tenantId}`);
}
console.log(`   - VITE_API_BASE_URL: ${process.env.VITE_API_BASE_URL || process.env.CMS_BACKEND_URL || 'http://localhost:4173'}`);
console.log('');
console.log('📝 Tips:');
console.log(`   - Theme is available at: http://localhost:8080/`);
console.log(`   - Change theme via URL: http://localhost:8080/?theme=sparti-seo-landing`);
console.log(`   - Hot reload is enabled - edit files and see changes instantly`);
console.log(`   - Code injection happens at runtime (index.html not modified)`);
console.log(`   - __THEME_DEV_MODE__ will be injected into HTML`);
if (tenantId) {
  console.log(`   - Branding will be fetched from API: /api/v1/theme/${themeSlug}/branding`);
  console.log(`   - Make sure backend is running on port 4173 for branding to work`);
} else {
  console.log(`   - To fetch branding, pass tenant ID: npm run dev:theme ${themeSlug} <tenant-id>`);
}
console.log(`   - Press Ctrl+C to stop`);
console.log('');

// Use Vite's CLI to start dev server
// The vite.config.ts will detect the environment variables and use the plugin
const viteProcess = spawn('npx', ['vite', '--host', '::', '--port', '8080'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_DEV_THEME_SLUG: themeSlug,
    DEPLOY_THEME_SLUG: themeSlug,
    THEME_DEV_MODE: 'true',
    ...(tenantId && { CMS_TENANT: tenantId }),
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || process.env.CMS_BACKEND_URL || 'http://localhost:4173',
    CMS_BACKEND_URL: process.env.CMS_BACKEND_URL || process.env.VITE_API_BASE_URL || 'http://localhost:4173',
  }
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n[testing] Stopping development server...');
  viteProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  viteProcess.kill();
  process.exit(0);
});

viteProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[testing] Vite process exited with code ${code}`);
  }
  process.exit(code || 0);
});

