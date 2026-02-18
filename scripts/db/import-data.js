#!/usr/bin/env node
/**
 * Import data from export file into current DB.
 * Schema must already exist (run migrations first). Uses DATABASE_URL.
 */
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');

// Must match export order: parents before children (e.g. pages before page_layouts)
const IMPORT_TABLE_ORDER = [
  'tenants', 'tenant_databases', 'tenant_api_keys', 'tenant_integrations',
  'themes', 'site_settings', 'site_schemas',
  'users', 'user_sessions', 'user_access_keys', 'user_activity_log', 'security_events',
  'forms', 'form_fields', 'email_settings', 'form_submissions', 'form_submissions_extended',
  'contacts', 'media_folders', 'media', 'media_usage', 'components',
  'categories', 'tags', 'posts', 'post_categories', 'post_tags', 'terms', 'term_taxonomy', 'term_relationships', 'breadcrumbs',
  'pages', 'page_layouts', 'page_versions', 'page_components', 'slug_change_log', 'redirects',
  'sitemap_entries', 'robots_config', 'seo_meta', 'seo_analytics',
  'products', 'product_variants', 'product_categories', 'product_category_relations', 'orders', 'order_items',
  'pern_products', 'pern_cart', 'pern_cart_item', 'pern_orders', 'pern_order_item', 'pern_reviews',
  'projects', 'project_steps', 'smtp_config', 'audit_logs', 'rate_limiter_login',
];

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error('[import] DATABASE_URL required');
  process.exit(1);
}

function maskConnectionString(s) {
  try {
    const u = new URL(s.replace(/^postgres:\/\//, 'https://'));
    return `${u.hostname}${u.pathname || '/'} (user: ${u.username || '?'})`;
  } catch {
    return '(could not parse)';
  }
}

function getImportFile() {
  const idx = process.argv.indexOf('--file');
  if (idx !== -1 && process.argv[idx + 1]) {
    const p = process.argv[idx + 1];
    return path.isAbsolute(p) ? p : path.join(rootDir, p);
  }
  return null;
}

/** Ensure value is JSON-serializable for JSONB columns; avoids "invalid input syntax for type json". */
function safeJsonValue(val, fallback) {
  if (val == null) return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  if (typeof val === 'object' && (Array.isArray(val) || (typeof val === 'object' && !(val instanceof Date)))) {
    try {
      return JSON.parse(JSON.stringify(val));
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Fill nulls for NOT NULL columns that exports often leave null.
 * Ensures JSONB columns get valid values so forms (and thus form_submissions_extended) insert.
 * Returns a new row object (does not mutate).
 */
function normalizeRow(table, row) {
  const r = { ...row };
  if (table === 'tenants') {
    if (r.slug == null) r.slug = r.name ?? String(r.id ?? 'tenant');
  }
  if (table === 'users') {
    if (r.password_salt == null) r.password_salt = '';
  }
  if (table === 'pages') {
    const now = new Date().toISOString();
    if (r.created_at == null) r.created_at = now;
    if (r.updated_at == null) r.updated_at = now;
  }
  if (table === 'forms') {
    r.fields = safeJsonValue(r.fields, []);
    r.settings = safeJsonValue(r.settings, {});
  }
  if (table === 'form_fields') {
    r.validation_rules = safeJsonValue(r.validation_rules, {});
    r.options = safeJsonValue(r.options, []);
  }
  return r;
}

async function main() {
  const filePath = getImportFile();
  if (!filePath || !fs.existsSync(filePath)) {
    console.error('[import] Usage: node import-data.js --file <path-to-export.json>');
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(raw);
  const { tables } = payload;
  if (!tables || typeof tables !== 'object') {
    console.error('[import] Invalid export format: missing tables');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: connString,
    ssl: connString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  await client.connect();
  console.error('[import] Connected to:', maskConnectionString(connString));

  try {
    await client.query('SET session_replication_role = replica');
  } catch (e) {
    console.error('[import] Could not disable triggers:', e.message);
  }

  const BATCH = 100;
  // Process in dependency order so parent rows exist before children (e.g. pages before page_layouts)
  const tableOrder = IMPORT_TABLE_ORDER.filter((t) => t in tables);
  const missing = Object.keys(tables).filter((t) => !IMPORT_TABLE_ORDER.includes(t));
  if (missing.length > 0) console.error('[import] Tables in file but not in order list (will be skipped):', missing.join(', '));
  for (const table of tableOrder) {
    let rows = tables[table];
    if (!Array.isArray(rows) || rows.length === 0) {
      console.error(`[import] ${table}: 0 rows in file (skipped)`);
      continue;
    }
    // Skip page_layouts rows that reference a page not in the export (avoids FK violation)
    if (table === 'page_layouts' && Array.isArray(tables.pages) && tables.pages.length > 0) {
      const validPageIds = new Set(tables.pages.map((p) => p.id));
      const before = rows.length;
      rows = rows.filter((r) => validPageIds.has(r.page_id));
      if (before > rows.length) {
        console.error(`[import] ${table}: skipped ${before - rows.length} row(s) with page_id not in export`);
      }
    }
    if (rows.length === 0) {
      console.error(`[import] ${table}: 0 rows after filtering (skipped)`);
      continue;
    }
    const cols = Object.keys(rows[0]).filter((k) => k !== undefined && rows[0][k] !== undefined);
    if (cols.length === 0) {
      console.error(`[import] ${table}: no columns (skipped)`);
      continue;
    }

    const quotedCols = cols.map((c) => `"${c}"`).join(', ');
    let imported = 0;
    let batchErrors = 0;
    for (let start = 0; start < rows.length; start += BATCH) {
      const rawBatch = rows.slice(start, start + BATCH);
      const batch = rawBatch.map((row) => normalizeRow(table, row));
      const placeholders = batch.map((_, i) => {
        const off = i * cols.length;
        return `(${cols.map((_, j) => `$${off + j + 1}`).join(', ')})`;
      }).join(', ');
      const values = batch.flatMap((row) => cols.map((c) => row[c]));

      try {
        await client.query(
          `INSERT INTO "${table}" (${quotedCols}) VALUES ${placeholders}`,
          values
        );
        imported += batch.length;
      } catch (err) {
        if (err.code === '23505') {
          console.error(`[import] ${table}: duplicate key, skipping batch`);
        } else {
          batchErrors += 1;
          console.error(`[import] ${table} error:`, err.message);
        }
      }
    }
    console.error(`[import] ${table}: ${rows.length} in file → ${imported} inserted${batchErrors > 0 ? `, ${batchErrors} batch(es) failed` : ''}`);
  }

  try {
    await client.query('SET session_replication_role = DEFAULT');
  } catch (e) {
    // ignore
  }

  // Reset sequences for tables with SERIAL columns (from information_schema)
  for (const table of tableOrder) {
    try {
      const colRes = await client.query(
        `SELECT column_name, column_default FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_default LIKE 'nextval%'`,
        [table]
      );
      for (const col of colRes.rows) {
        const m = col.column_default.match(/nextval\('([^']+)'::regclass\)/);
        if (m) {
          const seq = m[1];
          const safeCol = col.column_name.replace(/"/g, '""');
          const safeTable = table.replace(/"/g, '""');
          await client.query(
            `SELECT setval($1::regclass, GREATEST(1, (SELECT COALESCE(MAX("${safeCol}"), 1) FROM "${safeTable}")::bigint))`,
            [seq]
          );
        }
      }
    } catch (e) {
      // skip
    }
  }

  await client.end();
  console.error('[import] Done');
}

main().catch((err) => {
  console.error('[import]', err);
  process.exit(1);
});
