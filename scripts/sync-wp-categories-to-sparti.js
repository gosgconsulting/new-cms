#!/usr/bin/env node
/**
 * Sync WordPress post categories → Sparti CMS for a given tenant.
 *
 * For every post that exists in Sparti (matched by slug) this script:
 *   1. Looks up the post's categories on WordPress
 *   2. Finds-or-creates each category in Sparti (by slug, scoped to the tenant)
 *   3. Updates the post's category assignments in Sparti
 *
 * Usage:
 *   node scripts/sync-wp-categories-to-sparti.js [tenant_id]
 *   tenant_id defaults to "tenant-nail-queen"
 *
 * Credentials loaded from .env or .cursor/mcp.json.
 */

import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadMcpEnv() {
  if (process.env.WORDPRESS_URL && process.env.DATABASE_URL) return;
  try {
    const mcpPath = join(__dirname, '..', '.cursor', 'mcp.json');
    const mcp = JSON.parse(readFileSync(mcpPath, 'utf8'));
    const servers = mcp.mcpServers || {};
    if (servers['wordpress-mcp']?.env) Object.assign(process.env, servers['wordpress-mcp'].env);
    if (servers['sparti-cms']?.env) Object.assign(process.env, servers['sparti-cms'].env);
  } catch (_) {}
}
loadMcpEnv();

const { Pool } = pg;
const tenantId = process.argv[2] || 'tenant-nail-queen';

// ---------------------------------------------------------------------------
// WordPress helpers
// ---------------------------------------------------------------------------

function wpAuthHeader() {
  const url = process.env.WORDPRESS_URL?.replace(/\/$/, '');
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_APP_PASSWORD;
  if (!url || !username || !password) throw new Error('Missing WordPress credentials');
  return {
    baseUrl: url,
    auth: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
  };
}

async function wpGet(path, params = {}) {
  const { baseUrl, auth } = wpAuthHeader();
  const url = new URL(`${baseUrl}/wp-json/wp/v2${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const res = await fetch(url.toString(), { headers: { Authorization: auth } });
  if (!res.ok) throw new Error(`WP API ${res.status} ${path}: ${await res.text()}`);
  return {
    data: await res.json(),
    total: Number(res.headers.get('X-WP-Total') ?? 0),
    totalPages: Number(res.headers.get('X-WP-TotalPages') ?? 1),
  };
}

async function fetchAllWpCategories() {
  const map = new Map(); // id → {id, name, slug, description}
  let page = 1, totalPages = 1;
  while (page <= totalPages) {
    const { data, totalPages: tp } = await wpGet('/categories', { per_page: 100, page, hide_empty: false });
    totalPages = tp;
    for (const cat of data) map.set(cat.id, { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description ?? '' });
    page++;
  }
  console.log(`  WP categories fetched: ${map.size}`);
  return map;
}

async function fetchAllWpPosts() {
  const posts = []; // [{slug, categories: [wpCatId, ...]}]
  let page = 1, totalPages = 1;
  while (page <= totalPages) {
    const { data, total, totalPages: tp } = await wpGet('/posts', { status: 'publish', per_page: 100, page });
    totalPages = tp;
    for (const p of data) posts.push({ slug: p.slug, categories: p.categories ?? [] });
    console.log(`  WP posts: page ${page}/${totalPages} (${posts.length}/${total})`);
    page++;
  }
  return posts;
}

// ---------------------------------------------------------------------------
// Sparti DB helpers
// ---------------------------------------------------------------------------

async function getSpartiPosts(pool) {
  // slug → id
  const { rows } = await pool.query('SELECT id, slug FROM posts WHERE tenant_id = $1', [tenantId]);
  return new Map(rows.map(r => [r.slug, r.id]));
}

async function getSpartiCategories(pool) {
  // slug → id (tenant-scoped)
  const { rows } = await pool.query(
    'SELECT id, slug FROM categories WHERE tenant_id = $1',
    [tenantId]
  );
  return new Map(rows.map(r => [r.slug, r.id]));
}

async function findOrCreateSpartiCategory(pool, spartiCatCache, wpCat) {
  if (spartiCatCache.has(wpCat.slug)) return spartiCatCache.get(wpCat.slug);

  const { rows } = await pool.query(
    `INSERT INTO categories (name, slug, description, tenant_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (slug, COALESCE(tenant_id, ''::character varying))
     DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
     RETURNING id`,
    [wpCat.name, wpCat.slug, wpCat.description || '', tenantId]
  );
  const id = rows[0].id;
  spartiCatCache.set(wpCat.slug, id);
  return id;
}

async function setPostCategories(pool, postId, categoryIds) {
  await pool.query('DELETE FROM post_categories WHERE post_id = $1', [postId]);
  for (const catId of categoryIds) {
    await pool.query(
      'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [postId, catId]
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nSyncing WordPress categories → Sparti CMS (tenant: ${tenantId})\n`);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
  });

  try {
    // 1) Fetch WP data
    console.log('Fetching WordPress categories...');
    const wpCategories = await fetchAllWpCategories(); // Map<wpCatId, {name,slug,...}>

    console.log('\nFetching WordPress posts...');
    const wpPosts = await fetchAllWpPosts(); // [{slug, categories:[wpCatId,...]}]
    console.log(`  Total WP posts: ${wpPosts.length}`);

    // 2) Fetch Sparti data
    console.log('\nFetching Sparti posts for tenant...');
    const spartiPosts = await getSpartiPosts(pool); // Map<slug, spartiPostId>
    console.log(`  Sparti posts: ${spartiPosts.size}`);

    console.log('\nFetching existing Sparti categories...');
    const spartiCatCache = await getSpartiCategories(pool); // Map<slug, spartiCatId>
    console.log(`  Existing Sparti categories: ${spartiCatCache.size}`);

    // 3) For each WP post that exists in Sparti, sync categories
    console.log('\nSyncing categories...\n');
    let updated = 0, skipped = 0, errors = 0;

    for (const wpPost of wpPosts) {
      const spartiPostId = spartiPosts.get(wpPost.slug);
      if (!spartiPostId) {
        skipped++;
        continue; // post not migrated yet
      }

      try {
        // Resolve each WP category ID → Sparti category ID (create if missing)
        const spartiCatIds = [];
        for (const wpCatId of wpPost.categories) {
          const wpCat = wpCategories.get(wpCatId);
          if (!wpCat) {
            console.warn(`    Warning: WP category id=${wpCatId} not found, skipping`);
            continue;
          }
          const spartiCatId = await findOrCreateSpartiCategory(pool, spartiCatCache, wpCat);
          spartiCatIds.push(spartiCatId);
        }

        await setPostCategories(pool, spartiPostId, spartiCatIds);

        const catNames = wpPost.categories.map(id => wpCategories.get(id)?.name ?? `id:${id}`).join(', ') || '(none)';
        console.log(`  ✓ ${wpPost.slug}  →  [${catNames}]`);
        updated++;
      } catch (err) {
        errors++;
        console.error(`  ✗ ${wpPost.slug}: ${err.message}`);
      }
    }

    console.log(`\n─────────────────────────────────────────`);
    console.log(`Updated : ${updated}`);
    console.log(`Skipped : ${skipped} (not yet in Sparti)`);
    console.log(`Errors  : ${errors}`);
  } finally {
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
