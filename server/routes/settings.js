import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getBrandingSettings,
  updateMultipleBrandingSettings,
  getSiteSettingByKey,
  updateSiteSettingByKey,
  getsitesettingsbytenant
} from '../../sparti-cms/db/index.js';
import { invalidateAll } from '../../sparti-cms/cache/index.js';
import languageManagementService from '../../sparti-cms/services/languageManagementService.js';

const router = express.Router();

// ===== BRANDING ROUTES =====

// Get branding settings
router.get('/branding', authenticateUser, async (req, res) => {
  try {
    // Get tenant ID from query parameter, user context, or default to tenant-gosg
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Getting branding settings for tenant: ${tenantId}`);
    const settings = await getBrandingSettings(tenantId);
    res.json(settings);
  } catch (error) {
    console.error('[testing] API: Error getting branding settings:', error);
    res.status(500).json({ error: 'Failed to get branding settings' });
  }
});

// Update branding settings
router.post('/branding', authenticateUser, async (req, res) => {
  try {
    // Get tenant ID from query parameter, user context, or default to tenant-gosg
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Updating branding settings for tenant: ${tenantId}`, req.body);
    await updateMultipleBrandingSettings(req.body, tenantId);
    // Smart invalidation: settings can affect many pages; clear all for now
    try { invalidateAll(); } catch (e) { /* no-op */ }
    res.json({ success: true, message: 'Branding settings updated successfully' });
  } catch (error) {
    console.error('[testing] API: Error updating branding settings:', error);
    res.status(500).json({ error: 'Failed to update branding settings' });
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
    
    // Get tenant ID from query parameter, user context, or default to tenant-gosg
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
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
    
    // Get tenant ID from query parameter, user context, or default to tenant-gosg
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
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
    
    // Get tenant ID from query parameter, user context, or default to tenant-gosg
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
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
    // Get tenant ID from query parameter, user context, or default to tenant-gosg
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    console.log(`[testing] API: Getting site setting for key: ${key}, tenant: ${tenantId}`);
    
    const setting = await getSiteSettingByKey(key, tenantId);
    
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
    const { setting_value, setting_type, setting_category } = req.body;
    // Get tenant ID from query parameter, user context, or default to tenant-gosg
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    
    console.log(`[testing] API: Updating site setting for key: ${key}, tenant: ${tenantId}`, req.body);
    
    const result = await updateSiteSettingByKey(
      key, 
      setting_value, 
      setting_type || 'text', 
      setting_category || 'general',
      tenantId
    );
    
    res.json(result);
  } catch (error) {
    console.error(`[testing] API: Error updating site setting for key ${req.params.key}:`, error);
    res.status(500).json({ error: 'Failed to update site setting' });
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

