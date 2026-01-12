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
// Use app.use() instead of app.get('*') for Express 5 compatibility
app.use(async (req, res, next) => {
  // Skip static assets - let static middleware handle them
  // Check if the request is for a static file (has a file extension)
  const staticFileExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.map'];
  const hasExtension = staticFileExtensions.some(ext => req.path.toLowerCase().endsWith(ext));
  
  if (req.method === 'GET' && !hasExtension) {
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
      let brandingData = null;
      if (CMS_TENANT) {
        brandingData = await getBrandingSettingsDirect(CMS_TENANT, THEME_SLUG);
        if (brandingData && Object.keys(brandingData).length > 0) {
          // Escape the JSON string for safe injection into HTML
          const brandingJson = JSON.stringify(brandingData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
          scriptContent += `      window.__BRANDING_SETTINGS__ = ${brandingJson};\n`;
          console.log(`[testing] Injected branding settings into HTML:`, Object.keys(brandingData));
        } else {
          console.warn(`[testing] No branding data to inject (empty or null)`);
        }
      }
      
      // Update favicon from branding if available
      if (brandingData && brandingData.site_favicon) {
        // Replace favicon links
        htmlContent = htmlContent.replace(
          /<link[^>]*rel=["'](icon|apple-touch-icon)["'][^>]*>/g,
          (match) => {
            if (match.includes('rel="icon"') || match.includes("rel='icon'")) {
              return `<link rel="icon" type="image/png" href="${brandingData.site_favicon}" />`;
            } else if (match.includes('rel="apple-touch-icon"') || match.includes("rel='apple-touch-icon'")) {
              return `<link rel="apple-touch-icon" href="${brandingData.site_favicon}" />`;
            }
            return match;
          }
        );
        // If no favicon links found, add them
        if (!htmlContent.includes('rel="icon"') && !htmlContent.includes("rel='icon'")) {
          const faviconTags = `    <link rel="icon" type="image/png" href="${brandingData.site_favicon}" />\n    <link rel="apple-touch-icon" href="${brandingData.site_favicon}" />\n`;
          if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `${faviconTags}  </head>`);
          } else if (htmlContent.includes('<body>')) {
            htmlContent = htmlContent.replace('<body>', `${faviconTags}  <body>`);
          }
        }
        console.log(`[testing] Updated favicon from branding: ${brandingData.site_favicon}`);
      }
      
      // Update title from branding if available
      if (brandingData && brandingData.site_name) {
        // Escape HTML entities for safety
        const escapedTitle = brandingData.site_name
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        
        // Replace title tag
        htmlContent = htmlContent.replace(
          /<title[^>]*>.*?<\/title>/i,
          `<title>${escapedTitle}</title>`
        );
        console.log(`[testing] Updated title from branding: ${escapedTitle}`);
      }
      
      // Fetch and inject custom code settings
      let customCodeData = null;
      if (CMS_TENANT) {
        console.log(`[testing] Fetching custom code for tenant: ${CMS_TENANT}`);
        try {
          customCodeData = await getCustomCodeSettingsDirect(CMS_TENANT);
          if (customCodeData) {
            console.log(`[testing] Custom code settings fetched:`, Object.keys(customCodeData));
            console.log(`[testing] Custom code values:`, {
              hasHead: !!(customCodeData.head && customCodeData.head.trim()),
              hasBody: !!(customCodeData.body && customCodeData.body.trim()),
              hasGtmId: !!(customCodeData.gtmId && customCodeData.gtmId.trim()),
              hasGaId: !!(customCodeData.gaId && customCodeData.gaId.trim()),
              hasGsc: !!(customCodeData.gscVerification && customCodeData.gscVerification.trim())
            });
          } else {
            console.log(`[testing] No custom code data returned from database`);
          }
        } catch (error) {
          console.error(`[testing] Error fetching custom code:`, error);
        }
      } else {
        console.log(`[testing] No CMS_TENANT set, skipping custom code fetch`);
      }
      
      // Inject custom code into HTML using placeholders
      let headInjections = '';
      let bodyInjections = '';
      
      if (customCodeData) {
        // Google Search Console verification meta tag
        if (customCodeData.gscVerification && customCodeData.gscVerification.trim()) {
          const gscMeta = `    <meta name="google-site-verification" content="${customCodeData.gscVerification.replace(/"/g, '&quot;')}" />\n`;
          headInjections += gscMeta;
          console.log(`[testing] Injecting Google Search Console verification`);
        }
        
        // Google Tag Manager script (in head)
        if (customCodeData.gtmId && customCodeData.gtmId.trim()) {
          const gtmId = customCodeData.gtmId.trim();
          const gtmScript = `    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId.replace(/"/g, '&quot;')}');</script>
    <!-- End Google Tag Manager -->\n`;
          headInjections += gtmScript;
          console.log(`[testing] Injecting Google Tag Manager: ${gtmId}`);
        }
        
        // Google Analytics script (in head)
        if (customCodeData.gaId && customCodeData.gaId.trim()) {
          const gaId = customCodeData.gaId.trim();
          const gaScript = `    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId.replace(/"/g, '&quot;')}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId.replace(/"/g, '&quot;')}');
    </script>
    <!-- End Google Analytics -->\n`;
          headInjections += gaScript;
          console.log(`[testing] Injecting Google Analytics: ${gaId}`);
        }
        
        // Custom head code
        if (customCodeData.head && customCodeData.head.trim()) {
          headInjections += `    ${customCodeData.head.trim()}\n`;
          console.log(`[testing] Injecting custom head code`);
        }
        
        // Google Tag Manager noscript (in body)
        if (customCodeData.gtmId && customCodeData.gtmId.trim()) {
          const gtmId = customCodeData.gtmId.trim();
          const gtmNoscript = `    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId.replace(/"/g, '&quot;')}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->\n`;
          bodyInjections += gtmNoscript;
        }
        
        // Custom body code
        if (customCodeData.body && customCodeData.body.trim()) {
          bodyInjections += `    ${customCodeData.body.trim()}\n`;
          console.log(`[testing] Injecting custom body code`);
        }
      }
      
      // Replace placeholders with actual code or remove them if empty
      // Always remove placeholders - replace with code if available, otherwise just remove
      console.log(`[testing] Processing placeholders. Head injections length: ${headInjections.length}, Body injections length: ${bodyInjections.length}`);
      console.log(`[testing] HTML contains head placeholder: ${htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER')}`);
      console.log(`[testing] HTML contains body placeholder: ${htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER')}`);
      
      // Use a more flexible regex that matches the placeholder with any whitespace
      const headPlaceholderPattern = /<!--\s*CUSTOM_CODE_HEAD_PLACEHOLDER\s*-->/g;
      const bodyPlaceholderPattern = /<!--\s*CUSTOM_CODE_BODY_PLACEHOLDER\s*-->/g;
      
      // Always process head placeholder - ensure it's removed even if no custom code
      if (htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER')) {
        if (headInjections && headInjections.trim()) {
          const beforeReplace = htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER');
          // Replace placeholder with head code, preserving the code as-is (don't trim, keep formatting)
          htmlContent = htmlContent.replace(headPlaceholderPattern, headInjections);
          const afterReplace = htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER');
          console.log(`[testing] Replaced head placeholder with custom code. Before: ${beforeReplace}, After: ${afterReplace}`);
          console.log(`[testing] Head code preview (first 200 chars): ${headInjections.substring(0, 200)}`);
        } else {
          // Remove the placeholder and any surrounding whitespace/newlines on the same line
          const beforeReplace = htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER');
          htmlContent = htmlContent.replace(/[\s]*<!--\s*CUSTOM_CODE_HEAD_PLACEHOLDER\s*-->[\s]*\n?/g, '');
          const afterReplace = htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER');
          console.log(`[testing] Removed empty head placeholder. Before: ${beforeReplace}, After: ${afterReplace}`);
        }
      }
      
      // Always process body placeholder - ensure it's removed even if no custom code
      if (htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER')) {
        if (bodyInjections && bodyInjections.trim()) {
          const beforeReplace = htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER');
          // Replace placeholder with body code, preserving the code as-is (don't trim, keep formatting)
          htmlContent = htmlContent.replace(bodyPlaceholderPattern, bodyInjections);
          const afterReplace = htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER');
          console.log(`[testing] Replaced body placeholder with custom code. Before: ${beforeReplace}, After: ${afterReplace}`);
          console.log(`[testing] Body code preview (first 200 chars): ${bodyInjections.substring(0, 200)}`);
        } else {
          // Remove the placeholder and any surrounding whitespace/newlines on the same line
          const beforeReplace = htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER');
          htmlContent = htmlContent.replace(/[\s]*<!--\s*CUSTOM_CODE_BODY_PLACEHOLDER\s*-->[\s]*\n?/g, '');
          const afterReplace = htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER');
          console.log(`[testing] Removed empty body placeholder. Before: ${beforeReplace}, After: ${afterReplace}`);
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
    // Not a GET request or not a route that needs HTML processing - continue to static middleware
    next();
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

