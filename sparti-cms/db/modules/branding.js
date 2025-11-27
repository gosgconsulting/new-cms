import { query } from '../connection.js';
import pool from '../connection.js';
import { translateText } from '../../services/googleTranslationService.js';
import models, { sequelize } from '../sequelize/models/index.js';
import { Op } from 'sequelize';
const { SiteSchema } = models;

// Branding-specific functions
export async function getBrandingSettings(tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type, setting_category, is_public, tenant_id
      FROM site_settings
      WHERE setting_category IN ('branding', 'seo', 'localization') 
        AND is_public = true
        AND tenant_id = $1
      ORDER BY setting_category, setting_key
    `, [tenantId]);
    
    // Convert to object format grouped by category
    const settings = {
      branding: {},
      seo: {},
      localization: {}
    };
    
    result.rows.forEach((row) => {
      const category = row.setting_category || 'branding';
      if (!settings[category]) settings[category] = {};
      settings[category][row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error(`Error fetching branding settings for tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function getPublicSEOSettings(tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type
      FROM site_settings
      WHERE is_public = true 
        AND (setting_category = 'seo' OR setting_key IN ('site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon'))
        AND tenant_id = $1
      ORDER BY setting_key
    `, [tenantId]);
    
    // Convert to flat object format for easy access
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error(`Error fetching public SEO settings for tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function updateBrandingSetting(key, value, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at, tenant_id)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      key, 
      value, 
      key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 'text',
      tenantId
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating branding setting for tenant ${tenantId}:`, error);
    throw error;
  }
}

// Helper function to extract translatable text from schema JSON
// Returns a map of paths to text values for translation
function extractTranslatableTextFromSchema(obj, path = '', result = {}) {
  if (obj === null || obj === undefined) {
    return result;
  }
  
  // Skip non-translatable fields
  const skipFields = ['id', 'src', 'link', 'url', 'image', 'images', 'avatar', 'logo', 'phoneNumber', 'email', 'date', 'rating', 'version', 'sort_order', 'sortOrder', 'level', 'required', 'value', 'type', 'key'];
  
  if (typeof obj === 'string') {
    // Only extract non-empty strings that aren't URLs or IDs
    if (obj.trim().length > 0 && 
        !obj.startsWith('http') && 
        !obj.startsWith('/') && 
        !obj.match(/^[a-zA-Z0-9_-]+$/)) {
      result[path] = obj;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      extractTranslatableTextFromSchema(item, path ? `${path}[${index}]` : `[${index}]`, result);
    });
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      // Skip certain fields that shouldn't be translated
      if (skipFields.includes(key.toLowerCase())) {
        return;
      }
      
      const newPath = path ? `${path}.${key}` : key;
      extractTranslatableTextFromSchema(obj[key], newPath, result);
    });
  }
  
  return result;
}

// Helper function to inject translated text back into schema JSON
function injectTranslatedTextIntoSchema(obj, translations, path = '') {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    // If this path has a translation, use it
    if (translations[path] !== undefined) {
      return translations[path];
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map((item, index) => {
      const itemPath = path ? `${path}[${index}]` : `[${index}]`;
      return injectTranslatedTextIntoSchema(item, translations, itemPath);
    });
  } else if (typeof obj === 'object') {
    const result = {};
    Object.keys(obj).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      result[key] = injectTranslatedTextIntoSchema(obj[key], translations, newPath);
    });
    return result;
  }
  
  return obj;
}

// Helper function to get configured languages from site_settings
async function getConfiguredLanguages(tenantId) {
  const languagesResult = await query(`
    SELECT setting_value 
    FROM site_settings 
    WHERE setting_key = 'site_content_languages' 
    AND tenant_id = $1
  `, [tenantId]);
  
  if (languagesResult.rows.length === 0 || !languagesResult.rows[0].setting_value) {
    return [];
  }
  
  // Parse the comma-separated language list
  const rawValue = languagesResult.rows[0].setting_value;
  if (rawValue.includes(',')) {
    return rawValue.split(',').filter(lang => lang.trim() !== '');
  } else if (rawValue.trim() !== '') {
    return [rawValue.trim()];
  }
  
  return [];
}

// Helper function to get default language from site_settings
async function getDefaultLanguage(tenantId) {
  const defaultLanguageResult = await query(`
    SELECT setting_value 
    FROM site_settings 
    WHERE setting_key = 'site_language' 
    AND tenant_id = $1
  `, [tenantId]);
  
  return defaultLanguageResult.rows.length > 0 ? 
    defaultLanguageResult.rows[0].setting_value : 'default';
}

// Helper function to get target languages (excluding default)
async function getTargetLanguages(tenantId) {
  const allLanguages = await getConfiguredLanguages(tenantId);
  
  if (allLanguages.length === 0) {
    return [];
  }
  
  const defaultLanguage = await getDefaultLanguage(tenantId);
  
  // Filter out the default language (don't translate to itself)
  return allLanguages.filter(lang => lang !== defaultLanguage && lang !== 'default');
}

// Helper function to ensure language column exists (migration safety)
async function ensureSiteSchemaLanguageColumn() {
  try {
    await query(`
      ALTER TABLE site_schemas 
      ADD COLUMN IF NOT EXISTS language VARCHAR(50) NOT NULL DEFAULT 'default'
    `);
  } catch (error) {
    // Column already exists, ignore
    if (error.code !== '42701' && !error.message.includes('already exists')) {
      console.log('[testing] Note: Could not ensure language column exists:', error.message);
    }
  }
}

// Helper function to ensure composite unique constraint exists (migration safety)
async function ensureSiteSchemaUniqueConstraint() {
  try {
    const constraintCheck = await query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'site_schemas' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'site_schemas_schema_key_tenant_id_language_unique'
    `);
    
    if (constraintCheck.rows.length === 0) {
      // Check if old constraint exists and drop it
      const oldConstraintCheck = await query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'site_schemas' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%schema_key%'
        AND constraint_name LIKE '%tenant_id%'
        AND constraint_name NOT LIKE '%language%'
      `);
      
      for (const constraint of oldConstraintCheck.rows) {
        await query(`
          ALTER TABLE site_schemas 
          DROP CONSTRAINT IF EXISTS ${constraint.constraint_name}
        `);
      }
      
      // Add new composite unique constraint
      await query(`
        ALTER TABLE site_schemas 
        ADD CONSTRAINT site_schemas_schema_key_tenant_id_language_unique UNIQUE (schema_key, tenant_id, language)
      `);
      console.log('[testing] Added composite unique constraint for site_schemas');
    }
  } catch (error) {
    console.log('[testing] Note: Could not ensure composite unique constraint exists:', error.message);
  }
}

// Helper function to update existing schema
async function updateExistingSchema(schemaKey, schemaValue, language, tenantId) {
  const updateResult = await query(`
    UPDATE site_schemas 
    SET 
      schema_value = $2,
      updated_at = NOW()
    WHERE schema_key = $1 AND tenant_id = $3 AND language = $4
  `, [schemaKey, JSON.stringify(schemaValue), tenantId, language]);
  
  return updateResult.rowCount > 0;
}

// Helper function to insert new schema
async function insertNewSchema(schemaKey, schemaValue, language, tenantId) {
  await query(`
    INSERT INTO site_schemas (schema_key, schema_value, language, tenant_id, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
  `, [schemaKey, JSON.stringify(schemaValue), language, tenantId]);
}

// Helper function to translate all text fields for a single language
async function translateSchemaTextFields(textMap, targetLanguage, defaultLanguage) {
  const translations = {};
  const textPaths = Object.keys(textMap);
  
  for (const textPath of textPaths) {
    const originalText = textMap[textPath];
    try {
      const translatedText = await translateText(originalText, targetLanguage, defaultLanguage);
      translations[textPath] = translatedText;
      console.log(`[testing] Translated schema text ${textPath}: "${originalText.substring(0, 50)}..." -> "${translatedText.substring(0, 50)}..."`);
    } catch (error) {
      console.error(`[testing] Error translating schema text at path ${textPath}:`, error);
      // Use original text if translation fails
      translations[textPath] = originalText;
    }
  }
  
  return translations;
}

// Helper function to translate schema to a single target language
async function translateSchemaToLanguage(schemaKey, schemaValue, targetLanguage, defaultLanguage, tenantId, textMap) {
  try {
    console.log(`[testing] Translating schema ${schemaKey} to ${targetLanguage}...`);
    
    // Translate all text fields
    const translations = await translateSchemaTextFields(textMap, targetLanguage, defaultLanguage);
    
    // Inject translated text back into schema
    const translatedSchema = injectTranslatedTextIntoSchema(schemaValue, translations);
    
    // Upsert the translated schema
    await upsertSiteSchema(schemaKey, translatedSchema, targetLanguage, tenantId);
    
    console.log(`[testing] Successfully translated and saved schema ${schemaKey} for language ${targetLanguage}`);
  } catch (error) {
    console.error(`[testing] Error translating schema ${schemaKey} to ${targetLanguage}:`, error);
    throw error; // Re-throw to let caller handle
  }
}

// Helper function to translate schema to all configured languages
async function translateSchemaToAllLanguages(schemaKey, schemaValue, tenantId) {
  try {
    console.log(`[testing] Starting translation for schema ${schemaKey} and tenant ${tenantId}`);
    
    // Get target languages
    const targetLanguages = await getTargetLanguages(tenantId);
    
    if (targetLanguages.length === 0) {
      console.log(`[testing] No target languages to translate to, skipping translation`);
      return;
    }
    
    console.log(`[testing] Translating to ${targetLanguages.length} languages: ${targetLanguages.join(', ')}`);
    
    // Extract translatable text from schema
    const textMap = extractTranslatableTextFromSchema(schemaValue);
    const textPaths = Object.keys(textMap);
    
    if (textPaths.length === 0) {
      console.log(`[testing] No translatable text found in schema, skipping translation`);
      return;
    }
    
    console.log(`[testing] Found ${textPaths.length} translatable text fields`);
    
    // Get default language for translation
    const defaultLanguage = await getDefaultLanguage(tenantId);
    
    // Translate to each target language
    for (const targetLanguage of targetLanguages) {
      try {
        await translateSchemaToLanguage(schemaKey, schemaValue, targetLanguage, defaultLanguage, tenantId, textMap);
      } catch (error) {
        // Continue with other languages even if one fails
        console.error(`[testing] Failed to translate schema ${schemaKey} to ${targetLanguage}, continuing with other languages`);
      }
    }
    
    console.log(`[testing] Completed translation process for schema ${schemaKey}`);
  } catch (error) {
    console.error(`[testing] Error in translateSchemaToAllLanguages:`, error);
    // Don't throw - this is a background process
  }
}

// Helper function to upsert site schema (update or insert)
async function upsertSiteSchema(schemaKey, schemaValue, language, tenantId) {
  let operationSuccessful = false;
  
  // Try to update existing schema first
  const wasUpdated = await updateExistingSchema(schemaKey, schemaValue, language, tenantId);
  
  if (wasUpdated) {
    operationSuccessful = true;
  } else {
    // If no rows were updated, check if schema exists
    const existingCheck = await query(`
      SELECT id FROM site_schemas WHERE schema_key = $1 AND tenant_id = $2 AND language = $3
    `, [schemaKey, tenantId, language]);
    
    if (existingCheck.rows.length === 0) {
      // Insert new schema
      await insertNewSchema(schemaKey, schemaValue, language, tenantId);
      operationSuccessful = true;
    } else {
      // Schema exists but update didn't work, try update again
      const wasUpdatedRetry = await updateExistingSchema(schemaKey, schemaValue, language, tenantId);
      operationSuccessful = wasUpdatedRetry;
    }
  }
  
  // After successful operation on default language, trigger translation to other languages
  if (operationSuccessful && language === 'default' && tenantId) {
    // Call translation asynchronously (fire and forget) to avoid blocking
    translateSchemaToAllLanguages(schemaKey, schemaValue, tenantId).catch(error => {
      console.error(`[testing] Error in background translation for schema ${schemaKey}:`, error);
    });
  }
}

// Site Schema functions
export async function getSiteSchema(schemaKey, tenantId, language = 'default') {
  try {
    // Ensure database schema is up to date (migration safety)
    await ensureSiteSchemaLanguageColumn();
    
    // Use Sequelize to fetch the schema
    // Try to find schema with specified language, or fallback to 'default'
    const siteSchema = await SiteSchema.findOne({
      where: {
        schema_key: schemaKey,
        tenant_id: tenantId,
        [Op.or]: [
          { language: language },
          { language: 'default' }
        ]
      },
      order: [
        // Prefer the specified language over 'default'
        [sequelize.literal(`CASE WHEN language = '${language}' THEN 0 ELSE 1 END`), 'ASC']
      ]
    });
    
    if (!siteSchema) {
      return null;
    }
    
    // Get the schema value (Sequelize handles JSONB parsing automatically)
    const schemaValue = siteSchema.schema_value;
    return typeof schemaValue === 'string' ? JSON.parse(schemaValue) : schemaValue;
  } catch (error) {
    console.error('Error fetching site schema:', error);
    throw error;
  }
}

export async function updateSiteSchema(schemaKey, schemaValue, tenantId, language = 'default') {
  try {
    // Ensure database schema is up to date (migration safety)
    await ensureSiteSchemaLanguageColumn();
    await ensureSiteSchemaUniqueConstraint();
    
    // Update or insert the schema (pass tenantId for translation support)
    await upsertSiteSchema(schemaKey, schemaValue, language, tenantId);
    
    return true;
  } catch (error) {
    console.error('Error updating site schema:', error);
    throw error;
  }
}

export async function updateMultipleBrandingSettings(settings, tenantId = 'tenant-gosg') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const [key, value] of Object.entries(settings)) {
      const settingType = key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 
                         key.includes('description') ? 'textarea' : 'text';
      
      await client.query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at, tenant_id)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
        ON CONFLICT (setting_key, tenant_id) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `, [key, value, settingType, tenantId]);
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error updating multiple branding settings for tenant ${tenantId}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getsitesettingsbytenant(tenantId) {
  try {
    const result = await query(`
      SELECT * FROM site_settings WHERE tenant_id = $1
    `, [tenantId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching site settings by tenant:', error);
    throw error;
  }
}

// Site Settings functions
export async function getSiteSettingByKey(key, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type, setting_category, is_public, tenant_id
      FROM site_settings
      WHERE setting_key = $1 AND tenant_id = $2
      LIMIT 1
    `, [key, tenantId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error fetching site setting for key ${key} and tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function updateSiteSettingByKey(key, value, type = 'text', category = 'general', tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, updated_at, tenant_id)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        setting_type = COALESCE(EXCLUDED.setting_type, site_settings.setting_type),
        setting_category = COALESCE(EXCLUDED.setting_category, site_settings.setting_category),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [key, value, type, category, tenantId]);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating site setting for key ${key} and tenant ${tenantId}:`, error);
    throw error;
  }
}

// SEO-specific functions
export async function updateSEOSettings(seoData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const seoSettings = {
      meta_title: seoData.meta_title,
      meta_description: seoData.meta_description,
      meta_keywords: seoData.meta_keywords,
      meta_author: seoData.meta_author,
      og_title: seoData.og_title,
      og_description: seoData.og_description,
      og_image: seoData.og_image,
      og_type: seoData.og_type,
      twitter_card: seoData.twitter_card,
      twitter_site: seoData.twitter_site,
      twitter_image: seoData.twitter_image
    };
    
    for (const [key, value] of Object.entries(seoSettings)) {
      if (value !== undefined) {
        const settingType = key.includes('image') ? 'media' : 
                           key.includes('description') ? 'textarea' : 'text';
        
        await client.query(`
          INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, updated_at)
          VALUES ($1, $2, $3, 'seo', true, CURRENT_TIMESTAMP)
          ON CONFLICT (setting_key) 
          DO UPDATE SET 
            setting_value = EXCLUDED.setting_value,
            updated_at = CURRENT_TIMESTAMP
        `, [key, value, settingType]);
      }
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating SEO settings:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Media migration functions (these depend on createMediaItem which may be in another module)
export async function migrateLogoToDatabase(logoPath, altText = 'Site Logo') {
  try {
    // Try to import createMediaItem if it exists
    const { createMediaItem } = await import('../media-management.js').catch(() => ({}));
    if (!createMediaItem) {
      throw new Error('createMediaItem function not found');
    }
    
    // Create media item for logo
    const logoMediaData = {
      filename: 'site-logo.png',
      original_filename: 'go-sg-logo-official.png',
      alt_text: altText,
      title: 'Site Logo',
      description: 'Main site logo',
      url: logoPath,
      relative_path: logoPath,
      mime_type: 'image/png',
      file_extension: 'png',
      file_size: 50000, // Estimated size
      media_type: 'image',
      folder_id: null, // Will be assigned to logos folder
      is_featured: true,
      seo_optimized: true
    };
    
    const logoMedia = await createMediaItem(logoMediaData);
    
    // Update site_logo setting with media ID
    await updateBrandingSetting('site_logo', logoMedia.id.toString());
    
    console.log('Logo migrated to database:', logoMedia.id);
    return logoMedia;
  } catch (error) {
    console.error('Error migrating logo to database:', error);
    throw error;
  }
}

export async function migrateFaviconToDatabase(faviconPath) {
  try {
    // Try to import createMediaItem if it exists
    const { createMediaItem } = await import('../media-management.js').catch(() => ({}));
    if (!createMediaItem) {
      throw new Error('createMediaItem function not found');
    }
    
    // Create media item for favicon
    const faviconMediaData = {
      filename: 'favicon.png',
      original_filename: 'favicon.png',
      alt_text: 'Site Favicon',
      title: 'Site Favicon',
      description: 'Site favicon icon',
      url: faviconPath,
      relative_path: faviconPath,
      mime_type: 'image/png',
      file_extension: 'png',
      file_size: 5000, // Estimated size
      width: 32,
      height: 32,
      media_type: 'image',
      folder_id: null,
      is_featured: true,
      seo_optimized: true
    };
    
    const faviconMedia = await createMediaItem(faviconMediaData);
    
    // Update site_favicon setting with media ID
    await updateBrandingSetting('site_favicon', faviconMedia.id.toString());
    
    console.log('Favicon migrated to database:', faviconMedia.id);
    return faviconMedia;
  } catch (error) {
    console.error('Error migrating favicon to database:', error);
    throw error;
  }
}

