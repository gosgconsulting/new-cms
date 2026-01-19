import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { app } from './config/app.js';
import { ensureUploadsDir } from './utils/uploads.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
ensureUploadsDir();


// Routes (includes access key authentication middleware)
// IMPORTANT: Routes must come before static middleware to handle theme routes correctly
app.use(routes);

// Serve theme assets from sparti-cms/theme directory
// Only serve actual asset files (with extensions), not HTML routes or directories
app.use('/theme', (req, res, next) => {
  // Skip if this looks like a route (no file extension) - let route handlers deal with it
  const path = req.path;
  // Only serve files with extensions (assets like .js, .css, .png, etc.)
  // Skip paths that look like routes (no extension or ending with /)
  if (!path || path.endsWith('/') || !/\.([a-zA-Z0-9]+)$/.test(path)) {
    return next(); // Pass to route handlers
  }
  // Serve static files
  express.static(join(__dirname, '..', 'sparti-cms', 'theme'))(req, res, next);
});

// Serve static files from the 'public' directory
app.use(express.static(join(__dirname, '..', 'public')));

// Serve static files from the dist directory - MUST come after API routes
app.use(express.static(join(__dirname, '..', 'dist')));

// Handle all other routes by serving the React app - MUST be last
app.use((req, res) => {
  const indexPath = join(__dirname, '..', 'dist', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'Server is running but app not built',
      timestamp: new Date().toISOString() 
    });
  }
});

export default app;