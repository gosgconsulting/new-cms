import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'node:child_process';
import { query } from '../../sparti-cms/db/index.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ASTRO_PROJECT_DIR = join(
  __dirname,
  '..',
  '..',
  'sparti-cms',
  'theme',
  'migrations',
  'mainline-astro-template-master'
);

const ASTRO_DIST_DIR = join(ASTRO_PROJECT_DIR, 'dist');
const ASTRO_CLIENT_DIR = join(ASTRO_DIST_DIR, 'client');
const ASTRO_SERVER_ENTRY = join(ASTRO_DIST_DIR, 'server', 'entry.mjs');

let cachedHandler = null;
let buildPromise = null;

function buildAstroOnce() {
  if (buildPromise) return buildPromise;

  buildPromise = new Promise((resolve, reject) => {
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(npxCmd, ['astro', 'build'], {
      cwd: ASTRO_PROJECT_DIR,
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    });

    child.on('exit', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Astro build failed with code ${code}`));
    });

    child.on('error', (err) => reject(err));
  }).finally(() => {
    // Allow retry if build failed
    if (!existsSync(ASTRO_SERVER_ENTRY)) {
      buildPromise = null;
    }
  });

  return buildPromise;
}

async function getAstroHandler() {
  if (cachedHandler) return cachedHandler;

  // Dev convenience: if not built yet, attempt a build once.
  if (!existsSync(ASTRO_SERVER_ENTRY)) {
    try {
      await buildAstroOnce();
    } catch (err) {
      console.error('[master-astro] Build error:', err);
      return null;
    }
  }

  if (!existsSync(ASTRO_SERVER_ENTRY)) {
    return null;
  }

  // Import as file URL (Node ESM)
  const mod = await import(`file://${ASTRO_SERVER_ENTRY}`);
  cachedHandler = mod.handler;
  return cachedHandler;
}

async function resolveTenantId(req) {
  // Allow explicit override (useful for testing)
  const fromQuery = req.query?.tenantId;
  const fromHeader = req.headers['x-tenant-id'];

  if (typeof fromQuery === 'string' && fromQuery.trim()) return fromQuery.trim();
  if (typeof fromHeader === 'string' && fromHeader.trim()) return fromHeader.trim();

  // Fallback: pick the first tenant using theme_id = 'master'
  const result = await query(
    `SELECT id FROM tenants WHERE theme_id = 'master' ORDER BY created_at DESC LIMIT 1`,
    []
  );
  return result.rows[0]?.id || null;
}

// Serve Astro client assets first
router.use((req, res, next) => {
  if (!existsSync(ASTRO_CLIENT_DIR)) return next();
  return express.static(ASTRO_CLIENT_DIR)(req, res, next);
});

// SSR all remaining routes with Astro
router.use(async (req, res, next) => {
  try {
    const handler = await getAstroHandler();

    if (!handler) {
      return res
        .status(200)
        .send(
          `<html><body style="font-family: system-ui; padding: 24px;">
            <h1>Master Astro theme is not built yet</h1>
            <p>We attempted to build it automatically, but the build output was not found.</p>
            <p>Expected:</p>
            <pre>${ASTRO_SERVER_ENTRY}</pre>
          </body></html>`
        );
    }

    const tenantId = await resolveTenantId(req);
    if (tenantId) {
      // Make tenantId available to Astro (for server-side CMS fetches)
      req.headers['x-tenant-id'] = tenantId;
    }

    return handler(req, res, next);
  } catch (err) {
    console.error('[master-astro] SSR error:', err);
    return next(err);
  }
});

export default router;