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
import usersRoutes from './users.js';
import themeRoutes from './theme.js';
import themeAdminRoutes from './theme-admin.js';
import themesApiRoutes from './themes.js';
import tenantsApiRoutes from './tenants-api.js';
import aiAssistantRoutes from './ai-assistant.js';
import shopRoutes from './shop.js';
import mediaRoutes from './media.js';
import docsRoutes from './docs.js';

const router = express.Router();

// Apply access key authentication middleware to all API routes except verify-access-key and v1 routes
router.use('/api', (req, res, next) => {
  // Skip authentication for OPTIONS requests (handled by CORS middleware)
  if (req.method === 'OPTIONS') {
    return next();
  }
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

// Public tenant API routes (no authentication required for by-slug endpoint)
router.use('/api/tenants', tenantsApiRoutes);

// Public themes API routes
router.use('/api/themes', themesApiRoutes);

// All other API routes
router.use('/api', authRoutes);
router.use('/api', contentRoutes);
router.use('/api', formsRoutes);
router.use('/api', crmRoutes);
router.use('/api', settingsRoutes);
router.use('/api', seoRoutes);
router.use('/api', systemRoutes);
router.use('/api', usersRoutes);
router.use('/api', aiAssistantRoutes);
router.use('/api/shop', shopRoutes);
router.use('/api/media', mediaRoutes);
router.use('/api', docsRoutes);

// Theme routes (mounted before other routes to catch /theme/* paths)
// Theme admin/auth routes (must come before general theme routes)
router.use('/theme', themeAdminRoutes);
router.use('/theme', themeRoutes);

// Dynamic robots.txt route - serves different content based on deployment type
router.get('/robots.txt', (req, res) => {
  const deployThemeSlug = process.env.DEPLOY_THEME_SLUG;
  const cmsTenant = process.env.CMS_TENANT;
  
  // Check if this is a theme deployment (both DEPLOY_THEME_SLUG and CMS_TENANT should be set)
  const isThemeDeployment = deployThemeSlug && cmsTenant;
  
  res.setHeader('Content-Type', 'text/plain');
  
  if (isThemeDeployment) {
    // Allow indexing for theme deployments
    res.send(`User-agent: *
Allow: /

# Sitemap
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml
`);
    console.log('[testing] Serving robots.txt for theme deployment - allowing indexing');
  } else {
    // Prevent indexing for CMS admin interface
    res.send(`User-agent: *
Disallow: /

# CMS Admin Interface - Not for public indexing
`);
    console.log('[testing] Serving robots.txt for CMS admin - preventing indexing');
  }
});

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