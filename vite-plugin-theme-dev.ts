/**
 * Vite plugin for theme development mode
 * Injects theme development script and branding into HTML at runtime without modifying index.html
 * Works for both dev and production builds
 */

import type { Plugin } from 'vite';

/**
 * Fetch branding settings from API or environment variables
 */
async function getBrandingData(
  themeSlug: string,
  tenantId?: string | null
): Promise<Record<string, any> | null> {
  // Check for branding in environment variable (for production builds)
  if (process.env.BRANDING_SETTINGS_JSON) {
    try {
      const branding = JSON.parse(process.env.BRANDING_SETTINGS_JSON);
      console.log(`[testing] Theme dev plugin: Using branding from BRANDING_SETTINGS_JSON env var`);
      return branding;
    } catch (error) {
      console.warn(`[testing] Theme dev plugin: Failed to parse BRANDING_SETTINGS_JSON:`, error);
    }
  }

  // In dev mode, try to fetch from API (if backend is running)
  const isDevMode = process.env.NODE_ENV !== 'production' || process.env.THEME_DEV_MODE === 'true';
  
  if (isDevMode && tenantId) {
    const apiBaseUrl = process.env.VITE_API_BASE_URL || process.env.CMS_BACKEND_URL || 'http://localhost:4173';
    
    try {
      const apiUrl = `${apiBaseUrl}/api/v1/theme/${themeSlug}/branding?tenantId=${encodeURIComponent(tenantId)}`;
      console.log(`[testing] Theme dev plugin: Fetching branding from API: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to avoid hanging
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      if (response.ok) {
        const result = await response.json() as { success?: boolean; data?: Record<string, any> } | Record<string, any>;
        // API returns { success: true, data: {...} } or just {...}
        const branding = (result && typeof result === 'object' && 'success' in result && result.success)
          ? (result.data || {})
          : (result as Record<string, any>);
        if (branding && typeof branding === 'object' && Object.keys(branding).length > 0) {
          console.log(`[testing] Theme dev plugin: Fetched branding from API:`, Object.keys(branding));
          return branding;
        }
      } else {
        console.warn(`[testing] Theme dev plugin: API returned ${response.status}, skipping branding fetch`);
      }
    } catch (error: any) {
      // Silently fail - API might not be available
      if (error.name !== 'AbortError') {
        console.warn(`[testing] Theme dev plugin: Could not fetch branding from API (backend may not be running):`, error.message);
      }
    }
  }
  
  return null;
}

export function themeDevPlugin(themeSlug: string, tenantId: string): Plugin {
  return {
    name: 'theme-dev',
    async transformIndexHtml(html) {
      // Only inject if we're in theme dev mode
      const isThemeDevMode = process.env.VITE_DEV_THEME_SLUG || process.env.VITE_DEPLOY_THEME_SLUG || process.env.THEME_DEV_MODE;
      console.log(`[testing] Theme dev plugin: isThemeDevMode: ${isThemeDevMode}`);
      
      if (isThemeDevMode) {
        const slug = themeSlug || process.env.VITE_DEV_THEME_SLUG || process.env.VITE_DEPLOY_THEME_SLUG || 'custom';
        const tenant = tenantId || process.env.CMS_TENANT || 'tenant-gosg';
        
        // Fetch branding data
        const brandingData = await getBrandingData(slug, tenant);
        
        // Build injection script
        let scriptContent = `
      // Injected by theme-dev plugin for development/production
      window.__DEV_THEME_SLUG__ = '${slug}';
      window.__THEME_DEV_MODE__ = true;`;
        
        // Inject tenant ID if available
        if (tenant) {
          scriptContent += `\n      window.__CMS_TENANT__ = '${tenant.replace(/'/g, "\\'")}';`;
        }
        
        // Inject branding settings if available
        if (brandingData && Object.keys(brandingData).length > 0) {
          // Escape JSON for safe injection into HTML
          const brandingJson = JSON.stringify(brandingData)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/\//g, '\\/');
          scriptContent += `\n      window.__BRANDING_SETTINGS__ = ${brandingJson};`;
        }
        
        const injectionScript = `
    <script>${scriptContent}
    </script>`;
        
        let modifiedHtml = html;
        let injectionDone = false;
        
        // Strategy 1: Replace main.tsx script tag with theme-dev.tsx and inject script
        const mainScriptPattern = /<script[^>]*type="module"[^>]*src="\/src\/main\.tsx"[^>]*><\/script>/;
        if (mainScriptPattern.test(modifiedHtml)) {
          modifiedHtml = modifiedHtml.replace(
            mainScriptPattern,
            `${injectionScript}
    <script type="module" src="/src/theme-dev.tsx"></script>`
          );
          injectionDone = true;
        }
        
        // Strategy 2: If Strategy 1 didn't work, try simpler pattern
        if (!injectionDone) {
          const simplePattern = /src="\/src\/main\.tsx"/;
          if (simplePattern.test(modifiedHtml)) {
            modifiedHtml = modifiedHtml.replace(simplePattern, 'src="/src/theme-dev.tsx"');
            // Now inject the script before the theme-dev script
            const themeDevScriptPattern = /(<script[^>]*src="\/src\/theme-dev\.tsx"[^>]*>)/;
            if (themeDevScriptPattern.test(modifiedHtml)) {
              modifiedHtml = modifiedHtml.replace(
                themeDevScriptPattern,
                `${injectionScript}\n    $1`
              );
              injectionDone = true;
            }
          }
        }
        
        // Strategy 3: If still not injected, inject before any script tag or before </head>
        if (!injectionDone) {
          // Try to inject before </head>
          if (modifiedHtml.includes('</head>')) {
            modifiedHtml = modifiedHtml.replace('</head>', `${injectionScript}\n  </head>`);
            injectionDone = true;
          } 
          // Or inject before <body>
          else if (modifiedHtml.includes('<body>')) {
            modifiedHtml = modifiedHtml.replace('<body>', `${injectionScript}\n  <body>`);
            injectionDone = true;
          }
          // Last resort: inject before first script tag
          else {
            const firstScriptPattern = /(<script[^>]*>)/;
            if (firstScriptPattern.test(modifiedHtml)) {
              modifiedHtml = modifiedHtml.replace(
                firstScriptPattern,
                `${injectionScript}\n    $1`
              );
              injectionDone = true;
            }
          }
        }
        
        // Ensure theme-dev.tsx is used instead of main.tsx if not already replaced
        if (!modifiedHtml.includes('theme-dev.tsx') && modifiedHtml.includes('main.tsx')) {
          modifiedHtml = modifiedHtml.replace(/src="\/src\/main\.tsx"/g, 'src="/src/theme-dev.tsx"');
        }
        
        const brandingInfo = brandingData 
          ? ` with branding (${Object.keys(brandingData).length} keys)` 
          : ' (no branding)';
        console.log(`[testing] Theme dev plugin: Injected __THEME_DEV_MODE__ for theme: ${slug}${brandingInfo}`);
        return modifiedHtml;
      }
      
      return html;
    },
  };
}

