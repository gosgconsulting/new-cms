#!/usr/bin/env node

import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔨 Building server...');
console.log('Working directory:', process.cwd());
console.log('Script directory:', __dirname);

// Check if the entry file exists
const entryPath = resolve(__dirname, 'server/node-build.ts');
console.log('Looking for entry file at:', entryPath);

if (!existsSync(entryPath)) {
  console.error('❌ Entry file not found:', entryPath);
  console.log('Available files in server directory:');
  try {
    const serverFiles = readdirSync(resolve(__dirname, 'server'), { recursive: true });
    console.log(serverFiles);
  } catch (e) {
    console.log('Could not read server directory');
  }
  process.exit(1);
}

try {
  await build({
    build: {
      outDir: 'dist/server',
      target: 'node22',
      ssr: true,
      rollupOptions: {
        input: entryPath,
        external: [
          // Node.js built-ins
          'fs', 'path', 'url', 'http', 'https', 'os', 'crypto', 'stream', 'util', 'events', 'buffer', 'querystring', 'child_process',
          // External dependencies
          'express', 'cors', 'dotenv'
        ],
        output: {
          format: 'es',
          entryFileNames: 'node-build.mjs',
        },
      },
      minify: false,
      sourcemap: true,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './client'),
        '@shared': resolve(__dirname, './shared'),
      },
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });
  
  console.log('✅ Server build completed successfully');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
