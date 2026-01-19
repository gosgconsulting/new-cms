import express from 'express';
import { extractThemeFromUrl } from '../middleware/themeUrl.js';

const router = express.Router();

/**
 * GET /theme/:themeSlug/auth
 * Serves the auth page with theme context
 * No authentication required - this is the login page
 * The actual auth page is handled by client-side React routing
 */
router.get('/:themeSlug/auth', extractThemeFromUrl, (req, res) => {
  const themeSlug = req.params.themeSlug;
  
  // Return HTML that will be handled by client-side React
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login - ${themeSlug}</title>
</head>
<body>
  <div id="root"></div>
  <script>
    // Store theme context in sessionStorage for client-side routing
    sessionStorage.setItem('themeContext', '${themeSlug}');
    // Redirect to client-side auth route
    window.location.href = '/theme/${themeSlug}/auth';
  </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
});

/**
 * IMPORTANT: This router only handles /auth paths.
 * All other paths (like /theme/str, /theme/str/group-class, etc.) 
 * will automatically pass through to the next router (themeRoutes)
 * because Express Router only matches routes that are explicitly defined.
 * No catch-all needed - unmatched routes automatically pass to next middleware.
 */

export default router;

