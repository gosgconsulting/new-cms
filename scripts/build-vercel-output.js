#!/usr/bin/env node
/**
 * Build Output API: produces .vercel/output/ with static files and serverless function.
 * Run as Vercel buildCommand; runs Vite (or build:theme) then assembles output.
 */
import 'dotenv/config';
import { spawnSync } from 'child_process';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EXTERNALS_TO_INSTALL } from './vercel-api-externals.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Auto-detect VITE_API_BASE_URL from Vercel URL if not set
if (!process.env.VITE_API_BASE_URL) {
  const vercelUrl = process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl) {
    process.env.VITE_API_BASE_URL = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    console.log('[build:vercel] Auto-detected VITE_API_BASE_URL from Vercel:', process.env.VITE_API_BASE_URL);
  } else {
    process.env.VITE_API_BASE_URL = 'http://localhost:4173';
    console.warn('[build:vercel] WARNING: VITE_API_BASE_URL not set, using fallback:', process.env.VITE_API_BASE_URL);
  }
}

const deployThemeSlug = process.env.DEPLOY_THEME_SLUG || process.env.VITE_DEPLOY_THEME_SLUG;
const isThemeBuild = deployThemeSlug && String(deployThemeSlug).trim() !== '';

// Step 1: Run frontend build (Vite or theme)
if (isThemeBuild) {
  console.log('[build:vercel] Building standalone theme for:', deployThemeSlug);
  const themeResult = spawnSync('npm', ['run', 'build:theme'], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
    cwd: rootDir,
  });
  if (themeResult.status !== 0) {
    process.exit(themeResult.status ?? (themeResult.signal ? 1 : 0));
  }
} else {
  console.log('[build:vercel] Running Vite build');
  const viteResult = spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
    cwd: rootDir,
  });
  if (viteResult.status !== 0) {
    process.exit(viteResult.status ?? (viteResult.signal ? 1 : 0));
  }
}

const outputDir = join(rootDir, '.vercel', 'output');
const staticDir = join(outputDir, 'static');
const funcDir = join(outputDir, 'functions', 'api', 'index.func');
const distDir = join(rootDir, 'dist');

// Step 2: Create output directories
mkdirSync(staticDir, { recursive: true });
mkdirSync(funcDir, { recursive: true });

// Step 3: Copy dist/ to .vercel/output/static/
cpSync(distDir, staticDir, { recursive: true });
console.log('[build:vercel] Copied dist/ to .vercel/output/static/');

// Step 4: Run API bundle (writes .vercel/output/functions/api/index.func/index.js)
const bundleResult = spawnSync('node', ['scripts/bundle-vercel-api.js'], {
  stdio: 'inherit',
  env: process.env,
  cwd: rootDir,
});
if (bundleResult.status !== 0) {
  process.exit(bundleResult.status ?? 1);
}

// Step 5: Write .vc-config.json
const vcConfig = {
  runtime: 'nodejs20.x',
  handler: 'index.js',
  launcherType: 'Nodejs',
  shouldAddHelpers: true,
  maxDuration: 60,
};
writeFileSync(join(funcDir, '.vc-config.json'), JSON.stringify(vcConfig, null, 2) + '\n');
console.log('[build:vercel] Wrote .vercel/output/functions/api/index.func/.vc-config.json');

// Step 5b: Write package.json so Vercel installs external deps; "type": "module" for ESM
const rootPkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
const funcDeps = {};
for (const name of EXTERNALS_TO_INSTALL) {
  const ver = rootPkg.dependencies?.[name] ?? rootPkg.devDependencies?.[name];
  if (ver) funcDeps[name] = ver;
}
const funcPkg = {
  type: 'module',
  dependencies: funcDeps,
};
writeFileSync(join(funcDir, 'package.json'), JSON.stringify(funcPkg, null, 2) + '\n');
console.log('[build:vercel] Wrote .vercel/output/functions/api/index.func/package.json');

// Step 6: Write config.json (routes)
// Function routes first (phase 1). Then handle: "filesystem" so SPA fallback
// only runs after static files are checked - otherwise /assets/*.js gets index.html (wrong MIME).
const config = {
  version: 3,
  routes: [
    { src: '/api/(.*)', dest: '/api/index' },
    { src: '/health', dest: '/api/index' },
    { src: '/health/(.*)', dest: '/api/index' },
    { src: '/robots.txt', dest: '/api/index' },
    { src: '/r/(.*)', dest: '/api/index' },
    { handle: 'filesystem' },
    { src: '/theme/(.*)', dest: '/index.html' },
    { src: '/(.*)', dest: '/index.html' },
  ],
};
writeFileSync(join(outputDir, 'config.json'), JSON.stringify(config, null, 2) + '\n');
console.log('[build:vercel] Wrote .vercel/output/config.json');

console.log('[build:vercel] Build Output API build complete: .vercel/output/');
