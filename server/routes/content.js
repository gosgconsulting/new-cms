import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { authenticateUser } from '../middleware/auth.js';
import { getDatabaseState } from '../utils/database.js';
import {
  getAllPagesWithTypes,
  updatePageSlug,
  validateSlug,
  updatePageName,
  toggleSEOIndex,
  getPageWithLayout,
  updatePageData,
  updatePageLayout,
  getLayoutBySlug,
  upsertLayoutBySlug,
  getTerms,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  bulkCreateTags,
  setPostCategories,
  setPostTags
} from '../../sparti-cms/db/index.js';
import { invalidateBySlug } from '../../sparti-cms/cache/index.js';

const router = express.Router();

// ===== PAGES ROUTES =====

// Get all pages
router.get('/pages/all', authenticateUser, async (req, res) => {
  try {
    console.log(`[testing] API: Fetching all pages with types for tenant: ${req.tenantId}`);
    
    // Filter pages by tenant
    const pages = await getAllPagesWithTypes(req.tenantId);
    
    res.json({ 
      success: true, 
      pages: pages,
      total: pages.length,
      tenantId: req.tenantId
    });
  } catch (error) {
    console.error('[testing] API: Error fetching pages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pages',
      message: error.message 
    });
  }
});

// Get individual page with layout
router.get('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId } = req.query;
    console.log(`[testing] API: Fetching page ${pageId} for tenant: ${tenantId || 'default'}`);
    
    const page = await getPageWithLayout(pageId, tenantId);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }
    
    res.json({
      success: true,
      page: page
    });
  } catch (error) {
    console.error('[testing] API: Error fetching page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch page',
      message: error.message
    });
  }
});

// Update page data
router.put('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { page_name, meta_title, meta_description, seo_index, tenantId } = req.body;
    console.log(`[testing] API: Updating page ${pageId} for tenant: ${tenantId}`);
    
    const success = await updatePageData(pageId, page_name, meta_title, meta_description, seo_index, tenantId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Page not found or update failed'
      });
    }
    
    res.json({
      success: true,
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('[testing] API: Error updating page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update page',
      message: error.message
    });
  }
});

// Update page layout
router.put('/pages/:pageId/layout', authenticateUser, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { layout_json, tenantId } = req.body;
    console.log(`[testing] API: Updating page layout ${pageId} for tenant: ${tenantId}`);
    
    // Validate tenant access: user can only update their own tenant unless they're a super admin
    if (!req.user.is_super_admin && tenantId !== req.user.tenant_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only update layouts for your own tenant'
      });
    }
    
    const success = await updatePageLayout(pageId, layout_json, tenantId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Page not found or layout update failed'
      });
    }
    
    res.json({
      success: true,
      message: 'Page layout updated successfully'
    });
  } catch (error) {
    console.error('[testing] API: Error updating page layout:', error);
    
    // Handle validation errors with 400 status
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update page layout',
      message: error.message
    });
  }
});

// Update page slug
router.post('/pages/update-slug', async (req, res) => {
  try {
    const { pageId, pageType, newSlug, oldSlug, tenantId } = req.body;
    console.log(`[testing] API: Updating slug for tenant: ${tenantId || 'default'}`);
    
    console.log('[testing] API: Updating page slug:', { pageId, pageType, newSlug, oldSlug });
    
    // Validate required fields
    if (!pageId || !pageType || !newSlug || !oldSlug) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'pageId, pageType, newSlug, and oldSlug are required'
      });
    }
    
    // Validate page type
    if (!['page', 'landing', 'legal'].includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page type',
        message: 'pageType must be one of: page, landing, legal'
      });
    }
    
    // Validate slug format
    try {
      const validatedSlug = validateSlug(newSlug);
      console.log('[testing] API: Slug validated:', validatedSlug);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid slug format',
        message: validationError.message
      });
    }
    
    // Prevent homepage slug changes
    if (oldSlug === '/' && newSlug !== '/') {
      return res.status(400).json({
        success: false,
        error: 'Cannot change homepage slug',
        message: 'The homepage slug cannot be modified'
      });
    }
    
    // Update the slug
    const updatedPage = await updatePageSlug(pageId, pageType, newSlug, oldSlug, tenantId);
    
    console.log('[testing] API: Page slug updated successfully:', updatedPage.id);
    
    res.json({
      success: true,
      message: 'Slug updated successfully',
      page: updatedPage,
      oldSlug: oldSlug,
      newSlug: newSlug
    });
    
  } catch (error) {
    console.error('[testing] API: Error updating page slug:', error);
    
    // Handle specific error cases
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Slug already exists',
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update slug',
      message: error.message
    });
  }
});

// Update page name
router.post('/pages/update-name', async (req, res) => {
  try {
    const { pageId, pageType, newName, tenantId } = req.body;
    console.log(`[testing] API: Updating page name for tenant: ${tenantId || 'default'}`);
    
    console.log('[testing] API: Updating page name:', { pageId, pageType, newName });
    
    // Validate required fields
    if (!pageId || !pageType || !newName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'pageId, pageType, and newName are required'
      });
    }
    
    // Validate page type
    if (!['page', 'landing', 'legal'].includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page type',
        message: 'pageType must be one of: page, landing, legal'
      });
    }
    
    // Update the page name
    const success = await updatePageName(pageId, pageType, newName, tenantId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Page not found',
        message: 'The specified page could not be found'
      });
    }
    
    console.log('[testing] API: Page name updated successfully');
    
    res.json({
      success: true,
      message: 'Page name updated successfully',
      pageId: pageId,
      newName: newName
    });
    
  } catch (error) {
    console.error('[testing] API: Error updating page name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update page name',
      message: error.message
    });
  }
});

// Toggle SEO index
router.post('/pages/toggle-seo-index', async (req, res) => {
  try {
    const { pageId, pageType, currentIndex, tenantId } = req.body;
    console.log(`[testing] API: Toggling SEO index for tenant: ${tenantId || 'default'}`);
    
    console.log('[testing] API: Toggling SEO index:', { pageId, pageType, currentIndex });
    
    // Validate required fields
    if (!pageId || !pageType || currentIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'pageId, pageType, and currentIndex are required'
      });
    }
    
    // Validate page type
    if (!['page', 'landing', 'legal'].includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page type',
        message: 'pageType must be one of: page, landing, legal'
      });
    }
    
    // Toggle the SEO index
    const newIndex = await toggleSEOIndex(pageId, pageType, currentIndex, tenantId);
    
    console.log('[testing] API: SEO index toggled successfully');
    
    res.json({
      success: true,
      message: 'SEO index toggled successfully',
      pageId: pageId,
      newIndex: newIndex
    });
    
  } catch (error) {
    console.error('[testing] API: Error toggling SEO index:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle SEO index',
      message: error.message
    });
  }
});

// ===== LAYOUT ROUTES =====

// Get layout by slug
router.get('/pages/:slug/layout', async (req, res) => {
  try {
    const layout = await getLayoutBySlug('/' + req.params.slug.replace(/^\//, ''));
    if (!layout) return res.status(404).json({ error: 'Page not found' });
    res.json(layout.layout_json || { components: [] });
  } catch (error) {
    console.error('[testing] Error getting layout:', error);
    res.status(500).json({ error: 'Failed to get layout' });
  }
});

// Update layout by slug
router.put('/pages/:slug/layout', async (req, res) => {
  try {
    const slug = '/' + req.params.slug.replace(/^\//, '');
    const layoutJson = req.body?.components ? req.body : { components: [] };
    const updated = await upsertLayoutBySlug(slug, layoutJson);
    // Invalidate cache for this page
    invalidateBySlug(slug);
    res.json({ ok: true, version: updated.version });
  } catch (error) {
    console.error('[testing] Error updating layout:', error);
    res.status(500).json({ error: 'Failed to update layout' });
  }
});

// Alternative layout endpoints supporting slashes via query param
router.get('/layout', async (req, res) => {
  try {
    const slug = typeof req.query.slug === 'string' ? req.query.slug : '/';
    const layout = await getLayoutBySlug(slug);
    if (!layout) return res.status(404).json({ error: 'Page not found' });
    res.json(layout.layout_json || { components: [] });
  } catch (error) {
    console.error('[testing] Error getting layout (query):', error);
    res.status(500).json({ error: 'Failed to get layout' });
  }
});

router.put('/layout', async (req, res) => {
  try {
    const slug = typeof req.query.slug === 'string' ? req.query.slug : '/';
    const layoutJson = req.body && req.body.components ? req.body : { components: [] };
    const updated = await upsertLayoutBySlug(slug, layoutJson);
    invalidateBySlug(slug);
    res.json({ ok: true, version: updated.version });
  } catch (error) {
    console.error('[testing] Error updating layout (query):', error);
    res.status(500).json({ error: 'Failed to update layout' });
  }
});

// ===== TERMS ROUTES =====

// Get terms by taxonomy (backward compatibility)
router.get('/terms/taxonomy/:taxonomy', async (req, res) => {
  try {
    const { taxonomy } = req.params;
    // Use the existing getTerms function and filter by taxonomy
    const allTerms = await getTerms();
    const filteredTerms = allTerms.filter(term => term.taxonomy === taxonomy);
    res.json(filteredTerms);
  } catch (error) {
    console.error('[testing] Error fetching terms by taxonomy:', error);
    res.status(500).json({ error: 'Failed to fetch terms' });
  }
});

// Get terms (backward compatibility - supports ?taxonomy=category or ?taxonomy=post_tag)
router.get('/terms', async (req, res) => {
  try {
    const { taxonomy } = req.query;
    const terms = await getTerms(taxonomy || null);
    res.json(terms);
  } catch (error) {
    console.error('[testing] Error fetching terms:', error);
    res.status(500).json({ error: 'Failed to fetch terms' });
  }
});

// ===== CATEGORIES ROUTES =====

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    console.error('[testing] Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategory(parseInt(id));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('[testing] Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('[testing] Error creating category:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A category with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await updateCategory(parseInt(id), req.body);
    res.json(category);
  } catch (error) {
    console.error('[testing] Error updating category:', error);
    if (error.message === 'Category not found') {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A category with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await deleteCategory(parseInt(id));
    res.json({ success: true, message: 'Category deleted successfully', category });
  } catch (error) {
    console.error('[testing] Error deleting category:', error);
    if (error.message === 'Category not found') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ===== TAGS ROUTES =====

// Get all tags
router.get('/tags', async (req, res) => {
  try {
    const tags = await getTags();
    res.json(tags);
  } catch (error) {
    console.error('[testing] Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get single tag
router.get('/tags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await getTag(parseInt(id));
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (error) {
    console.error('[testing] Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// Create tag
router.post('/tags', async (req, res) => {
  try {
    const tag = await createTag(req.body);
    res.status(201).json(tag);
  } catch (error) {
    console.error('[testing] Error creating tag:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A tag with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Update tag
router.put('/tags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await updateTag(parseInt(id), req.body);
    res.json(tag);
  } catch (error) {
    console.error('[testing] Error updating tag:', error);
    if (error.message === 'Tag not found') {
      return res.status(404).json({ error: 'Tag not found' });
    }
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A tag with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

// Delete tag
router.delete('/tags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await deleteTag(parseInt(id));
    res.json({ success: true, message: 'Tag deleted successfully', tag });
  } catch (error) {
    console.error('[testing] Error deleting tag:', error);
    if (error.message === 'Tag not found') {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// ===== POSTS ROUTES =====

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    // Get tenant from authenticated user
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide tenant ID via authentication or query parameter'
      });
    }

    console.log('[testing] Fetching all posts for tenant:', tenantId);
    
    // Check if posts table has tenant_id column
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
    
    // Build query with conditional tenant filtering
    let queryText = `
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      WHERE 1=1
    `;
    
    const params = [];
    if (hasTenantId) {
      queryText += ` AND (p.tenant_id = $1 OR p.tenant_id IS NULL)`;
      params.push(tenantId);
    }
    
    queryText += ` GROUP BY p.id ORDER BY p.created_at DESC`;
    
    const result = await query(queryText, params);
    
    const posts = result.rows;
    res.json(posts);
  } catch (error) {
    console.error('[testing] Error fetching posts:', error);
    
    // Handle database not ready errors
    const { dbInitialized } = getDatabaseState();
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      if (!dbInitialized) {
        return res.status(503).json({
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    // Get tenant from authenticated user
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide tenant ID via authentication or query parameter'
      });
    }

    const { id } = req.params;
    console.log('[testing] Fetching post:', id, 'for tenant:', tenantId);
    
    // Fetch post with tenant filtering
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      WHERE p.id = $1 AND (p.tenant_id = $2 OR p.tenant_id IS NULL)
      GROUP BY p.id
    `, [parseInt(id), tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = result.rows[0];
    res.json(post);
  } catch (error) {
    console.error('[testing] Error fetching post:', error);
    
    // Handle database not ready errors
    const { dbInitialized } = getDatabaseState();
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      if (!dbInitialized) {
        return res.status(503).json({
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
router.post('/posts', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    // Get tenant from authenticated user
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide tenant ID via authentication or request body'
      });
    }

    console.log('[testing] Creating new post for tenant:', tenantId);
    
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
      twitter_description
    } = req.body;
    
    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({ 
        error: 'Title and slug are required' 
      });
    }
    
    // Check if posts table has tenant_id column
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
    
    // Build INSERT query conditionally including tenant_id
    let insertColumns = `
      title, slug, content, excerpt, status, post_type, author_id,
      meta_title, meta_description, meta_keywords, canonical_url,
      og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
      published_at
    `;
    let insertValues = `$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18`;
    const insertParams = [
      title,
      slug,
      content || '',
      excerpt || '',
      status || 'draft',
      'post',
      author_id || req.user?.id || 1,
      meta_title || '',
      meta_description || '',
      meta_keywords || '',
      '',
      og_title || '',
      og_description || '',
      '',
      twitter_title || '',
      twitter_description || '',
      published_at || null
    ];
    
    if (hasTenantId) {
      insertColumns += `, tenant_id`;
      insertValues += `, $19`;
      insertParams.push(tenantId);
    }
    
    const postResult = await query(`
      INSERT INTO posts (${insertColumns})
      VALUES (${insertValues})
      RETURNING *
    `, insertParams);

    const post = postResult.rows[0];

    // Handle categories using new table
    if (Array.isArray(categories) && categories.length > 0) {
      try {
        await setPostCategories(post.id, categories);
      } catch (err) {
        console.log('[testing] Note setting post categories:', err.message);
        // Fallback to old method for backward compatibility
        for (const categoryId of categories) {
          const taxonomyResult = await query(`
            SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
          `, [categoryId]);
          
          if (taxonomyResult.rows.length > 0) {
            await query(`
              INSERT INTO term_relationships (object_id, term_taxonomy_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [post.id, taxonomyResult.rows[0].id]);
          }
        }
      }
    }

    // Handle tags using new table
    if (Array.isArray(tags) && tags.length > 0) {
      try {
        await setPostTags(post.id, tags);
      } catch (err) {
        console.log('[testing] Note setting post tags:', err.message);
        // Fallback to old method for backward compatibility
        for (const tagId of tags) {
          const taxonomyResult = await query(`
            SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
          `, [tagId]);
          
          if (taxonomyResult.rows.length > 0) {
            await query(`
              INSERT INTO term_relationships (object_id, term_taxonomy_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [post.id, taxonomyResult.rows[0].id]);
          }
        }
      }
    }

    // Fetch the complete post with terms
    const completePostResult = await query(`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [post.id]);
    
    const newPost = completePostResult.rows[0];
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('[testing] Error creating post:', error);
    
    // Handle database not ready errors
    const { dbInitialized } = getDatabaseState();
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      if (!dbInitialized) {
        return res.status(503).json({
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    // Handle unique constraint violations (duplicate slug)
    if (error.code === '23505' || error.message.includes('unique')) {
      return res.status(409).json({ 
        error: 'A post with this slug already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create post',
      message: error.message 
    });
  }
});

// Update existing post
router.put('/posts/:id', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    // Get tenant from authenticated user
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide tenant ID via authentication or request body'
      });
    }

    const { id } = req.params;
    console.log('[testing] Updating post:', id, 'for tenant:', tenantId);
    
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
      twitter_description
    } = req.body;
    
    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({ 
        error: 'Title and slug are required' 
      });
    }
    
    // First verify the post exists and belongs to this tenant
    const checkResult = await query(`
      SELECT id FROM posts WHERE id = $1 AND (tenant_id = $2 OR tenant_id IS NULL)
    `, [parseInt(id), tenantId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Update the post
    const updateResult = await query(`
      UPDATE posts SET
        title = $2,
        slug = $3,
        content = $4,
        excerpt = $5,
        status = $6,
        author_id = $7,
        meta_title = $8,
        meta_description = $9,
        meta_keywords = $10,
        og_title = $11,
        og_description = $12,
        twitter_title = $13,
        twitter_description = $14,
        published_at = $15,
        updated_at = NOW()
      WHERE id = $1 AND (tenant_id = $16 OR tenant_id IS NULL)
      RETURNING *
    `, [
      parseInt(id),
      title,
      slug,
      content || '',
      excerpt || '',
      status || 'draft',
      author_id || req.user?.id || 1,
      meta_title || '',
      meta_description || '',
      meta_keywords || '',
      og_title || '',
      og_description || '',
      twitter_title || '',
      twitter_description || '',
      published_at || null,
      tenantId
    ]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Clear existing relationships (old method for backward compatibility)
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [parseInt(id)]);

    // Handle categories using new table
    if (Array.isArray(categories) && categories.length > 0) {
      try {
        await setPostCategories(parseInt(id), categories);
      } catch (err) {
        console.log('[testing] Note setting post categories:', err.message);
        // Fallback to old method for backward compatibility
        for (const categoryId of categories) {
          const taxonomyResult = await query(`
            SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
          `, [categoryId]);
          
          if (taxonomyResult.rows.length > 0) {
            await query(`
              INSERT INTO term_relationships (object_id, term_taxonomy_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [parseInt(id), taxonomyResult.rows[0].id]);
          }
        }
      }
    } else {
      // Clear categories if empty array
      try {
        await setPostCategories(parseInt(id), []);
      } catch (err) {
        console.log('[testing] Note clearing post categories:', err.message);
      }
    }

    // Handle tags using new table
    if (Array.isArray(tags) && tags.length > 0) {
      try {
        await setPostTags(parseInt(id), tags);
      } catch (err) {
        console.log('[testing] Note setting post tags:', err.message);
        // Fallback to old method for backward compatibility
        for (const tagId of tags) {
          const taxonomyResult = await query(`
            SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
          `, [tagId]);
          
          if (taxonomyResult.rows.length > 0) {
            await query(`
              INSERT INTO term_relationships (object_id, term_taxonomy_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [parseInt(id), taxonomyResult.rows[0].id]);
          }
        }
      }
    } else {
      // Clear tags if empty array
      try {
        await setPostTags(parseInt(id), []);
      } catch (err) {
        console.log('[testing] Note clearing post tags:', err.message);
      }
    }

    // Fetch the complete post with terms
    const completePostResult = await query(`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [parseInt(id)]);
    
    const updatedPost = completePostResult.rows[0];
    
    res.json(updatedPost);
  } catch (error) {
    console.error('[testing] Error updating post:', error);
    
    // Handle database not ready errors
    const { dbInitialized } = getDatabaseState();
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      if (!dbInitialized) {
        return res.status(503).json({
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    // Handle post not found
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Handle unique constraint violations (duplicate slug)
    if (error.code === '23505' || error.message.includes('unique')) {
      return res.status(409).json({ 
        error: 'A post with this slug already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update post',
      message: error.message 
    });
  }
});

// Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    // Get tenant from authenticated user
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide tenant ID via authentication or query parameter'
      });
    }

    const { id } = req.params;
    console.log('[testing] Deleting post:', id, 'for tenant:', tenantId);
    
    // Delete relationships first
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [parseInt(id)]);
    
    // Delete the post (only if it belongs to this tenant)
    const result = await query(`
      DELETE FROM posts 
      WHERE id = $1 AND (tenant_id = $2 OR tenant_id IS NULL)
      RETURNING *
    `, [parseInt(id), tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ 
      success: true,
      message: 'Post deleted successfully' 
    });
  } catch (error) {
    console.error('[testing] Error deleting post:', error);
    
    // Handle database not ready errors
    const { dbInitialized } = getDatabaseState();
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      if (!dbInitialized) {
        return res.status(503).json({
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    // Handle post not found
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to delete post',
      message: error.message 
    });
  }
});

// ===== BLOG ROUTES =====

// Get all blog posts
router.get('/blog/posts', async (req, res) => {
  try {
    // Get tenant from request or use default
    const tenantId = req.query.tenant || 'tenant-gosg';
    
    // Query posts from the database (using regular query instead of getDbForTenant)
    const queryText = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.excerpt, 
        p.content,
        p.featured_image as image,
        p.created_at as date,
        '5 min read' as "readTime",
        COALESCE(
          (SELECT t.name FROM post_terms pt 
           JOIN terms t ON pt.term_id = t.id 
           WHERE pt.post_id = p.id AND t.taxonomy = 'category' 
           LIMIT 1),
          'Uncategorized'
        ) as category
      FROM posts p
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT 20
    `;
    
    const result = await query(queryText);
    
    // Format dates and ensure proper structure
    const posts = result.rows.map(post => ({
      ...post,
      date: post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Get individual blog post by slug
router.get('/blog/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tenantId = req.query.tenant || 'tenant-gosg';
    
    // Query post from the database (using regular query instead of getDbForTenant)
    const queryText = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.excerpt, 
        p.content,
        p.featured_image as image,
        p.created_at as date,
        '5 min read' as "readTime",
        COALESCE(
          (SELECT t.name FROM post_terms pt 
           JOIN terms t ON pt.term_id = t.id 
           WHERE pt.post_id = p.id AND t.taxonomy = 'category' 
           LIMIT 1),
          'Uncategorized'
        ) as category
      FROM posts p
      WHERE p.slug = $1 AND p.status = 'published'
      LIMIT 1
    `;
    
    const result = await query(queryText, [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Get post tags
    const tagsQuery = `
      SELECT t.name
      FROM post_terms pt
      JOIN terms t ON pt.term_id = t.id
      WHERE pt.post_id = $1 AND t.taxonomy = 'post_tag'
    `;
    
    const tagsResult = await query(tagsQuery, [result.rows[0].id]);
    const tags = tagsResult.rows.map(row => row.name);
    
    // Format post data
    const post = {
      ...result.rows[0],
      date: result.rows[0].date ? new Date(result.rows[0].date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      tags: tags
    };
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// ===== SCHEMA MIGRATION ROUTES =====

// Migrate schema
router.post('/pages/:pageId/migrate-schema', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId } = req.body;
    console.log(`[testing] API: Migrating schema for page ${pageId} (tenant: ${tenantId})`);
    
    // Get current page layout
    const page = await getPageWithLayout(pageId, tenantId);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }
    
    // Import migration utilities
    const { migrateOldSchemaToNew, needsMigration } = await import('../../sparti-cms/utils/schema-migration.ts');
    
    // Check if migration is needed
    if (!needsMigration(page.layout)) {
      return res.json({
        success: true,
        message: 'Schema already in new format',
        migrated: false
      });
    }
    
    // Migrate the schema
    const newSchema = migrateOldSchemaToNew(page.layout);
    
    // Add version info
    const schemaWithVersion = {
      ...newSchema,
      _version: {
        version: '2.0',
        migratedAt: new Date().toISOString(),
        migratedFrom: '1.0'
      }
    };
    
    // Update the database
    const success = await updatePageLayout(pageId, schemaWithVersion, tenantId);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update page layout'
      });
    }
    
    res.json({
      success: true,
      message: 'Schema migrated successfully',
      migrated: true,
      newSchema
    });
  } catch (error) {
    console.error('[testing] API: Error migrating schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to migrate schema',
      message: error.message
    });
  }
});

// Validate schema
router.post('/pages/:pageId/validate-schema', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId } = req.body;
    console.log(`[testing] API: Validating schema for page ${pageId} (tenant: ${tenantId})`);
    
    // Get current page layout
    const page = await getPageWithLayout(pageId, tenantId);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }
    
    // Import validation utilities
    const { validatePageSchema, getValidationSummary } = await import('../../sparti-cms/utils/schema-validator.ts');
    
    // Validate the schema
    const validation = validatePageSchema(page.layout);
    const summary = getValidationSummary(page.layout);
    
    res.json({
      success: true,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      },
      summary: {
        totalComponents: summary.totalComponents,
        totalItems: summary.totalItems,
        itemTypeCounts: summary.itemTypeCounts,
        hasErrors: summary.hasErrors,
        hasWarnings: summary.hasWarnings
      }
    });
  } catch (error) {
    console.error('[testing] API: Error validating schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate schema',
      message: error.message
    });
  }
});

// Note: Server-rendered page route (/r/:slug) is handled in routes/index.js
// at the root level to avoid /api prefix

export default router;

