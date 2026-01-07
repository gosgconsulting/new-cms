import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';
import { themeDevPlugin } from './vite-plugin-theme-dev';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [
    dyadComponentTagger(), 
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean);
  
  // Add theme dev plugin if in theme dev mode
  if (process.env.VITE_DEV_THEME_SLUG || process.env.DEPLOY_THEME_SLUG || process.env.THEME_DEV_MODE) {
    const themeSlug = process.env.VITE_DEV_THEME_SLUG || process.env.DEPLOY_THEME_SLUG || 'landingpage';
    plugins.push(themeDevPlugin(themeSlug));
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
