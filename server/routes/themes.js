import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { syncThemesFromFileSystem, getAllThemes, getThemeBySlug, getThemesFromFileSystem, createTheme, syncThemePages } from '../../sparti-cms/services/themeSync.js';
import { query } from '../../sparti-cms/db/index.js';
import { generateThemeApiKey } from '../../sparti-cms/db/tenant-management.js';

const router = express.Router();

/**
 * GET /api/themes
 * List all active themes
 * Public endpoint - no authentication required
 * Falls back to file system if database is not available
 */
router.get('/', async (req, res) => {
  try {
    let themes = [];
    let fromFilesystem = false;
    
    try {
      // Try to get themes from database first
      themes = await getAllThemes();
    } catch (dbError) {
      // If database fails, fall back to file system
      console.log('[testing] Database query failed, using file system themes:', dbError.message);
      themes = getThemesFromFileSystem();
      fromFilesystem = true;
    }
    
    // If database returned empty array, try file system as fallback
    if (themes.length === 0) {
      console.log('[testing] No themes in database, checking file system...');
      const fsThemes = getThemesFromFileSystem();
      if (fsThemes.length > 0) {
        themes = fsThemes;
        fromFilesystem = true;
      }
    }
    
    res.json({
      success: true,
      themes: themes,
      total: themes.length,
      from_filesystem: fromFilesystem
    });
  } catch (error) {
    console.error('[testing] Error fetching themes:', error);
    // Last resort: try file system
    try {
      const fsThemes = getThemesFromFileSystem();
      res.json({
        success: true,
        themes: fsThemes,
        total: fsThemes.length,
        from_filesystem: true
      });
    } catch (fsError) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch themes',
        message: error.message
      });
    }
  }
});

/**
 * GET /api/themes/:slug
 * Get theme by slug
 * Public endpoint - no authentication required
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const theme = await getThemeBySlug(slug);
    
    if (!theme) {
      return res.status(404).json({
        success: false,
        error: 'Theme not found',
        code: 'THEME_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      theme: theme
    });
  } catch (error) {
    console.error('[testing] Error fetching theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch theme',
      message: error.message
    });
  }
});

/**
 * POST /api/themes/sync
 * Manually trigger theme sync from file system
 * Requires authentication and super admin privileges
 */
router.post('/sync', authenticateUser, async (req, res) => {
  try {
    // Check if user is super admin
    if (!req.user || !req.user.is_super_admin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only super admins can sync themes'
      });
    }

    const syncResult = await syncThemesFromFileSystem();
    
    // Also sync pages for each theme
    let pagesSynced = 0;
    const pageSyncResults = [];
    
    if (syncResult.success && syncResult.results) {
      for (const themeResult of syncResult.results) {
        if (themeResult.action === 'created' || themeResult.action === 'updated') {
          try {
            const pageSyncResult = await syncThemePages(themeResult.slug);
            if (pageSyncResult.success) {
              pagesSynced += pageSyncResult.synced;
              pageSyncResults.push({
                theme: themeResult.slug,
                pages: pageSyncResult
              });
            }
          } catch (error) {
            console.error(`[testing] Error syncing pages for theme ${themeResult.slug}:`, error);
          }
        }
      }
    }
    
    if (syncResult.success) {
      res.json({
        success: true,
        message: syncResult.message,
        synced: syncResult.synced,
        total: syncResult.total,
        results: syncResult.results,
        pagesSynced: pagesSynced,
        pageSyncResults: pageSyncResults
      });
    } else {
      res.status(500).json({
        success: false,
        error: syncResult.error,
        message: syncResult.message
      });
    }
  } catch (error) {
    console.error('[testing] Error syncing themes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync themes',
      message: error.message
    });
  }
});

/**
 * POST /api/themes
 * Create a new theme (folder + database entry)
 * Requires authentication and super admin privileges
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    // Check if user is super admin
    if (!req.user || !req.user.is_super_admin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only super admins can create themes'
      });
    }

    const { slug, name, description } = req.body;

    // Validate required fields
    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Slug is required',
        message: 'Theme slug (folder name) is required'
      });
    }

    // Create theme
    const theme = await createTheme(slug, name, description);

    res.status(201).json({
      success: true,
      theme: theme,
      message: 'Theme created successfully'
    });
  } catch (error) {
    console.error('[testing] Error creating theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create theme',
      message: error.message
    });
  }
});

/**
 * PUT /api/themes/:id
 * Update theme metadata
 * Requires authentication and super admin privileges
 */
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    // Check if user is super admin
    if (!req.user || !req.user.is_super_admin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only super admins can update themes'
      });
    }

    const { id } = req.params;
    const { name, description, is_active } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(`
      UPDATE themes
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} OR slug = $${paramIndex}
      RETURNING id, name, slug, description, created_at, updated_at, is_active
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Theme not found'
      });
    }

    res.json({
      success: true,
      theme: result.rows[0],
      message: 'Theme updated successfully'
    });
  } catch (error) {
    console.error('[testing] Error updating theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update theme',
      message: error.message
    });
  }
});

/**
 * POST /api/themes/:themeId/api-keys
 * Generate API key for a theme
 * Requires authentication
 */
router.post('/:themeId/api-keys', authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const { description } = req.body;
    
    const result = await generateThemeApiKey(themeId, description || 'API Key from Developer Section');
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    res.json({ apiKey: result.apiKey });
  } catch (error) {
    console.error(`[testing] Error generating API key for theme ${req.params.themeId}:`, error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

export default router;

