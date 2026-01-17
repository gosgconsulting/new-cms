import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import { authenticateUser } from '../middleware/auth.js';
import { syncThemesFromFileSystem, getAllThemes, getThemeBySlug, getThemesFromFileSystem, createTheme, syncThemePages, getDefaultLayoutForTheme, readThemePages } from '../../sparti-cms/services/themeSync.js';
import { query } from '../../sparti-cms/db/index.js';
import { generateThemeApiKey } from '../../sparti-cms/db/tenant-management.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getThemeAssetsDirs(themeSlug) {
  const projectRoot = path.join(__dirname, '..', '..');

  const themeAssetsDir = path.join(projectRoot, 'sparti-cms', 'theme', themeSlug, 'assets');
  const publicAssetsDir = path.join(projectRoot, 'public', 'theme', themeSlug, 'assets');

  return { themeAssetsDir, publicAssetsDir };
}

function listFilesRecursive(baseDir) {
  const results = [];
  if (!fs.existsSync(baseDir)) return results;

  const walk = (dir, prefix = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const abs = path.join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(abs, rel);
      } else {
        results.push(rel);
      }
    }
  };

  walk(baseDir);
  return results;
}

// Upload handler for theme assets
const themeAssetsUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const themeSlug = req.params.themeSlug;
        const { themeAssetsDir, publicAssetsDir } = getThemeAssetsDirs(themeSlug);
        ensureDir(themeAssetsDir);
        ensureDir(publicAssetsDir);
        cb(null, themeAssetsDir);
      } catch (e) {
        cb(e);
      }
    },
    filename: (req, file, cb) => {
      const original = file.originalname || 'file';
      const ext = path.extname(original);
      const base = path
        .basename(original, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 60);

      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${base || 'asset'}-${unique}${ext.toLowerCase()}`);
    },
  }),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

/**
 * GET /api/themes/:themeSlug/assets
 * List static assets for a theme.
 *
 * Returns URLs like: /theme/:themeSlug/assets/<file>
 */
router.get('/:themeSlug/assets', authenticateUser, async (req, res) => {
  try {
    if (!req.user?.is_super_admin) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const themeSlug = req.params.themeSlug;
    const { themeAssetsDir, publicAssetsDir } = getThemeAssetsDirs(themeSlug);

    // Prefer real theme folder, but fall back to public folder.
    const baseDir = fs.existsSync(themeAssetsDir) ? themeAssetsDir : publicAssetsDir;

    const files = listFilesRecursive(baseDir);

    const assets = files.map((filePath) => ({
      path: filePath,
      url: `/theme/${themeSlug}/assets/${filePath}`,
    }));

    return res.json({ success: true, theme: themeSlug, assets });
  } catch (error) {
    console.error('[testing] Error listing theme assets:', error);
    return res.status(500).json({ success: false, error: 'Failed to list theme assets' });
  }
});

/**
 * POST /api/themes/:themeSlug/assets/upload
 * Uploads a file into the theme assets folder.
 *
 * Writes to:
 * - sparti-cms/theme/:themeSlug/assets (server + production)
 * - public/theme/:themeSlug/assets (vite dev + fallback)
 */
router.post(
  '/:themeSlug/assets/upload',
  authenticateUser,
  (req, res, next) => {
    if (!req.user?.is_super_admin) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    return next();
  },
  themeAssetsUpload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const themeSlug = req.params.themeSlug;
      const { themeAssetsDir, publicAssetsDir } = getThemeAssetsDirs(themeSlug);
      ensureDir(themeAssetsDir);
      ensureDir(publicAssetsDir);

      // Copy to public folder so Vite dev can serve it.
      const srcPath = path.join(themeAssetsDir, req.file.filename);
      const destPath = path.join(publicAssetsDir, req.file.filename);
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (copyErr) {
        console.warn('[testing] Could not copy uploaded theme asset into public folder:', copyErr);
      }

      const url = `/theme/${themeSlug}/assets/${req.file.filename}`;

      return res.status(201).json({
        success: true,
        theme: themeSlug,
        filename: req.file.filename,
        originalName: req.file.originalname,
        url,
      });
    } catch (error) {
      console.error('[testing] Error uploading theme asset:', error);
      return res.status(500).json({ success: false, error: 'Failed to upload theme asset' });
    }
  }
);

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
 * POST /api/themes/:themeId/migrate-layouts
 * Create default layouts for pages that don't have them
 * Uses theme's default component structure for homepages
 * Requires authentication
 */
router.post('/:themeId/migrate-layouts', authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    console.log(`[testing] Migrating layouts for theme: ${themeId}`);
    
    // First, check if any pages exist for this theme
    const allPages = await query(`
      SELECT id, page_name, slug, theme_id
      FROM pages
      WHERE theme_id = $1
    `, [themeId]);
    
    console.log(`[testing] Found ${allPages.rows.length} page(s) for theme ${themeId}`);
    
    if (allPages.rows.length === 0) {
      // Try to sync pages from file system first
      console.log(`[testing] No pages found in database, attempting to sync from file system...`);
      try {
        const { syncThemePages } = await import('../../sparti-cms/services/themeSync.js');
        const syncResult = await syncThemePages(themeId);
        
        if (syncResult.success && syncResult.synced > 0) {
          console.log(`[testing] Synced ${syncResult.synced} page(s) from file system`);
          // Re-query pages after sync
          const recheckPages = await query(`
            SELECT id, page_name, slug, theme_id
            FROM pages
            WHERE theme_id = $1
          `, [themeId]);
          
          if (recheckPages.rows.length > 0) {
            // Continue with migration - pages were synced, now check layouts
            console.log(`[testing] Found ${recheckPages.rows.length} page(s) after sync, proceeding with migration`);
            // Re-query with layouts after sync
            const pagesWithLayoutsAfterSync = await query(`
              SELECT p.id, p.page_name, p.slug, pl.id as layout_id, pl.layout_json
              FROM pages p
              LEFT JOIN page_layouts pl ON p.id = pl.page_id AND pl.language = 'default'
              WHERE p.theme_id = $1
            `, [themeId]);
            
            // Use the newly synced pages for migration
            pagesWithoutLayouts.rows = pagesWithLayoutsAfterSync.rows;
          } else {
            return res.json({
              success: true,
              message: `No pages found for theme ${themeId} even after sync. Please check if pages.json exists in the theme folder.`,
              migrated: 0,
              total: 0,
              results: []
            });
          }
        } else {
          return res.json({
            success: true,
            message: `No pages found for theme ${themeId}. Please ensure pages.json exists in sparti-cms/theme/${themeId}/pages.json`,
            migrated: 0,
            total: 0,
            results: []
          });
        }
      } catch (syncError) {
        console.error(`[testing] Error syncing pages:`, syncError);
        return res.json({
          success: false,
          message: `No pages found and failed to sync: ${syncError.message}`,
          migrated: 0,
          total: 0,
          results: []
        });
      }
    }
    
    // Find all pages for this theme that don't have layouts OR have empty layouts
    // Re-query in case pages were just synced
    let pagesWithoutLayouts = await query(`
      SELECT p.id, p.page_name, p.slug, pl.id as layout_id, pl.layout_json
      FROM pages p
      LEFT JOIN page_layouts pl ON p.id = pl.page_id AND pl.language = 'default'
      WHERE p.theme_id = $1
    `, [themeId]);
    
    console.log(`[testing] Checking ${pagesWithoutLayouts.rows.length} page(s) for empty layouts`);
    
    // Filter pages that need migration (no layout or empty layout)
    const pagesToMigrate = pagesWithoutLayouts.rows.filter(page => {
      if (!page.layout_id) {
        console.log(`[testing] Page ${page.page_name} (${page.id}) has no layout - will create`);
        return true;
      }
      
      // Check if layout is empty
      let layoutJson = page.layout_json;
      
      // Handle different JSON formats
      if (typeof layoutJson === 'string') {
        try {
          layoutJson = JSON.parse(layoutJson);
        } catch (e) {
          console.log(`[testing] Page ${page.page_name} (${page.id}) has invalid layout JSON - will update`);
          return true;
        }
      }
      
      // Check if components array is empty or missing
      if (!layoutJson || !layoutJson.components || 
          (Array.isArray(layoutJson.components) && layoutJson.components.length === 0) ||
          (typeof layoutJson.components === 'string' && layoutJson.components === '[]')) {
        console.log(`[testing] Page ${page.page_name} (${page.id}) has empty layout - will update`);
        return true;
      }
      
      // Check if all components have empty props
      const hasContent = Array.isArray(layoutJson.components) && 
                        layoutJson.components.some(comp => {
                          return comp.props && Object.keys(comp.props).length > 0;
                        });
      
      if (!hasContent) {
        console.log(`[testing] Page ${page.page_name} (${page.id}) has components but no props - will update`);
        return true;
      }
      
      console.log(`[testing] Page ${page.page_name} (${page.id}) already has ${layoutJson.components.length} component(s) with content, skipping`);
      return false;
    });
    
    console.log(`[testing] Found ${pagesToMigrate.length} page(s) that need migration`);
    
    let migratedCount = 0;
    const results = [];
    
    for (const page of pagesToMigrate) {
      try {
        // Get default layout structure for this theme
        // For homepage (slug = '/'), use theme's default component structure
        // For other pages, use empty layout (can be customized later)
        let defaultLayout;
        if (page.slug === '/' || page.slug === '/home' || page.slug === '/index') {
          // Homepage: use theme's default component structure
          defaultLayout = getDefaultLayoutForTheme(themeId);
          console.log(`[testing] Creating default theme layout for homepage: ${themeId}`);
        } else {
          // Other pages: start with empty layout
          defaultLayout = { components: [] };
          console.log(`[testing] Creating empty layout for page: ${page.page_name}`);
        }
        
        if (page.layout_id) {
          // Update existing empty layout
          await query(`
            UPDATE page_layouts
            SET layout_json = $1, version = version + 1, updated_at = NOW()
            WHERE id = $2
          `, [JSON.stringify(defaultLayout), page.layout_id]);
        } else {
          // Insert new layout
          await query(`
            INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
            VALUES ($1, 'default', $2, 1, NOW())
            ON CONFLICT (page_id, language) DO UPDATE
            SET layout_json = EXCLUDED.layout_json, version = page_layouts.version + 1, updated_at = NOW()
          `, [page.id, JSON.stringify(defaultLayout)]);
        }
        
        migratedCount++;
        results.push({
          pageId: page.id,
          pageName: page.page_name,
          slug: page.slug,
          status: 'migrated',
          componentsCount: defaultLayout.components?.length || 0
        });
      } catch (error) {
        console.error(`[testing] Error migrating layout for page ${page.id}:`, error);
        results.push({
          pageId: page.id,
          pageName: page.page_name,
          slug: page.slug,
          status: 'error',
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Migrated ${migratedCount} layout(s) for theme ${themeId}`,
      migrated: migratedCount,
      total: pagesWithoutLayouts.rows.length,
      results: results
    });
  } catch (error) {
    console.error(`[testing] Error migrating layouts for theme ${req.params.themeId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to migrate layouts',
      message: error.message
    });
  }
});

/**
 * POST /api/themes/:themeId/api-keys
 * Generate API key for a theme
 * Requires authentication
 * This route must come before /:slug to avoid route conflicts
 */
router.post('/:themeId/api-keys', authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const { description } = req.body;
    
    console.log(`[testing] Generating API key for theme: ${themeId}`);
    
    const result = await generateThemeApiKey(themeId, description || 'API Key from Developer Section');
    
    if (!result.success) {
      console.error(`[testing] Failed to generate API key for theme ${themeId}:`, result.message);
      return res.status(404).json({ error: result.message });
    }
    
    console.log(`[testing] Successfully generated API key for theme: ${themeId}`);
    res.json({ apiKey: result.apiKey });
  } catch (error) {
    console.error(`[testing] Error generating API key for theme ${req.params.themeId}:`, error);
    res.status(500).json({ 
      error: 'Failed to generate API key',
      message: error.message || 'Unknown error occurred'
    });
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
    let settingsSynced = 0;
    
    if (syncResult.success && syncResult.results) {
      for (const themeResult of syncResult.results) {
        if (themeResult.action === 'created' || themeResult.action === 'updated') {
          try {
            // Sync pages for this theme
            const pageSyncResult = await syncThemePages(themeResult.slug);
            if (pageSyncResult.success) {
              pagesSynced += pageSyncResult.synced;
              pageSyncResults.push({
                theme: themeResult.slug,
                themeId: themeResult.id,
                pages: pageSyncResult
              });
            }
            
            // Ensure demo tenant has pages for this theme
            try {
              const { ensureDemoTenantHasThemePages } = await import('../../sparti-cms/services/themeSync.js');
              const themePages = readThemePages(themeResult.slug);
              if (themePages && themePages.length > 0) {
                await ensureDemoTenantHasThemePages(themeResult.slug, themePages);
              }
            } catch (demoError) {
              console.log(`[testing] Note: Could not ensure demo tenant pages for theme ${themeResult.slug}:`, demoError.message);
            }
          } catch (error) {
            console.error(`[testing] Error syncing pages for theme ${themeResult.slug}:`, error);
          }
          
          // Sync theme settings: Ensure all settings use the correct theme database ID
          try {
            const themeDbId = themeResult.id || themeResult.slug;
            const settingsUpdated = await query(`
              UPDATE site_settings
              SET theme_id = $1, updated_at = CURRENT_TIMESTAMP
              WHERE (theme_id = $2 OR theme_id IS NULL)
                AND setting_key IN ('theme_styles', 'site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon')
                AND theme_id != $1
              RETURNING id, setting_key
            `, [themeDbId, themeResult.slug]);
            
            if (settingsUpdated.rows.length > 0) {
              settingsSynced += settingsUpdated.rows.length;
              console.log(`[testing] Synced ${settingsUpdated.rows.length} setting(s) for theme ${themeResult.slug} (ID: ${themeDbId})`);
            }
          } catch (settingsError) {
            console.log(`[testing] Note: Could not sync settings for theme ${themeResult.slug}:`, settingsError.message);
          }
        }
      }
    }
    
    if (syncResult.success) {
      res.json({
        success: true,
        message: `${syncResult.message}. Synced ${pagesSynced} page(s) and ${settingsSynced} setting(s).`,
        synced: syncResult.synced,
        total: syncResult.total,
        results: syncResult.results,
        pagesSynced: pagesSynced,
        settingsSynced: settingsSynced,
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
    const { name, description, is_active, tags } = req.body;

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

    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(Array.isArray(tags) ? tags : [tags]);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    // Try to return tags if column exists
    let result;
    try {
      result = await query(`
        UPDATE themes
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex} OR slug = $${paramIndex}
        RETURNING id, name, slug, description, created_at, updated_at, is_active, tags
      `, values);
    } catch (tagsError) {
      // If tags column doesn't exist, return without it
      if (tagsError.message?.includes('column "tags"') || tagsError.code === '42703') {
        result = await query(`
          UPDATE themes
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex} OR slug = $${paramIndex}
          RETURNING id, name, slug, description, created_at, updated_at, is_active
        `, values);
      } else {
        throw tagsError;
      }
    }

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

export default router;