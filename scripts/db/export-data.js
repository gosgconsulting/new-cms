#!/usr/bin/env node
/**
 * Export data from all used tables for server migration.
 * Outputs JSON to stdout or --out file. Run against current DB (DATABASE_URL).
 */
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');

// Tables in dependency order (parents before children) for clean import
const EXPORT_TABLE_ORDER = [
  'tenants',
  'tenant_databases',
  'tenant_api_keys',
  'tenant_integrations',
  'themes',
  'site_settings',
  'site_schemas',
  'users',
  'user_sessions',
  'user_access_keys',
  'user_activity_log',
  'security_events',
  'forms',
  'form_fields',
  'email_settings',
  'form_submissions',
  'form_submissions_extended',
  'contacts',
  'media_folders',
  'media',
  'media_usage',
  'components',
  'categories',
  'tags',
  'posts',
  'post_categories',
  'post_tags',
  'terms',
  'term_taxonomy',
  'term_relationships',
  'breadcrumbs',
  'pages',
  'page_layouts',
  'page_versions',
  'page_components',
  'slug_change_log',
  'redirects',
  'sitemap_entries',
  'robots_config',
  'seo_meta',
  'seo_analytics',
  'products',
  'product_variants',
  'product_categories',
  'product_category_relations',
  'orders',
  'order_items',
  'pern_products',
  'pern_cart',
  'pern_cart_item',
  'pern_orders',
  'pern_order_item',
  'pern_reviews',
  'projects',
  'project_steps',
  'smtp_config',
  'audit_logs',
  'rate_limiter_login',
];

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error('[export] DATABASE_URL required');
  process.exit(1);
}

async function tableExists(client, table) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  return r.rows.length > 0;
}

async function main() {
  const outPath = process.argv.includes('--out')
    ? process.argv[process.argv.indexOf('--out') + 1]
    : null;

  const client = new pg.Client({
    connectionString: connString,
    ssl: connString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  await client.connect();

  const payload = { exportedAt: new Date().toISOString(), tables: {} };

  for (const table of EXPORT_TABLE_ORDER) {
    const exists = await tableExists(client, table);
    if (!exists) {
      console.error(`[export] Skip (missing): ${table}`);
      continue;
    }
    try {
      const res = await client.query(`SELECT * FROM "${table}"`);
      payload.tables[table] = res.rows;
      console.error(`[export] ${table}: ${res.rows.length} rows`);
    } catch (err) {
      console.error(`[export] Error reading ${table}:`, err.message);
    }
  }

  await client.end();

  const json = JSON.stringify(payload, null, 0);
  if (outPath) {
    const abs = path.isAbsolute(outPath) ? outPath : path.join(rootDir, outPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, json, 'utf8');
    console.error(`[export] Wrote ${abs}`);
  } else {
    process.stdout.write(json);
  }
}

main().catch((err) => {
  console.error('[export]', err);
  process.exit(1);
});
