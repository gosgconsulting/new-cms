import express from 'express';
import {
  query,
  getPageWithLayout,
  getSiteSchema,
  getSiteSettingByKey,
  getsitesettingsbytenant,
  getThemeSettings,
  getBrandingSettings,
  setPostCategories,
  setPostTags
} from '../../sparti-cms/db/index.js';

// Lazy-load Sequelize and models inside handlers to avoid boot-time crashes if DATABASE_URL is missing
const loadSequelizeModels = async () => {
  const modelsModule = await import('../../sparti-cms/db/sequelize/models/index.js');
  const sequelizeModule = await import('../../sparti-cms/db/sequelize/models/index.js');
  const sequelizeInstance = (await import('../../sparti-cms/db/sequelize/models/index.js')).sequelize;
  const { Op } = await import('sequelize');
  return {
    models: modelsModule.default,
    sequelize: sequelizeInstance,
    Op
  };
};

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
 * GET /api/v1/me
 * Return current tenant and current user. req.tenantId and req.user are set by authenticateTenantApiKey.
 */
router.get('/me', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(401).json(
        errorResponse(new Error('API key or tenant ID required'), 'MISSING_AUTH', 401)
      );
    }

    const tenantResult = await query(
      `SELECT id, name, slug FROM tenants WHERE id = $1 LIMIT 1`,
      [tenantId]
    );
    const tenantRow = tenantResult.rows[0];
    const data = {
      tenant_id: tenantId,
      tenant: tenantRow
        ? { id: tenantRow.id, name: tenantRow.name, slug: tenantRow.slug }
        : null
    };
    if (req.user) {
      data.user = req.user;
    }

    res.json(successResponse(data, tenantId));
  } catch (error) {
    console.error('[testing] Error in GET /me:', error);
    res.status(500).json(errorResponse(error, 'ME_ERROR'));
  }
});

/**
 * GET /api/v1/pages
 * Get all pages with optional filtering
 */
router.get('/pages', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { sequelize } = await loadSequelizeModels();
    const { status, page_type, limit, offset } = req.query;
    
    // Build query with Sequelize
    const queryOptions = {
      replacements: { tenantId },
      type: sequelize.QueryTypes.SELECT
    };
    
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
      WHERE tenant_id = :tenantId
    `;
    
    if (status) {
      queryText += ` AND status = :status`;
      queryOptions.replacements.status = status;
    }
    
    if (page_type) {
      queryText += ` AND page_type = :page_type`;
      queryOptions.replacements.page_type = page_type;
    }
    
    queryText += ` ORDER BY created_at DESC`;
    
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    queryText += ` LIMIT :limit OFFSET :offset`;
    queryOptions.replacements.limit = limitNum;
    queryOptions.replacements.offset = offsetNum;
    
    const result = await sequelize.query(queryText, queryOptions);
    
    res.json(successResponse(result, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching pages:', error);
    res.status(500).json(errorResponse(error, 'FETCH_PAGES_ERROR'));
  }
});

/**
 * GET /api/v1/pages/:slug
 * Get single page by slug
 * Supports language parameter: ?language=en (falls back to 'default' if not provided or not found)
 */
router.get('/pages/:slug', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { sequelize } = await loadSequelizeModels();
    const { language } = req.query;
    let slug = req.params.slug;
    
    // Ensure slug starts with /
    if (!slug.startsWith('/')) {
      slug = '/' + slug;
    }
    
    // First, get the page by slug using Sequelize
    const pageResult = await sequelize.query(`
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
        updated_at
      FROM pages
      WHERE slug = :slug AND tenant_id = :tenantId
      LIMIT 1
    `, {
      replacements: { slug, tenantId },
      type: sequelize.QueryTypes.SELECT
    });
    
    if (pageResult.length === 0) {
      return res.status(404).json(errorResponse('Page not found', 'PAGE_NOT_FOUND', 404));
    }
    
    const page = pageResult[0];
    const pageId = page.id;
    
    // Get layout for requested language, fallback to 'default' if not found
    const requestedLanguage = language || 'default';
    let layoutResult = await sequelize.query(`
      SELECT layout_json, version, updated_at, language
      FROM page_layouts
      WHERE page_id = :pageId AND language = :language
      ORDER BY version DESC
      LIMIT 1
    `, {
      replacements: { pageId, language: requestedLanguage },
      type: sequelize.QueryTypes.SELECT
    });
    
    // If requested language not found and it's not 'default', fallback to 'default'
    if (layoutResult.length === 0 && requestedLanguage !== 'default') {
      console.log(`[testing] Layout for language '${requestedLanguage}' not found, falling back to 'default'`);
      layoutResult = await sequelize.query(`
        SELECT layout_json, version, updated_at, language
        FROM page_layouts
        WHERE page_id = :pageId AND language = 'default'
        ORDER BY version DESC
        LIMIT 1
      `, {
        replacements: { pageId },
        type: sequelize.QueryTypes.SELECT
      });
    }
    
    // Attach layout to page
    if (layoutResult.length > 0) {
      page.layout = layoutResult[0].layout_json;
      page.layout_language = layoutResult[0].language;
    } else {
      // No layout found at all
      page.layout = { components: [] };
      page.layout_language = 'default';
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
 * GET /api/v1/global-schema
 * Get both header and footer schemas
 */
router.get('/global-schema', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { language } = req.query;
    
    // Fetch both header and footer schemas
    const [headerSchema, footerSchema] = await Promise.all([
      getSiteSchema('header', tenantId, language),
      getSiteSchema('footer', tenantId, language)
    ]);
    
    const globalSchema = {
      header: headerSchema || null,
      footer: footerSchema || null
    };
    
    res.json(successResponse(globalSchema, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching global schema:', error);
    res.status(500).json(errorResponse(error, 'FETCH_GLOBAL_SCHEMA_ERROR'));
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
    const { sequelize, models, Op } = await loadSequelizeModels();
    const { Post, Category, Tag } = models;
    const { status, limit, offset } = req.query;
    
    // Build where clause
    const whereClause = {};
    
    // Filter by tenant_id if provided
    if (tenantId) {
      whereClause[Op.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }
    
    // Filter by status (default to published)
    whereClause.status = status || 'published';
    
    // Build query options
    const queryOptions = {
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['created_at', 'DESC']],
      attributes: [
        'id',
        'title',
        'slug',
        'excerpt',
        'content',
        'status',
        'post_type',
        'created_at',
        'updated_at',
        'published_at',
        'view_count'
      ]
    };
    
    // Add pagination
    if (limit) {
      queryOptions.limit = parseInt(limit, 10) || 20;
      if (offset) {
        queryOptions.offset = parseInt(offset, 10) || 0;
      }
    } else {
      queryOptions.limit = 20; // Default limit
    }
    
    // Fetch posts using Sequelize
    const posts = await Post.findAll(queryOptions);
    
    // Transform posts to include terms array for backward compatibility
    const postsWithTerms = posts.map(post => {
      const postJson = post.toJSON();
      
      // Build terms array from categories and tags
      const terms = [
        ...(postJson.categories || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          taxonomy: 'category'
        })),
        ...(postJson.tags || []).map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          taxonomy: 'post_tag'
        }))
      ];
      
      return {
        ...postJson,
        terms: terms
      };
    });
    
    res.json(successResponse(postsWithTerms, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching blog posts:', error);
    res.status(500).json(errorResponse(error, 'FETCH_POSTS_ERROR'));
  }
});

/**
 * GET /api/v1/blog/posts/id/:id
 * Get single blog post by numeric id (must be before :slug route)
 */
router.get('/blog/posts/id/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json(errorResponse('Invalid post id', 'INVALID_ID', 400));
    }
    const { models, Op } = await loadSequelizeModels();
    const { Post, Category, Tag } = models;

    const whereClause = { id };
    if (tenantId) {
      whereClause[Op.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }

    const post = await Post.findOne({
      where: whereClause,
      include: [
        { model: Category, as: 'categories', through: { attributes: [] }, attributes: ['id', 'name', 'slug'] },
        { model: Tag, as: 'tags', through: { attributes: [] }, attributes: ['id', 'name', 'slug'] }
      ],
      attributes: [
        'id', 'title', 'slug', 'excerpt', 'content', 'status', 'post_type',
        'created_at', 'updated_at', 'published_at', 'view_count', 'meta_title', 'meta_description',
        'featured_image_id', 'tenant_id', 'author_id'
      ]
    });

    if (!post) {
      return res.status(404).json(errorResponse('Post not found', 'POST_NOT_FOUND', 404));
    }

    const postJson = post.toJSON();
    const terms = [
      ...(postJson.categories || []).map(cat => ({ id: cat.id, name: cat.name, slug: cat.slug, taxonomy: 'category' })),
      ...(postJson.tags || []).map(tag => ({ id: tag.id, name: tag.name, slug: tag.slug, taxonomy: 'post_tag' }))
    ];
    res.json(successResponse({ ...postJson, terms }, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching blog post by id:', error);
    res.status(500).json(errorResponse(error, 'FETCH_POST_ERROR'));
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
    const { models, Op } = await loadSequelizeModels();
    const { Post, Category, Tag } = models;
    
    // Build where clause
    const whereClause = { slug };
    
    // Filter by tenant_id if provided
    if (tenantId) {
      whereClause[Op.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }
    
    // Fetch post using Sequelize with associations
    const post = await Post.findOne({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug']
        }
      ],
      attributes: [
        'id',
        'title',
        'slug',
        'excerpt',
        'content',
        'status',
        'post_type',
        'created_at',
        'updated_at',
        'published_at',
        'view_count'
      ]
    });
    
    if (!post) {
      return res.status(404).json(errorResponse('Post not found', 'POST_NOT_FOUND', 404));
    }
    
    const postJson = post.toJSON();
    
    // Build terms array from categories and tags for backward compatibility
    const terms = [
      ...(postJson.categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        taxonomy: 'category'
      })),
      ...(postJson.tags || []).map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        taxonomy: 'post_tag'
      }))
    ];
    
    const postWithTerms = {
      ...postJson,
      terms: terms
    };
    
    res.json(successResponse(postWithTerms, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching blog post:', error);
    res.status(500).json(errorResponse(error, 'FETCH_POST_ERROR'));
  }
});

/**
 * POST /api/v1/blog/posts
 * Create a new blog post
 */
router.post('/blog/posts', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(400).json(errorResponse('Tenant ID is required', 'TENANT_ID_REQUIRED', 400));
    }

    const {
      title,
      slug,
      content,
      excerpt,
      status,
      author_id,
      published_at,
      categories = [],
      tags = [],
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      twitter_title,
      twitter_description,
      featured_image_id
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json(errorResponse('Title and slug are required', 'VALIDATION_ERROR', 400));
    }

    const { models } = await loadSequelizeModels();
    const { Post, Category, Tag } = models;

    const post = await Post.create({
      title,
      slug,
      content: content || '',
      excerpt: excerpt || '',
      status: status || 'draft',
      post_type: 'post',
      author_id: author_id || 1,
      meta_title: meta_title || '',
      meta_description: meta_description || '',
      meta_keywords: meta_keywords || '',
      canonical_url: '',
      og_title: og_title || '',
      og_description: og_description || '',
      twitter_title: twitter_title || '',
      twitter_description: twitter_description || '',
      published_at: published_at || null,
      tenant_id: tenantId,
      featured_image_id: featured_image_id || null
    });

    const categoryIds = Array.isArray(categories) ? categories : [];
    const tagIds = Array.isArray(tags) ? tags : [];
    try {
      await setPostCategories(post.id, categoryIds);
    } catch (err) {
      console.log('[testing] Note setting post categories:', err.message);
    }
    try {
      await setPostTags(post.id, tagIds);
    } catch (err) {
      console.log('[testing] Note setting post tags:', err.message);
    }

    const newPost = await Post.findByPk(post.id, {
      include: [
        { model: Category, as: 'categories', through: { attributes: [] } },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });
    const postData = newPost ? newPost.toJSON() : post.toJSON();
    const terms = [
      ...(postData.categories || []).map(cat => ({ id: cat.id, name: cat.name, slug: cat.slug, taxonomy: 'category' })),
      ...(postData.tags || []).map(tag => ({ id: tag.id, name: tag.name, slug: tag.slug, taxonomy: 'post_tag' }))
    ];
    res.status(201).json(successResponse({ ...postData, terms }, tenantId));
  } catch (error) {
    console.error('[testing] Error creating blog post:', error);
    if (error.code === '23505' || error.message?.includes('unique')) {
      return res.status(409).json(errorResponse('A post with this slug already exists', 'DUPLICATE_SLUG', 409));
    }
    res.status(500).json(errorResponse(error, 'CREATE_POST_ERROR'));
  }
});

/**
 * PUT /api/v1/blog/posts/:id
 * Update an existing blog post
 */
router.put('/blog/posts/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(400).json(errorResponse('Tenant ID is required', 'TENANT_ID_REQUIRED', 400));
    }

    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json(errorResponse('Invalid post id', 'INVALID_ID', 400));
    }

    const {
      title,
      slug,
      content,
      excerpt,
      status,
      author_id,
      published_at,
      categories = [],
      tags = [],
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      twitter_title,
      twitter_description,
      featured_image_id
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json(errorResponse('Title and slug are required', 'VALIDATION_ERROR', 400));
    }

    const { models, Op } = await loadSequelizeModels();
    const { Post, Category, Tag } = models;

    const post = await Post.findOne({
      where: {
        id,
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      }
    });

    if (!post) {
      return res.status(404).json(errorResponse('Post not found', 'POST_NOT_FOUND', 404));
    }

    await post.update({
      title,
      slug,
      content: content || '',
      excerpt: excerpt || '',
      status: status || 'draft',
      author_id: author_id || post.author_id,
      meta_title: meta_title || '',
      meta_description: meta_description || '',
      meta_keywords: meta_keywords || '',
      og_title: og_title || '',
      og_description: og_description || '',
      twitter_title: twitter_title || '',
      twitter_description: twitter_description || '',
      featured_image_id: featured_image_id !== undefined ? featured_image_id : post.featured_image_id,
      published_at: published_at || null
    });

    const categoryIds = Array.isArray(categories) ? categories : [];
    const tagIds = Array.isArray(tags) ? tags : [];
    try {
      await setPostCategories(id, categoryIds);
    } catch (err) {
      console.log('[testing] Note setting post categories:', err.message);
    }
    try {
      await setPostTags(id, tagIds);
    } catch (err) {
      console.log('[testing] Note setting post tags:', err.message);
    }

    const updatedPost = await Post.findByPk(id, {
      include: [
        { model: Category, as: 'categories', through: { attributes: [] } },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });
    const postData = updatedPost ? updatedPost.toJSON() : post.toJSON();
    const terms = [
      ...(postData.categories || []).map(cat => ({ id: cat.id, name: cat.name, slug: cat.slug, taxonomy: 'category' })),
      ...(postData.tags || []).map(tag => ({ id: tag.id, name: tag.name, slug: tag.slug, taxonomy: 'post_tag' }))
    ];
    res.json(successResponse({ ...postData, terms }, tenantId));
  } catch (error) {
    console.error('[testing] Error updating blog post:', error);
    if (error.code === '23505' || error.message?.includes('unique')) {
      return res.status(409).json(errorResponse('A post with this slug already exists', 'DUPLICATE_SLUG', 409));
    }
    res.status(500).json(errorResponse(error, 'UPDATE_POST_ERROR'));
  }
});

/**
 * DELETE /api/v1/blog/posts/:id
 * Delete a blog post
 */
router.delete('/blog/posts/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(400).json(errorResponse('Tenant ID is required', 'TENANT_ID_REQUIRED', 400));
    }

    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json(errorResponse('Invalid post id', 'INVALID_ID', 400));
    }

    const { models, Op } = await loadSequelizeModels();
    const { Post } = models;

    const post = await Post.findOne({
      where: {
        id,
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      }
    });

    if (!post) {
      return res.status(404).json(errorResponse('Post not found', 'POST_NOT_FOUND', 404));
    }

    await post.destroy();
    res.json(successResponse({ message: 'Post deleted successfully' }, tenantId));
  } catch (error) {
    console.error('[testing] Error deleting blog post:', error);
    res.status(500).json(errorResponse(error, 'DELETE_POST_ERROR'));
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

/**
 * GET /api/v1/theme/:themeSlug/settings
 * Get all public settings for a theme (filtered by tenant from subdomain/header)
 */
router.get('/theme/:themeSlug/settings', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { themeSlug } = req.params;
    
    if (!tenantId) {
      return res.status(400).json(errorResponse('Tenant ID is required', 'TENANT_ID_REQUIRED', 400));
    }
    
    const settings = await getThemeSettings(tenantId, themeSlug);
    
    // Filter only public settings
    const publicSettings = {};
    Object.keys(settings).forEach(category => {
      publicSettings[category] = {};
      // Note: Individual settings' is_public flag would need to be checked
      // For now, we return all settings from getThemeSettings
      // In production, you might want to filter by is_public per setting
      Object.assign(publicSettings[category], settings[category]);
    });
    
    res.json(successResponse(publicSettings, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching theme settings:', error);
    res.status(500).json(errorResponse(error, 'FETCH_THEME_SETTINGS_ERROR'));
  }
});

/**
 * GET /api/v1/theme/:themeSlug/branding
 * Get public branding settings for a theme
 */
router.get('/theme/:themeSlug/branding', async (req, res) => {
  try {
    // Get tenant ID from middleware, query param, or default to tenant-gosg
    const tenantId = req.tenantId || req.query.tenantId || 'tenant-gosg';
    const { themeSlug } = req.params;
    
    console.log(`[testing] Fetching branding for theme: ${themeSlug}, tenant: ${tenantId}`);
    console.log(`[testing] Request headers:`, {
      'x-tenant-id': req.headers['x-tenant-id'],
      'x-api-key': req.headers['x-api-key'] ? '***' : undefined,
      query: req.query
    });
    
    // themeSlug can be used directly as themeId in getBrandingSettings
    // The function accepts either theme ID or theme slug
    const settings = await getBrandingSettings(tenantId, themeSlug);
    
    console.log(`[testing] Branding settings retrieved:`, {
      brandingKeys: Object.keys(settings.branding || {}),
      seoKeys: Object.keys(settings.seo || {}),
      localizationKeys: Object.keys(settings.localization || {}),
      themeKeys: Object.keys(settings.theme || {})
    });
    
    // Return branding settings in the expected format
    res.json(successResponse(settings.branding || {}, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching theme branding:', error);
    console.error('[testing] Error stack:', error.stack);
    res.status(500).json(errorResponse(error, 'FETCH_THEME_BRANDING_ERROR'));
  }
});

/**
 * GET /api/v1/theme/:themeSlug/styles
 * Get public style settings for a theme
 */
router.get('/theme/:themeSlug/styles', async (req, res) => {
  try {
    // Get tenant ID from middleware, query param, or default to tenant-gosg
    const tenantId = req.tenantId || req.query.tenantId || 'tenant-gosg';
    const { themeSlug } = req.params;
    
    console.log(`[testing] Fetching styles for theme: ${themeSlug}, tenant: ${tenantId}`);
    
    const setting = await getSiteSettingByKey('theme_styles', tenantId, themeSlug);
    
    if (!setting) {
      console.log(`[testing] No styles found for theme: ${themeSlug}, tenant: ${tenantId}`);
      return res.json(successResponse({}, tenantId));
    }
    
    // Check if setting is public (if is_public is false, still return it for theme-specific styles)
    // Theme styles should be accessible if they exist
    let styles = {};
    if (setting.setting_value) {
      try {
        styles = typeof setting.setting_value === 'string' 
          ? JSON.parse(setting.setting_value) 
          : setting.setting_value;
        console.log(`[testing] Styles retrieved for theme: ${themeSlug}`, Object.keys(styles));
      } catch (e) {
        console.error('[testing] Error parsing theme styles:', e);
      }
    }
    
    res.json(successResponse(styles, tenantId));
  } catch (error) {
    console.error('[testing] Error fetching theme styles:', error);
    res.status(500).json(errorResponse(error, 'FETCH_THEME_STYLES_ERROR'));
  }
});

export default router;