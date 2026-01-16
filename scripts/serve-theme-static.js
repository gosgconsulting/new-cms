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
import { existsSync, readFileSync } from 'fs';
import {
  isStaticFileRequest,
  processHtmlWithInjections
} from './utilities/html-processing.js';
// Don't import database function at top level - import lazily to avoid blocking server startup

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

// Get CMS_TENANT from environment variable
const CMS_TENANT = process.env.CMS_TENANT;
if (CMS_TENANT) {
  console.log(`[testing] CMS_TENANT: ${CMS_TENANT} - Will inject into HTML`);
} else {
  console.warn(`[testing] WARNING: CMS_TENANT is not set. Theme may not be able to determine tenant ID.`);
}

// Get theme slug from environment variable
// Check DEPLOY_THEME_SLUG first (set by Dockerfile), then fall back to VITE_DEPLOY_THEME_SLUG
const THEME_SLUG = process.env.DEPLOY_THEME_SLUG || process.env.VITE_DEPLOY_THEME_SLUG || 'landingpage';
console.log(`[testing] Theme slug: ${THEME_SLUG}`);

// Helper function to get branding settings directly from database
// Uses lazy import to avoid blocking server startup
async function getBrandingSettingsDirect(tenantId, themeSlug) {
  if (!tenantId) {
    console.warn(`[testing] No tenant ID provided, skipping branding fetch`);
    return null;
  }
  
  try {
    console.log(`[testing] Fetching branding settings from database for tenant: ${tenantId}, theme: ${themeSlug}`);
    
    // Lazy import - only load database module when needed
    // This prevents database connection from blocking server startup
    const { getBrandingSettings } = await import('../sparti-cms/db/modules/branding.js');
    
    // Call the shared function directly from the database module
    const settings = await getBrandingSettings(tenantId);
    
    // Extract branding data from the settings object
    // getBrandingSettings returns: { branding: {...}, seo: {...}, localization: {...}, theme: {...} }
    const brandingData = settings.branding || {};
    
    console.log(`[testing] Branding settings fetched from database:`, Object.keys(brandingData));
    return brandingData;
  } catch (error) {
    console.error(`[testing] Error fetching branding settings from database:`, error);
    console.error(`[testing] Error stack:`, error.stack);
    // Don't throw - return null so server can still serve HTML without branding
    return null;
  }
}

// Helper function to get custom code settings directly from database
// Uses lazy import to avoid blocking server startup
async function getCustomCodeSettingsDirect(tenantId) {
  if (!tenantId) {
    console.warn(`[testing] No tenant ID provided, skipping custom code fetch`);
    return null;
  }
  
  try {
    console.log(`[testing] Fetching custom code settings from database for tenant: ${tenantId}`);
    
    // Lazy import - only load database module when needed
    const { getCustomCodeSettings } = await import('../sparti-cms/db/modules/branding.js');
    
    // Call the shared function directly from the database module
    const customCodeData = await getCustomCodeSettings(tenantId);
    
    console.log(`[testing] Custom code settings fetched from database:`, Object.keys(customCodeData));
    return customCodeData;
  } catch (error) {
    console.error(`[testing] Error fetching custom code settings from database:`, error);
    console.error(`[testing] Error stack:`, error.stack);
    // Don't throw - return null so server can still serve HTML without custom code
    return null;
  }
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
    // When using app.use('/api', ...), Express strips '/api' from req.path
    // So we need to add it back, or use req.originalUrl which has the full path
    const queryString = Object.keys(req.query).length > 0 
      ? '?' + new URLSearchParams(req.query).toString() 
      : '';
    
    // Construct the full API path: /api + req.path + query string
    // req.path will be like '/v1/theme/landingpage/branding' (without /api prefix)
    const apiPath = `/api${req.path}${queryString}`;
    const targetUrl = `${BACKEND_URL}${apiPath}`;
    
    console.log(`[testing] Proxying ${req.method} ${req.url} to ${targetUrl}`);
    console.log(`[testing] Request query:`, req.query);
    console.log(`[testing] Request headers:`, {
      'x-tenant-id': req.headers['x-tenant-id'],
      'x-api-key': req.headers['x-api-key'] ? '***' : undefined,
      'content-type': req.headers['content-type']
    });
    
    // Forward headers (excluding host and connection)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['content-length']; // Let fetch set this
    
    // Set Accept-Encoding to avoid zstd compression (Node.js fetch doesn't support zstd)
    // Request only encodings that Node.js can automatically decompress
    headers['accept-encoding'] = 'gzip, deflate, br';
    
    // Make request to backend
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };
    
    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
      console.log(`[testing] Request body:`, req.body);
    }
    
    console.log(`[testing] Making fetch request to: ${targetUrl}`);
    const response = await fetch(targetUrl, fetchOptions);
    
    console.log(`[testing] Backend response status: ${response.status}`);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log(`[testing] Backend response headers:`, responseHeaders);
    
    // Get response data
    const contentType = response.headers.get('content-type') || '';
    const contentEncoding = response.headers.get('content-encoding') || '';
    let data;
    
    // Check if response is compressed
    if (contentEncoding) {
      if (contentEncoding.includes('zstd')) {
        console.warn(`[testing] Response is compressed with zstd (not supported by Node.js fetch), requesting uncompressed or gzip`);
        // zstd is not supported by Node.js fetch - we need to handle this
        // Try to read as text first, which might fail
        try {
          const responseText = await response.text();
          if (contentType.includes('application/json')) {
            data = JSON.parse(responseText);
          } else {
            data = responseText;
          }
        } catch (error) {
          console.error(`[testing] Failed to read zstd-compressed response:`, error.message);
          // Return error response
          res.status(502).json({
            success: false,
            error: 'Backend response uses unsupported compression (zstd)',
            message: 'Please configure backend to use gzip, deflate, or br compression'
          });
          return;
        }
      } else if (contentEncoding.includes('gzip') || contentEncoding.includes('deflate') || contentEncoding.includes('br')) {
        console.log(`[testing] Response is compressed with ${contentEncoding}, will decompress automatically`);
        // For JSON responses, use .json() which handles decompression automatically for gzip/deflate/br
        if (contentType.includes('application/json')) {
          try {
            data = await response.json();
            console.log(`[testing] Parsed JSON response (keys):`, typeof data === 'object' ? Object.keys(data) : 'not an object');
          } catch (parseError) {
            console.error(`[testing] Failed to parse JSON response:`, parseError);
            throw parseError;
          }
        } else {
          data = await response.text();
          console.log(`[testing] Backend response body (first 500 chars):`, data.substring(0, 500));
        }
      } else {
        // Unknown compression - try to read as text
        console.warn(`[testing] Unknown compression: ${contentEncoding}, attempting to read as text`);
        const responseText = await response.text();
        if (contentType.includes('application/json')) {
          data = JSON.parse(responseText);
        } else {
          data = responseText;
        }
      }
    } else {
      // No compression - read normally
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log(`[testing] Parsed JSON response (keys):`, typeof data === 'object' ? Object.keys(data) : 'not an object');
        } catch (parseError) {
          console.error(`[testing] Failed to parse JSON response:`, parseError);
          throw parseError;
        }
      } else {
        data = await response.text();
        console.log(`[testing] Backend response body (first 500 chars):`, data.substring(0, 500));
      }
    }
    
    // Forward response headers (excluding ones that shouldn't be forwarded)
    // Important: Skip content-encoding since we've already decompressed the response
    const headersToSkip = ['content-encoding', 'transfer-encoding', 'connection', 'content-length'];
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!headersToSkip.includes(lowerKey)) {
        // Only forward safe headers
        res.setHeader(key, value);
      }
    });
    
    // Always set Content-Type for JSON responses
    if (typeof data === 'object') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(response.status).json(data);
    } else {
      res.status(response.status).send(data);
    }
    
    console.log(`[testing] Proxy response sent: status ${response.status}, data type: ${typeof data}`);
  } catch (error) {
    console.error(`[testing] Error proxying API request:`, error);
    console.error(`[testing] Error stack:`, error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to proxy API request',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Proxy /uploads requests to backend CMS
// This allows the static theme to serve uploaded files from the CMS backend
app.use('/uploads', async (req, res) => {
  try {
    // Build target URL - req.path will be like '/file-1768540187677-444216355.png'
    const queryString = Object.keys(req.query).length > 0 
      ? '?' + new URLSearchParams(req.query).toString() 
      : '';
    
    const uploadsPath = `/uploads${req.path}${queryString}`;
    const targetUrl = `${BACKEND_URL}${uploadsPath}`;
    
    console.log(`[testing] Proxying uploads request ${req.method} ${req.url} to ${targetUrl}`);
    
    // Forward headers (excluding host and connection)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['content-length'];
    
    // Make request to backend
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };
    
    const response = await fetch(targetUrl, fetchOptions);
    
    console.log(`[testing] Backend uploads response status: ${response.status}`);
    
    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        error: 'Failed to fetch upload',
        message: `Backend returned ${response.status}`
      });
      return;
    }
    
    // Forward response headers (important for images: content-type, cache-control, etc.)
    const headersToSkip = ['content-encoding', 'transfer-encoding', 'connection', 'content-length'];
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!headersToSkip.includes(lowerKey)) {
        res.setHeader(key, value);
      }
    });
    
    // Get response as buffer for binary data (images, files, etc.)
    const buffer = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(buffer));
    
    console.log(`[testing] Uploads proxy response sent: status ${response.status}, size: ${buffer.byteLength} bytes`);
  } catch (error) {
    console.error(`[testing] Error proxying uploads request:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to proxy uploads request',
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

// Handle HTML routes FIRST (before static middleware) to inject custom code
// This ensures index.html is processed with branding and custom code before being served
app.use(async (req, res, next) => {
  // Skip static assets - let static middleware handle them
  if (req.method !== 'GET' || isStaticFileRequest(req)) {
    return next();
  }
  
  // Read index.html file
  const indexPath = join(distPath, 'index.html');
  if (!existsSync(indexPath)) {
    return res.status(404).json({ 
      status: 'error', 
      message: 'index.html not found',
      timestamp: new Date().toISOString() 
    });
  }
  
  try {
    // Read and process HTML with all injections
    let htmlContent = readFileSync(indexPath, 'utf-8');
    htmlContent = await processHtmlWithInjections(
      htmlContent,
      CMS_TENANT,
      THEME_SLUG,
      getBrandingSettingsDirect,
      getCustomCodeSettingsDirect
    );
    
    // Send processed HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    console.error(`[testing] Error processing HTML:`, error);
    // Fallback: send original HTML if processing fails
    const htmlContent = readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  }
});

// Serve static files AFTER HTML processing middleware
// This allows static assets (JS, CSS, images) to be served normally
app.use(express.static(distPath));

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

