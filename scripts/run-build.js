#!/usr/bin/env node
/**
 * Conditional production build (Vercel / generic).
 * If DEPLOY_THEME_SLUG or VITE_DEPLOY_THEME_SLUG is set, runs npm run build:theme.
 * Otherwise runs npm run build.
 */

import 'dotenv/config';
import { spawnSync } from 'child_process';

const deployThemeSlug = process.env.DEPLOY_THEME_SLUG || process.env.VITE_DEPLOY_THEME_SLUG;

// Auto-detect VITE_API_BASE_URL from Vercel URL if not set
if (!process.env.VITE_API_BASE_URL) {
  const vercelUrl = process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl) {
    process.env.VITE_API_BASE_URL = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    console.log('[testing] Auto-detected VITE_API_BASE_URL from Vercel:', process.env.VITE_API_BASE_URL);
  } else {
    process.env.VITE_API_BASE_URL = 'http://localhost:4173';
    console.warn('[testing] WARNING: VITE_API_BASE_URL not set, using fallback:', process.env.VITE_API_BASE_URL);
  }
} else {
  console.log('[testing] Using provided VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL);
}

const isThemeBuild = deployThemeSlug && String(deployThemeSlug).trim() !== '';

if (isThemeBuild) {
  console.log('[testing] Building standalone theme for:', deployThemeSlug);
  const result = spawnSync('npm', ['run', 'build:theme'], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });
  process.exit(result.status ?? (result.signal ? 1 : 0));
} else {
  console.log('[testing] Building full CMS application');
  const result = spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });
  process.exit(result.status ?? (result.signal ? 1 : 0));
}
