import { query } from '../connection.js';

// Page Layout Helpers
export async function getLayoutBySlug(slug, language = 'default') {
  try {
    const pageRes = await query(`SELECT id FROM pages WHERE slug = $1`, [slug]);
    if (pageRes.rows.length === 0) return null;
    const pageId = pageRes.rows[0].id;
    const layoutRes = await query(`SELECT layout_json, version, updated_at FROM page_layouts WHERE page_id = $1 AND language = $2`, [pageId, language]);
    return layoutRes.rows[0] || { layout_json: { components: [] }, version: 1 };
  } catch (error) {
    console.error('Error fetching layout by slug:', error);
    throw error;
  }
}

export async function upsertLayoutBySlug(slug, layoutJson, language = 'default') {
  try {
    const pageRes = await query(`SELECT id FROM pages WHERE slug = $1`, [slug]);
    if (pageRes.rows.length === 0) {
      throw new Error('Page not found for slug: ' + slug);
    }
    const pageId = pageRes.rows[0].id;
    const result = await query(`
      INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
      VALUES ($1, $2, $3, 1, NOW())
      ON CONFLICT (page_id, language)
      DO UPDATE SET layout_json = EXCLUDED.layout_json, version = page_layouts.version + 1, updated_at = NOW()
      RETURNING layout_json, version
    `, [pageId, language, layoutJson]);
    return result.rows[0];
  } catch (error) {
    console.error('Error upserting layout by slug:', error);
    throw error;
  }
}

