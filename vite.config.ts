import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { componentTagger } from "lovable-tagger";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';
import { themeDevPlugin } from './vite-plugin-theme-dev';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  // Vite's loadEnv loads .env, .env.local, .env.[mode], .env.[mode].local
  const env = loadEnv(mode, process.cwd(), '');
  
  // Merge loaded env vars with process.env (process.env takes precedence)
  const envVars = { ...env, ...process.env };
  
  const plugins = [
    // Tailwind v4 (Vite plugin)
    tailwindcss(),
    dyadComponentTagger(), 
    react(),
    mode === 'development' && componentTagger(),
    // Custom plugin to handle /theme/* routes for SPA routing
    {
      name: 'theme-spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          
          // Only handle /theme/* paths
          if (url.startsWith('/theme/')) {
            // Check if it's an asset request (has file extension)
            const hasExtension = /\.([a-zA-Z0-9]+)$/.test(url);
            
            // If it's not an asset, serve index.html for SPA routing
            if (!hasExtension) {
              // Rewrite to index.html to let React Router handle it
              req.url = '/index.html';
            }
          }
          
          next();
        });
      }
    },
  ].filter(Boolean);
  
  // Add theme dev plugin if in theme dev mode
  if (envVars.VITE_DEV_THEME_SLUG || envVars.VITE_DEPLOY_THEME_SLUG || envVars.THEME_DEV_MODE) {
    const themeSlug = envVars.VITE_DEV_THEME_SLUG || envVars.VITE_DEPLOY_THEME_SLUG || 'custom';
    // Read tenant ID from .env file (CMS_TENANT) or environment variables
    // Priority: process.env (set by dev-theme.js) > .env file > fallback
    const tenantId = envVars.CMS_TENANT || envVars.VITE_DEV_TENANT_ID || envVars.VITE_DEPLOY_TENANT_ID || 'tenant-gosg';
    console.log(`[testing] Theme dev plugin: themeSlug: ${themeSlug}, tenantId: ${tenantId}`);
    console.log(`[testing] Env vars - CMS_TENANT: ${envVars.CMS_TENANT || 'not set'}, VITE_DEV_TENANT_ID: ${envVars.VITE_DEV_TENANT_ID || 'not set'}`);
    plugins.push(themeDevPlugin(themeSlug, tenantId));
  }
  
  // When theme folder is excluded (Vercel CMS-only or VITE_SKIP_THEMES), resolve sparti-cms/theme to stubs so build succeeds.
  const useThemeStubs = envVars.VERCEL === '1' || envVars.VITE_SKIP_THEMES === '1';
  const themeStubsPath = path.resolve(__dirname, 'src/theme-stubs');
  const resolveAlias: Array<{ find: string | RegExp; replacement: string }> = [
    { find: '@', replacement: path.resolve(__dirname, './src') },
  ];
  if (useThemeStubs) {
    // IMPORTANT: Vite can sometimes attempt to load an aliased directory as a file.
    // Map top-level theme entry imports to the actual stub index file explicitly.
    resolveAlias.push({
      find: /sparti-cms\/theme\/([^/]+)$/,
      replacement: themeStubsPath + '/$1/index.tsx',
    });

    // Map deep imports (e.g. sparti-cms/theme/gosgconsulting/services/wordpressApi)
    // directly into the stubs folder.
    resolveAlias.push({ find: /sparti-cms\/theme(.*)/, replacement: themeStubsPath + '$1' });
  }

  return {
  server: {
    host: "::",
    port: 8080,
    strictPort: false, // Allow port fallback if 8080 is in use
    hmr: {
      host: 'localhost',
      protocol: 'ws'
      // port and clientPort removed - Vite will auto-detect from server.port
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4173',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying for HMR
      },
      // Allow frontend dev server to load theme assets directly from the backend.
      // Needed for themes whose assets are served by Express (e.g. Nail Queen imported assets).
      // Only proxy theme assets (files with extensions), not routes - let Vite handle SPA routing
      '/theme': {
        target: 'http://localhost:4173',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
        // Only proxy if the path has a file extension (asset request)
        // If no extension, bypass proxy to let Vite handle as SPA route
        bypass: (req) => {
          const path = req.url || '';
          // If no file extension, bypass proxy (let Vite handle as SPA route)
          if (!/\.([a-zA-Z0-9]+)$/.test(path)) {
            return false; // Bypass proxy, let Vite handle it
          }
          // Proxy assets (files with extensions)
          return null; // Continue with proxy
        },
      }
    }
  },
  plugins,
  resolve: {
    alias: resolveAlias,
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Exclude server-side packages from frontend bundle
    exclude: ['pg', 'express'],
    // Force React and React-DOM to be pre-bundled together
    include: ['react', 'react-dom', 'react/jsx-runtime', 'flowbite'],
    force: true // Force re-optimization to clear cache
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  };
});