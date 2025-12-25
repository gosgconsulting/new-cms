import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Get tenant ID from environment variable (for Railway deployment)
  const deployTenantId = process.env.DEPLOY_TENANT_ID;
  
  // Configure build options based on tenant
  const buildConfig = deployTenantId ? {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, `dev/${deployTenantId}/index.html`),
      },
    },
    outDir: 'dist',
  } : {
    outDir: 'dist',
  };

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/dev": path.resolve(__dirname, "./dev"),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: buildConfig,
    define: {
      // Make tenant ID available at build time
      'import.meta.env.DEPLOY_TENANT_ID': JSON.stringify(deployTenantId),
    },
  };
})
