/**
 * HTML Processing Utilities
 * 
 * Helper functions for processing HTML content with branding, custom code, and script injections
 * Used by the standalone theme server to inject runtime data into HTML
 */

/**
 * Check if the request is for a static file (JS, CSS, images, etc.)
 * @param {express.Request} req - Express request object
 * @returns {boolean} - True if request is for a static file
 */
export function isStaticFileRequest(req) {
  const staticFileExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.map'];
  return staticFileExtensions.some(ext => req.path.toLowerCase().endsWith(ext));
}

/**
 * Build script content with CMS tenant and branding settings
 * @param {string|null} cmsTenant - CMS tenant ID
 * @param {Object|null} brandingData - Branding data from database
 * @returns {string} - Script content string
 */
export function buildScriptContent(cmsTenant, brandingData) {
  let scriptContent = '';
  
  if (cmsTenant) {
    scriptContent += `      window.__CMS_TENANT__ = '${cmsTenant.replace(/'/g, "\\'")}';\n`;
  }
  
  if (brandingData && Object.keys(brandingData).length > 0) {
    const brandingJson = JSON.stringify(brandingData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
    scriptContent += `      window.__BRANDING_SETTINGS__ = ${brandingJson};\n`;
    console.log(`[testing] Injected branding settings into HTML:`, Object.keys(brandingData));
  }
  
  return scriptContent;
}

/**
 * Apply branding settings (favicon and title) to HTML content
 * @param {string} htmlContent - Original HTML content
 * @param {Object|null} brandingData - Branding data from database
 * @returns {string} - HTML content with branding applied
 */
export function applyBrandingToHtml(htmlContent, brandingData) {
  if (!brandingData) return htmlContent;
  
  // Update favicon from branding
  if (brandingData.site_favicon) {
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
  
  // Update title from branding
  if (brandingData.site_name) {
    const escapedTitle = brandingData.site_name
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    htmlContent = htmlContent.replace(
      /<title[^>]*>.*?<\/title>/i,
      `<title>${escapedTitle}</title>`
    );
    console.log(`[testing] Updated title from branding: ${escapedTitle}`);
  }
  
  return htmlContent;
}

/**
 * Build custom code injection strings for head and body
 * @param {Object|null} customCodeData - Custom code data from database
 * @returns {{headInjections: string, bodyInjections: string}} - Object with head and body injection strings
 */
export function buildCustomCodeInjections(customCodeData) {
  let headInjections = '';
  let bodyInjections = '';
  
  if (!customCodeData) {
    return { headInjections, bodyInjections };
  }
  
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
  
  return { headInjections, bodyInjections };
}

/**
 * Process and replace/remove custom code placeholders in HTML
 * @param {string} htmlContent - HTML content with placeholders
 * @param {string} headInjections - Code to inject in head (or empty string)
 * @param {string} bodyInjections - Code to inject in body (or empty string)
 * @returns {string} - HTML content with placeholders replaced or removed
 */
export function processPlaceholders(htmlContent, headInjections, bodyInjections) {
  const headPlaceholderPattern = /<!--\s*CUSTOM_CODE_HEAD_PLACEHOLDER\s*-->/g;
  const bodyPlaceholderPattern = /<!--\s*CUSTOM_CODE_BODY_PLACEHOLDER\s*-->/g;
  
  console.log(`[testing] Processing placeholders. Head injections length: ${headInjections.length}, Body injections length: ${bodyInjections.length}`);
  console.log(`[testing] HTML contains head placeholder: ${htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER')}`);
  console.log(`[testing] HTML contains body placeholder: ${htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER')}`);
  
  // Process head placeholder
  if (htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER')) {
    if (headInjections && headInjections.trim()) {
      const beforeReplace = htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER');
      htmlContent = htmlContent.replace(headPlaceholderPattern, headInjections);
      const afterReplace = htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER');
      console.log(`[testing] Replaced head placeholder with custom code. Before: ${beforeReplace}, After: ${afterReplace}`);
      console.log(`[testing] Head code preview (first 200 chars): ${headInjections.substring(0, 200)}`);
    } else {
      const beforeReplace = htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER');
      htmlContent = htmlContent.replace(/[\s]*<!--\s*CUSTOM_CODE_HEAD_PLACEHOLDER\s*-->[\s]*\n?/g, '');
      const afterReplace = htmlContent.includes('CUSTOM_CODE_HEAD_PLACEHOLDER');
      console.log(`[testing] Removed empty head placeholder. Before: ${beforeReplace}, After: ${afterReplace}`);
    }
  }
  
  // Process body placeholder
  if (htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER')) {
    if (bodyInjections && bodyInjections.trim()) {
      const beforeReplace = htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER');
      htmlContent = htmlContent.replace(bodyPlaceholderPattern, bodyInjections);
      const afterReplace = htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER');
      console.log(`[testing] Replaced body placeholder with custom code. Before: ${beforeReplace}, After: ${afterReplace}`);
      console.log(`[testing] Body code preview (first 200 chars): ${bodyInjections.substring(0, 200)}`);
    } else {
      const beforeReplace = htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER');
      htmlContent = htmlContent.replace(/[\s]*<!--\s*CUSTOM_CODE_BODY_PLACEHOLDER\s*-->[\s]*\n?/g, '');
      const afterReplace = htmlContent.includes('CUSTOM_CODE_BODY_PLACEHOLDER');
      console.log(`[testing] Removed empty body placeholder. Before: ${beforeReplace}, After: ${afterReplace}`);
    }
  }
  
  return htmlContent;
}

/**
 * Inject script tag with runtime data into HTML
 * @param {string} htmlContent - HTML content
 * @param {string} scriptContent - Script content to inject
 * @param {string|null} cmsTenant - CMS tenant ID
 * @returns {string} - HTML content with script tag injected
 */
export function injectScriptTag(htmlContent, scriptContent, cmsTenant) {
  if (!scriptContent) return htmlContent;
  
  const scriptTag = `
    <script>
      // Injected at runtime from environment variables and backend API
${scriptContent}    </script>`;
  
  // Check if injection script already exists
  if (htmlContent.includes('window.__CMS_TENANT__') || htmlContent.includes('window.__BRANDING_SETTINGS__')) {
    const scriptRegex = /<script>\s*\/\/\s*Injected at runtime[\s\S]*?<\/script>/;
    if (scriptRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(scriptRegex, scriptTag.trim());
      console.log(`[testing] Updated injected data in HTML`);
    } else {
      // Try to update individual variables
      if (cmsTenant && htmlContent.includes('window.__CMS_TENANT__')) {
        htmlContent = htmlContent.replace(
          /window\.__CMS_TENANT__\s*=\s*['"][^'"]*['"];?/g,
          `window.__CMS_TENANT__ = '${cmsTenant.replace(/'/g, "\\'")}';`
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
  
  return htmlContent;
}

/**
 * Process HTML content with all injections (branding, custom code, scripts)
 * @param {string} htmlContent - Original HTML content
 * @param {string|null} cmsTenant - CMS tenant ID
 * @param {string} themeSlug - Theme slug
 * @param {Function} getBrandingSettingsDirect - Function to fetch branding settings
 * @param {Function} getCustomCodeSettingsDirect - Function to fetch custom code settings
 * @returns {Promise<string>} - Processed HTML content
 */
export async function processHtmlWithInjections(
  htmlContent,
  cmsTenant,
  themeSlug,
  getBrandingSettingsDirect,
  getCustomCodeSettingsDirect
) {
  // Fetch branding settings
  let brandingData = null;
  if (cmsTenant) {
    brandingData = await getBrandingSettingsDirect(cmsTenant, themeSlug);
    if (!brandingData || Object.keys(brandingData).length === 0) {
      console.warn(`[testing] No branding data to inject (empty or null)`);
    }
  }
  
  // Build script content
  const scriptContent = buildScriptContent(cmsTenant, brandingData);
  
  // Apply branding (favicon, title)
  htmlContent = applyBrandingToHtml(htmlContent, brandingData);
  
  // Fetch custom code settings
  let customCodeData = null;
  if (cmsTenant) {
    console.log(`[testing] Fetching custom code for tenant: ${cmsTenant}`);
    try {
      customCodeData = await getCustomCodeSettingsDirect(cmsTenant);
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
  
  // Build custom code injections
  const { headInjections, bodyInjections } = buildCustomCodeInjections(customCodeData);
  
  // Process placeholders
  htmlContent = processPlaceholders(htmlContent, headInjections, bodyInjections);
  
  // Inject script tag
  htmlContent = injectScriptTag(htmlContent, scriptContent, cmsTenant);
  
  return htmlContent;
}
