import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
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

async function getAstroHandler() {
  if (cachedHandler) return cachedHandler;

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
            <p>The Astro build output was not found. Build should generate:</p>
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
