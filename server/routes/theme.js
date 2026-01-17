import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * GET /theme/:tenantSlug/:pageSlug
 * Serves the React app's index.html for client-side routing
 * The actual page is rendered by React on the client side
 * This route handles 2-segment paths like /theme/str/booking
 */
router.get('/:tenantSlug/:pageSlug', (req, res) => {
  // Serve the React app's index.html so client-side routing can handle it
  const indexPath = join(__dirname, '..', '..', 'dist', 'index.html');
  if (existsSync(indexPath)) {
    try {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('[testing] Error sending index.html:', err);
          if (!res.headersSent) {
            res.status(500).json({
              status: 'error',
              message: 'Failed to serve application',
              error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
          }
        }
      });
    } catch (error) {
      console.error('[testing] Error in theme route:', error);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to serve application',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  } else {
    res.status(200).json({ 
      status: 'error', 
      message: 'React app not built. Please build the app first.',
      timestamp: new Date().toISOString() 
    });
  }
});

/**
 * Note: Express Router with path-to-regexp v8 doesn't support /* wildcard syntax
 * for catch-all routes. The 2-segment route above handles /theme/str/booking,
 * and deeper nested paths (3+ segments) will be handled by client-side routing
 * after index.html is loaded. This is acceptable since React Router handles
 * all client-side navigation.
 */

/**
 * GET /theme/:tenantSlug
 * Serves the React app's index.html for client-side routing
 * The actual landing page is rendered by React on the client side
 * This route handles 1-segment paths like /theme/str
 * Must come last to avoid matching longer paths
 */
router.get('/:tenantSlug', (req, res) => {
  // Serve the React app's index.html so client-side routing can handle it
  const indexPath = join(__dirname, '..', '..', 'dist', 'index.html');
  if (existsSync(indexPath)) {
    try {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('[testing] Error sending index.html:', err);
          if (!res.headersSent) {
            res.status(500).json({
              status: 'error',
              message: 'Failed to serve application',
              error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
          }
        }
      });
    } catch (error) {
      console.error('[testing] Error in theme route:', error);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to serve application',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  } else {
    res.status(200).json({ 
      status: 'error', 
      message: 'React app not built. Please build the app first.',
      timestamp: new Date().toISOString() 
    });
  }
});

export default router;

