/**
 * Translation Service
 * 
 * Provides CRUD operations for content translations and integrates
 * with the Google Translation Service for AI-powered translations.
 */

import { query } from '../db/index.js';
import { translateText, batchTranslateTexts } from './googleTranslationService.js';
import crypto from 'crypto';

// ==================== Utility ====================

/**
 * Compute MD5 hash of source text for change detection
 * @param {string} text - Source text to hash
 * @returns {string} MD5 hex digest
 */
export function computeSourceHash(text) {
    if (!text) return '';
    return crypto.createHash('md5').update(String(text)).digest('hex');
}

// ==================== Read Operations ====================

/**
 * Get all translations for a specific content item in a language
 * @param {string} contentType - 'page' or 'post'
 * @param {number|string} contentId
 * @param {string} language - ISO language code
 * @param {string} tenantId
 * @returns {Promise<Object>} Map of field_name -> { translated_value, status, source_hash, ... }
 */
export async function getTranslations(contentType, contentId, language, tenantId) {
    const result = await query(`
    SELECT id, field_name, translated_value, source_hash, status, translated_by, updated_at
    FROM content_translations
    WHERE tenant_id = $1 AND content_type = $2 AND content_id = $3 AND language = $4
  `, [tenantId, contentType, contentId, language]);

    const translations = {};
    for (const row of result.rows) {
        translations[row.field_name] = {
            id: row.id,
            value: row.translated_value,
            sourceHash: row.source_hash,
            status: row.status,
            translatedBy: row.translated_by,
            updatedAt: row.updated_at,
        };
    }
    return translations;
}

/**
 * Get available translations (languages) for a content item
 * @param {string} contentType
 * @param {number|string} contentId
 * @param {string} tenantId
 * @returns {Promise<Array>} Array of { language, fieldCount, statuses }
 */
export async function getContentLanguages(contentType, contentId, tenantId) {
    const result = await query(`
    SELECT 
      language,
      COUNT(*) as field_count,
      COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
      COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed_count,
      COUNT(CASE WHEN status = 'ai_generated' THEN 1 END) as ai_generated_count,
      COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
      MAX(updated_at) as last_updated
    FROM content_translations
    WHERE tenant_id = $1 AND content_type = $2 AND content_id = $3
    GROUP BY language
    ORDER BY language
  `, [tenantId, contentType, contentId]);

    return result.rows.map(row => ({
        language: row.language,
        fieldCount: parseInt(row.field_count),
        publishedCount: parseInt(row.published_count),
        reviewedCount: parseInt(row.reviewed_count),
        aiGeneratedCount: parseInt(row.ai_generated_count),
        draftCount: parseInt(row.draft_count),
        lastUpdated: row.last_updated,
    }));
}

/**
 * Get translation status overview across all content for a tenant
 * @param {string} tenantId
 * @param {string} [language] - Optional: filter by language
 * @param {string} [contentType] - Optional: filter by content type
 * @returns {Promise<Object>}
 */
export async function getTranslationStatus(tenantId, language = null, contentType = null) {
    let sql = `
    SELECT 
      ct.content_type,
      ct.language,
      ct.content_id,
      COUNT(*) as total_fields,
      COUNT(CASE WHEN ct.status = 'published' THEN 1 END) as published_fields,
      COUNT(CASE WHEN ct.status = 'reviewed' THEN 1 END) as reviewed_fields,
      COUNT(CASE WHEN ct.status = 'ai_generated' THEN 1 END) as ai_fields,
      COUNT(CASE WHEN ct.status = 'draft' THEN 1 END) as draft_fields
    FROM content_translations ct
    WHERE ct.tenant_id = $1
  `;
    const params = [tenantId];
    let paramIndex = 2;

    if (language) {
        sql += ` AND ct.language = $${paramIndex}`;
        params.push(language);
        paramIndex++;
    }
    if (contentType) {
        sql += ` AND ct.content_type = $${paramIndex}`;
        params.push(contentType);
        paramIndex++;
    }

    sql += ` GROUP BY ct.content_type, ct.language, ct.content_id ORDER BY ct.content_type, ct.language`;

    const result = await query(sql, params);

    // Aggregate into a summary
    const summary = {
        byLanguage: {},
        byContentType: {},
        items: result.rows.map(row => ({
            contentType: row.content_type,
            contentId: row.content_id,
            language: row.language,
            totalFields: parseInt(row.total_fields),
            publishedFields: parseInt(row.published_fields),
            reviewedFields: parseInt(row.reviewed_fields),
            aiFields: parseInt(row.ai_fields),
            draftFields: parseInt(row.draft_fields),
        })),
    };

    for (const item of summary.items) {
        // By language
        if (!summary.byLanguage[item.language]) {
            summary.byLanguage[item.language] = { total: 0, translated: 0, reviewed: 0, published: 0 };
        }
        summary.byLanguage[item.language].total++;
        if (item.totalFields > 0) summary.byLanguage[item.language].translated++;
        if (item.reviewedFields > 0) summary.byLanguage[item.language].reviewed++;
        if (item.publishedFields > 0) summary.byLanguage[item.language].published++;

        // By content type
        if (!summary.byContentType[item.contentType]) {
            summary.byContentType[item.contentType] = { total: 0, translated: 0 };
        }
        summary.byContentType[item.contentType].total++;
        if (item.totalFields > 0) summary.byContentType[item.contentType].translated++;
    }

    return summary;
}

// ==================== Write Operations ====================

/**
 * Save or update a single translation field
 * @param {string} contentType
 * @param {number|string} contentId
 * @param {string} language
 * @param {string} fieldName
 * @param {string} value - Translated text
 * @param {string} sourceText - Original source text (for hash calculation)
 * @param {string} translatedBy - 'ai' or user ID
 * @param {string} tenantId
 * @param {string} [status='draft']
 * @returns {Promise<Object>}
 */
export async function saveTranslation(contentType, contentId, language, fieldName, value, sourceText, translatedBy, tenantId, status = 'draft') {
    const sourceHash = computeSourceHash(sourceText);

    const result = await query(`
    INSERT INTO content_translations 
      (tenant_id, content_type, content_id, language, field_name, translated_value, source_hash, status, translated_by, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (tenant_id, content_type, content_id, language, field_name)
    DO UPDATE SET 
      translated_value = EXCLUDED.translated_value,
      source_hash = EXCLUDED.source_hash,
      status = EXCLUDED.status,
      translated_by = EXCLUDED.translated_by,
      updated_at = NOW()
    RETURNING *
  `, [tenantId, contentType, contentId, language, fieldName, value, sourceHash, status, translatedBy]);

    return result.rows[0];
}

/**
 * Save multiple translation fields at once
 * @param {string} contentType
 * @param {number|string} contentId
 * @param {string} language
 * @param {Object} fields - Map of { fieldName: { value, sourceText } }
 * @param {string} translatedBy
 * @param {string} tenantId
 * @param {string} [status='draft']
 * @returns {Promise<Object[]>}
 */
export async function saveMultipleTranslations(contentType, contentId, language, fields, translatedBy, tenantId, status = 'draft') {
    const results = [];
    for (const [fieldName, { value, sourceText }] of Object.entries(fields)) {
        const result = await saveTranslation(
            contentType, contentId, language, fieldName,
            value, sourceText, translatedBy, tenantId, status
        );
        results.push(result);
    }
    return results;
}

/**
 * Update translation status (e.g., from ai_generated → reviewed → published)
 * @param {number} translationId
 * @param {string} status
 * @returns {Promise<Object>}
 */
export async function updateTranslationStatus(translationId, status) {
    const result = await query(`
    UPDATE content_translations SET status = $1, updated_at = NOW()
    WHERE id = $2 RETURNING *
  `, [status, translationId]);
    return result.rows[0];
}

/**
 * Update a translation's value manually (user edit)
 * @param {number} translationId
 * @param {string} value
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function updateTranslation(translationId, value, userId) {
    const result = await query(`
    UPDATE content_translations 
    SET translated_value = $1, translated_by = $2, status = 'reviewed', updated_at = NOW()
    WHERE id = $3 RETURNING *
  `, [value, userId, translationId]);
    return result.rows[0];
}

// ==================== Delete Operations ====================

/**
 * Delete all translations for a content item in a specific language
 * @param {string} contentType
 * @param {number|string} contentId
 * @param {string} language
 * @param {string} tenantId
 * @returns {Promise<number>} Count of deleted rows
 */
export async function deleteTranslations(contentType, contentId, language, tenantId) {
    const result = await query(`
    DELETE FROM content_translations
    WHERE tenant_id = $1 AND content_type = $2 AND content_id = $3 AND language = $4
  `, [tenantId, contentType, contentId, language]);
    return result.rowCount;
}

/**
 * Delete all translations for a content item (all languages)
 * @param {string} contentType
 * @param {number|string} contentId
 * @param {string} tenantId
 * @returns {Promise<number>}
 */
export async function deleteAllTranslations(contentType, contentId, tenantId) {
    const result = await query(`
    DELETE FROM content_translations
    WHERE tenant_id = $1 AND content_type = $2 AND content_id = $3
  `, [tenantId, contentType, contentId]);
    return result.rowCount;
}

// ==================== AI Translation ====================

/**
 * AI-translate a single field and save the result
 * @param {string} contentType
 * @param {number|string} contentId
 * @param {string} language - Target language code
 * @param {string} fieldName
 * @param {string} sourceText - Text to translate
 * @param {string} sourceLanguage - Source language code (e.g., 'en')
 * @param {string} tenantId
 * @returns {Promise<Object>}
 */
export async function translateField(contentType, contentId, language, fieldName, sourceText, sourceLanguage, tenantId) {
    if (!sourceText || sourceText.trim() === '') {
        return await saveTranslation(
            contentType, contentId, language, fieldName,
            '', sourceText, 'ai', tenantId, 'ai_generated'
        );
    }

    const translatedText = await translateText(sourceText, language, sourceLanguage);

    return await saveTranslation(
        contentType, contentId, language, fieldName,
        translatedText, sourceText, 'ai', tenantId, 'ai_generated'
    );
}

/**
 * AI-translate multiple fields for a content item
 * @param {string} contentType
 * @param {number|string} contentId
 * @param {string} language - Target language
 * @param {Object} fields - Map of { fieldName: sourceText }
 * @param {string} sourceLanguage
 * @param {string} tenantId
 * @returns {Promise<Object>} Map of fieldName -> translation result
 */
export async function translateAllFields(contentType, contentId, language, fields, sourceLanguage, tenantId) {
    const fieldNames = Object.keys(fields);
    const sourceTexts = Object.values(fields).map(v => String(v || ''));

    // Filter out empty texts for batch translation
    const nonEmptyIndices = [];
    const nonEmptyTexts = [];
    sourceTexts.forEach((text, i) => {
        if (text && text.trim() !== '') {
            nonEmptyIndices.push(i);
            nonEmptyTexts.push(text);
        }
    });

    // Batch translate non-empty texts
    let translatedTexts = [];
    if (nonEmptyTexts.length > 0) {
        translatedTexts = await batchTranslateTexts(nonEmptyTexts, language, sourceLanguage);
    }

    // Save all translations
    const results = {};
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const sourceText = sourceTexts[i];
        const nonEmptyIdx = nonEmptyIndices.indexOf(i);
        const translatedValue = nonEmptyIdx !== -1 ? translatedTexts[nonEmptyIdx] : '';

        const saved = await saveTranslation(
            contentType, contentId, language, fieldName,
            translatedValue, sourceText, 'ai', tenantId, 'ai_generated'
        );
        results[fieldName] = saved;
    }

    return results;
}

/**
 * Bulk AI-translate multiple content items
 * @param {string} contentType
 * @param {Array<{contentId, fields}>} items - Array of { contentId, fields: { fieldName: sourceText } }
 * @param {string} language
 * @param {string} sourceLanguage
 * @param {string} tenantId
 * @returns {Promise<Object>} Map of contentId -> translation results
 */
export async function bulkTranslate(contentType, items, language, sourceLanguage, tenantId) {
    const results = {};
    for (const item of items) {
        try {
            results[item.contentId] = await translateAllFields(
                contentType, item.contentId, language, item.fields, sourceLanguage, tenantId
            );
        } catch (error) {
            console.error(`[translation] Error translating ${contentType}:${item.contentId} to ${language}:`, error);
            results[item.contentId] = { error: error.message };
        }
    }
    return results;
}

// ==================== Outdated Detection ====================

/**
 * Check if translations are outdated for a content item
 * Compares stored source_hash with current source text hash
 * @param {string} contentType
 * @param {number|string} contentId
 * @param {string} language
 * @param {Object} currentSourceFields - Map of { fieldName: currentSourceText }
 * @param {string} tenantId
 * @returns {Promise<Object>} Map of fieldName -> { outdated: boolean, translation }
 */
export async function checkOutdated(contentType, contentId, language, currentSourceFields, tenantId) {
    const translations = await getTranslations(contentType, contentId, language, tenantId);
    const results = {};

    for (const [fieldName, currentText] of Object.entries(currentSourceFields)) {
        const currentHash = computeSourceHash(currentText);
        const translation = translations[fieldName];

        if (translation) {
            results[fieldName] = {
                outdated: translation.sourceHash !== currentHash,
                translation,
                currentHash,
                storedHash: translation.sourceHash,
            };
        } else {
            results[fieldName] = {
                outdated: false,
                translation: null,
                missing: true,
            };
        }
    }

    return results;
}

// ==================== Page-Specific Helpers ====================

/**
 * Get translatable fields from a page layout JSON
 * Extracts text content from all components for translation
 * @param {Object} layoutJson - Page layout with components array
 * @returns {Object} Map of field paths to text values
 */
export function extractPageTranslatableFields(layoutJson) {
    const fields = {};
    if (!layoutJson || !layoutJson.components) return fields;

    for (const component of layoutJson.components) {
        const prefix = `component_${component.id || component.type}`;

        // Extract common text props
        if (component.props) {
            const textProps = ['title', 'subtitle', 'content', 'description', 'heading',
                'text', 'buttonText', 'label', 'placeholder', 'caption'];

            for (const prop of textProps) {
                if (component.props[prop] && typeof component.props[prop] === 'string') {
                    fields[`${prefix}.${prop}`] = component.props[prop];
                }
            }

            // Handle items array (for sliders, testimonials, FAQ, etc.)
            if (Array.isArray(component.props.items)) {
                component.props.items.forEach((item, idx) => {
                    for (const [key, value] of Object.entries(item)) {
                        if (typeof value === 'string' && value.trim() &&
                            !key.includes('image') && !key.includes('url') && !key.includes('icon')) {
                            fields[`${prefix}.items[${idx}].${key}`] = value;
                        }
                    }
                });
            }
        }
    }

    return fields;
}

/**
 * Get translatable fields from a blog post
 * @param {Object} post - Post object from database
 * @returns {Object} Map of field names to values
 */
export function extractPostTranslatableFields(post) {
    const fields = {};

    if (post.title) fields.title = post.title;
    if (post.content) fields.content = post.content;
    if (post.excerpt) fields.excerpt = post.excerpt;
    if (post.meta_title) fields.meta_title = post.meta_title;
    if (post.meta_description) fields.meta_description = post.meta_description;
    if (post.og_title) fields.og_title = post.og_title;
    if (post.og_description) fields.og_description = post.og_description;
    if (post.twitter_title) fields.twitter_title = post.twitter_title;
    if (post.twitter_description) fields.twitter_description = post.twitter_description;

    return fields;
}

export default {
    computeSourceHash,
    getTranslations,
    getContentLanguages,
    getTranslationStatus,
    saveTranslation,
    saveMultipleTranslations,
    updateTranslationStatus,
    updateTranslation,
    deleteTranslations,
    deleteAllTranslations,
    translateField,
    translateAllFields,
    bulkTranslate,
    checkOutdated,
    extractPageTranslatableFields,
    extractPostTranslatableFields,
};
