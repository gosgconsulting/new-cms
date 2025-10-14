import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Create a virtual module for missing Supabase types
const virtualTypesPlugin = {
  name: 'virtual-types',
  resolveId(id: string) {
    if (id === './types' || id.endsWith('/integrations/supabase/types')) {
      return '\0virtual:supabase-types';
    }
  },
  load(id: string) {
    if (id === '\0virtual:supabase-types') {
      return `
        export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
        export interface Database {
          public: {
            Tables: { [_ in never]: never };
            Views: { [_ in never]: never };
            Functions: { [_ in never]: never };
            Enums: { [_ in never]: never };
          };
        }
      `;
    }
  }
};

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
    virtualTypesPlugin,
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Exclude server-side packages from frontend bundle
    exclude: ['pg', 'express']
  },
}));
