import express from 'express';
import {
  query,
  getPageWithLayout,
  getSiteSchema,
  getSiteSettingByKey,
  getsitesettingsbytenant
} from './index.js';

const router = express.Router();

// Helper function to format success response
const successResponse = (data, tenantId) => {
  return {
    success: true,
    data,
    meta: {
      tenant_id: tenantId,
      timestamp: new Date().toISOString()
    }
  };
};

// Helper function to format error response
const errorResponse = (error, code, status = 500) => {
  return {
    success: false,
    error: error.message || error,
    code: code || 'ERROR'
  };
};

/**
 * GET /api/v1/pages
 * Get all pages with optional filtering
 */
router.get('/pages', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status, page_type, limit, offset } = req.query;
    
    // Build query with filters
    let queryText = `
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        created_at,
        updated_at,
        campaign_source,
        conversion_goal,
        legal_type,
        last_reviewed_date,
        version
      FROM pages
      WHERE tenant_id = $1
    `;
    
    const params = [tenantId];
    let paramIndex = 2;
    
    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (page_type) {
      queryText += ` AND page_type = $${paramIndex}`;
      params.push(page_type);
      paramIndex++;
    }
    
    queryText += ` ORDER BY created_at DESC`;
    
    if (limit) {
      const limitNum = parseInt(limit, 10) || 20;
      queryText += ` LIMIT $${paramIndex}`;
      params.push(limitNum);
      paramIndex++;
      
      if (offset) {
        const offsetNum = parseInt(offset, 10) || 0;
        queryText += ` OFFSET $${paramIndex}`;
        params.push(offsetNum);
      }
    } else {
      queryText += ` LIMIT 100`; // Default limit
    }
    
    const result = await query(queryText, params);
    
    res.json(successResponse(result.rows, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching pages:', error);
    res.status(500).json(errorResponse(error, 'FETCH_PAGES_ERROR'));
  }
});

/**
 * GET /api/v1/pages/:slug
 * Get single page by slug
 */
router.get('/pages/:slug', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    let slug = req.params.slug;
    
    // Ensure slug starts with /
    if (!slug.startsWith('/')) {
      slug = '/' + slug;
    }
    
    // First, get the page by slug
    const pageResult = await query(`
      SELECT id
      FROM pages
      WHERE slug = $1 AND tenant_id = $2
      LIMIT 1
    `, [slug, tenantId]);
    
    if (pageResult.rows.length === 0) {
      return res.status(404).json(errorResponse('Page not found', 'PAGE_NOT_FOUND', 404));
    }
    
    const pageId = pageResult.rows[0].id;
    
    // Get page with layout
    const page = await getPageWithLayout(pageId, tenantId);
    
    if (!page) {
      return res.status(404).json(errorResponse('Page not found', 'PAGE_NOT_FOUND', 404));
    }
    
    res.json(successResponse(page, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching page:', error);
    res.status(500).json(errorResponse(error, 'FETCH_PAGE_ERROR'));
  }
});

/**
 * GET /api/v1/header
 * Get header schema
 */
router.get('/header', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const schema = await getSiteSchema('header', tenantId);
    
    if (!schema) {
      return res.status(404).json(errorResponse('Header schema not found', 'HEADER_NOT_FOUND', 404));
    }
    
    res.json(successResponse(schema, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching header schema:', error);
    res.status(500).json(errorResponse(error, 'FETCH_HEADER_ERROR'));
  }
});

/**
 * GET /api/v1/footer
 * Get footer schema
 */
router.get('/footer', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const schema = await getSiteSchema('footer', tenantId);
    
    if (!schema) {
      return res.status(404).json(errorResponse('Footer schema not found', 'FOOTER_NOT_FOUND', 404));
    }
    
    res.json(successResponse(schema, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching footer schema:', error);
    res.status(500).json(errorResponse(error, 'FETCH_FOOTER_ERROR'));
  }
});

/**
 * GET /api/v1/blog/posts
 * Get all blog posts
 * Note: If posts table has tenant_id column, it will be filtered by tenant.
 * Otherwise, all published posts will be returned (tenant isolation not enforced).
 */
router.get('/blog/posts', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status, limit, offset } = req.query;
    
    // First, check if posts table has tenant_id column
    let hasTenantId = false;
    try {
      const columnCheck = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'tenant_id'
      `);
      hasTenantId = columnCheck.rows.length > 0;
    } catch (err) {
      console.log('[testing] Could not check for tenant_id column in posts table');
    }
    
    // Build query
    let queryText = `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.content,
        p.featured_image,
        p.status,
        p.post_type,
        p.created_at,
        p.updated_at,
        p.published_at,
        p.view_count,
        COALESCE(
          (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', tr.id, 'name', tr.name, 'slug', tr.slug, 'taxonomy', tr.taxonomy))
          FROM (
            SELECT c.id, c.name, c.slug, 'category'::text AS taxonomy
            FROM post_categories pc
            JOIN categories c ON pc.category_id = c.id
            WHERE pc.post_id = p.id
            UNION ALL
            SELECT t.id, t.name, t.slug, 'post_tag'::text AS taxonomy
            FROM post_tags pt
            JOIN tags t ON pt.tag_id = t.id
            WHERE pt.post_id = p.id
          ) AS tr),
          '[]'::json
        ) as terms
      FROM posts p
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Add tenant_id filter if column exists
    if (hasTenantId) {
      queryText += ` AND p.tenant_id = $${paramIndex}`;
      params.push(tenantId);
      paramIndex++;
    }
    
    if (status) {
      queryText += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    } else {
      // Default to published posts
      queryText += ` AND p.status = $${paramIndex}`;
      params.push('published');
      paramIndex++;
    }
    
    queryText += ` ORDER BY p.created_at DESC`;
    
    if (limit) {
      const limitNum = parseInt(limit, 10) || 20;
      queryText += ` LIMIT $${paramIndex}`;
      params.push(limitNum);
      paramIndex++;
      
      if (offset) {
        const offsetNum = parseInt(offset, 10) || 0;
        queryText += ` OFFSET $${paramIndex}`;
        params.push(offsetNum);
      }
    } else {
      queryText += ` LIMIT 20`; // Default limit
    }
    
    const result = await query(queryText, params);
    
    // Format the response
    const posts = result.rows.map(post => ({
      ...post,
      terms: typeof post.terms === 'string' ? JSON.parse(post.terms) : post.terms
    }));
    
    res.json(successResponse(posts, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching blog posts:', error);
    res.status(500).json(errorResponse(error, 'FETCH_POSTS_ERROR'));
  }
});

/**
 * GET /api/v1/blog/posts/:slug
 * Get single blog post by slug
 */
router.get('/blog/posts/:slug', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const slug = req.params.slug;
    
    // Query post
    const postQuery = `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.content,
        p.featured_image,
        p.status,
        p.post_type,
        p.created_at,
        p.updated_at,
        p.published_at,
        p.view_count
      FROM posts p
      WHERE p.slug = $1
      LIMIT 1
    `;
    
    const postResult = await query(postQuery, [slug]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json(errorResponse('Post not found', 'POST_NOT_FOUND', 404));
    }
    
    const post = postResult.rows[0];
    
    // Get terms (categories and tags) from post_categories / post_tags
    const termsQuery = `
      SELECT c.id, c.name, c.slug, 'category'::text AS taxonomy
      FROM post_categories pc
      JOIN categories c ON pc.category_id = c.id
      WHERE pc.post_id = $1
      UNION ALL
      SELECT t.id, t.name, t.slug, 'post_tag'::text AS taxonomy
      FROM post_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.post_id = $1
    `;
    
    const termsResult = await query(termsQuery, [post.id]);
    post.terms = termsResult.rows;
    
    res.json(successResponse(post, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching blog post:', error);
    res.status(500).json(errorResponse(error, 'FETCH_POST_ERROR'));
  }
});

/**
 * GET /api/v1/settings
 * Get all public settings
 */
router.get('/settings', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const settings = await getsitesettingsbytenant(tenantId);
    
    // Filter only public settings
    const publicSettings = settings
      .filter(setting => setting.is_public === true)
      .reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {});
    
    res.json(successResponse(publicSettings, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching settings:', error);
    res.status(500).json(errorResponse(error, 'FETCH_SETTINGS_ERROR'));
  }
});

/**
 * GET /api/v1/settings/:key
 * Get specific setting by key
 */
router.get('/settings/:key', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const key = req.params.key;
    
    const setting = await getSiteSettingByKey(key, tenantId);
    
    if (!setting) {
      return res.status(404).json(errorResponse('Setting not found', 'SETTING_NOT_FOUND', 404));
    }
    
    if (!setting.is_public) {
      return res.status(403).json(errorResponse('Setting is not public', 'SETTING_NOT_PUBLIC', 403));
    }
    
    res.json(successResponse({
      key: setting.setting_key,
      value: setting.setting_value,
      type: setting.setting_type,
      category: setting.setting_category
    }, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching setting:', error);
    res.status(500).json(errorResponse(error, 'FETCH_SETTING_ERROR'));
  }
});

export default router;

