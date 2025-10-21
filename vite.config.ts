import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
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
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    force: true // Force re-optimization to clear cache
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
}));
