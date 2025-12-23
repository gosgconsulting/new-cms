import express from 'express';
import { extractTemplateFromUrl } from '../middleware/templateUrl.js';

const router = express.Router();

/**
 * GET /template/:templateSlug/admin
 * Serves the admin page with template context
 * If user is not authenticated, they will be redirected by client-side routing
 */
router.get('/:templateSlug/admin', extractTemplateFromUrl, (req, res) => {
  const templateSlug = req.params.templateSlug;
  
  // Return HTML that will be handled by client-side React
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin - ${templateSlug}</title>
</head>
<body>
  <div id="root"></div>
  <script>
    // Store template context in sessionStorage for client-side routing
    sessionStorage.setItem('templateContext', '${templateSlug}');
  </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
});

/**
 * GET /template/:templateSlug/auth
 * Serves the auth page with template context
 * The actual auth page is handled by client-side React routing
 */
router.get('/:templateSlug/auth', extractTemplateFromUrl, (req, res) => {
  const templateSlug = req.params.templateSlug;
  
  // Return HTML that will be handled by client-side React
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login - ${templateSlug}</title>
</head>
<body>
  <div id="root"></div>
  <script>
    // Store template context in sessionStorage for client-side routing
    sessionStorage.setItem('templateContext', '${templateSlug}');
    // Redirect to client-side auth route
    window.location.href = '/template/${templateSlug}/auth';
  </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
});

export default router;

