import express from 'express';
import { extractThemeFromUrl } from '../middleware/themeUrl.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * GET /theme/:themeSlug/auth
 * Serve the React app so client-side routing renders the Auth page.
 */
router.get('/:themeSlug/auth', extractThemeFromUrl, (req, res) => {
  const indexPath = join(__dirname, '..', '..', 'dist', 'index.html');
  if (existsSync(indexPath)) {
    return res.sendFile(indexPath, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to serve application',
        });
      }
    });
  }
  // Fallback when app isn't built
  return res.status(200).json({
    status: 'error',
    message: 'React app not built. Please build the app first.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * IMPORTANT: This router only handles /auth paths.
 * All other paths (like /theme/str, /theme/str/group-class, etc.)
 * will pass through to the next router (themeRoutes).
 */

export default router;