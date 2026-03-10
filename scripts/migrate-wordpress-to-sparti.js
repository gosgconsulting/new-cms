#!/usr/bin/env node
/**
 * Migrate blog posts from WordPress to Sparti CMS for a given tenant.
 * Uses the same WordPress URL/credentials as wordpress-mcp and Sparti DB as sparti-cms MCP.
 * Ensures no duplicates by slug and preserves WordPress post slugs.
 *
 * Usage:
 *   node scripts/migrate-wordpress-to-sparti.js [tenant_id]
 *   tenant_id defaults to "tenant-nail-queen"
 *
 * Required: WORDPRESS_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD, DATABASE_URL
 * Loaded from .env (dotenv) or, if missing, from .cursor/mcp.json (wordpress-mcp.env + sparti-cms.env).
 */

import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Optionally load from .cursor/mcp.json when env vars are not set
function loadMcpEnv() {
  if (process.env.WORDPRESS_URL && process.env.DATABASE_URL) return;
  try {
    const mcpPath = join(__dirname, '..', '.cursor', 'mcp.json');
    const mcp = JSON.parse(readFileSync(mcpPath, 'utf8'));
    const servers = mcp.mcpServers || {};
    if (servers['wordpress-mcp']?.env) {
      Object.assign(process.env, servers['wordpress-mcp'].env);
    }
    if (servers['sparti-cms']?.env) {
      Object.assign(process.env, servers['sparti-cms'].env);
    }
  } catch (_) {
    // ignore
  }
}
loadMcpEnv();

const { Pool } = pg;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const tenantId = process.argv[2] || 'tenant-nail-queen';

function getWpConfig() {
  const url = process.env.WORDPRESS_URL?.replace(/\/$/, '');
  const username = process.env.WORDPRESS_USERNAME;
  const appPassword = process.env.WORDPRESS_APP_PASSWORD;
  if (!url || !username || !appPassword) {
    throw new Error('Set WORDPRESS_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD (or use .cursor/mcp.json)');
  }
  return { url, username, appPassword };
}

function buildWpAuthHeader() {
  const { username, appPassword } = getWpConfig();
  return 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64');
}

async function wpFetch(path, params = {}) {
  const { url } = getWpConfig();
  const endpoint = new URL(`${url}/wp-json/wp/v2${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    endpoint.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  const res = await fetch(endpoint.toString(), {
    headers: {
      Authorization: buildWpAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`WordPress API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const total = Number(res.headers.get('X-WP-Total') ?? 0);
  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 1);
  return { data, total, totalPages };
}

async function fetchAllWpPosts() {
  const list = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const { data, total, totalPages: tp } = await wpFetch('/posts', {
      status: 'publish',
      per_page: 100,
      page,
    });
    totalPages = tp;
    list.push(...data);
    console.log(`  WordPress: fetched page ${page}/${totalPages} (${list.length}/${total} posts)`);
    page++;
  }
  return list;
}

async function getExistingSlugsForTenant(pool) {
  const result = await pool.query(
    `SELECT slug FROM posts WHERE tenant_id = $1`,
    [tenantId]
  );
  return new Set(result.rows.map((r) => r.slug));
}

function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '').trim().slice(0, 500);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Migrating WordPress → Sparti CMS for tenant: ${tenantId}\n`);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
  });

  try {
    // 1) Fetch all published WordPress posts
    console.log('Fetching WordPress posts...');
    const wpPosts = await fetchAllWpPosts();
    console.log(`Total WordPress posts: ${wpPosts.length}\n`);

    if (wpPosts.length === 0) {
      console.log('No WordPress posts to migrate.');
      return;
    }

    // 2) Existing slugs in Sparti for this tenant (avoid duplicates)
    console.log('Loading existing Sparti slugs for tenant...');
    const existingSlugs = await getExistingSlugsForTenant(pool);
    console.log(`Existing slugs in Sparti for ${tenantId}: ${existingSlugs.size}\n`);

    const toMigrate = wpPosts.filter((p) => !existingSlugs.has(p.slug));
    const skipped = wpPosts.length - toMigrate.length;
    if (skipped) {
      console.log(`Skipping ${skipped} posts that already exist (same slug).`);
    }
    console.log(`Posts to migrate: ${toMigrate.length}\n`);

    let created = 0;
    let errors = 0;

    for (const wp of toMigrate) {
      try {
        // Fetch full post (content, excerpt) from WordPress
        const { data: full } = await wpFetch(`/posts/${wp.id}`);
        const title = full.title?.rendered ?? wp.title?.rendered ?? '';
        const slug = full.slug ?? wp.slug;
        const content = full.content?.rendered ?? '';
        const excerpt = full.excerpt?.rendered ?? '';
        const publishedAt = full.date ? new Date(full.date) : null;

        await pool.query(
          `INSERT INTO posts (
            title, slug, content, excerpt, status, post_type,
            tenant_id, published_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, 'published', 'post', $5, $6, NOW(), NOW())`,
          [
            title,
            slug,
            content,
            stripHtml(excerpt) || excerpt.slice(0, 500),
            tenantId,
            publishedAt,
          ]
        );
        created++;
        console.log(`  Created: ${slug}`);
      } catch (err) {
        errors++;
        console.error(`  Error migrating slug "${wp.slug}":`, err.message);
      }
    }

    console.log(`\nDone. Created: ${created}, Errors: ${errors}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
