import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { authenticateUser } from '../middleware/auth.js';
import { getDatabaseState } from '../utils/database.js';
import { getThemePagesFromFileSystem } from '../../sparti-cms/services/themeSync.js';
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
  setPostTags
} from '../../sparti-cms/db/index.js';
import { invalidateBySlug } from '../../sparti-cms/cache/index.js';
import models, { sequelize } from '../../sparti-cms/db/sequelize/models/index.js';
import { Op } from 'sequelize';
const { Post, Category, Tag } = models;

const router = express.Router();

// ===== PAGES ROUTES =====

// Get all pages
router.get('/pages/all', authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.query;
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
    
    console.log(`[testing] API: Sending response with ${validatedPages.length} validated page(s)`);
    console.log(`[testing] API: ==========================================`);
    
    res.json(response);
  } catch (error) {
    console.error('[testing] API: Error fetching pages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pages',
      message: error.message 
    });
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
    
    // Update category (preserve tenant_id unless explicitly changed by super admin)
    const updateData = { ...req.body };
    if (!req.user?.is_super_admin || !req.body.tenantId) {
      delete updateData.tenant_id; // Don't allow tenant_id changes unless super admin
    }
    
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
    
    // Update tag (preserve tenant_id unless explicitly changed by super admin)
    const updateData = { ...req.body };
    if (!req.user?.is_super_admin || !req.body.tenantId) {
      delete updateData.tenant_id; // Don't allow tenant_id changes unless super admin
    }
    
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
      twitter_description
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
      tenant_id: tenantId || null
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
      twitter_description
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
    
    res.json(updatedPost ? updatedPost.toJSON() : post.toJSON());
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

