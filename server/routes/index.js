import express from 'express';
import { authenticateTenantApiKey } from '../middleware/tenantApiKey.js';
import { authenticateWithAccessKey } from '../middleware/accessKey.js';
import { renderPageBySlug } from '../../sparti-cms/render/pageRenderer.js';
import { getPageCache, setPageCache } from '../../sparti-cms/cache/index.js';

// Import all route modules
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import contentRoutes from './content.js';
import formsRoutes from './forms.js';
import crmRoutes from './crm.js';
import settingsRoutes from './settings.js';
import seoRoutes from './seo.js';
import systemRoutes from './system.js';
import publicRoutes from './public.js';

const router = express.Router();

// Apply access key authentication middleware to all API routes except verify-access-key and v1 routes
router.use('/api', (req, res, next) => {
  // Skip access key authentication for the verify-access-key endpoint
  // req.path includes the full path from the request
  if (req.path === '/api/auth/verify-access-key') {
    return next();
  }
  // Skip access key authentication for v1 routes (they use tenant API key authentication)
  if (req.path.startsWith('/api/v1')) {
    return next();
  }
  return authenticateWithAccessKey(req, res, next);
});

// Mount routes
// Health check routes
router.use('/', healthRoutes);

// Public API v1 routes (requires tenant API key authentication)
router.use('/api/v1', authenticateTenantApiKey, publicRoutes);

// All other API routes
router.use('/api', authRoutes);
router.use('/api', contentRoutes);
router.use('/api', formsRoutes);
router.use('/api', crmRoutes);
router.use('/api', settingsRoutes);
router.use('/api', seoRoutes);
router.use('/api', systemRoutes);

// Server-rendered page route (mounted at root, not under /api)
router.get('/r/:slug', async (req, res) => {
  try {
    const slug = '/' + req.params.slug;
    const cached = getPageCache(slug);
    if (cached) {
      res.setHeader('ETag', cached.etag);
      res.setHeader('Cache-Control', 'public, max-age=30');
      return res.status(200).send(cached.html);
    }

    const result = await renderPageBySlug(slug);
    if (result.status === 404) {
      return res.status(404).send('<h1>Not Found</h1>');
    }

    const etag = 'W/"' + Buffer.from(String(result.html.length)).toString('hex') + '"';
    setPageCache(slug, { html: result.html, etag, renderedAt: Date.now() });

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=30');
    res.status(200).send(result.html);
  } catch (error) {
    console.error('[testing] Error rendering page:', error);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});

export default router;

