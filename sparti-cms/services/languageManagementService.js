/**
 * Language Management Service
 * 
 * This service provides functions for managing language settings in the CMS,
 * including adding, removing, and setting the default language.
 */

import { query } from '../db/index.js';
import { translateText } from './googleTranslationService.js';

/**
 * Add a new language to the site
 * 
 * @param {string} languageCode - The language code to add
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<Object>} - The result of the operation
 */
export const addLanguage = async (languageCode, tenantId) => {
  console.log(`[testing] Adding language ${languageCode} for tenant ${tenantId}`);
  
  try {
    // 1. Get current site_content_languages
    const currentLanguagesResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $1
    `, [tenantId]);
    
    // Parse the current languages
    let currentLanguages = [];
    if (currentLanguagesResult.rows.length > 0 && currentLanguagesResult.rows[0].setting_value) {
      const rawValue = currentLanguagesResult.rows[0].setting_value;
      console.log(`[testing] Raw site_content_languages value: "${rawValue}"`);
      
      // More robust parsing
      if (rawValue.includes(',')) {
        currentLanguages = rawValue.split(',').filter(lang => lang.trim() !== '');
      } else if (rawValue.trim() !== '') {
        // This is the case where there's only one language code (no commas)
        currentLanguages = [rawValue.trim()];
      }
      
      // Make sure the array is not empty and contains valid values
      if (currentLanguages.length === 0 || currentLanguages.some(lang => !lang)) {
        currentLanguages = [];
      }
      
      console.log(`[testing] Parsed currentLanguages array:`, currentLanguages);
    }
    
    // 2. Check if language already exists
    if (currentLanguages.includes(languageCode)) {
      console.log(`[testing] Language ${languageCode} already exists for tenant ${tenantId}`);
      return { success: false, message: `Language ${languageCode} already exists` };
    }
    
    // Get the default language
    const defaultLanguageResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_language' 
      AND tenant_id = $1
    `, [tenantId]);
    
    const defaultLanguage = defaultLanguageResult.rows.length > 0 ? 
      defaultLanguageResult.rows[0].setting_value : 'en';
    
    console.log(`[testing] Default language: ${defaultLanguage}`);
    
    // Don't add the default language to additional languages
    if (languageCode === defaultLanguage) {
      console.log(`[testing] Cannot add default language ${languageCode} as an additional language`);
      return { success: false, message: `Cannot add default language as an additional language` };
    }
    
    // Make sure the default language is in the currentLanguages array if it's not already there
    if (!currentLanguages.includes(defaultLanguage)) {
      console.log(`[testing] Adding default language ${defaultLanguage} to currentLanguages`);
      currentLanguages.push(defaultLanguage);
    }
    
    // Double-check that default language is actually in the array (defensive programming)
    if (!currentLanguages.includes(defaultLanguage)) {
      console.log(`[testing] CRITICAL: Default language ${defaultLanguage} still not in array, forcing it in`);
      currentLanguages = [defaultLanguage, ...currentLanguages];
    }
    
    // 3. Add new language to array
    console.log(`[testing] Before adding new language, currentLanguages:`, currentLanguages);
    currentLanguages.push(languageCode);
    console.log(`[testing] After adding new language, currentLanguages:`, currentLanguages);
    
    // 4. Join back to comma-separated string and update database
    const newLanguages = currentLanguages.join(',');
    console.log(`[testing] New languages string to save: "${newLanguages}"`);
    
    await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, tenant_id)
      VALUES ('site_content_languages', $1, 'text', 'localization', true, $2)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [newLanguages, tenantId]);
    
    console.log(`[testing] Updated site_content_languages to ${newLanguages} for tenant ${tenantId}`);
    
    // 5. Process page translations for the new language
    await processPageTranslations(languageCode, tenantId);
    
    return { success: true, message: `Language ${languageCode} added successfully` };
  } catch (error) {
    console.error(`[testing] Error adding language ${languageCode} for tenant ${tenantId}:`, error);
    return { success: false, message: error.message };
  }
};

/**
 * Remove a language from the site
 * 
 * @param {string} languageCode - The language code to remove
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<Object>} - The result of the operation
 */
export const removeLanguage = async (languageCode, tenantId) => {
  console.log(`[testing] Removing language ${languageCode} for tenant ${tenantId}`);
  
  try {
    // 1. Get current site_content_languages
    const currentLanguagesResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $1
    `, [tenantId]);
    
    // Parse the current languages
    let currentLanguages = [];
    if (currentLanguagesResult.rows.length > 0 && currentLanguagesResult.rows[0].setting_value) {
      const rawValue = currentLanguagesResult.rows[0].setting_value;
      console.log(`[testing] Raw site_content_languages value: "${rawValue}"`);
      
      // More robust parsing
      if (rawValue.includes(',')) {
        currentLanguages = rawValue.split(',').filter(lang => lang.trim() !== '');
      } else if (rawValue.trim() !== '') {
        // This is the case where there's only one language code (no commas)
        currentLanguages = [rawValue.trim()];
      }
      
      // Make sure the array is not empty and contains valid values
      if (currentLanguages.length === 0 || currentLanguages.some(lang => !lang)) {
        currentLanguages = [];
      }
      
      console.log(`[testing] Parsed currentLanguages array:`, currentLanguages);
    }
    
    // 2. Check if language exists
    if (!currentLanguages.includes(languageCode)) {
      console.log(`[testing] Language ${languageCode} does not exist for tenant ${tenantId}`);
      return { success: false, message: `Language ${languageCode} does not exist` };
    }
    
    // Get the default language
    const defaultLanguageResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_language' 
      AND tenant_id = $1
    `, [tenantId]);
    
    const defaultLanguage = defaultLanguageResult.rows.length > 0 ? 
      defaultLanguageResult.rows[0].setting_value : 'en';
    
    // Don't allow removing the default language
    if (languageCode === defaultLanguage) {
      console.log(`[testing] Cannot remove default language ${languageCode}`);
      return { success: false, message: `Cannot remove default language` };
    }
    
    // 3. Remove language from array
    console.log(`[testing] Before removing language, currentLanguages:`, currentLanguages);
    const newLanguages = currentLanguages.filter(lang => lang !== languageCode).join(',');
    console.log(`[testing] New languages string to save: "${newLanguages}"`);
    
    // 4. Update database
    await query(`
      UPDATE site_settings 
      SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $2
    `, [newLanguages, tenantId]);
    
    console.log(`[testing] Updated site_content_languages to ${newLanguages} for tenant ${tenantId}`);
    
    // 5. Delete translated page layouts for this language
    const deleteResult = await query(`
      DELETE FROM page_layouts
      WHERE language = $1
      AND page_id IN (
        SELECT id FROM pages WHERE tenant_id = $2
      )
    `, [languageCode, tenantId]);
    
    console.log(`[testing] Deleted ${deleteResult.rowCount} page layouts for language ${languageCode}`);
    
    return { success: true, message: `Language ${languageCode} removed successfully` };
  } catch (error) {
    console.error(`[testing] Error removing language ${languageCode} for tenant ${tenantId}:`, error);
    return { success: false, message: error.message };
  }
};

/**
 * Set the default language for the site
 * 
 * @param {string} languageCode - The language code to set as default
 * @param {string} tenantId - The tenant ID
 * @param {boolean} fromAdditionalLanguages - Whether the language is being set from the additional languages list
 * @returns {Promise<Object>} - The result of the operation
 */
export const setDefaultLanguage = async (languageCode, tenantId, fromAdditionalLanguages) => {
  console.log(`[testing] Setting default language to ${languageCode} for tenant ${tenantId} (from additional languages: ${fromAdditionalLanguages})`);
  
  try {
    // Get the current default language
    const currentDefaultResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_language' 
      AND tenant_id = $1
    `, [tenantId]);
    
    const currentDefault = currentDefaultResult.rows.length > 0 ? 
      currentDefaultResult.rows[0].setting_value : 'en';
    
    // If the language is already the default, do nothing
    if (currentDefault === languageCode) {
      console.log(`[testing] Language ${languageCode} is already the default for tenant ${tenantId}`);
      return { success: true, message: `Language ${languageCode} is already the default` };
    }
    
    // Check if translations exist for this language
    if (fromAdditionalLanguages) {
      // Path 1: Setting default from additional languages (translation exists)
      await setDefaultFromAdditionalLanguages(languageCode, tenantId, currentDefault);
    } else {
      // Path 2: Setting default from "Change Default" (need to check if translation exists)
      await setDefaultFromChangeDefault(languageCode, tenantId, currentDefault);
    }
    
    return { success: true, message: `Default language set to ${languageCode} successfully` };
  } catch (error) {
    console.error(`[testing] Error setting default language to ${languageCode} for tenant ${tenantId}:`, error);
    return { success: false, message: error.message };
  }
};

/**
 * Set default language from additional languages
 * 
 * @param {string} languageCode - The language code to set as default
 * @param {string} tenantId - The tenant ID
 * @param {string} currentDefault - The current default language
 * @returns {Promise<void>}
 */
const setDefaultFromAdditionalLanguages = async (languageCode, tenantId, currentDefault) => {
  console.log(`[testing] Setting default from additional languages: ${languageCode} for tenant ${tenantId}`);
  
  // 1. Update site_language in site_settings
  await query(`
    INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, tenant_id)
    VALUES ('site_language', $1, 'text', 'localization', true, $2)
    ON CONFLICT (setting_key, tenant_id) 
    DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
  `, [languageCode, tenantId]);
  
  console.log(`[testing] Updated site_language to ${languageCode} for tenant ${tenantId}`);
  
  // 2. Update site_content_languages to remove the new default and add the old default
  const currentLanguagesResult = await query(`
    SELECT setting_value 
    FROM site_settings 
    WHERE setting_key = 'site_content_languages' 
    AND tenant_id = $1
  `, [tenantId]);
  
  let currentLanguages = [];
  if (currentLanguagesResult.rows.length > 0 && currentLanguagesResult.rows[0].setting_value) {
    const rawValue = currentLanguagesResult.rows[0].setting_value;
    console.log(`[testing] Raw site_content_languages value: "${rawValue}"`);
    
    // More robust parsing
    if (rawValue.includes(',')) {
      currentLanguages = rawValue.split(',').filter(lang => lang.trim() !== '');
    } else if (rawValue.trim() !== '') {
      currentLanguages = [rawValue.trim()];
    }
    
    console.log(`[testing] Parsed currentLanguages array:`, currentLanguages);
  }
  
  // Remove the new default language from additional languages
  const filteredLanguages = currentLanguages.filter(lang => lang !== languageCode);
  console.log(`[testing] After removing new default, filteredLanguages:`, filteredLanguages);
  
  // Add the old default language if it's not already there
  if (!filteredLanguages.includes(currentDefault)) {
    console.log(`[testing] Adding old default language ${currentDefault} to filteredLanguages`);
    filteredLanguages.push(currentDefault);
  }
  
  const newAdditionalLanguages = filteredLanguages.join(',');
  console.log(`[testing] New additional languages string to save: "${newAdditionalLanguages}"`);
  
  await query(`
    UPDATE site_settings 
    SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    WHERE setting_key = 'site_content_languages' 
    AND tenant_id = $2
  `, [newAdditionalLanguages, tenantId]);
  
  console.log(`[testing] Updated site_content_languages to ${newAdditionalLanguages} for tenant ${tenantId}`);
  
  // 3. Update is_default flags in page_layouts
  // First, get all pages for the tenant
  const pagesResult = await query(`
    SELECT id FROM pages WHERE tenant_id = $1
  `, [tenantId]);
  
  // For each page, update the is_default flags
  for (const page of pagesResult.rows) {
    const pageId = page.id;
    
    // Set is_default = false for current default layouts
    await query(`
      UPDATE page_layouts
      SET is_default = false
      WHERE page_id = $1
      AND is_default = true
    `, [pageId]);
    
    // Set is_default = true for new default language layouts
    await query(`
      UPDATE page_layouts
      SET is_default = true
      WHERE page_id = $1
      AND language = $2
    `, [pageId, languageCode]);
    
    console.log(`[testing] Updated is_default flags for page ${pageId}`);
  }
};

/**
 * Set default language from "Change Default" button
 * 
 * @param {string} languageCode - The language code to set as default
 * @param {string} tenantId - The tenant ID
 * @param {string} currentDefault - The current default language
 * @returns {Promise<void>}
 */
const setDefaultFromChangeDefault = async (languageCode, tenantId, currentDefault) => {
  console.log(`[testing] Setting default from change default: ${languageCode} for tenant ${tenantId}`);
  
  // Get all pages for the tenant
  const pagesResult = await query(`
    SELECT id FROM pages WHERE tenant_id = $1
  `, [tenantId]);
  
  // Check if translations exist for all pages
  let allTranslationsExist = true;
  const pagesToTranslate = [];
  
  for (const page of pagesResult.rows) {
    const pageId = page.id;
    
    // Check if a translation exists for this page
    const translationResult = await query(`
      SELECT id FROM page_layouts
      WHERE page_id = $1
      AND language = $2
    `, [pageId, languageCode]);
    
    if (translationResult.rows.length === 0) {
      allTranslationsExist = false;
      pagesToTranslate.push(pageId);
    }
  }
  
  if (allTranslationsExist) {
    // If all translations exist, follow Path 1
    await setDefaultFromAdditionalLanguages(languageCode, tenantId, currentDefault);
  } else {
    // If translations don't exist for some pages, create them
    
    // 1. Update site_language in site_settings
    await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, tenant_id)
      VALUES ('site_language', $1, 'text', 'localization', true, $2)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [languageCode, tenantId]);
    
    console.log(`[testing] Updated site_language to ${languageCode} for tenant ${tenantId}`);
    
    // 2. Add the language to site_content_languages if not already present
    const currentLanguagesResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $1
    `, [tenantId]);
    
    let currentLanguages = [];
    if (currentLanguagesResult.rows.length > 0 && currentLanguagesResult.rows[0].setting_value) {
      const rawValue = currentLanguagesResult.rows[0].setting_value;
      console.log(`[testing] Raw site_content_languages value: "${rawValue}"`);
      
      // More robust parsing
      if (rawValue.includes(',')) {
        currentLanguages = rawValue.split(',').filter(lang => lang.trim() !== '');
      } else if (rawValue.trim() !== '') {
        // This is the case where there's only one language code (no commas)
        currentLanguages = [rawValue.trim()];
      }
      
      // Make sure the array is not empty and contains valid values
      if (currentLanguages.length === 0 || currentLanguages.some(lang => !lang)) {
        currentLanguages = [];
      }
      
      console.log(`[testing] Parsed currentLanguages array:`, currentLanguages);
    }
    
    // Add the old default language if it's not already there
    if (!currentLanguages.includes(currentDefault)) {
      console.log(`[testing] Adding old default language ${currentDefault} to currentLanguages`);
      currentLanguages.push(currentDefault);
    }
    
    // Remove the new default language from additional languages
    const filteredLanguages = currentLanguages.filter(lang => lang !== languageCode);
    console.log(`[testing] After removing new default, filteredLanguages:`, filteredLanguages);
    
    const newAdditionalLanguages = filteredLanguages.join(',');
    console.log(`[testing] New additional languages string to save: "${newAdditionalLanguages}"`);
    
    await query(`
      UPDATE site_settings 
      SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $2
    `, [newAdditionalLanguages, tenantId]);
    
    console.log(`[testing] Updated site_content_languages to ${newAdditionalLanguages} for tenant ${tenantId}`);
    
    // 3. For each page that needs translation
    for (const pageId of pagesToTranslate) {
      // Find the current default layout
      const defaultLayoutResult = await query(`
        SELECT layout_json, version
        FROM page_layouts
        WHERE page_id = $1
        AND is_default = true
      `, [pageId]);
      
      if (defaultLayoutResult.rows.length === 0) {
        console.log(`[testing] No default layout found for page ${pageId}, skipping`);
        continue;
      }
      
      const defaultLayout = defaultLayoutResult.rows[0];
      const layoutJson = defaultLayout.layout_json;
      const version = defaultLayout.version;
      
      // Instead of translating, we'll just duplicate the layout with the new language
      // In a real implementation, we would translate the content
      
      // Set current default to is_default = false
      await query(`
        UPDATE page_layouts
        SET is_default = false
        WHERE page_id = $1
        AND is_default = true
      `, [pageId]);
      
      // Store new layout with is_default = true
      await query(`
        INSERT INTO page_layouts (page_id, language, layout_json, version, is_default)
        VALUES ($1, $2, $3, $4, true)
      `, [pageId, languageCode, layoutJson, version]);
      
      console.log(`[testing] Created new layout for page ${pageId} with language ${languageCode}`);
    }
  }
};

/**
 * Process page translations for a new language
 * 
 * @param {string} languageCode - The language code to translate to
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<void>}
 */
const processPageTranslations = async (languageCode, tenantId) => {
  console.log(`[testing] Processing page translations for language ${languageCode} and tenant ${tenantId}`);
  
  try {
    // 1. Get all pages for the tenant
    const pagesResult = await query(`
      SELECT id FROM pages WHERE tenant_id = $1
    `, [tenantId]);
    
    console.log(`[testing] Found ${pagesResult.rows.length} pages for tenant ${tenantId}`);
    
    // 2. For each page, get its default layout
    for (const page of pagesResult.rows) {
      const pageId = page.id;
      
      // Find the default layout
      const defaultLayoutResult = await query(`
        SELECT layout_json, version
        FROM page_layouts
        WHERE page_id = $1
        AND is_default = true
      `, [pageId]);
      
      if (defaultLayoutResult.rows.length === 0) {
        console.log(`[testing] No default layout found for page ${pageId}, skipping`);
        continue;
      }
      
      const defaultLayout = defaultLayoutResult.rows[0];
      const layoutJson = defaultLayout.layout_json;
      const version = defaultLayout.version;
      
      // Check if a translation already exists
      const existingTranslationResult = await query(`
        SELECT id FROM page_layouts
        WHERE page_id = $1
        AND language = $2
      `, [pageId, languageCode]);
      
      if (existingTranslationResult.rows.length > 0) {
        console.log(`[testing] Translation already exists for page ${pageId} and language ${languageCode}, skipping`);
        continue;
      }
      
      // 3. Instead of translating, we'll just duplicate the layout with the new language
      // In a real implementation, we would translate the content using translateLayoutContent
      
      // Store the "translated" layout
      await query(`
        INSERT INTO page_layouts (page_id, language, layout_json, version, is_default)
        VALUES ($1, $2, $3, $4, false)
      `, [pageId, languageCode, layoutJson, version]);
      
      console.log(`[testing] Created new layout for page ${pageId} with language ${languageCode}`);
    }
  } catch (error) {
    console.error(`[testing] Error processing page translations:`, error);
    throw error;
  }
};

/**
 * Translate layout content (mock implementation)
 * 
 * @param {Object} layoutJson - The layout JSON to translate
 * @param {string} targetLanguage - The target language code
 * @returns {Promise<Object>} - The translated layout JSON
 */
const translateLayoutContent = async (layoutJson, targetLanguage) => {
  // This is a mock implementation that would normally translate the content
  // For now, we're just returning the original layout
  return layoutJson;
};

export default {
  addLanguage,
  removeLanguage,
  setDefaultLanguage
};