#!/usr/bin/env node
/**
 * Builds the Master Astro theme (Mainline template adapted for Sparti CMS)
 * Output: sparti-cms/theme/migrations/mainline-astro-template-master/dist
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectDir = path.join(
  __dirname,
  '..',
  'sparti-cms',
  'theme',
  'migrations',
  'mainline-astro-template-master'
);

if (!fs.existsSync(projectDir)) {
  console.error(`[master-astro] Project directory not found: ${projectDir}`);
  process.exit(1);
}

console.log(`[master-astro] Building Astro theme in: ${projectDir}`);

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['astro', 'build'],
  {
    cwd: projectDir,
    stdio: 'inherit',
    env: {
      ...process.env,
    },
  }
);

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`[master-astro] Build failed with code ${code}`);
    process.exit(code ?? 1);
  }
  console.log('[master-astro] ✅ Build complete');
});
