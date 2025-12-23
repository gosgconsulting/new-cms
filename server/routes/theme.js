import express from 'express';

const router = express.Router();

/**
 * GET /theme/:tenantSlug
 * Hardcoded landing page - no database connection
 * This route is handled by client-side React routing
 */
router.get('/:tenantSlug', (req, res) => {
  // For server-side rendering, return a simple HTML that will be handled by client-side
  // The actual landing page is rendered by React on the client side
  const tenantSlug = req.params.tenantSlug || 'landingpage';
  
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Landing Page</title>
</head>
<body>
  <div id="root"></div>
  <script>
    // This will be handled by the client-side React router
    window.location.reload();
  </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
});

/**
 * GET /theme/:tenantSlug/:pageSlug
 * Hardcoded sub-page - no database connection
 * This route is handled by client-side React routing
 */
router.get('/:tenantSlug/:pageSlug', (req, res) => {
  // For server-side rendering, return a simple HTML that will be handled by client-side
  const tenantSlug = req.params.tenantSlug || 'landingpage';
  const pageSlug = req.params.pageSlug || '';
  
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageSlug} - Landing Page</title>
</head>
<body>
  <div id="root"></div>
  <script>
    // This will be handled by the client-side React router
    window.location.reload();
  </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
});

export default router;

