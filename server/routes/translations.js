import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import translationService from '../../sparti-cms/services/translationService.js';

const router = express.Router();

// ===== GET TRANSLATIONS =====

// Get translations for a content item in a specific language
router.get('/translations/:contentType/:contentId/:language', authenticateUser, async (req, res) => {
    try {
        const { contentType, contentId, language } = req.params;
        const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';

        const translations = await translationService.getTranslations(contentType, contentId, language, tenantId);
        res.json({ success: true, translations });
    } catch (error) {
        console.error('[translation] Error getting translations:', error);
        res.status(500).json({ success: false, error: 'Failed to get translations' });
    }
});

// Get available languages for a content item
router.get('/translations/:contentType/:contentId/languages', authenticateUser, async (req, res) => {
    try {
        const { contentType, contentId } = req.params;
        const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';

        const languages = await translationService.getContentLanguages(contentType, contentId, tenantId);
        res.json({ success: true, languages });
    } catch (error) {
        console.error('[translation] Error getting content languages:', error);
        res.status(500).json({ success: false, error: 'Failed to get content languages' });
    }
});

// Get translation status overview
router.get('/translations/status', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
        const { language, contentType } = req.query;

        const status = await translationService.getTranslationStatus(tenantId, language || null, contentType || null);
        res.json({ success: true, status });
    } catch (error) {
        console.error('[translation] Error getting translation status:', error);
        res.status(500).json({ success: false, error: 'Failed to get translation status' });
    }
});

// ===== AI TRANSLATION =====

// AI translate specific fields for a content item
router.post('/translations/translate', authenticateUser, async (req, res) => {
    try {
        const { contentType, contentId, language, fields, sourceLanguage } = req.body;
        const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';

        if (!contentType || !contentId || !language || !fields) {
            return res.status(400).json({
                success: false,
                error: 'contentType, contentId, language, and fields are required'
            });
        }

        // If fields is a single field object { fieldName, sourceText }
        if (fields.fieldName && fields.sourceText !== undefined) {
            const result = await translationService.translateField(
                contentType, contentId, language,
                fields.fieldName, fields.sourceText,
                sourceLanguage || 'en', tenantId
            );
            return res.json({ success: true, translation: result });
        }

        // If fields is a map of { fieldName: sourceText }
        const result = await translationService.translateAllFields(
            contentType, contentId, language, fields,
            sourceLanguage || 'en', tenantId
        );
        res.json({ success: true, translations: result });
    } catch (error) {
        console.error('[translation] Error translating:', error);
        res.status(500).json({ success: false, error: 'Translation failed: ' + error.message });
    }
});

// Bulk translate multiple content items
router.post('/translations/bulk-translate', authenticateUser, async (req, res) => {
    try {
        const { contentType, items, language, sourceLanguage } = req.body;
        const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';

        if (!contentType || !items || !language) {
            return res.status(400).json({
                success: false,
                error: 'contentType, items, and language are required'
            });
        }

        const results = await translationService.bulkTranslate(
            contentType, items, language,
            sourceLanguage || 'en', tenantId
        );
        res.json({ success: true, results });
    } catch (error) {
        console.error('[translation] Error bulk translating:', error);
        res.status(500).json({ success: false, error: 'Bulk translation failed: ' + error.message });
    }
});

// ===== SAVE / UPDATE TRANSLATIONS =====

// Save or update a translation manually
router.put('/translations/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { value } = req.body;
        const userId = req.user?.id || 'user';

        if (value === undefined) {
            return res.status(400).json({ success: false, error: 'value is required' });
        }

        const result = await translationService.updateTranslation(parseInt(id), value, String(userId));
        if (!result) {
            return res.status(404).json({ success: false, error: 'Translation not found' });
        }
        res.json({ success: true, translation: result });
    } catch (error) {
        console.error('[translation] Error updating translation:', error);
        res.status(500).json({ success: false, error: 'Failed to update translation' });
    }
});

// Save multiple translations at once (manual save from editor)
router.post('/translations/save', authenticateUser, async (req, res) => {
    try {
        const { contentType, contentId, language, fields } = req.body;
        const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
        const userId = String(req.user?.id || 'user');

        if (!contentType || !contentId || !language || !fields) {
            return res.status(400).json({
                success: false,
                error: 'contentType, contentId, language, and fields are required'
            });
        }

        const results = await translationService.saveMultipleTranslations(
            contentType, contentId, language, fields, userId, tenantId, 'reviewed'
        );
        res.json({ success: true, translations: results });
    } catch (error) {
        console.error('[translation] Error saving translations:', error);
        res.status(500).json({ success: false, error: 'Failed to save translations' });
    }
});

// Update translation status
router.put('/translations/:id/status', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['draft', 'ai_generated', 'reviewed', 'published'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Valid status is required (draft, ai_generated, reviewed, published)'
            });
        }

        const result = await translationService.updateTranslationStatus(parseInt(id), status);
        if (!result) {
            return res.status(404).json({ success: false, error: 'Translation not found' });
        }
        res.json({ success: true, translation: result });
    } catch (error) {
        console.error('[translation] Error updating translation status:', error);
        res.status(500).json({ success: false, error: 'Failed to update translation status' });
    }
});

// ===== DELETE TRANSLATIONS =====

// Delete all translations for a content item in a specific language
router.delete('/translations/:contentType/:contentId/:language', authenticateUser, async (req, res) => {
    try {
        const { contentType, contentId, language } = req.params;
        const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';

        const deletedCount = await translationService.deleteTranslations(contentType, contentId, language, tenantId);
        res.json({ success: true, deletedCount });
    } catch (error) {
        console.error('[translation] Error deleting translations:', error);
        res.status(500).json({ success: false, error: 'Failed to delete translations' });
    }
});

// ===== OUTDATED DETECTION =====

// Check if translations are outdated
router.post('/translations/check-outdated', authenticateUser, async (req, res) => {
    try {
        const { contentType, contentId, language, currentSourceFields } = req.body;
        const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';

        if (!contentType || !contentId || !language || !currentSourceFields) {
            return res.status(400).json({
                success: false,
                error: 'contentType, contentId, language, and currentSourceFields are required'
            });
        }

        const results = await translationService.checkOutdated(
            contentType, contentId, language, currentSourceFields, tenantId
        );
        res.json({ success: true, results });
    } catch (error) {
        console.error('[translation] Error checking outdated translations:', error);
        res.status(500).json({ success: false, error: 'Failed to check outdated translations' });
    }
});

export default router;
