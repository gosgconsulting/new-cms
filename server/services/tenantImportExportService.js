/**
 * Tenant Import/Export Service
 * Exports tenant data as a single JSON file (metadata + data) with all media URLs as absolute.
 * Imports from a single JSON payload; media URLs are expected to be already set (e.g. by frontend after re-upload to Blob).
 * @module server/services/tenantImportExportService
 */

import { query } from '../../sparti-cms/db/index.js';
import { createMediaFolder, createMediaFile } from '../../sparti-cms/db/modules/media.js';

const EXPORT_VERSION = 1;

/**
 * Convert a relative or path-only URL to an absolute URL.
 * @param {string} baseUrl - e.g. https://example.com
 * @param {string} url - url or path (may be empty, or already absolute)
 * @returns {string}
 */
function toAbsoluteUrl(baseUrl, url) {
  if (!url || typeof url !== 'string') return url || '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = baseUrl.replace(/\/$/, '');
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}

/**
 * Walk export data and ensure all URL fields are absolute (for media and any embedded URLs).
 * @param {Object} data - export data (media, media_folders, pages, page_layouts, posts, etc.)
 * @param {string} baseUrl - origin, e.g. https://example.com
 */
function ensureAbsoluteUrls(data, baseUrl) {
  if (!baseUrl) return;
  (data.media || []).forEach((row) => {
    if (row.url) row.url = toAbsoluteUrl(baseUrl, row.url);
    if (row.relative_path) row.relative_path = toAbsoluteUrl(baseUrl, row.relative_path);
  });
}

/**
 * Get all tenant-scoped data for export (tenant_id = tenantId only; exclude master/null).
 * @param {string} tenantId
 * @returns {Promise<{ pages, page_layouts, page_versions, page_components, posts, post_categories, post_tags, media, media_folders, categories, tags }>}
 */
async function fetchTenantData(tenantId) {
  const [pagesRes, postsRes, mediaRes, mediaFoldersRes, categoriesRes, tagsRes] = await Promise.all([
    query(`SELECT * FROM pages WHERE tenant_id = $1 ORDER BY id`, [tenantId]),
    query(`SELECT * FROM posts WHERE tenant_id = $1 ORDER BY id`, [tenantId]),
    query(`SELECT * FROM media WHERE tenant_id = $1 AND is_active = true ORDER BY id`, [tenantId]),
    query(`SELECT * FROM media_folders WHERE tenant_id = $1 AND is_active = true ORDER BY id`, [tenantId]),
    query(`SELECT * FROM categories WHERE tenant_id = $1 ORDER BY id`, [tenantId]),
    query(`SELECT * FROM tags WHERE tenant_id = $1 ORDER BY id`, [tenantId]),
  ]);

  const pages = pagesRes.rows || [];
  const posts = postsRes.rows || [];
  const media = mediaRes.rows || [];
  const media_folders = mediaFoldersRes.rows || [];
  const categories = categoriesRes.rows || [];
  const tags = tagsRes.rows || [];

  const pageIds = pages.map((p) => p.id);
  const postIds = posts.map((p) => p.id);

  let page_layouts = [];
  let page_versions = [];
  let page_components = [];
  let post_categories = [];
  let post_tags = [];

  if (pageIds.length > 0) {
    const [layoutsRes, versionsRes, componentsRes] = await Promise.all([
      query(`SELECT * FROM page_layouts WHERE page_id = ANY($1::int[]) ORDER BY page_id, language`, [pageIds]),
      query(`SELECT * FROM page_versions WHERE page_id = ANY($1::int[]) AND tenant_id = $2 ORDER BY id`, [pageIds, tenantId]),
      query(`SELECT * FROM page_components WHERE page_id = ANY($1::int[]) ORDER BY id`, [pageIds]),
    ]);
    page_layouts = layoutsRes.rows || [];
    page_versions = versionsRes.rows || [];
    page_components = componentsRes.rows || [];
  }

  if (postIds.length > 0) {
    const [pcRes, ptRes] = await Promise.all([
      query(`SELECT * FROM post_categories WHERE post_id = ANY($1::int[])`, [postIds]),
      query(`SELECT * FROM post_tags WHERE post_id = ANY($1::int[])`, [postIds]),
    ]);
    post_categories = pcRes.rows || [];
    post_tags = ptRes.rows || [];
  }

  return {
    pages,
    page_layouts,
    page_versions,
    page_components,
    posts,
    post_categories,
    post_tags,
    media,
    media_folders,
    categories,
    tags,
  };
}

/**
 * Replace media ID references in a JSON-serializable value (layout, content).
 * @param {any} obj
 * @param {Map<number, number>} mediaIdMap oldId -> newId
 * @returns {any}
 */
function replaceMediaIdsInValue(obj, mediaIdMap) {
  if (obj == null) return obj;
  if (typeof obj === 'number' && mediaIdMap.has(obj)) return mediaIdMap.get(obj);
  if (typeof obj === 'string') {
    let s = obj;
    mediaIdMap.forEach((newId, oldId) => {
      s = s.replace(new RegExp(`"mediaId":\\s*${oldId}\\b`, 'g'), `"mediaId":${newId}`);
      s = s.replace(new RegExp(`"media_id":\\s*${oldId}\\b`, 'g'), `"media_id":${newId}`);
      s = s.replace(new RegExp(`(^|[^0-9])${oldId}([^0-9]|$)`, 'g'), `$1${newId}$2`);
    });
    return s;
  }
  if (Array.isArray(obj)) return obj.map((item) => replaceMediaIdsInValue(item, mediaIdMap));
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'mediaId' || k === 'media_id') {
        const num = Number(v);
        out[k] = mediaIdMap.has(num) ? mediaIdMap.get(num) : v;
      } else {
        out[k] = replaceMediaIdsInValue(v, mediaIdMap);
      }
    }
    return out;
  }
  return obj;
}

/**
 * Send tenant export as a single JSON response (metadata + data; all media URLs absolute).
 * @param {string} tenantId
 * @param {import('express').Response} res - Express response
 * @param {string} [baseUrl] - e.g. https://example.com for making relative URLs absolute
 */
export async function streamTenantExport(tenantId, res, baseUrl = '') {
  const data = await fetchTenantData(tenantId);
  ensureAbsoluteUrls(data, baseUrl);

  const payload = {
    version: EXPORT_VERSION,
    tenantId,
    exportedAt: new Date().toISOString(),
    counts: {
      pages: data.pages.length,
      page_layouts: data.page_layouts.length,
      posts: data.posts.length,
      media: data.media.length,
      media_folders: data.media_folders.length,
      categories: data.categories.length,
      tags: data.tags.length,
    },
    pages: data.pages,
    page_layouts: data.page_layouts,
    page_versions: data.page_versions,
    page_components: data.page_components,
    posts: data.posts,
    post_categories: data.post_categories,
    post_tags: data.post_tags,
    media: data.media,
    media_folders: data.media_folders,
    categories: data.categories,
    tags: data.tags,
  };

  const filename = `tenant-export-${tenantId}-${Date.now()}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.attachment(filename);
  res.send(JSON.stringify(payload));
}

/**
 * Import tenant data from a single JSON payload (metadata + data).
 * Media URLs in the payload are used as-is (expected to be set by frontend after re-upload to Blob).
 * @param {string} tenantId - Target tenant
 * @param {Object} payload - Parsed export JSON: { version, tenantId, exportedAt, counts, pages, media, ... }
 * @returns {Promise<{ success: boolean, stats: Object, errors: string[] }>}
 */
// Re-export fetchTenantData for use by backupService (avoids duplicating the query logic).
export { fetchTenantData as fetchTenantDataForBackup };

export async function importTenantData(tenantId, payload) {
  const errors = [];
  const stats = {
    media_folders: 0,
    media: 0,
    categories: 0,
    tags: 0,
    pages: 0,
    page_layouts: 0,
    page_versions: 0,
    page_components: 0,
    posts: 0,
    post_categories: 0,
    post_tags: 0,
  };

  if (!payload || typeof payload !== 'object') {
    errors.push('Invalid payload: expected JSON object');
    return { success: false, stats, errors };
  }

  const data = payload;
  if (data.version !== EXPORT_VERSION) {
    errors.push(`Unsupported export version: ${data.version}`);
  }

  const folderIdMap = new Map();
  const mediaIdMap = new Map();
  const categoryIdMap = new Map();
  const tagIdMap = new Map();
  const pageIdMap = new Map();
  const postIdMap = new Map();

  try {
    // 1. Media folders (remap old id -> new id). Skip create if folder with same slug already exists; use existing id.
    const foldersOrdered = (data.media_folders || []).sort((a, b) => (a.parent_folder_id || 0) - (b.parent_folder_id || 0));
    for (const row of foldersOrdered) {
      const existing = await query(
        `SELECT id FROM media_folders WHERE tenant_id = $1 AND slug = $2 AND is_active = true LIMIT 1`,
        [tenantId, row.slug]
      );
      if (existing.rows.length > 0) {
        folderIdMap.set(row.id, existing.rows[0].id);
        continue;
      }
      const parentId = row.parent_folder_id != null && folderIdMap.has(row.parent_folder_id)
        ? folderIdMap.get(row.parent_folder_id)
        : null;
      const created = await createMediaFolder(
        { name: row.name, slug: row.slug, description: row.description, parent_folder_id: parentId, folder_path: row.folder_path },
        tenantId
      );
      folderIdMap.set(row.id, created.id);
      stats.media_folders++;
    }

    // 2. Media: create record using url/relative_path from payload (already set by frontend after Blob upload)
    for (const row of data.media || []) {
      const newFolderId = row.folder_id != null && folderIdMap.has(row.folder_id) ? folderIdMap.get(row.folder_id) : null;
      const url = row.url || '';
      const relative_path = row.relative_path || url || '';

      const created = await createMediaFile(
        {
          filename: row.filename,
          original_filename: row.original_filename,
          slug: row.slug ? `${row.slug}-${Date.now()}` : `media-${Date.now()}`,
          alt_text: row.alt_text,
          title: row.title,
          description: row.description,
          url,
          relative_path,
          mime_type: row.mime_type,
          file_extension: row.file_extension,
          file_size: row.file_size,
          width: row.width,
          height: row.height,
          duration: row.duration,
          folder_id: newFolderId,
          media_type: row.media_type,
          metadata: row.metadata,
        },
        tenantId
      );
      mediaIdMap.set(row.id, created.id);
      stats.media++;
    }

    // 3. Categories (tenant-specific)
    for (const row of data.categories || []) {
      try {
        const existing = await query(`SELECT id FROM categories WHERE tenant_id = $1 AND slug = $2`, [tenantId, row.slug]);
        if (existing.rows.length > 0) {
          categoryIdMap.set(row.id, existing.rows[0].id);
          continue;
        }
        const parentId = row.parent_id != null && categoryIdMap.has(row.parent_id) ? categoryIdMap.get(row.parent_id) : null;
        const insert = await query(
          `INSERT INTO categories (name, slug, description, parent_id, tenant_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
          [row.name, row.slug, row.description || null, parentId, tenantId]
        );
        const newId = insert.rows[0].id;
        categoryIdMap.set(row.id, newId);
        stats.categories++;
      } catch (e) {
        errors.push(`Category ${row.slug}: ${e.message}`);
      }
    }

    // 4. Tags (tenant-specific)
    for (const row of data.tags || []) {
      try {
        const existing = await query(`SELECT id FROM tags WHERE (tenant_id = $1 OR tenant_id IS NULL) AND slug = $2`, [tenantId, row.slug]);
        if (existing.rows.length > 0) {
          tagIdMap.set(row.id, existing.rows[0].id);
          continue;
        }
        const tagInsert = await query(
          `INSERT INTO tags (name, slug, description, meta_title, meta_description, tenant_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
          [row.name, row.slug, row.description || null, row.meta_title || null, row.meta_description || null, tenantId]
        );
        if (tagInsert.rows[0]) {
          tagIdMap.set(row.id, tagInsert.rows[0].id);
          stats.tags++;
        }
      } catch (e) {
        errors.push(`Tag ${row.slug}: ${e.message}`);
      }
    }

    // 5. Pages
    for (const row of data.pages || []) {
      try {
        const slugExists = await query(`SELECT id FROM pages WHERE tenant_id = $1 AND slug = $2`, [tenantId, row.slug]);
        if (slugExists.rows.length > 0) {
          pageIdMap.set(row.id, slugExists.rows[0].id);
          continue;
        }
        const insert = await query(
          `INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status, page_type, tenant_id,
            campaign_source, conversion_goal, legal_type, last_reviewed_date, version, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
          [
            row.page_name,
            row.slug,
            row.meta_title || null,
            row.meta_description || null,
            row.seo_index !== false,
            row.status || 'draft',
            row.page_type || 'page',
            tenantId,
            row.campaign_source || null,
            row.conversion_goal || null,
            row.legal_type || null,
            row.last_reviewed_date || null,
            row.version || null,
            row.created_at || new Date(),
            row.updated_at || new Date(),
          ]
        );
        const newId = insert.rows[0].id;
        pageIdMap.set(row.id, newId);
        stats.pages++;
      } catch (e) {
        errors.push(`Page ${row.slug}: ${e.message}`);
      }
    }

    // 6. Page layouts (remap page_id and media IDs in layout_json)
    for (const row of data.page_layouts || []) {
      const newPageId = pageIdMap.get(row.page_id);
      if (newPageId == null) continue;
      const layoutJson = replaceMediaIdsInValue(row.layout_json, mediaIdMap);
      try {
        await query(
          `INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
           VALUES ($1, $2, $3::jsonb, $4, NOW())
           ON CONFLICT (page_id, language) DO UPDATE SET layout_json = EXCLUDED.layout_json, version = EXCLUDED.version, updated_at = NOW()`,
          [newPageId, row.language || 'default', JSON.stringify(layoutJson), row.version || 1]
        );
        stats.page_layouts++;
      } catch (e) {
        errors.push(`Page layout page_id=${row.page_id}: ${e.message}`);
      }
    }

    // 7. Page versions
    for (const row of data.page_versions || []) {
      const newPageId = pageIdMap.get(row.page_id);
      if (newPageId == null) continue;
      const layoutJson = row.layout_json != null ? replaceMediaIdsInValue(row.layout_json, mediaIdMap) : null;
      try {
        await query(
          `INSERT INTO page_versions (page_id, tenant_id, version_number, page_name, slug, meta_title, meta_description, seo_index, status, page_type, layout_json, comment, created_at, created_by)
           SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14
           WHERE NOT EXISTS (SELECT 1 FROM page_versions WHERE page_id = $1 AND tenant_id = $2 AND version_number = $3)`,
          [
            newPageId,
            tenantId,
            row.version_number,
            row.page_name,
            row.slug,
            row.meta_title,
            row.meta_description,
            row.seo_index,
            row.status,
            row.page_type,
            layoutJson ? JSON.stringify(layoutJson) : null,
            row.comment || null,
            row.created_at || new Date(),
            row.created_by || null,
          ]
        );
        stats.page_versions++;
      } catch (e) {
        errors.push(`Page version page_id=${row.page_id}: ${e.message}`);
      }
    }

    // 8. Page components (if table has tenant/page refs)
    const pageComponentsTable = await query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_components'`
    ).then((r) => r.rows.length > 0);
    if (pageComponentsTable && Array.isArray(data.page_components) && data.page_components.length > 0) {
      for (const row of data.page_components) {
        const newPageId = pageIdMap.get(row.page_id);
        if (newPageId == null) continue;
        try {
          await query(
            `INSERT INTO page_components (page_id, component_key, props, sort_order, updated_at)
             VALUES ($1, $2, $3::jsonb, $4, NOW())`,
            [newPageId, row.component_key, JSON.stringify(replaceMediaIdsInValue(row.props || {}, mediaIdMap)), row.sort_order ?? 0]
          );
          stats.page_components++;
        } catch (e) {
          errors.push(`Page component page_id=${row.page_id}: ${e.message}`);
        }
      }
    }

    // 9. Posts (remap featured_image_id, content media refs)
    for (const row of data.posts || []) {
      try {
        const slugExists = await query(`SELECT id FROM posts WHERE tenant_id = $1 AND slug = $2`, [tenantId, row.slug]);
        let newPostId;
        if (slugExists.rows.length > 0) {
          newPostId = slugExists.rows[0].id;
          postIdMap.set(row.id, newPostId);
          continue;
        }
        const newFeaturedId = row.featured_image_id != null && mediaIdMap.has(row.featured_image_id) ? mediaIdMap.get(row.featured_image_id) : null;
        const content = replaceMediaIdsInValue(row.content, mediaIdMap);
        const insert = await query(
          `INSERT INTO posts (title, slug, content, excerpt, status, post_type, author_id, parent_id, menu_order, featured_image_id,
            meta_title, meta_description, meta_keywords, canonical_url, robots_meta, og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
            view_count, last_viewed_at, published_at, tenant_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27) RETURNING id`,
          [
            row.title,
            row.slug,
            content,
            row.excerpt || null,
            row.status || 'draft',
            row.post_type || 'post',
            row.author_id || null,
            row.parent_id || null,
            row.menu_order ?? 0,
            newFeaturedId,
            row.meta_title || null,
            row.meta_description || null,
            row.meta_keywords || null,
            row.canonical_url || null,
            row.robots_meta || 'index,follow',
            row.og_title || null,
            row.og_description || null,
            row.og_image || null,
            row.twitter_title || null,
            row.twitter_description || null,
            row.twitter_image || null,
            row.view_count ?? 0,
            row.last_viewed_at || null,
            row.published_at || null,
            tenantId,
            row.created_at || new Date(),
            row.updated_at || new Date(),
          ]
        );
        newPostId = insert.rows[0].id;
        postIdMap.set(row.id, newPostId);
        stats.posts++;
      } catch (e) {
        errors.push(`Post ${row.slug}: ${e.message}`);
      }
    }

    // 10. Post categories and tags
    for (const row of data.post_categories || []) {
      const newPostId = postIdMap.get(row.post_id);
      const newCatId = categoryIdMap.get(row.category_id);
      if (newPostId == null || newCatId == null) continue;
      try {
        await query(`INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [newPostId, newCatId]);
        stats.post_categories++;
      } catch (e) {
        // ignore duplicate
      }
    }
    for (const row of data.post_tags || []) {
      const newPostId = postIdMap.get(row.post_id);
      const newTagId = tagIdMap.get(row.tag_id);
      if (newPostId == null || newTagId == null) continue;
      try {
        await query(`INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [newPostId, newTagId]);
        stats.post_tags++;
      } catch (e) {
        // ignore duplicate
      }
    }
  } catch (e) {
    errors.push(e.message || String(e));
    console.error('[testing] tenantImportExport import error:', e);
  }

  return {
    success: errors.length === 0,
    stats,
    errors,
  };
}
