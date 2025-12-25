import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * GET /theme/:tenantSlug
 * Serves the React app's index.html for client-side routing
 * The actual landing page is rendered by React on the client side
 */
router.get('/:tenantSlug', (req, res) => {
  // Serve the React app's index.html so client-side routing can handle it
  const indexPath = join(__dirname, '..', '..', 'dist', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ 
      status: 'error', 
      message: 'React app not built. Please build the app first.',
      timestamp: new Date().toISOString() 
    });
  }
});

/**
 * GET /theme/:tenantSlug/:pageSlug
 * Serves the React app's index.html for client-side routing
 * The actual page is rendered by React on the client side
 */
router.get('/:tenantSlug/:pageSlug', (req, res) => {
  // Serve the React app's index.html so client-side routing can handle it
  const indexPath = join(__dirname, '..', '..', 'dist', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ 
      status: 'error', 
      message: 'React app not built. Please build the app first.',
      timestamp: new Date().toISOString() 
    });
  }
});

export default router;

