/**
 * Vite plugin for theme development mode
 * Injects theme development script into HTML at runtime without modifying index.html
 */

import type { Plugin } from 'vite';

export function themeDevPlugin(themeSlug: string): Plugin {
  return {
    name: 'theme-dev',
    transformIndexHtml(html) {
      // Only inject if we're in theme dev mode
      const isThemeDevMode = process.env.VITE_DEV_THEME_SLUG || process.env.DEPLOY_THEME_SLUG || process.env.THEME_DEV_MODE;
      
      if (isThemeDevMode) {
        const slug = themeSlug || process.env.VITE_DEV_THEME_SLUG || process.env.DEPLOY_THEME_SLUG || 'landingpage';
        
        // Inject script with theme dev variables
        const injectionScript = `
    <script>
      // Injected by theme-dev plugin for development
      window.__DEV_THEME_SLUG__ = '${slug}';
      window.__THEME_DEV_MODE__ = true;
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
        
        console.log(`[testing] Theme dev plugin: Injected __THEME_DEV_MODE__ for theme: ${slug}`);
        return modifiedHtml;
      }
      
      return html;
    },
  };
}

