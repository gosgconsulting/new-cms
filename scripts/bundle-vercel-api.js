/**
 * Bundles the Vercel API entry and all reachable server + sparti-cms
 * code into a single file so the serverless function stays under the 250 MB limit.
 * Native and large runtime deps are marked external so they are not inlined.
 *
 * Run during Build Output API build; local dev uses server.js / server/index.js.
 */
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import { EXTERNALS } from './vercel-api-externals.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const entry = join(rootDir, 'server', 'vercel-handler.js');
const outfile = join(rootDir, '.vercel', 'output', 'functions', 'api', 'index.func', 'index.js');

async function main() {
  try {
    mkdirSync(dirname(outfile), { recursive: true });
    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile,
      external: EXTERNALS,
      target: 'node20',
    });
    console.log('[build:api] Bundled .vercel/output/functions/api/index.func/index.js');
  } catch (err) {
    console.error('[build:api] Bundle failed:', err);
    process.exit(1);
  }
}

main();
