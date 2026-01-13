import { defineConfig } from "vite";
import path from "path";

// Server build configuration
export default defineConfig({
  build: {
    rollupOptions: {
      input: "server/node-build.ts",
      external: [
        // Node.js built-ins
        "fs",
        "path",
        "url",
        "http",
        "https",
        "os",
        "crypto",
        "stream",
        "util",
        "events",
        "buffer",
        "querystring",
        "child_process",
        // External dependencies that should not be bundled
        "express",
        "cors",
        "dotenv",
      ],
      output: {
        format: "es",
        entryFileNames: "node-build.mjs",
        dir: "dist/server",
      },
    },
    target: "node18",
    ssr: true,
    minify: false,
    sourcemap: true,
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "@shared": path.resolve(process.cwd(), "shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
