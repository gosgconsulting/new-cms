import express from 'express';
import {
  query,
  getPageWithLayout,
  getSiteSchema,
  getSiteSettingByKey,
  getsitesettingsbytenant,
  getThemeSettings,
  getBrandingSettings
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