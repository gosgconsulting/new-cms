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
import { getBrandingSettings } from '../sparti-cms/db/modules/branding.js';

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
const THEME_SLUG = process.env.DEPLOY_THEME_SLUG || 'landingpage';
console.log(`[testing] Theme slug: ${THEME_SLUG}`);

// Helper function to get branding settings directly from database
async function getBrandingSettingsDirect(tenantId, themeSlug) {
  if (!tenantId) {
    console.warn(`[testing] No tenant ID provided, skipping branding fetch`);
    return null;
  }
  
  try {
    console.log(`[testing] Fetching branding settings from database for tenant: ${tenantId}, theme: ${themeSlug}`);
    
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
    if (contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('deflate') || contentEncoding.includes('br'))) {
      console.log(`[testing] Response is compressed with ${contentEncoding}, will decompress automatically`);
    }
    
    // For JSON responses, use .json() which handles decompression automatically
    if (contentType.includes('application/json')) {
      try {
        // Use .json() directly - it handles decompression automatically
        data = await response.json();
        console.log(`[testing] Parsed JSON response (keys):`, typeof data === 'object' ? Object.keys(data) : 'not an object');
      } catch (parseError) {
        console.error(`[testing] Failed to parse JSON response:`, parseError);
        // Fallback: try reading as text
        try {
          const responseText = await response.text();
          console.error(`[testing] Response text (first 500 chars):`, responseText.substring(0, 500));
          data = JSON.parse(responseText);
        } catch (textParseError) {
          console.error(`[testing] Also failed to parse as text:`, textParseError);
          throw parseError;
        }
      }
    } else {
      // For non-JSON, read as text
      const responseText = await response.text();
      console.log(`[testing] Backend response body (first 500 chars):`, responseText.substring(0, 500));
      data = responseText;
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
app.use(async (req, res, next) => {
  if (req.method === 'GET') {
    const indexPath = join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      // Read the HTML file
      let htmlContent = readFileSync(indexPath, 'utf-8');
      
      // Build script tag with injected data
      let scriptContent = '';
      
      // Inject CMS_TENANT
      if (CMS_TENANT) {
        scriptContent += `      window.__CMS_TENANT__ = '${CMS_TENANT.replace(/'/g, "\\'")}';\n`;
      }
      
      // Fetch and inject branding settings directly from database
      if (CMS_TENANT) {
        const brandingData = await getBrandingSettingsDirect(CMS_TENANT, THEME_SLUG);
        if (brandingData && Object.keys(brandingData).length > 0) {
          // Escape the JSON string for safe injection into HTML
          const brandingJson = JSON.stringify(brandingData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
          scriptContent += `      window.__BRANDING_SETTINGS__ = ${brandingJson};\n`;
          console.log(`[testing] Injected branding settings into HTML:`, Object.keys(brandingData));
        } else {
          console.warn(`[testing] No branding data to inject (empty or null)`);
        }
      }
      
      // Inject script tag if we have content
      if (scriptContent) {
        const scriptTag = `
    <script>
      // Injected at runtime from environment variables and backend API
${scriptContent}    </script>`;
        
        // Check if injection script already exists
        if (htmlContent.includes('window.__CMS_TENANT__') || htmlContent.includes('window.__BRANDING_SETTINGS__')) {
          // Replace existing script block
          const scriptRegex = /<script>\s*\/\/\s*Injected at runtime[\s\S]*?<\/script>/;
          if (scriptRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(scriptRegex, scriptTag.trim());
            console.log(`[testing] Updated injected data in HTML`);
          } else {
            // Try to update individual variables
            if (CMS_TENANT && htmlContent.includes('window.__CMS_TENANT__')) {
              htmlContent = htmlContent.replace(
                /window\.__CMS_TENANT__\s*=\s*['"][^'"]*['"];?/g,
                `window.__CMS_TENANT__ = '${CMS_TENANT.replace(/'/g, "\\'")}';`
              );
            }
            // Add branding if it doesn't exist
            if (!htmlContent.includes('window.__BRANDING_SETTINGS__')) {
              if (htmlContent.includes('</head>')) {
                htmlContent = htmlContent.replace('</head>', `${scriptTag}\n  </head>`);
              } else if (htmlContent.includes('<body>')) {
                htmlContent = htmlContent.replace('<body>', `${scriptTag}\n  <body>`);
              }
            }
          }
        } else {
          // Inject new script tag before </head> or <body>
          if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `${scriptTag}\n  </head>`);
          } else if (htmlContent.includes('<body>')) {
            htmlContent = htmlContent.replace('<body>', `${scriptTag}\n  <body>`);
          } else {
            // Last resort: inject at the beginning of the body
            htmlContent = htmlContent.replace('<body>', `<body>${scriptTag}`);
          }
          console.log(`[testing] Injected runtime data into HTML`);
        }
      }
      
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
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

