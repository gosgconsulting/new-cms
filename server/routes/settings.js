import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getBrandingSettings,
  updateMultipleBrandingSettings,
  getSiteSettingByKey,
  updateSiteSettingByKey,
  getsitesettingsbytenant,
  getThemeSettings,
  getCustomCodeSettings,
  updateCustomCodeSettings
} from '../../sparti-cms/db/index.js';
import { invalidateAll } from '../../sparti-cms/cache/index.js';
import languageManagementService from '../../sparti-cms/services/languageManagementService.js';

const router = express.Router();

// ===== BRANDING ROUTES =====

// Get branding settings
router.get('/branding', authenticateUser, async (req, res) => {
  try {
    // Get tenant ID from req.tenantId (set by auth middleware), query parameter, user context, or default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    // Get theme ID from req.themeSlug (set by theme middleware), query parameter, or null
    const themeId = req.themeSlug || req.query.themeId || null;
    console.log(`[testing] API: Getting branding settings for tenant: ${tenantId}, theme: ${themeId}`);
    const settings = await getBrandingSettings(tenantId, themeId);
    res.json(settings);
  } catch (error) {
    console.error('[testing] API: Error getting branding settings:', error);
    res.status(500).json({ error: 'Failed to get branding settings' });
  }
});

// Update branding settings
router.post('/branding', authenticateUser, async (req, res) => {
  try {
    // Get tenant ID from req.tenantId (set by auth middleware), query parameter, user context, or default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    // Get theme ID from req.themeSlug (set by theme middleware), query parameter, request body, or null
    const themeId = req.themeSlug || req.query.themeId || req.body.themeId || null;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to update branding settings' });
    }
    
    console.log(`[testing] API: Updating branding settings for tenant: ${tenantId}, theme: ${themeId}`, req.body);
    
    // Verify tenant exists
    const { query } = await import('../../sparti-cms/db/index.js');
    const tenantCheck = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({ error: `Tenant '${tenantId}' not found` });
    }
    
    await updateMultipleBrandingSettings(req.body, tenantId, themeId);
    // Smart invalidation: settings can affect many pages; clear all for now
    try { invalidateAll(); } catch (e) { /* no-op */ }
    res.json({ success: true, message: 'Branding settings updated successfully' });
  } catch (error) {
    console.error('[testing] API: Error updating branding settings:', error);
    console.error('[testing] Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack
    });
    
    if (error.message && (error.message.includes('master') || error.message.includes('Tenant ID is required'))) {
      return res.status(403).json({ error: error.message });
    }
    
    // Provide more detailed error message
    let errorMessage = error.message || 'Failed to update branding settings';
    if (error.code === '23505' || error.constraint) {
      errorMessage = `Database constraint violation: ${error.detail || errorMessage}. This may indicate a duplicate setting.`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      code: error.code,
      constraint: error.constraint
    });
  }
});

// ===== LANGUAGE ROUTES =====

// Add language
router.post('/language/add', authenticateUser, async (req, res) => {
  try {
    const { languageCode } = req.body;
    if (!languageCode) {
      return res.status(400).json({ success: false, message: 'Language code is required' });
    }
    
    // Get tenant ID from req.tenantId (set by auth middleware), query parameter, user context, or default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Adding language ${languageCode} for tenant: ${tenantId}`);
    
    const result = await languageManagementService.addLanguage(languageCode, tenantId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[testing] API: Error adding language:', error);
    res.status(500).json({ success: false, message: 'Failed to add language' });
  }
});

// Remove language
router.post('/language/remove', authenticateUser, async (req, res) => {
  try {
    const { languageCode } = req.body;
    if (!languageCode) {
      return res.status(400).json({ success: false, message: 'Language code is required' });
    }
    
    // Get tenant ID from req.tenantId (set by auth middleware), query parameter, user context, or default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Removing language ${languageCode} for tenant: ${tenantId}`);
    
    const result = await languageManagementService.removeLanguage(languageCode, tenantId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[testing] API: Error removing language:', error);
    res.status(500).json({ success: false, message: 'Failed to remove language' });
  }
});

// Set default language
router.post('/language/set-default', authenticateUser, async (req, res) => {
  try {
    const { languageCode, fromAdditionalLanguages } = req.body;
    if (!languageCode) {
      return res.status(400).json({ success: false, message: 'Language code is required' });
    }
    
    // Get tenant ID from req.tenantId (set by auth middleware), query parameter, user context, or default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Setting default language ${languageCode} for tenant: ${tenantId}`);
    
    const result = await languageManagementService.setDefaultLanguage(
      languageCode, 
      tenantId, 
      fromAdditionalLanguages === true
    );
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[testing] API: Error setting default language:', error);
    res.status(500).json({ success: false, message: 'Failed to set default language' });
  }
});

// ===== SITE SETTINGS ROUTES =====

// Get site setting by key
router.get('/site-settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    // Get tenant ID from req.tenantId (set by auth middleware), query parameter, user context, or default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    // Get theme ID from query parameter (optional for backward compatibility)
    const themeId = req.query.themeId || null;
    console.log(`[testing] API: Getting site setting for key: ${key}, tenant: ${tenantId}, theme: ${themeId}`);
    
    const setting = await getSiteSettingByKey(key, tenantId, themeId);
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    console.log(`[testing] Found site setting:`, setting);
    res.json(setting);
  } catch (error) {
    console.error(`[testing] API: Error getting site setting for key ${req.params.key}:`, error);
    res.status(500).json({ error: 'Failed to get site setting' });
  }
});

// Get all site settings by tenant
router.get('/site-settings-by-tenant/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    console.log(`[testing] API: Getting all site settings for tenant: ${tenantId}`);
    
    const settings = await getsitesettingsbytenant(tenantId);
    
    console.log(`[testing] Found ${settings.length} site settings for tenant ${tenantId}`);
    res.json(settings);
  } catch (error) {
    console.error(`[testing] API: Error getting site settings for tenant ${req.params.tenantId}:`, error);
    res.status(500).json({ error: 'Failed to get site settings for tenant' });
  }
});

// Specific endpoint for tenant-gosg site settings (for testing)
router.get('/tenant-gosg-settings', async (req, res) => {
  try {
    console.log('[testing] API: Getting all site settings for tenant-gosg');
    
    const settings = await getsitesettingsbytenant('tenant-gosg');
    
    console.log(`[testing] Found ${settings.length} site settings for tenant-gosg`);
    res.json(settings);
  } catch (error) {
    console.error('[testing] API: Error getting site settings for tenant-gosg:', error);
    res.status(500).json({ error: 'Failed to get site settings for tenant-gosg' });
  }
});

// Update site setting by key
router.put('/site-settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { setting_value, setting_type, setting_category, themeId } = req.body;
    // Get tenant ID from req.tenantId (set by auth middleware), query parameter, user context, or default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    // Get theme ID from body or query parameter (optional for backward compatibility)
    const theme_id = themeId || req.query.themeId || null;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to update settings' });
    }
    
    console.log(`[testing] API: Updating site setting for key: ${key}, tenant: ${tenantId}, theme: ${theme_id}`, req.body);
    
    const result = await updateSiteSettingByKey(
      key, 
      setting_value, 
      setting_type || 'text', 
      setting_category || 'general',
      tenantId,
      theme_id
    );
    
    res.json(result);
  } catch (error) {
    console.error(`[testing] API: Error updating site setting for key ${req.params.key}:`, error);
    if (error.message && (error.message.includes('master') || error.message.includes('Tenant ID is required'))) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Failed to update site setting' });
  }
});

// ===== THEME SETTINGS ROUTES =====

// Get all settings for a theme
router.get('/theme/:themeId', authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Getting all settings for tenant: ${tenantId}, theme: ${themeId}`);
    
    const settings = await getThemeSettings(tenantId, themeId);
    res.json(settings);
  } catch (error) {
    console.error(`[testing] API: Error getting theme settings:`, error);
    res.status(500).json({ error: 'Failed to get theme settings' });
  }
});

// Get branding settings for a theme
router.get('/theme/:themeId/branding', authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Getting branding settings for tenant: ${tenantId}, theme: ${themeId}`);
    
    const settings = await getBrandingSettings(tenantId, themeId);
    res.json(settings.branding || {});
  } catch (error) {
    console.error(`[testing] API: Error getting theme branding:`, error);
    res.status(500).json({ error: 'Failed to get theme branding' });
  }
});

// Get localization settings for a theme
router.get('/theme/:themeId/localization', authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Getting localization settings for tenant: ${tenantId}, theme: ${themeId}`);
    
    const settings = await getBrandingSettings(tenantId, themeId);
    res.json(settings.localization || {});
  } catch (error) {
    console.error(`[testing] API: Error getting theme localization:`, error);
    res.status(500).json({ error: 'Failed to get theme localization' });
  }
});

// Get style settings for a theme
router.get('/theme/:themeId/styles', authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Getting style settings for tenant: ${tenantId}, theme: ${themeId}`);
    
    const setting = await getSiteSettingByKey('theme_styles', tenantId, themeId);
    if (setting && setting.setting_value) {
      try {
        const styles = typeof setting.setting_value === 'string' 
          ? JSON.parse(setting.setting_value) 
          : setting.setting_value;
        res.json(styles);
      } catch (e) {
        res.json({});
      }
    } else {
      res.json({});
    }
  } catch (error) {
    console.error(`[testing] API: Error getting theme styles:`, error);
    res.status(500).json({ error: 'Failed to get theme styles' });
  }
});

// Update specific setting for a theme
router.put('/theme/:themeId/:key', authenticateUser, async (req, res) => {
  try {
    const { themeId, key } = req.params;
    const { setting_value, setting_type, setting_category } = req.body;
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    
    console.log(`[testing] API: Updating setting ${key} for tenant: ${tenantId}, theme: ${themeId}`, {
      setting_type,
      setting_category,
      valueLength: setting_value?.length
    });
    
    // Ensure we always return JSON, even on error
    try {
      const result = await updateSiteSettingByKey(
        key,
        setting_value,
        setting_type || 'text',
        setting_category || 'general',
        tenantId,
        themeId
      );
      
      console.log(`[testing] API: Successfully updated setting ${key}`, {
        id: result?.id,
        hasValue: !!result?.setting_value
      });
      
      res.json(result);
    } catch (dbError) {
      console.error(`[testing] API: Database error updating setting ${key}:`, dbError);
      
      // Check if it's a schema issue
      if (dbError.message?.includes('column') || dbError.message?.includes('does not exist')) {
        res.status(500).json({ 
          error: 'Database schema error',
          message: 'The site_settings table is missing required columns. Please run the migration: sparti-cms/db/migrations/create-site-settings-schema.sql',
          details: dbError.message,
          migrationFile: 'sparti-cms/db/migrations/create-site-settings-schema.sql'
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to update theme setting',
          message: dbError.message || 'Unknown database error',
          details: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
        });
      }
    }
  } catch (error) {
    console.error(`[testing] API: Error updating theme setting:`, error);
    // Ensure we always return JSON
    res.status(500).json({ 
      error: 'Failed to update theme setting',
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Sync all settings to theme (placeholder for future file sync)
router.post('/theme/:themeId/sync', authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Syncing settings for tenant: ${tenantId}, theme: ${themeId}`);
    
    // For now, just return success - file sync will be implemented later
    res.json({ 
      success: true, 
      message: 'Settings sync initiated (database integration complete, file sync coming soon)',
      tenantId,
      themeId
    });
  } catch (error) {
    console.error(`[testing] API: Error syncing theme settings:`, error);
    res.status(500).json({ error: 'Failed to sync theme settings' });
  }
});

// ===== CUSTOM CODE ROUTES =====

// Get custom code settings (public endpoint for theme usage, requires tenantId query param)
router.get('/custom-code', async (req, res) => {
  try {
    // Get tenant ID from query parameter (required for public access)
    const tenantId = req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId query parameter is required' });
    }
    console.log(`[testing] API: Getting custom code settings for tenant: ${tenantId}`);
    const settings = await getCustomCodeSettings(tenantId);
    res.json(settings);
  } catch (error) {
    console.error('[testing] API: Error getting custom code settings:', error);
    res.status(500).json({ error: 'Failed to get custom code settings' });
  }
});

// Get custom code settings (authenticated endpoint for admin - fallback if no tenantId in query)
router.get('/custom-code/auth', authenticateUser, async (req, res) => {
  try {
    // Get tenant ID from req.tenantId (set by auth middleware), query parameter, user context, or default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Getting custom code settings for tenant: ${tenantId}`);
    const settings = await getCustomCodeSettings(tenantId);
    res.json(settings);
  } catch (error) {
    console.error('[testing] API: Error getting custom code settings:', error);
    res.status(500).json({ error: 'Failed to get custom code settings' });
  }
});

// Update custom code settings
router.post('/custom-code', authenticateUser, async (req, res) => {
  try {
    // Get tenant ID from req.tenantId (set by auth middleware), query parameter, user context, or default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to update custom code settings' });
    }
    
    console.log(`[testing] API: Updating custom code settings for tenant: ${tenantId}`, req.body);
    
    // Verify tenant exists
    const { query } = await import('../../sparti-cms/db/index.js');
    const tenantCheck = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({ error: `Tenant '${tenantId}' not found` });
    }
    
    await updateCustomCodeSettings(req.body, tenantId);
    // Smart invalidation: settings can affect many pages; clear all for now
    try { invalidateAll(); } catch (e) { /* no-op */ }
    res.json({ success: true, message: 'Custom code settings updated successfully' });
  } catch (error) {
    console.error('[testing] API: Error updating custom code settings:', error);
    console.error('[testing] Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack
    });
    
    if (error.message && error.message.includes('Tenant ID is required')) {
      return res.status(403).json({ error: error.message });
    }
    
    // Provide more detailed error message
    let errorMessage = error.message || 'Failed to update custom code settings';
    if (error.code === '23505' || error.constraint) {
      errorMessage = `Database constraint violation: ${error.detail || errorMessage}. This may indicate a duplicate setting.`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      code: error.code,
      constraint: error.constraint
    });
  }
});

// ===== SITE SCHEMA ROUTES =====

// Get site schema
router.get('/site-schemas/:schemaKey', authenticateUser, async (req, res) => {
  try {
    const { schemaKey } = req.params;
    const tenantId = req.headers['x-tenant-id'];
    const language = req.query.language || 'default'; // Support language query parameter
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    const { getSiteSchema } = await import('../../sparti-cms/db/index.js');
    const schema = await getSiteSchema(schemaKey, tenantId, language);
    
    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    
    res.json({ success: true, schema, language });
  } catch (error) {
    console.error('[testing] Error fetching site schema:', error);
    res.status(500).json({ error: 'Failed to fetch site schema' });
  }
});

// Update site schema
router.put('/site-schemas/:schemaKey', authenticateUser, async (req, res) => {
  try {
    const { schemaKey } = req.params;
    const { schema, language } = req.body; // Support language in request body
    const tenantId = req.headers['x-tenant-id'];
    const schemaLanguage = language || 'default'; // Default to 'default' if not specified
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    if (!schema) {
      return res.status(400).json({ error: 'Schema data is required' });
    }
    
    const { updateSiteSchema } = await import('../../sparti-cms/db/index.js');
    await updateSiteSchema(schemaKey, schema, tenantId, schemaLanguage);
    
    res.json({ success: true, message: 'Schema updated successfully', language: schemaLanguage });
  } catch (error) {
    console.error('[testing] Error updating site schema:', error);
    res.status(500).json({ error: 'Failed to update site schema' });
  }
});

export default router;

