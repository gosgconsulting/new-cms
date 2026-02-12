/**
 * Bundles the Vercel API entry (api/index.js) and all reachable server + sparti-cms
 * code into a single file so the serverless function stays under the 250 MB limit.
 * Native and large runtime deps are marked external so they are not inlined.
 *
 * Run during Vercel build only; local dev uses server.js / server/index.js.
 */
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const entry = join(rootDir, 'api', 'index.source.js');
const outfile = join(rootDir, 'api', 'index.js');

const externals = [
  'pg',
  'pg-native',
  'sequelize',
  '@anthropic-ai/sdk',
  '@vercel/blob',
];

async function main() {
  try {
    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile,
      external: externals,
      target: 'node20',
    });
    console.log('[build:api] Bundled api/index.js for Vercel');
  } catch (err) {
    console.error('[build:api] Bundle failed:', err);
    process.exit(1);
  }
}

main();
