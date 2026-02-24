import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { authenticateUser } from '../middleware/auth.js';
import { getDatabaseState } from '../utils/database.js';
import { getThemePagesFromFileSystem } from '../../sparti-cms/services/themeSync.js';
import { getTranslations } from '../../sparti-cms/services/translationService.js';
import {
  getAllPagesWithTypes,
  updatePageSlug,
  validateSlug,
  updatePageName,
  toggleSEOIndex,
  getPageWithLayout,
  updatePageData,
  updatePageLayout,
  savePageVersion,
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
  setPostTags,
  findOrCreateCategory,
  findOrCreateTag
} from '../../sparti-cms/db/index.js';
import { upload } from '../config/multer.js';
import { readFileSync } from 'fs';
import { parseWordPressXML, parseWordPressJSON, extractPosts, extractCategories, extractTags, extractImages, updateImageReferences } from '../../sparti-cms/services/wordpressImport.js';
import { downloadImages } from '../../sparti-cms/services/imageDownloader.js';
import { invalidateBySlug } from '../../sparti-cms/cache/index.js';
import models, { sequelize } from '../../sparti-cms/db/sequelize/models/index.js';
import { Op } from 'sequelize';
import { createWordPressClientFromConfig } from '../services/wordpressClient.js';
const { Post, Category, Tag } = models;

const router = express.Router();

/**
 * Helper function to sync post to WordPress
 * Returns null if sync is not needed or failed (non-blocking)
 */
async function syncPostToWordPress(post, tenantId) {
  try {
    // Check if WordPress sync is enabled for this tenant
    const integrationResult = await query(`
      SELECT config, is_active
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'wordpress' AND is_active = true
      LIMIT 1
    `, [tenantId]);

    if (integrationResult.rows.length === 0) {
      return null; // WordPress integration not configured
    }

    const config = integrationResult.rows[0].config;
    if (!config || !config.auto_sync_enabled) {
      return null; // Auto-sync disabled
    }

    // Check if this post has WordPress sync enabled
    if (!post.wordpress_sync_enabled) {
      return null; // Sync disabled for this post
    }

    const client = createWordPressClientFromConfig(config);

    // Map CMS status to WordPress status
    const statusMap = {
      'published': 'publish',
      'draft': 'draft',
      'private': 'private',
      'trash': 'trash'
    };
    const wpStatus = statusMap[post.status] || 'draft';

    // Get categories and tags
    const postWithRelations = await Post.findByPk(post.id, {
      include: [
        { model: Category, as: 'categories', through: { attributes: [] } },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });

    const categoryIds = postWithRelations?.categories?.map(c => c.id) || [];
    const tagIds = postWithRelations?.tags?.map(t => t.id) || [];

    // Map to WordPress format
    const wpPostData = {
      title: post.title,
      content: post.content || '',
      excerpt: post.excerpt || '',
      slug: post.slug,
      status: wpStatus,
      date: post.published_at ? new Date(post.published_at).toISOString() : new Date().toISOString(),
      categories: categoryIds,
      tags: tagIds
    };

    let wpPost;
    if (post.wordpress_id) {
      // Update existing WordPress post
      wpPost = await client.updatePost(post.wordpress_id, wpPostData);
    } else {
      // Create new WordPress post
      wpPost = await client.createPost(wpPostData);

      // Update post with WordPress ID
      await post.update({
        wordpress_id: wpPost.id,
        wordpress_last_synced_at: new Date()
      });
    }

    // Update last synced timestamp
    await post.update({
      wordpress_last_synced_at: new Date()
    });

    return { success: true, wordpress_id: wpPost.id };
  } catch (error) {
    console.error('[testing] Error syncing post to WordPress:', error);
    // Log error but don't block the request
    // Could store error in integration config for monitoring
    return { success: false, error: error.message };
  }
}

// ===== PAGES ROUTES =====

// Get all pages
router.get('/pages/all', authenticateUser, async (req, res) => {
  try {
    // Get theme ID from req.themeSlug (set by theme middleware), query parameter, or null
    const themeId = req.themeSlug || req.query.themeId || null;
    // Fix tenant ID detection - check multiple sources
    const tenantId = req.tenantId || req.query.tenantId || req.headers['x-tenant-id'] || (req.user?.tenant_id);

    // Comprehensive debugging logs
    console.log(`[testing] API: ========== /pages/all Request ==========`);
    console.log(`[testing] API: req.tenantId: ${req.tenantId}`);
    console.log(`[testing] API: req.query.tenantId: ${req.query.tenantId}`);
    console.log(`[testing] API: req.headers['x-tenant-id']: ${req.headers['x-tenant-id']}`);
    console.log(`[testing] API: req.user?.tenant_id: ${req.user?.tenant_id}`);
    console.log(`[testing] API: Final tenantId: ${tenantId}`);
    console.log(`[testing] API: themeId from query: ${themeId || 'custom'}`);
    console.log(`[testing] API: User is_super_admin: ${req.user?.is_super_admin || false}`);

    // getAllPagesWithTypes already handles file system fallback for demo tenant
    let pages = [];
    let fromFilesystem = false;

    try {
      pages = await getAllPagesWithTypes(tenantId, themeId || null);
      console.log(`[testing] API: getAllPagesWithTypes returned ${pages.length} page(s)`);

      // Check if pages came from file system (they'll have from_filesystem flag)
      if (pages.length > 0 && pages[0].from_filesystem) {
        fromFilesystem = true;
        console.log(`[testing] API: Pages came from file system`);
      } else if (pages.length > 0) {
        console.log(`[testing] API: Pages came from database`);
      }

      // Log page types for debugging
      if (pages.length > 0) {
        const pageTypes = pages.map(p => p.page_type).filter((v, i, a) => a.indexOf(v) === i);
        console.log(`[testing] API: Page types found: ${pageTypes.join(', ')}`);
        console.log(`[testing] API: Sample page:`, {
          id: pages[0].id,
          page_name: pages[0].page_name,
          slug: pages[0].slug,
          page_type: pages[0].page_type,
          theme_id: pages[0].theme_id,
          tenant_id: pages[0].tenant_id,
          from_filesystem: pages[0].from_filesystem
        });
      }
    } catch (error) {
      console.error('[testing] API: Error fetching pages:', error);
      console.error('[testing] API: Error stack:', error.stack);
      // getAllPagesWithTypes already handles demo tenant fallback, so if it throws,
      // it means the fallback also failed or it's a non-demo tenant
      throw error;
    }

    // Validate and ensure pages have required fields
    const validatedPages = (pages || []).map((page, index) => {
      // Ensure required fields are present
      if (!page.id) {
        console.warn(`[testing] API: Page at index ${index} missing id, generating one`);
        const slugId = (page.slug || '').replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'page';
        page.id = page.id || `page-${tenantId}-${slugId}-${index}`;
      }
      if (!page.page_name) {
        console.warn(`[testing] API: Page at index ${index} missing page_name`);
        page.page_name = page.page_name || 'Untitled Page';
      }
      if (!page.slug) {
        console.warn(`[testing] API: Page at index ${index} missing slug`);
        page.slug = page.slug || '/';
      }
      if (!page.page_type) {
        console.warn(`[testing] API: Page at index ${index} missing page_type, defaulting to 'page'`);
        page.page_type = page.page_type || 'page';
      }
      // Ensure tenant_id and theme_id are set
      if (!page.tenant_id) {
        page.tenant_id = tenantId;
      }
      if (themeId && themeId !== 'custom' && !page.theme_id) {
        page.theme_id = themeId;
      }
      return page;
    });

    const response = {
      success: true,
      pages: validatedPages,
      total: validatedPages.length,
      tenantId: tenantId,
      themeId: themeId || 'custom',
      from_filesystem: fromFilesystem
    };

    res.json(response);
  } catch (error) {
    console.error('[testing] API: Error in /pages/all:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pages',
      message: error.message
    });
  }
});

// Create one or more pages (array) for a tenant/theme
router.post('/pages', authenticateUser, async (req, res) => {
  try {
    const { pages: pagesPayload, tenantId, themeId } = req.body;
    if (!Array.isArray(pagesPayload) || pagesPayload.length === 0 || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'pages (array) and tenantId are required'
      });
    }
    if (!req.user.is_super_admin && tenantId !== req.user.tenant_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only create pages for your own tenant'
      });
    }
    const created = [];
    const now = new Date().toISOString();
    for (const p of pagesPayload) {
      const result = await query(`
        INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status, page_type, theme_id, tenant_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, page_name, slug, meta_title, meta_description, seo_index, status, page_type, theme_id, tenant_id, created_at, updated_at
      `, [
        p.page_name || 'Untitled',
        p.slug || '/',
        p.meta_title || null,
        p.meta_description || null,
        p.seo_index !== undefined ? p.seo_index : (p.page_type === 'legal' ? false : true),
        p.status || 'draft',
        p.page_type || 'page',
        themeId && themeId !== 'custom' ? themeId : null,
        tenantId,
        now,
        now
      ]);
      created.push(result.rows[0]);
    }
    res.json({ success: true, pages: created });
  } catch (err) {
    console.error('[testing] POST /pages error:', err);
    res.status(500).json({ success: false, error: err.message, message: err.message });
  }
});

// Get pages by theme_id
router.get('/pages/theme/:themeId', async (req, res) => {
  try {
    const { themeId } = req.params;
    console.log(`[testing] API: Fetching pages for theme: ${themeId}`);

    let pages = [];
    let fromFilesystem = false;

    try {
      // Try to fetch pages from database first
      const result = await query(`
        SELECT 
          id,
          page_name,
          slug,
          meta_title,
          meta_description,
          seo_index,
          status,
          page_type,
          theme_id,
          created_at,
          updated_at
        FROM pages
        WHERE theme_id = $1
        ORDER BY page_name ASC
      `, [themeId]);

      pages = result.rows;
    } catch (dbError) {
      // If database query fails, fall back to file system
      console.log('[testing] Database query failed, using file system pages:', dbError.message);
      pages = getThemePagesFromFileSystem(themeId);
      fromFilesystem = true;
    }

    // If database returned empty array, try file system as fallback
    if (pages.length === 0) {
      console.log('[testing] No pages in database, checking file system...');
      const fsPages = getThemePagesFromFileSystem(themeId);
      if (fsPages.length > 0) {
        pages = fsPages;
        fromFilesystem = true;
      }
    }

    res.json({
      success: true,
      pages: pages,
      total: pages.length,
      themeId: themeId,
      from_filesystem: fromFilesystem
    });
  } catch (error) {
    console.error('[testing] API: Error fetching theme pages:', error);
    // Last resort: try file system
    try {
      const { themeId } = req.params;
      const fsPages = getThemePagesFromFileSystem(themeId);
      res.json({
        success: true,
        pages: fsPages,
        total: fsPages.length,
        themeId: themeId,
        from_filesystem: true
      });
    } catch (fsError) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch theme pages',
        message: error.message
      });
    }
  }
});

// Get individual page with layout
router.get('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId, themeId } = req.query;

    // Check if this is a theme page (pageId starts with "theme-") or if we're in theme mode
    const isThemePage = pageId.startsWith('theme-');
    const isThemeMode = themeId && !tenantId;

    if ((isThemePage || isThemeMode) && themeId) {
      // Theme mode: query by theme_id
      console.log(`[testing] API: Fetching theme page ${pageId} for theme: ${themeId}`);

      // First, try to query by page ID directly (works for both numeric IDs and theme- prefixed IDs)
      // Try as string first (most common case)
      let pageResult = await query(`
        SELECT 
          id,
          page_name,
          slug,
          meta_title,
          meta_description,
          seo_index,
          status,
          page_type,
          theme_id,
          created_at,
          updated_at
        FROM pages
        WHERE id::text = $1 AND theme_id = $2
        LIMIT 1
      `, [pageId, themeId]);

      // If not found and pageId is numeric, try as integer
      if (pageResult.rows.length === 0 && /^\d+$/.test(pageId)) {
        pageResult = await query(`
          SELECT 
            id,
            page_name,
            slug,
            meta_title,
            meta_description,
            seo_index,
            status,
            page_type,
            theme_id,
            created_at,
            updated_at
          FROM pages
          WHERE id = $1 AND theme_id = $2
          LIMIT 1
        `, [parseInt(pageId), themeId]);
      }

      // If not found by ID, try to extract slug from pageId and query by slug
      if (pageResult.rows.length === 0) {
        // Extract slug from pageId (format: theme-{themeSlug}-{pageSlug})
        // Remove "theme-{themeSlug}-" prefix to get the page slug part
        const prefix = `theme-${themeId}-`;
        if (pageId.startsWith(prefix)) {
          const pageSlugPart = pageId.substring(prefix.length);
          // Convert hyphens back to slashes and ensure it starts with /
          const pageSlug = '/' + pageSlugPart.replace(/-/g, '/');

          // Query by theme_id and slug
          pageResult = await query(`
            SELECT 
              id,
              page_name,
              slug,
              meta_title,
              meta_description,
              seo_index,
              status,
              page_type,
              theme_id,
              created_at,
              updated_at
            FROM pages
            WHERE slug = $1 AND theme_id = $2
            LIMIT 1
          `, [pageSlug, themeId]);
        }
      }

      if (pageResult.rows.length === 0) {
        // Try to get from file system as fallback
        const fsPages = getThemePagesFromFileSystem(themeId);
        const fsPage = fsPages.find(p => p.id === pageId);

        if (fsPage) {
          // Return file system page with empty layout
          return res.json({
            success: true,
            page: {
              ...fsPage,
              layout: { components: [] }
            }
          });
        }

        return res.status(404).json({
          success: false,
          error: 'Page not found'
        });
      }

      const page = pageResult.rows[0];

      // Get the layout data (default language)
      const layoutResult = await query(`
        SELECT layout_json, version, updated_at
        FROM page_layouts
        WHERE page_id = $1 AND language = 'default'
        ORDER BY version DESC
        LIMIT 1
      `, [page.id]);

      if (layoutResult.rows.length > 0) {
        let layout = layoutResult.rows[0].layout_json;

        // Convert testimonials sections to proper items structure
        try {
          const { convertLayoutTestimonialsToItems } = await import('../../sparti-cms/utils/convertTestimonialsToItems.js');
          layout = convertLayoutTestimonialsToItems(layout);
        } catch (error) {
          console.log('[testing] Note: Could not convert testimonials structure:', error.message);
        }

        page.layout = layout;
      } else {
        page.layout = { components: [] };
      }

      return res.json({
        success: true,
        page: page
      });
    } else {
      // Tenant mode: use existing logic
      console.log(`[testing] API: Fetching page ${pageId} for tenant: ${tenantId || 'default'}`);

      const page = await getPageWithLayout(pageId, tenantId);

      if (!page) {
        return res.status(404).json({
          success: false,
          error: 'Page not found'
        });
      }

      // Convert testimonials sections to proper items structure
      if (page.layout && page.layout.components) {
        try {
          const { convertLayoutTestimonialsToItems } = await import('../../sparti-cms/utils/convertTestimonialsToItems.js');
          page.layout = convertLayoutTestimonialsToItems(page.layout);
        } catch (error) {
          console.log('[testing] Note: Could not convert testimonials structure:', error.message);
        }
      }

      res.json({
        success: true,
        page: page
      });
    }
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
    if (error.message && error.message.includes('master page')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update page',
      message: error.message
    });
  }
});

// Update page layout
router.put('/pages/:pageId/layout', authenticateUser, async (req, res) => {
  console.log('[testing] ========== API: PUT /pages/:pageId/layout ==========');
  console.log('[testing] Request received:', {
    pageId: req.params.pageId,
    pageIdType: typeof req.params.pageId,
    method: req.method,
    url: req.url,
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      tenant_id: req.user.tenant_id,
      is_super_admin: req.user.is_super_admin
    } : 'no user',
    bodyKeys: Object.keys(req.body || {})
  });

  try {
    const { pageId } = req.params;
    const { layout_json, tenantId, themeId } = req.body;

    console.log('[testing] Step 1: Extracted parameters:', {
      pageId: pageId,
      pageIdType: typeof pageId,
      tenantId: tenantId,
      themeId: themeId,
      hasLayoutJson: !!layout_json,
      layoutJsonType: typeof layout_json,
      layoutJsonKeys: layout_json ? Object.keys(layout_json) : [],
      componentsCount: layout_json?.components ? (Array.isArray(layout_json.components) ? layout_json.components.length : 'not array') : 'no components'
    });

    // Validate tenant access: user can only update their own tenant unless they're a super admin
    console.log('[testing] Step 2: Validating tenant access...');
    if (!req.user.is_super_admin && tenantId !== req.user.tenant_id) {
      console.error('[testing] Step 2: Tenant access denied:', {
        userTenantId: req.user.tenant_id,
        requestTenantId: tenantId,
        isSuperAdmin: req.user.is_super_admin
      });
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only update layouts for your own tenant'
      });
    }
    console.log('[testing] Step 2: Tenant access validated');

    console.log('[testing] Step 3: Calling updatePageLayout...');
    const success = await updatePageLayout(pageId, layout_json, tenantId, 'default', themeId);

    console.log('[testing] Step 3: updatePageLayout result:', {
      success: success,
      pageId: pageId,
      tenantId: tenantId,
      themeId: themeId
    });

    if (!success) {
      console.error('[testing] Step 3: updatePageLayout returned false - page not found or update failed');
      return res.status(404).json({
        success: false,
        error: 'Page not found or layout update failed'
      });
    }

    console.log('[testing] ========== API: Layout update successful ==========');
    res.json({
      success: true,
      message: 'Page layout updated successfully'
    });
  } catch (error) {
    console.error('[testing] ========== API: Error updating page layout ==========');
    console.error('[testing] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });

    // Handle validation errors with 400 status
    if (error.code === 'VALIDATION_ERROR') {
      console.error('[testing] Validation error detected');
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

// Save page version
router.post('/pages/:pageId/versions', authenticateUser, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { pageData, layoutJson, comment, tenantId } = req.body;
    console.log(`[testing] API: Saving page version ${pageId} for tenant: ${tenantId}`);

    // Validate tenant access: user can only save versions for their own tenant unless they're a super admin
    if (!req.user.is_super_admin && tenantId !== req.user.tenant_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only save versions for your own tenant'
      });
    }

    if (!pageData || !layoutJson) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'pageData and layoutJson are required'
      });
    }

    const version = await savePageVersion(
      parseInt(pageId),
      tenantId,
      pageData,
      layoutJson,
      req.user.id,
      comment || null
    );

    res.json({
      success: true,
      version: version,
      message: 'Page version saved successfully'
    });
  } catch (error) {
    console.error('[testing] API: Error saving page version:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to save page version',
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
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;

    // Build where clause
    const whereClause = {};
    if (tenantId) {
      whereClause[Op.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }

    // Use Sequelize model to fetch categories filtered by tenant
    const categories = await Category.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    res.json(categories.map(cat => cat.toJSON()));
  } catch (error) {
    console.error('[testing] Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;

    // Build where clause
    const whereClause = { id: parseInt(id) };
    if (tenantId) {
      whereClause[Op.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }

    const category = await Category.findOne({ where: whereClause });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category.toJSON());
  } catch (error) {
    console.error('[testing] Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide tenant ID via authentication or request body'
      });
    }

    // Use Sequelize model to create category with tenant_id
    const category = await Category.create({
      ...req.body,
      tenant_id: tenantId
    });

    res.status(201).json(category.toJSON());
  } catch (error) {
    console.error('[testing] Error creating category:', error);
    if (error.code === '23505' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'A category with this slug already exists for this tenant' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to update categories' });
    }

    // Build where clause - only allow updating tenant-specific categories
    const whereClause = {
      id: parseInt(id),
      tenant_id: tenantId // Only tenant-specific categories can be updated
    };

    const category = await Category.findOne({ where: whereClause });
    if (!category) {
      // Check if it's a master category
      const masterCategory = await Category.findOne({
        where: { id: parseInt(id), tenant_id: null }
      });
      if (masterCategory) {
        return res.status(403).json({
          error: 'Cannot update master category. Master data (tenant_id = NULL) is shared across all tenants. Create a tenant-specific category instead.'
        });
      }
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update category (preserve tenant_id)
    const updateData = { ...req.body };
    delete updateData.tenant_id; // Never allow tenant_id changes via update

    await category.update(updateData);
    res.json(category.toJSON());
  } catch (error) {
    console.error('[testing] Error updating category:', error);
    if (error.code === '23505' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'A category with this slug already exists for this tenant' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;

    // Build where clause - only allow deletion of tenant-specific categories
    const whereClause = { id: parseInt(id) };
    if (tenantId) {
      // Only allow deletion of tenant-specific categories, not master (tenant_id = NULL)
      whereClause.tenant_id = tenantId;
    } else {
      return res.status(400).json({ error: 'Tenant ID is required to delete categories' });
    }

    const category = await Category.findOne({ where: whereClause });
    if (!category) {
      return res.status(404).json({ error: 'Category not found or is a master category (cannot delete master data)' });
    }

    // Prevent deletion of master categories (tenant_id = NULL)
    if (!category.tenant_id) {
      return res.status(403).json({ error: 'Cannot delete master category. Master data (tenant_id = NULL) is shared across all tenants.' });
    }

    await category.destroy();
    res.json({ success: true, message: 'Category deleted successfully', category: category.toJSON() });
  } catch (error) {
    console.error('[testing] Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ===== TAGS ROUTES =====

// Get all tags
router.get('/tags', async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;

    // Build where clause
    const whereClause = {};
    if (tenantId) {
      whereClause[Op.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }

    // Use Sequelize model to fetch tags filtered by tenant
    const tags = await Tag.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    res.json(tags.map(tag => tag.toJSON()));
  } catch (error) {
    console.error('[testing] Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get single tag
router.get('/tags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;

    // Build where clause
    const whereClause = { id: parseInt(id) };
    if (tenantId) {
      whereClause[Op.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }

    const tag = await Tag.findOne({ where: whereClause });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag.toJSON());
  } catch (error) {
    console.error('[testing] Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// Create tag
router.post('/tags', async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide tenant ID via authentication or request body'
      });
    }

    // Use Sequelize model to create tag with tenant_id
    const tag = await Tag.create({
      ...req.body,
      tenant_id: tenantId
    });

    res.status(201).json(tag.toJSON());
  } catch (error) {
    console.error('[testing] Error creating tag:', error);
    if (error.code === '23505' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'A tag with this slug already exists for this tenant' });
    }
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Update tag
router.put('/tags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to update tags' });
    }

    // Build where clause - only allow updating tenant-specific tags
    const whereClause = {
      id: parseInt(id),
      tenant_id: tenantId // Only tenant-specific tags can be updated
    };

    const tag = await Tag.findOne({ where: whereClause });
    if (!tag) {
      // Check if it's a master tag
      const masterTag = await Tag.findOne({
        where: { id: parseInt(id), tenant_id: null }
      });
      if (masterTag) {
        return res.status(403).json({
          error: 'Cannot update master tag. Master data (tenant_id = NULL) is shared across all tenants. Create a tenant-specific tag instead.'
        });
      }
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Update tag (preserve tenant_id)
    const updateData = { ...req.body };
    delete updateData.tenant_id; // Never allow tenant_id changes via update

    await tag.update(updateData);
    res.json(tag.toJSON());
  } catch (error) {
    console.error('[testing] Error updating tag:', error);
    if (error.code === '23505' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'A tag with this slug already exists for this tenant' });
    }
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

// Delete tag
router.delete('/tags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;

    // Build where clause - only allow deletion of tenant-specific tags
    const whereClause = { id: parseInt(id) };
    if (tenantId) {
      // Only allow deletion of tenant-specific tags, not master (tenant_id = NULL)
      whereClause.tenant_id = tenantId;
    } else {
      return res.status(400).json({ error: 'Tenant ID is required to delete tags' });
    }

    const tag = await Tag.findOne({ where: whereClause });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found or is a master tag (cannot delete master data)' });
    }

    // Prevent deletion of master tags (tenant_id = NULL)
    if (!tag.tenant_id) {
      return res.status(403).json({ error: 'Cannot delete master tag. Master data (tenant_id = NULL) is shared across all tenants.' });
    }

    await tag.destroy();
    res.json({ success: true, message: 'Tag deleted successfully', tag: tag.toJSON() });
  } catch (error) {
    console.error('[testing] Error deleting tag:', error);
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

    // Fetch posts using Sequelize with associations for new categories and tags tables
    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      include: [
        {
          model: models.Category,
          as: 'categories',
          through: { attributes: [] },
        },
        {
          model: models.Tag,
          as: 'tags',
          through: { attributes: [] },
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Transform posts to include terms array for backward compatibility
    const postsWithTerms = posts.map(post => {
      const postJson = post.toJSON();

      // Build terms array from categories and tags for backward compatibility
      const terms = [
        ...(postJson.categories || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          taxonomy: 'category'
        })),
        ...(postJson.tags || []).map(tag => ({
          id: tag.id,
          name: tag.name,
          taxonomy: 'post_tag'
        }))
      ];

      return {
        ...postJson,
        terms: terms
      };
    });

    res.json(postsWithTerms);
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

    // Fetch post using Sequelize with associations
    const post = await Post.findOne({
      where: {
        id: parseInt(id),
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      include: [
        {
          model: models.Category,
          as: 'categories',
          through: { attributes: [] },
        },
        {
          model: models.Tag,
          as: 'tags',
          through: { attributes: [] },
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post.toJSON());
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
    // For super admins, prioritize tenantId from request body if provided
    // Otherwise use tenantId from middleware/headers or user's tenant_id
    let tenantId;
    if (req.user?.is_super_admin && req.body.tenantId) {
      // Super admin explicitly providing tenantId in body - use it
      tenantId = req.body.tenantId;
    } else {
      // Regular users or super admin without explicit tenantId in body
      tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    }

    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide tenant ID via authentication or request body'
      });
    }

    console.log('[testing] Creating new post for tenant:', tenantId, 'is_super_admin:', req.user?.is_super_admin);

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

    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({
        error: 'Title and slug are required'
      });
    }

    // Create post using Sequelize
    const post = await Post.create({
      title,
      slug,
      content: content || '',
      excerpt: excerpt || '',
      status: status || 'draft',
      post_type: 'post',
      author_id: author_id || req.user?.id || 1,
      meta_title: meta_title || '',
      meta_description: meta_description || '',
      meta_keywords: meta_keywords || '',
      canonical_url: '',
      og_title: og_title || '',
      og_description: og_description || '',
      og_image: '',
      twitter_title: twitter_title || '',
      twitter_description: twitter_description || '',
      twitter_image: '',
      published_at: published_at || null,
      tenant_id: tenantId || null,
      featured_image_id: featured_image_id || null
    });

    // Handle categories using new table - always call to ensure proper state
    const categoryIds = Array.isArray(categories) ? categories : [];
    try {
      await setPostCategories(post.id, categoryIds);
    } catch (err) {
      console.log('[testing] Note setting post categories:', err.message);
      // Fallback to old method for backward compatibility
      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
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

    // Handle tags using new table - always call to ensure proper state
    const tagIds = Array.isArray(tags) ? tags : [];
    try {
      await setPostTags(post.id, tagIds);
    } catch (err) {
      console.log('[testing] Note setting post tags:', err.message);
      // Fallback to old method for backward compatibility
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
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

    // Fetch the complete post with categories and tags using Sequelize
    const newPost = await Post.findByPk(post.id, {
      include: [
        {
          model: models.Category,
          as: 'categories',
          through: { attributes: [] }, // Exclude junction table attributes
        },
        {
          model: models.Tag,
          as: 'tags',
          through: { attributes: [] }, // Exclude junction table attributes
        }
      ]
    });

    // Convert Sequelize model to plain object
    const postData = newPost ? newPost.toJSON() : post.toJSON();

    // Sync to WordPress if enabled (non-blocking)
    if (req.body.wordpress_sync_enabled !== false) {
      // Set wordpress_sync_enabled if not explicitly set
      if (post.wordpress_sync_enabled === undefined || post.wordpress_sync_enabled === null) {
        await post.update({ wordpress_sync_enabled: true });
      }
      // Trigger sync asynchronously (don't wait for it)
      syncPostToWordPress(post, tenantId).catch(err => {
        console.error('[testing] WordPress sync error (non-blocking):', err);
      });
    }

    res.status(201).json(postData);
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
    // For super admins, prioritize tenantId from request body if provided
    // Otherwise use tenantId from middleware/headers or user's tenant_id
    let tenantId;
    if (req.user?.is_super_admin && req.body.tenantId) {
      // Super admin explicitly providing tenantId in body - use it
      tenantId = req.body.tenantId;
    } else {
      // Regular users or super admin without explicit tenantId in body
      tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    }

    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide tenant ID via authentication or request body'
      });
    }

    const { id } = req.params;
    console.log('[testing] Updating post:', id, 'for tenant:', tenantId, 'is_super_admin:', req.user?.is_super_admin);

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

    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({
        error: 'Title and slug are required'
      });
    }

    // Find the post using Sequelize
    // For super admins, allow finding posts from any tenant
    // For regular users, only find posts from their tenant
    const whereClause = req.user?.is_super_admin
      ? { id: parseInt(id) } // Super admin can access any post
      : {
        id: parseInt(id),
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      };

    const post = await Post.findOne({ where: whereClause });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Build update data
    const updateData = {
      title,
      slug,
      content: content || '',
      excerpt: excerpt || '',
      status: status || 'draft',
      author_id: author_id || req.user?.id || 1,
      meta_title: meta_title || '',
      meta_description: meta_description || '',
      meta_keywords: meta_keywords || '',
      og_title: og_title || '',
      og_description: og_description || '',
      twitter_title: twitter_title || '',
      twitter_description: twitter_description || '',
      featured_image_id: featured_image_id !== undefined ? featured_image_id : post.featured_image_id,
      published_at: published_at || null
    };

    // For super admins, allow updating tenant_id if provided in body
    if (req.user?.is_super_admin && req.body.tenantId) {
      updateData.tenant_id = req.body.tenantId;
    }

    // Update the post
    await post.update(updateData);

    // Clear existing relationships (old method for backward compatibility)
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [parseInt(id)]);

    // Handle categories using new table - always call to ensure proper state
    const categoryIds = Array.isArray(categories) ? categories : [];
    try {
      await setPostCategories(parseInt(id), categoryIds);
    } catch (err) {
      console.log('[testing] Note setting post categories:', err.message);
      // Fallback to old method for backward compatibility
      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
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
    }

    // Handle tags using new table - always call to ensure proper state
    const tagIds = Array.isArray(tags) ? tags : [];
    try {
      await setPostTags(parseInt(id), tagIds);
    } catch (err) {
      console.log('[testing] Note setting post tags:', err.message);
      // Fallback to old method for backward compatibility
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
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
    }

    // Fetch the complete post with categories and tags using Sequelize
    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: models.Category,
          as: 'categories',
          through: { attributes: [] },
        },
        {
          model: models.Tag,
          as: 'tags',
          through: { attributes: [] },
        }
      ]
    });

    // Sync to WordPress if enabled (non-blocking)
    const finalPost = updatedPost || post;
    if (finalPost.wordpress_sync_enabled) {
      // Trigger sync asynchronously (don't wait for it)
      syncPostToWordPress(finalPost, tenantId).catch(err => {
        console.error('[testing] WordPress sync error (non-blocking):', err);
      });
    }

    res.json(finalPost ? finalPost.toJSON() : post.toJSON());
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
    // Find and delete the post using Sequelize
    const post = await Post.findOne({
      where: {
        id: parseInt(id),
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.destroy();

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
    const lang = req.query.lang || 'default';

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
          (SELECT c.name FROM post_categories pc 
           JOIN categories c ON pc.category_id = c.id 
           WHERE pc.post_id = p.id 
           LIMIT 1),
          'Uncategorized'
        ) as category
      FROM posts p
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT 20
    `;

    const result = await query(queryText);

    // Format dates and ensure proper structure, and apply translations
    const posts = await Promise.all(result.rows.map(async post => {
      let title = post.title;
      let excerpt = post.excerpt;

      if (lang !== 'default') {
        const translations = await getTranslations('blog', post.id, lang, tenantId);
        if (translations['title']?.value) title = translations['title'].value;
        if (translations['excerpt']?.value) excerpt = translations['excerpt'].value;
      }

      return {
        ...post,
        title,
        excerpt,
        date: post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
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
    const lang = req.query.lang || 'default';

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
          (SELECT c.name FROM post_categories pc 
           JOIN categories c ON pc.category_id = c.id 
           WHERE pc.post_id = p.id 
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
      FROM post_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.post_id = $1
    `;

    const tagsResult = await query(tagsQuery, [result.rows[0].id]);
    const tags = tagsResult.rows.map(row => row.name);

    let title = result.rows[0].title;
    let excerpt = result.rows[0].excerpt;
    let content = result.rows[0].content;

    if (lang !== 'default') {
      const translations = await getTranslations('blog', result.rows[0].id, lang, tenantId);
      if (translations['title']?.value) title = translations['title'].value;
      if (translations['excerpt']?.value) excerpt = translations['excerpt'].value;
      if (translations['content']?.value) content = translations['content'].value;
    }

    // Format post data
    const post = {
      ...result.rows[0],
      title,
      excerpt,
      content,
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

// ===== WORDPRESS IMPORT ROUTE =====

// Import WordPress blog posts from XML or JSON export
router.post('/import/wordpress', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Read file content
    const fileContent = readFileSync(req.file.path, 'utf8');
    const fileExtension = req.file.originalname.toLowerCase().split('.').pop();

    // Parse file based on extension
    let parsedData;
    try {
      if (fileExtension === 'xml') {
        parsedData = parseWordPressXML(fileContent);
      } else if (fileExtension === 'json') {
        parsedData = parseWordPressJSON(fileContent);
      } else {
        return res.status(400).json({ error: 'Unsupported file format. Please upload .xml or .json file' });
      }
    } catch (parseError) {
      console.error('[testing] Error parsing WordPress file:', parseError);
      return res.status(400).json({ error: `Failed to parse file: ${parseError.message}` });
    }

    // Initialize summary
    const summary = {
      postsCreated: 0,
      postsUpdated: 0,
      categoriesCreated: 0,
      tagsCreated: 0,
      imagesDownloaded: 0,
      errors: []
    };

    // Extract and process categories
    const categoriesData = extractCategories(parsedData);
    const categoryMap = new Map(); // Map category name/slug to ID

    for (const catData of categoriesData) {
      try {
        const slug = catData.slug || catData.name.toLowerCase().replace(/\s+/g, '-');
        const category = await findOrCreateCategory(slug, {
          name: catData.name,
          description: catData.description || ''
        });
        categoryMap.set(catData.name, category.id);
        categoryMap.set(slug, category.id);
        if (category.id && !categoryMap.has(category.id)) {
          summary.categoriesCreated++;
        }
      } catch (error) {
        console.error('[testing] Error processing category:', catData.name, error);
        summary.errors.push(`Failed to process category "${catData.name}": ${error.message}`);
      }
    }

    // Extract and process tags
    const tagsData = extractTags(parsedData);
    const tagMap = new Map(); // Map tag name/slug to ID

    for (const tagData of tagsData) {
      try {
        const slug = tagData.slug || tagData.name.toLowerCase().replace(/\s+/g, '-');
        const tag = await findOrCreateTag(slug, {
          name: tagData.name,
          description: tagData.description || ''
        });
        tagMap.set(tagData.name, tag.id);
        tagMap.set(slug, tag.id);
        if (tag.id && !tagMap.has(tag.id)) {
          summary.tagsCreated++;
        }
      } catch (error) {
        console.error('[testing] Error processing tag:', tagData.name, error);
        summary.errors.push(`Failed to process tag "${tagData.name}": ${error.message}`);
      }
    }

    // Extract and process posts
    const postsData = extractPosts(parsedData);

    // Helper function to get or create category/tag from post
    const getOrCreateCategory = async (name) => {
      if (!name) return null;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (categoryMap.has(name) || categoryMap.has(slug)) {
        return categoryMap.get(name) || categoryMap.get(slug);
      }
      try {
        const category = await findOrCreateCategory(slug, { name, description: '' });
        categoryMap.set(name, category.id);
        categoryMap.set(slug, category.id);
        summary.categoriesCreated++;
        return category.id;
      } catch (error) {
        console.error('[testing] Error creating category from post:', name, error);
        return null;
      }
    };

    const getOrCreateTag = async (name) => {
      if (!name) return null;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (tagMap.has(name) || tagMap.has(slug)) {
        return tagMap.get(name) || tagMap.get(slug);
      }
      try {
        const tag = await findOrCreateTag(slug, { name, description: '' });
        tagMap.set(name, tag.id);
        tagMap.set(slug, tag.id);
        summary.tagsCreated++;
        return tag.id;
      } catch (error) {
        console.error('[testing] Error creating tag from post:', name, error);
        return null;
      }
    };

    for (const postData of postsData) {
      try {
        // Check if post exists by slug
        const existingPost = await Post.findOne({
          where: {
            slug: postData.slug,
            tenant_id: tenantId
          }
        });

        // Extract images from content
        const imageUrls = extractImages(postData.content);
        let updatedContent = postData.content;
        let imagesDownloaded = 0;

        // Download images if any
        if (imageUrls.length > 0) {
          try {
            const { imageMap, errors: imageErrors } = await downloadImages(imageUrls, tenantId);
            imagesDownloaded = Array.from(imageMap.values()).filter(url => url.startsWith('/uploads/')).length;
            summary.imagesDownloaded += imagesDownloaded;

            // Update content with local image URLs
            updatedContent = updateImageReferences(postData.content, imageMap);

            // Add image download errors to summary
            imageErrors.forEach(err => summary.errors.push(err));
          } catch (imageError) {
            console.error('[testing] Error downloading images for post:', postData.title, imageError);
            summary.errors.push(`Failed to download some images for post "${postData.title}"`);
          }
        }

        // Prepare post data
        const postPayload = {
          title: postData.title,
          slug: postData.slug,
          content: updatedContent,
          excerpt: postData.excerpt || '',
          status: postData.status === 'publish' ? 'published' : (postData.status || 'draft'),
          post_type: 'post',
          author_id: req.user?.id || 1,
          published_at: postData.publishedAt || null,
          tenant_id: tenantId
        };

        let post;
        if (existingPost) {
          // Update existing post
          await existingPost.update(postPayload);
          post = existingPost;
          summary.postsUpdated++;
        } else {
          // Create new post
          post = await Post.create(postPayload);
          summary.postsCreated++;
        }

        // Link categories - create if they don't exist
        const categoryIds = [];
        if (Array.isArray(postData.categories)) {
          for (const catName of postData.categories) {
            let catId = categoryMap.get(catName) || categoryMap.get(catName.toLowerCase().replace(/\s+/g, '-'));
            if (!catId) {
              catId = await getOrCreateCategory(catName);
            }
            if (catId && !categoryIds.includes(catId)) {
              categoryIds.push(catId);
            }
          }
        }
        if (categoryIds.length > 0) {
          await setPostCategories(post.id, categoryIds);
        }

        // Link tags - create if they don't exist
        const tagIds = [];
        if (Array.isArray(postData.tags)) {
          for (const tagName of postData.tags) {
            let tagId = tagMap.get(tagName) || tagMap.get(tagName.toLowerCase().replace(/\s+/g, '-'));
            if (!tagId) {
              tagId = await getOrCreateTag(tagName);
            }
            if (tagId && !tagIds.includes(tagId)) {
              tagIds.push(tagId);
            }
          }
        }
        if (tagIds.length > 0) {
          await setPostTags(post.id, tagIds);
        }

      } catch (error) {
        console.error('[testing] Error processing post:', postData.title, error);
        summary.errors.push(`Failed to process post "${postData.title}": ${error.message}`);
      }
    }

    // Clean up uploaded file
    try {
      const { unlinkSync } = await import('fs');
      unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('[testing] Error cleaning up uploaded file:', cleanupError);
    }

    res.json({
      success: true,
      summary: summary
    });

  } catch (error) {
    console.error('[testing] Error importing WordPress file:', error);
    res.status(500).json({
      error: 'Failed to import WordPress file',
      message: error.message
    });
  }
});

// Note: Server-rendered page route (/r/:slug) is handled in routes/index.js
// at the root level to avoid /api prefix

export default router;

