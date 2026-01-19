import { translateText } from '../../services/googleTranslationService.js';
import models, { sequelize } from '../sequelize/models/index.js';
import { Op, QueryTypes } from 'sequelize';
import { query as rawQuery } from '../connection.js';
const { SiteSchema, SiteSetting } = models;

// Branding-specific functions
// Includes master fallback (tenant_id IS NULL) for missing tenant-specific settings
export async function getBrandingSettings(tenantId = 'tenant-gosg', themeId = null) {
  try {
    console.log(`[testing] getBrandingSettings called with tenantId: ${tenantId}, themeId: ${themeId}`);
    
    const whereClause = {
      [Op.and]: [
        {
          setting_category: {
            [Op.in]: ['branding', 'seo', 'localization', 'theme']
          }
        },
        {
          // For public API, we want public settings OR theme settings OR branding/localization settings
          // Branding and localization settings should be public by default
          [Op.or]: [
            { is_public: true },
            { setting_category: 'theme' },
            { setting_category: 'branding' },
            { setting_category: 'localization' }
          ]
        },
        {
          [Op.or]: [
            { tenant_id: tenantId },
            { tenant_id: null }
          ]
        }
      ]
    };
    
    // if (themeId) {
    //   whereClause[Op.and].push({
    //     [Op.or]: [
    //       { theme_id: themeId },
    //       { theme_id: null }
    //     ]
    //   });
    // } else {
    //   whereClause[Op.and].push({
    //     theme_id: null
    //   });
    // }
    
    const orderClause = themeId
      ? [
          [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
          [sequelize.literal(`CASE WHEN theme_id = '${themeId}' THEN 0 ELSE 1 END`), 'ASC'],
          sequelize.literal('tenant_id DESC NULLS LAST'),
          sequelize.literal('theme_id DESC NULLS LAST'),
          ['setting_category', 'ASC'],
          ['setting_key', 'ASC']
        ]
      : [
          [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
          sequelize.literal('tenant_id DESC NULLS LAST'),
          ['setting_category', 'ASC'],
          ['setting_key', 'ASC']
        ];
    
    const results = await SiteSetting.findAll({
      where: whereClause,
      order: orderClause,
      attributes: ['setting_key', 'setting_value', 'setting_type', 'setting_category', 'is_public', 'tenant_id', 'theme_id']
    });
    
    console.log(`[testing] getBrandingSettings found ${results.length} settings for tenant ${tenantId}, theme ${themeId}`);
    if (results.length > 0) {
      console.log(`[testing] Sample settings:`, results.slice(0, 3).map(r => ({
        key: r.setting_key,
        category: r.setting_category,
        is_public: r.is_public,
        tenant_id: r.tenant_id,
        theme_id: r.theme_id
      })));
    }
    
    // Convert to object format grouped by category
    // Prefer tenant-specific over master, theme-specific over tenant-only
    const settings = {
      branding: {},
      seo: {},
      localization: {},
      theme: {}
    };
    
    const seenKeys = new Set();
    
    results.forEach((row) => {
      const category = row.setting_category || 'branding';
      if (!settings[category]) settings[category] = {};
      
      const key = `${category}.${row.setting_key}`;
      const isTenantSpecific = row.tenant_id === tenantId;
      const isThemeSpecific = row.theme_id === themeId;
      
      // Use tenant-specific first, then master (tenant_id IS NULL)
      // For theme-specific, prefer theme-specific over tenant-only
      if (!seenKeys.has(key) || (isTenantSpecific && isThemeSpecific)) {
        settings[category][row.setting_key] = row.setting_value;
        if (isTenantSpecific) {
          seenKeys.add(key);
        }
      }
    });
    
    console.log(`[testing] getBrandingSettings returning:`, {
      brandingKeys: Object.keys(settings.branding),
      seoKeys: Object.keys(settings.seo),
      localizationKeys: Object.keys(settings.localization),
      themeKeys: Object.keys(settings.theme)
    });
    
    return settings;
  } catch (error) {
    console.error(`Error fetching branding settings for tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}

export async function getPublicSEOSettings(tenantId = 'tenant-gosg') {
  try {
    // Include master settings (tenant_id = NULL) and tenant-specific settings
    // Prefer tenant-specific over master
    const results = await SiteSetting.findAll({
      where: {
        is_public: true,
        [Op.or]: [
          { setting_category: 'seo' },
          { setting_key: { [Op.in]: ['site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon', 'country', 'timezone', 'language', 'theme_styles'] } }
        ],
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      order: [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
        ['setting_key', 'ASC']
      ],
      attributes: ['setting_key', 'setting_value', 'setting_type', 'tenant_id']
    });
    
    // Convert to flat object format for easy access
    // Prefer tenant-specific over master
    const settings = {};
    const seenKeys = new Set();
    
    results.forEach((row) => {
      if (!seenKeys.has(row.setting_key) || row.tenant_id === tenantId) {
        settings[row.setting_key] = row.setting_value;
        if (row.tenant_id === tenantId) {
          seenKeys.add(row.setting_key);
        }
      }
    });
    
    return settings;
  } catch (sequelizeError) {
    // Fallback to raw SQL query if Sequelize fails (e.g., models not initialized, table missing)
    console.warn(`[testing] Sequelize query failed, trying raw SQL fallback:`, sequelizeError.message);
    try {
      const sqlQuery = `
        SELECT setting_key, setting_value, setting_type, tenant_id
        FROM site_settings
        WHERE is_public = true
          AND (
            setting_category = 'seo'
            OR setting_key IN ('site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon', 'country', 'timezone', 'language', 'theme_styles')
          )
          AND (tenant_id = $1 OR tenant_id IS NULL)
        ORDER BY 
          CASE WHEN tenant_id = $1 THEN 0 ELSE 1 END ASC,
          setting_key ASC
      `;
      
      const result = await rawQuery(sqlQuery, [tenantId]);
      
      // Convert to flat object format for easy access
      // Prefer tenant-specific over master
      const settings = {};
      const seenKeys = new Set();
      
      result.rows.forEach((row) => {
        if (!seenKeys.has(row.setting_key) || row.tenant_id === tenantId) {
          settings[row.setting_key] = row.setting_value;
          if (row.tenant_id === tenantId) {
            seenKeys.add(row.setting_key);
          }
        }
      });
      
      return settings;
    } catch (rawQueryError) {
      // If raw query also fails, return empty object (route handler will use defaults)
      console.error(`[testing] Both Sequelize and raw SQL queries failed for tenant ${tenantId}:`, rawQueryError.message);
      return {};
    }
  }
}

export async function updateBrandingSetting(key, value, tenantId = 'tenant-gosg') {
  try {
    if (!tenantId) {
      throw new Error('Tenant ID is required to update branding settings. Master settings (tenant_id = NULL) should be updated via admin interface.');
    }
    
    // This function creates/updates tenant-specific settings, not master
    // Master settings are shared and should not be updated via this function
    
    const settingType = key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 'text';
    const category = key.startsWith('site_') ? 'branding' : 'general';
    
    // Check if tenant-specific setting exists first (with theme_id = NULL for tenant-level settings)
    const existing = await SiteSetting.findOne({
      where: {
        setting_key: key,
        tenant_id: tenantId,
        theme_id: null
      }
    });
    
    let result;
    if (existing) {
      // Update existing tenant-specific setting
      await existing.update({
        setting_value: value,
        setting_type: settingType,
        setting_category: category
      });
      result = existing;
    } else {
      // Insert new tenant-specific setting
      // Handle race condition by trying to create, then finding and updating if it already exists
      try {
        result = await SiteSetting.create({
          setting_key: key,
          setting_value: value,
          setting_type: settingType,
          setting_category: category,
          tenant_id: tenantId,
          theme_id: null
        });
      } catch (insertError) {
        // If we get a unique constraint violation (race condition), try to find and update instead
        if (insertError.name === 'SequelizeUniqueConstraintError' || insertError.code === '23505') {
          const retryExisting = await SiteSetting.findOne({
            where: {
              setting_key: key,
              tenant_id: tenantId,
              theme_id: null
            }
          });
          
          if (retryExisting) {
            await retryExisting.update({
              setting_value: value,
              setting_type: settingType,
              setting_category: category
            });
            result = retryExisting;
          } else {
            throw insertError;
          }
        } else {
          throw insertError;
        }
      }
    }
    
    if (!result) {
      throw new Error('Failed to update branding setting. Ensure tenant_id is provided.');
    }
    
    return result.toJSON();
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
  const languagesResult = await SiteSetting.findOne({
    where: {
      setting_key: 'site_content_languages',
      tenant_id: tenantId
    },
    attributes: ['setting_value']
  });
  
  if (!languagesResult || !languagesResult.setting_value) {
    return [];
  }
  
  // Parse the comma-separated language list
  const rawValue = languagesResult.setting_value;
  if (rawValue.includes(',')) {
    return rawValue.split(',').filter(lang => lang.trim() !== '');
  } else if (rawValue.trim() !== '') {
    return [rawValue.trim()];
  }
  
  return [];
}

// Helper function to get default language from site_settings
async function getDefaultLanguage(tenantId) {
  const defaultLanguageResult = await SiteSetting.findOne({
    where: {
      setting_key: 'site_language',
      tenant_id: tenantId
    },
    attributes: ['setting_value']
  });
  
  return defaultLanguageResult && defaultLanguageResult.setting_value ? 
    defaultLanguageResult.setting_value : 'default';
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
    // Use Sequelize queryInterface for DDL operations
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('site_schemas');
    
    if (!tableDescription.language) {
      await queryInterface.addColumn('site_schemas', 'language', {
        type: sequelize.Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'default'
      });
    }
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
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if constraint exists
    const constraints = await queryInterface.showConstraint('site_schemas', 'site_schemas_schema_key_tenant_id_language_unique').catch(() => null);
    
    if (!constraints) {
      // Check if old constraints exist and remove them
      const allConstraints = await queryInterface.showConstraints('site_schemas');
      const oldConstraints = allConstraints.filter(c => 
        c.constraintType === 'UNIQUE' &&
        c.constraintName.includes('schema_key') &&
        c.constraintName.includes('tenant_id') &&
        !c.constraintName.includes('language')
      );
      
      for (const constraint of oldConstraints) {
        await queryInterface.removeConstraint('site_schemas', constraint.constraintName).catch(() => {});
      }
      
      // Add new composite unique constraint
      await queryInterface.addConstraint('site_schemas', {
        fields: ['schema_key', 'tenant_id', 'language'],
        type: 'unique',
        name: 'site_schemas_schema_key_tenant_id_language_unique'
      });
      console.log('[testing] Added composite unique constraint for site_schemas');
    }
  } catch (error) {
    console.log('[testing] Note: Could not ensure composite unique constraint exists:', error.message);
  }
}

// Helper function to update existing schema
async function updateExistingSchema(schemaKey, schemaValue, language, tenantId) {
  const updateResult = await SiteSchema.update(
    {
      schema_value: schemaValue
    },
    {
      where: {
        schema_key: schemaKey,
        tenant_id: tenantId,
        language: language
      }
    }
  );
  
  return updateResult[0] > 0; // Sequelize returns [affectedRows]
}

// Helper function to insert new schema
async function insertNewSchema(schemaKey, schemaValue, language, tenantId) {
  await SiteSchema.create({
    schema_key: schemaKey,
    schema_value: schemaValue,
    language: language,
    tenant_id: tenantId
  });
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
  
  // Use Sequelize findOrCreate for atomic upsert
  try {
    const [schema, created] = await SiteSchema.findOrCreate({
      where: {
        schema_key: schemaKey,
        tenant_id: tenantId,
        language: language
      },
      defaults: {
        schema_key: schemaKey,
        schema_value: schemaValue,
        language: language,
        tenant_id: tenantId
      }
    });
    
    if (!created) {
      // Update existing schema
      await schema.update({
        schema_value: schemaValue
      });
    }
    
    operationSuccessful = true;
  } catch (error) {
    console.error(`[testing] Error upserting schema ${schemaKey}:`, error);
    throw error;
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

export async function updateMultipleBrandingSettings(settings, tenantId = 'tenant-gosg', themeId = null) {
  if (!tenantId) {
    throw new Error('Tenant ID is required to update settings. Master settings (tenant_id = NULL) should be updated via admin interface.');
  }
  
  const transaction = await sequelize.transaction();
  const errors = [];
  let transactionAborted = false;
  let firstError = null; // Track the first error that might cause transaction abort
  
  try {
    for (const [key, value] of Object.entries(settings)) {
      // Skip null/undefined values
      if (value === null || value === undefined) {
        continue;
      }
      
      // If transaction is aborted, we can't continue
      if (transactionAborted) {
        errors.push({ key, error: 'Transaction aborted' });
        continue;
      }
      
      try {
        const settingType = key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 
                           key.includes('description') ? 'textarea' : 'text';
        const category = key.startsWith('site_') ? 'branding' : 
                        ['country', 'timezone', 'language'].includes(key) ? 'localization' : 
                        key === 'theme_styles' ? 'theme' : 'general';
        
        const isPublic = category === 'seo' || category === 'branding' || category === 'localization';
        
        // Convert value to string if it's an object (e.g., theme_styles JSON)
        const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        // Normalize theme_id: use null instead of undefined
        const normalizedThemeId = themeId || null;
        
        // Try to find existing setting first
        // IMPORTANT: Search without theme_id first to find existing records
        // regardless of their theme_id value. This handles:
        // - Records created before theme_id was added
        // - Records with different theme_id values
        // - Migration scenarios
        let setting = await SiteSetting.findOne({
          where: {
            setting_key: key,
            tenant_id: tenantId
            // Don't filter by theme_id initially - we'll update it if needed
          },
          transaction
        });
        
        if (setting) {
          // Update existing setting
          // Also update theme_id if it's different (helps with migration)
          await setting.update({
            setting_value: settingValue,
            setting_type: settingType,
            setting_category: category,
            is_public: isPublic,
            theme_id: normalizedThemeId  // Update theme_id to match what we want
          }, { transaction });
        } else {
          // No existing record found, create new one
          try {
            setting = await SiteSetting.create({
              setting_key: key,
              setting_value: settingValue,
              setting_type: settingType,
              setting_category: category,
              is_public: isPublic,
              tenant_id: tenantId,
              theme_id: normalizedThemeId
            }, { transaction });
          } catch (createError) {
            // If unique constraint violation, the record exists but wasn't found
            // This can happen due to COALESCE-based unique index vs WHERE clause mismatch
            if (createError.name === 'SequelizeUniqueConstraintError' || createError.code === '23505' || createError.parent?.code === '23505') {
              // Try one more time with a raw query to find ANY record with this key+tenant
              let found;
              try {
                found = await sequelize.query(`
                  SELECT * FROM site_settings 
                  WHERE setting_key = :key 
                    AND tenant_id = :tenantId
                  LIMIT 1
                `, {
                  replacements: { key, tenantId },
                  type: QueryTypes.SELECT,
                  transaction
                });
              } catch (queryError) {
                console.error(`[testing] Error in raw query to find existing setting:`, queryError);
                throw createError;
              }
              
              if (found && found.length > 0) {
                // Found it, now update using Sequelize
                setting = await SiteSetting.findByPk(found[0].id, { transaction });
                if (setting) {
                  await setting.update({
                    setting_value: settingValue,
                    setting_type: settingType,
                    setting_category: category,
                    is_public: isPublic,
                    theme_id: normalizedThemeId
                  }, { transaction });
                } else {
                  throw createError;
                }
              } else {
                console.error(`[testing] Unique constraint violation for ${key} but record not found. Tenant: ${tenantId}, Theme: ${normalizedThemeId}`);
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        }
      } catch (settingError) {
        // Check if transaction is aborted (PostgreSQL error code 25P02 = in_failed_sql_transaction)
        if (settingError.parent && settingError.parent.code === '25P02') {
          transactionAborted = true;
          // Include the first error that caused the transaction to abort
          const abortError = firstError 
            ? `Transaction aborted due to previous error in ${firstError.key}: ${firstError.error}`
            : 'Transaction aborted due to an error';
          errors.push({ key, error: abortError });
          console.error(`[testing] Transaction aborted while processing ${key}. First error was:`, firstError);
          break; // Exit loop, transaction is dead
        }
        
        // Track the first error (this might be what causes the transaction to abort)
        if (!firstError) {
          firstError = {
            key,
            error: settingError.message || settingError.toString(),
            code: settingError.code || settingError.parent?.code,
            detail: settingError.detail || settingError.parent?.detail,
            constraint: settingError.constraint
          };
        }
        
        // Log detailed error information
        console.error(`[testing] Error updating setting ${key}:`, {
          name: settingError.name,
          message: settingError.message,
          code: settingError.code,
          parentCode: settingError.parent?.code,
          parentMessage: settingError.parent?.message,
          constraint: settingError.constraint,
          detail: settingError.detail,
          stack: settingError.stack
        });
        
        errors.push({ 
          key, 
          error: settingError.message || settingError.toString(),
          code: settingError.code || settingError.parent?.code,
          detail: settingError.detail || settingError.parent?.detail,
          constraint: settingError.constraint
        });
      }
    }
    
    // If transaction was aborted or we have errors, rollback everything
    if (transactionAborted || errors.length > 0) {
      await transaction.rollback();
      let errorMessage;
      if (transactionAborted) {
        // Include details about the first error that caused the abort
        if (firstError) {
          errorMessage = `Transaction was aborted due to an error in ${firstError.key}: ${firstError.error}${firstError.detail ? ` (${firstError.detail})` : ''}${firstError.constraint ? ` [Constraint: ${firstError.constraint}]` : ''}`;
        } else {
          errorMessage = 'Transaction was aborted due to an error';
        }
      } else {
        errorMessage = `Failed to update ${errors.length} setting(s): ${errors.map(e => `${e.key} (${e.code || e.error}${e.detail ? ` - ${e.detail}` : ''})`).join(', ')}`;
      }
      throw new Error(errorMessage);
    }
    
    await transaction.commit();
    return true;
  } catch (error) {
    // Only rollback if transaction hasn't been rolled back already
    if (!transaction.finished && !transactionAborted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(`[testing] Error during rollback:`, rollbackError);
      }
    }
    console.error(`[testing] Error updating multiple branding settings for tenant ${tenantId}, theme ${themeId}:`, error);
    console.error(`[testing] Error name: ${error.name}, message: ${error.message}`);
    if (error.parent) {
      console.error(`[testing] Parent error: ${error.parent.message}`);
      console.error(`[testing] Parent error code: ${error.parent.code}`);
      if (error.parent.sql) {
        console.error(`[testing] SQL: ${error.parent.sql}`);
      }
    }
    throw error;
  }
}

export async function getsitesettingsbytenant(tenantId) {
  try {
    // Include master settings (tenant_id = NULL) and tenant-specific settings
    // Prefer tenant-specific over master
    const results = await SiteSetting.findAll({
      where: {
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      order: [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
        ['setting_category', 'ASC'],
        ['setting_key', 'ASC']
      ]
    });
    
    return results.map(row => row.toJSON());
  } catch (error) {
    console.error('Error fetching site settings by tenant:', error);
    throw error;
  }
}

// Get theme styles specifically
export async function getThemeStyles(tenantId = 'tenant-gosg', themeId = null) {
  try {
    const setting = await getSiteSettingByKey('theme_styles', tenantId, themeId);
    if (setting && setting.setting_value) {
      try {
        return typeof setting.setting_value === 'string' 
          ? JSON.parse(setting.setting_value) 
          : setting.setting_value;
      } catch (e) {
        console.error(`Error parsing theme styles for tenant ${tenantId}, theme ${themeId}:`, e);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching theme styles for tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}

// Get all settings for a specific tenant + theme combination
// Includes master fallback (tenant_id IS NULL) for missing tenant-specific settings
export async function getThemeSettings(tenantId = 'tenant-gosg', themeId = null) {
  try {
    const whereClause = {
      [Op.and]: [
        {
          [Op.or]: [
            { tenant_id: tenantId },
            { tenant_id: null }
          ]
        }
      ]
    };
    
    let orderClause;
    
    if (themeId) {
      // Get theme-specific settings, with fallback to tenant-only, then master
      whereClause[Op.and].push({
        [Op.or]: [
          { theme_id: themeId },
          { theme_id: null }
        ]
      });
      orderClause = [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
        [sequelize.literal(`CASE WHEN theme_id = '${themeId}' THEN 0 ELSE 1 END`), 'ASC'],
        sequelize.literal('tenant_id DESC NULLS LAST'),
        sequelize.literal('theme_id DESC NULLS LAST'),
        ['setting_category', 'ASC'],
        ['setting_key', 'ASC']
      ];
    } else {
      // Get tenant-level settings with master fallback
      whereClause[Op.and].push({
        theme_id: null
      });
      orderClause = [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
        sequelize.literal('tenant_id DESC NULLS LAST'),
        ['setting_category', 'ASC'],
        ['setting_key', 'ASC']
      ];
    }
    
    const results = await SiteSetting.findAll({
      where: whereClause,
      order: orderClause,
      attributes: ['setting_key', 'setting_value', 'setting_type', 'setting_category', 'is_public', 'tenant_id', 'theme_id']
    });
    
    // Group by category and merge (tenant-specific overrides master, theme-specific overrides tenant-only)
    const settings = {};
    const seenKeys = new Set();
    
    results.forEach((row) => {
      const category = row.setting_category || 'general';
      if (!settings[category]) settings[category] = {};
      
      const key = `${category}.${row.setting_key}`;
      // Use tenant-specific first, then master (tenant_id IS NULL)
      // For theme-specific, prefer theme-specific over tenant-only
      const isTenantSpecific = row.tenant_id === tenantId;
      const isThemeSpecific = row.theme_id === themeId;
      
      if (!seenKeys.has(key) || (isTenantSpecific && isThemeSpecific)) {
        settings[category][row.setting_key] = row.setting_value;
        if (isTenantSpecific) {
          seenKeys.add(key);
        }
      }
    });
    
    return settings;
  } catch (error) {
    console.error(`Error fetching theme settings for tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}

// Site Settings functions
export async function getSiteSettingByKey(key, tenantId = 'tenant-gosg', themeId = null) {
  try {
    const whereClause = {
      [Op.and]: [
        {
          setting_key: key
        },
        {
          [Op.or]: [
            { tenant_id: tenantId },
            { tenant_id: null }
          ]
        }
      ]
    };
    
    let orderClause;
    
    if (themeId) {
      // Prefer theme-specific setting, fallback to tenant-only, then master
      whereClause[Op.and].push({
        [Op.or]: [
          { theme_id: themeId },
          { theme_id: null }
        ]
      });
      orderClause = [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
        [sequelize.literal(`CASE WHEN theme_id = '${themeId}' THEN 0 ELSE 1 END`), 'ASC'],
        sequelize.literal('tenant_id DESC NULLS LAST'),
        sequelize.literal('theme_id DESC NULLS LAST')
      ];
    } else {
      // Prefer tenant-specific, fallback to master (tenant_id IS NULL)
      whereClause[Op.and].push({
        theme_id: null
      });
      orderClause = [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
        sequelize.literal('tenant_id DESC NULLS LAST')
      ];
    }
    
    const result = await SiteSetting.findOne({
      where: whereClause,
      order: orderClause,
      attributes: ['setting_key', 'setting_value', 'setting_type', 'setting_category', 'is_public', 'tenant_id', 'theme_id']
    });
    
    return result ? result.toJSON() : null;
  } catch (error) {
    console.error(`Error fetching site setting for key ${key}, tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}

export async function updateSiteSettingByKey(key, value, type = 'text', category = 'general', tenantId = 'tenant-gosg', themeId = null) {
  try {
    if (!tenantId) {
      throw new Error('Tenant ID is required to update settings. Master settings (tenant_id = NULL) should be updated via admin interface.');
    }
    
    // Set is_public to true for SEO and branding settings
    const isPublic = category === 'seo' || category === 'branding';
    
    // Find existing setting first
    const existing = await SiteSetting.findOne({
      where: {
        setting_key: key,
        tenant_id: tenantId,
        theme_id: themeId || null
      }
    });
    
    let setting;
    if (existing) {
      // Check if it's a master setting (shouldn't happen, but protect anyway)
      if (!existing.tenant_id) {
        throw new Error('Cannot update master setting. Master settings (tenant_id = NULL) are shared across all tenants.');
      }
      
      // Update existing tenant-specific setting
      await existing.update({
        setting_value: value,
        setting_type: type,
        setting_category: category,
        is_public: isPublic,
        theme_id: themeId || null
      });
      setting = existing;
    } else {
      // Create new setting
      try {
        setting = await SiteSetting.create({
          setting_key: key,
          setting_value: value,
          setting_type: type,
          setting_category: category,
          is_public: isPublic,
          tenant_id: tenantId,
          theme_id: themeId || null
        });
      } catch (createError) {
        // Handle race condition: if another process created it between findOne and create
        if (createError.name === 'SequelizeUniqueConstraintError' || createError.code === '23505') {
          // Try to find and update again
          const retryExisting = await SiteSetting.findOne({
            where: {
              setting_key: key,
              tenant_id: tenantId,
              theme_id: themeId || null
            }
          });
          
          if (retryExisting) {
            await retryExisting.update({
              setting_value: value,
              setting_type: type,
              setting_category: category,
              is_public: isPublic,
              theme_id: themeId || null
            });
            setting = retryExisting;
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    }
    
    return setting.toJSON();
  } catch (error) {
    console.error(`Error updating site setting for key ${key}, tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}

// SEO-specific functions
export async function updateSEOSettings(seoData) {
  const transaction = await sequelize.transaction();
  
  try {
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
        
        // Find existing master setting (tenant_id = NULL) first
        const existing = await SiteSetting.findOne({
          where: {
            setting_key: key,
            tenant_id: null,
            theme_id: null
          },
          transaction
        });
        
        if (existing) {
          // Update existing setting
          await existing.update({
            setting_value: value,
            setting_type: settingType
          }, { transaction });
        } else {
          // Create new master setting
          try {
            await SiteSetting.create({
              setting_key: key,
              setting_value: value,
              setting_type: settingType,
              setting_category: 'seo',
              is_public: true,
              tenant_id: null,
              theme_id: null
            }, { transaction });
          } catch (createError) {
            // Handle race condition: if another process created it between findOne and create
            if (createError.name === 'SequelizeUniqueConstraintError' || createError.code === '23505') {
              // Try to find and update again
              const retryExisting = await SiteSetting.findOne({
                where: {
                  setting_key: key,
                  tenant_id: null,
                  theme_id: null
                },
                transaction
              });
              
              if (retryExisting) {
                await retryExisting.update({
                  setting_value: value,
                  setting_type: settingType
                }, { transaction });
              } else {
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        }
      }
    }
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating SEO settings:', error);
    throw error;
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


// Custom Code functions
export async function getCustomCodeSettings(tenantId = 'tenant-gosg') {
  try {
    console.log(`[testing] getCustomCodeSettings called with tenantId: ${tenantId}`);
    
    const results = await SiteSetting.findAll({
      where: {
        setting_category: 'custom_code',
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      order: [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
        ['setting_key', 'ASC']
      ],
      attributes: ['setting_key', 'setting_value', 'setting_type', 'tenant_id']
    });
    
    // Convert to object format
    const settings = {
      head: '',
      body: '',
      gtmId: '',
      gaId: '',
      gscVerification: ''
    };
    
    const seenKeys = new Set();
    
    results.forEach((row) => {
      const key = row.setting_key;
      const isTenantSpecific = row.tenant_id === tenantId;
      
      // Map database keys to settings object keys
      if (key === 'custom_code_head' && (!seenKeys.has('head') || isTenantSpecific)) {
        settings.head = row.setting_value || '';
        if (isTenantSpecific) seenKeys.add('head');
      } else if (key === 'custom_code_body' && (!seenKeys.has('body') || isTenantSpecific)) {
        settings.body = row.setting_value || '';
        if (isTenantSpecific) seenKeys.add('body');
      } else if (key === 'custom_code_gtm_id' && (!seenKeys.has('gtmId') || isTenantSpecific)) {
        settings.gtmId = row.setting_value || '';
        if (isTenantSpecific) seenKeys.add('gtmId');
      } else if (key === 'custom_code_ga_id' && (!seenKeys.has('gaId') || isTenantSpecific)) {
        settings.gaId = row.setting_value || '';
        if (isTenantSpecific) seenKeys.add('gaId');
      } else if (key === 'custom_code_gsc_verification' && (!seenKeys.has('gscVerification') || isTenantSpecific)) {
        settings.gscVerification = row.setting_value || '';
        if (isTenantSpecific) seenKeys.add('gscVerification');
      }
    });
    
    console.log(`[testing] getCustomCodeSettings returning settings for tenant ${tenantId}`);
    return settings;
  } catch (error) {
    console.error(`Error fetching custom code settings for tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function updateCustomCodeSettings(settings, tenantId = 'tenant-gosg') {
  if (!tenantId) {
    throw new Error('Tenant ID is required to update custom code settings');
  }
  
  const transaction = await sequelize.transaction();
  const errors = [];
  let transactionAborted = false;
  
  try {
    // Map settings object to database keys
    const settingsMap = {
      head: { key: 'custom_code_head', type: 'textarea' },
      body: { key: 'custom_code_body', type: 'textarea' },
      gtmId: { key: 'custom_code_gtm_id', type: 'text' },
      gaId: { key: 'custom_code_ga_id', type: 'text' },
      gscVerification: { key: 'custom_code_gsc_verification', type: 'text' }
    };
    
    for (const [field, value] of Object.entries(settings)) {
      // Skip if field is not in our map
      if (!settingsMap[field]) {
        continue;
      }
      
      // If transaction is aborted, we can't continue
      if (transactionAborted) {
        errors.push({ key: field, error: 'Transaction aborted' });
        continue;
      }
      
      try {
        const { key: settingKey, type: settingType } = settingsMap[field];
        const settingValue = value !== null && value !== undefined ? String(value) : '';
        
        // Try to find existing setting first
        let setting = await SiteSetting.findOne({
          where: {
            setting_key: settingKey,
            tenant_id: tenantId,
            theme_id: null
          },
          transaction
        });
        
        if (setting) {
          // Update existing setting
          await setting.update({
            setting_value: settingValue,
            setting_type: settingType,
            setting_category: 'custom_code',
            is_public: false
          }, { transaction });
        } else {
          // Try to create new setting
          try {
            setting = await SiteSetting.create({
              setting_key: settingKey,
              setting_value: settingValue,
              setting_type: settingType,
              setting_category: 'custom_code',
              is_public: false,
              tenant_id: tenantId,
              theme_id: null
            }, { transaction });
          } catch (createError) {
            // If unique constraint violation, try to find and update
            if (createError.name === 'SequelizeUniqueConstraintError' || createError.code === '23505' || createError.parent?.code === '23505') {
              const found = await sequelize.query(`
                SELECT * FROM site_settings 
                WHERE setting_key = :key 
                  AND COALESCE(tenant_id, '') = COALESCE(:tenantId, '')
                  AND COALESCE(theme_id, '') = ''
                LIMIT 1
              `, {
                replacements: { key: settingKey, tenantId },
                type: QueryTypes.SELECT,
                transaction
              });
              
              if (found && found.length > 0) {
                setting = await SiteSetting.findByPk(found[0].id, { transaction });
                if (setting) {
                  await setting.update({
                    setting_value: settingValue,
                    setting_type: settingType,
                    setting_category: 'custom_code',
                    is_public: false
                  }, { transaction });
                } else {
                  throw createError;
                }
              } else {
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        }
      } catch (settingError) {
        // Check if transaction is aborted
        if (settingError.parent && settingError.parent.code === '25P02') {
          transactionAborted = true;
          errors.push({ key: field, error: 'Transaction aborted' });
          console.error(`[testing] Transaction aborted while processing ${field}`);
          break;
        }
        
        console.error(`[testing] Error updating custom code setting ${field}:`, {
          name: settingError.name,
          message: settingError.message,
          code: settingError.code
        });
        
        errors.push({ 
          key: field, 
          error: settingError.message || settingError.toString()
        });
      }
    }
    
    // If transaction was aborted or we have errors, rollback everything
    if (transactionAborted || errors.length > 0) {
      await transaction.rollback();
      const errorMessage = transactionAborted 
        ? 'Transaction was aborted due to an error'
        : `Failed to update ${errors.length} custom code setting(s): ${errors.map(e => `${e.key} (${e.error})`).join(', ')}`;
      throw new Error(errorMessage);
    }
    
    await transaction.commit();
    return true;
  } catch (error) {
    // Only rollback if transaction hasn't been rolled back already
    if (!transaction.finished && !transactionAborted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(`[testing] Error during rollback:`, rollbackError);
      }
    }
    console.error(`[testing] Error updating custom code settings for tenant ${tenantId}:`, error);
    throw error;
  }
}
