import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
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
    dyadComponentTagger(), 
    react(),
    mode === 'development' && componentTagger(),
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
  
  return {
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:4173',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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
