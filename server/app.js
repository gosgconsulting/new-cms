import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { statSync } from 'fs';
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

// Serve theme assets from sparti-cms/theme and public/theme directories
// Only serve actual asset files (with extensions), not HTML routes or directories
app.use('/theme', async (req, res, next) => {
  // Skip if this looks like a route (no file extension) - let route handlers deal with it
  const path = req.path;
  // Only serve files with extensions (assets like .js, .css, .png, etc.)
  // Skip paths that look like routes (no extension or ending with /)
  if (!path || path.endsWith('/') || !/\.([a-zA-Z0-9]+)$/.test(path)) {
    return next(); // Pass to route handlers
  }
  
  // Normalize path (remove leading slash if present)
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Try to serve from sparti-cms/theme first, then fallback to public/theme
  const spartiThemePath = join(__dirname, '..', 'sparti-cms', 'theme', normalizedPath);
  const publicThemePath = join(__dirname, '..', 'public', 'theme', normalizedPath);
  
  let filePath = null;
  
  // Check if file exists in sparti-cms/theme
  if (existsSync(spartiThemePath)) {
    try {
      const stats = statSync(spartiThemePath);
      if (stats.isFile()) {
        filePath = spartiThemePath;
      }
    } catch (err) {
      // Ignore stat errors, try fallback
    }
  }
  
  // Fallback to public/theme if not found in sparti-cms/theme
  if (!filePath && existsSync(publicThemePath)) {
    try {
      const stats = statSync(publicThemePath);
      if (stats.isFile()) {
        filePath = publicThemePath;
      }
    } catch (err) {
      // Ignore stat errors
    }
  }
  
  // Serve the file if found
  if (filePath) {
    return res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        console.error('[testing] Error serving theme asset:', err);
        return res.status(err.status || 500).send('Error serving file');
      }
    });
  }

  // File not found on disk: fallback to Vercel Blob manifest if configured
  const manifestUrl = process.env.BLOB_THEME_MANIFEST_URL;
  if (manifestUrl) {
    const CACHE_TTL_MS = 5 * 60 * 1000;
    if (!app._themeBlobManifestCache || Date.now() - app._themeBlobManifestCache.ts > CACHE_TTL_MS) {
      try {
        const resp = await fetch(manifestUrl);
        if (resp.ok) {
          const data = await resp.json();
          app._themeBlobManifestCache = { data, ts: Date.now() };
        }
      } catch (e) {
        if (!app._themeBlobManifestCache?.data) {
          return res.status(404).send('Not Found');
        }
      }
    }
    const manifest = app._themeBlobManifestCache?.data;
    const blobUrl = manifest && manifest[normalizedPath];
    if (blobUrl) {
      return res.redirect(302, blobUrl);
    }
  }

  return res.status(404).send('Not Found');
});

// Serve static files from the 'public' directory
app.use(express.static(join(__dirname, '..', 'public')));

// Serve assets from dist/assets directory explicitly
// This ensures JS, CSS, and other built assets are always accessible
app.use('/assets', express.static(join(__dirname, '..', 'dist', 'assets')));

// Serve static files from the dist directory - MUST come after API routes
// This serves built assets (JS, CSS, images, etc.) in both development and production
// In development, if accessing through Express server, assets must be built first
app.use(express.static(join(__dirname, '..', 'dist'), {
  // Don't serve index.html as a static file - let route handlers deal with it
  index: false
}));

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