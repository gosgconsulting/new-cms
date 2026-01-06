#!/usr/bin/env node
/**
 * Static server for standalone theme deployment
 * Serves static files from dist/ directory and provides a /health endpoint
 * Proxies API requests to the backend CMS
 * Used when DEPLOY_THEME_SLUG is set to deploy theme-only frontend
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4173;

// Get backend API URL from environment variables
// Priority: CMS_BACKEND_URL > VITE_API_BASE_URL > default
// Note: For standalone theme deployments, set CMS_BACKEND_URL or VITE_API_BASE_URL
// to point to your main CMS backend (e.g., https://cms.sparti.ai)
const BACKEND_URL = process.env.CMS_BACKEND_URL || 
                    process.env.VITE_API_BASE_URL || 
                    'https://cms.sparti.ai';

console.log(`[testing] Backend API URL: ${BACKEND_URL}`);
if (!process.env.CMS_BACKEND_URL && !process.env.VITE_API_BASE_URL) {
  console.warn(`[testing] WARNING: Using default backend URL. Set CMS_BACKEND_URL or VITE_API_BASE_URL for production.`);
}

// Parse JSON bodies for API requests
app.use(express.json());

// Health check endpoint (required by Railway) - must be first for fast response
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    mode: 'standalone-theme',
    backend: BACKEND_URL
  });
});

// Proxy API requests to backend CMS
// This allows the static theme to make API calls to the backend
app.use('/api', async (req, res) => {
  try {
    // Build target URL with query string
    const queryString = Object.keys(req.query).length > 0 
      ? '?' + new URLSearchParams(req.query).toString() 
      : '';
    const targetUrl = `${BACKEND_URL}${req.path}${queryString}`;
    
    console.log(`[testing] Proxying ${req.method} ${req.path}${queryString} to ${targetUrl}`);
    
    // Forward headers (excluding host and connection)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    
    // Make request to backend
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };
    
    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    
    // Get response data
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Forward response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Send response
    res.status(response.status).send(data);
  } catch (error) {
    console.error(`[testing] Error proxying API request:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to proxy API request',
      message: error.message
    });
  }
});

// Serve static files from the dist directory
const distPath = join(__dirname, '..', 'dist');
if (!existsSync(distPath)) {
  console.error('[testing] ERROR: dist directory does not exist!');
  console.error('[testing] Build may have failed. Check build logs.');
  console.error('[testing] Current working directory:', process.cwd());
  console.error('[testing] Looking for dist at:', distPath);
  process.exit(1);
}

console.log('[testing] Serving static files from:', distPath);
app.use(express.static(distPath));

// Handle all other routes by serving the React app (SPA routing)
// Use app.use() instead of app.get('*') for Express 5 compatibility
app.use((req, res, next) => {
  if (req.method === 'GET') {
    const indexPath = join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ 
        status: 'error', 
        message: 'index.html not found',
        timestamp: new Date().toISOString() 
      });
    }
  } else {
    next();
  }
});

// Start server immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[testing] ✅ Standalone theme server running on port ${PORT}`);
  console.log(`[testing] Health check available at http://0.0.0.0:${PORT}/health`);
  console.log(`[testing] Theme available at http://0.0.0.0:${PORT}/`);
  console.log(`[testing] Serving static files from: ${distPath}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('[testing] ❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`[testing] Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('[testing] Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[testing] Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

