/**
 * Frontend Translation API Service
 * Provides typed methods for interacting with the translation API endpoints.
 */

import { api } from '../utils/api';

// ==================== Types ====================

export interface Translation {
    id: number;
    value: string;
    sourceHash: string;
    status: 'draft' | 'ai_generated' | 'reviewed' | 'published';
    translatedBy: string;
    updatedAt: string;
}

export interface TranslationMap {
    [fieldName: string]: Translation;
}

export interface ContentLanguage {
    language: string;
    fieldCount: number;
    publishedCount: number;
    reviewedCount: number;
    aiGeneratedCount: number;
    draftCount: number;
    lastUpdated: string;
}

export interface TranslationStatusItem {
    contentType: string;
    contentId: number;
    language: string;
    totalFields: number;
    publishedFields: number;
    reviewedFields: number;
    aiFields: number;
    draftFields: number;
}

export interface TranslationStatus {
    byLanguage: Record<string, { total: number; translated: number; reviewed: number; published: number }>;
    byContentType: Record<string, { total: number; translated: number }>;
    items: TranslationStatusItem[];
}

export interface OutdatedResult {
    outdated: boolean;
    translation: Translation | null;
    missing?: boolean;
    currentHash?: string;
    storedHash?: string;
}

// ==================== API Functions ====================

/**
 * Fetch translations for a content item in a specific language
 */
export async function fetchTranslations(
    contentType: string,
    contentId: number | string,
    language: string
): Promise<TranslationMap> {
    const res = await api.get(`/api/translations/${contentType}/${contentId}/${language}?_t=${Date.now()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch translations');
    return data.translations;
}

/**
 * Fetch available languages for a content item
 */
export async function fetchContentLanguages(
    contentType: string,
    contentId: number | string
): Promise<ContentLanguage[]> {
    const res = await api.get(`/api/translations/${contentType}/${contentId}/languages?_t=${Date.now()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch languages');
    return data.languages;
}

/**
 * Fetch translation status overview
 */
export async function fetchTranslationStatus(
    language?: string,
    contentType?: string
): Promise<TranslationStatus> {
    const params = new URLSearchParams();
    if (language) params.set('language', language);
    if (contentType) params.set('contentType', contentType);
    params.set('_t', Date.now().toString());
    const qs = params.toString();
    const res = await api.get(`/api/translations/status${qs ? '?' + qs : ''}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch status');
    return data.status;
}

/**
 * AI translate a single field
 */
export async function translateField(
    contentType: string,
    contentId: number | string,
    language: string,
    fieldName: string,
    sourceText: string,
    sourceLanguage: string = 'en'
): Promise<any> {
    const res = await api.post('/api/translations/translate', {
        contentType,
        contentId,
        language,
        fields: { fieldName, sourceText },
        sourceLanguage,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Translation failed');
    return data.translation;
}

/**
 * AI translate all provided fields at once
 */
export async function translateAllFields(
    contentType: string,
    contentId: number | string,
    language: string,
    fields: Record<string, string>,
    sourceLanguage: string = 'en'
): Promise<Record<string, any>> {
    const res = await api.post('/api/translations/translate', {
        contentType,
        contentId,
        language,
        fields,
        sourceLanguage,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Translation failed');
    return data.translations;
}

/**
 * Save manual translation edits
 */
export async function saveTranslations(
    contentType: string,
    contentId: number | string,
    language: string,
    fields: Record<string, { value: string; sourceText: string }>
): Promise<any[]> {
    const res = await api.post('/api/translations/save', {
        contentType,
        contentId,
        language,
        fields,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save translations');
    return data.translations;
}

/**
 * Update a single translation value
 */
export async function updateTranslation(
    translationId: number,
    value: string
): Promise<any> {
    const res = await api.put(`/api/translations/${translationId}`, { value });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update translation');
    return data.translation;
}

/**
 * Update translation status
 */
export async function updateTranslationStatus(
    translationId: number,
    status: 'draft' | 'ai_generated' | 'reviewed' | 'published'
): Promise<any> {
    const res = await api.put(`/api/translations/${translationId}/status`, { status });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update status');
    return data.translation;
}

/**
 * Delete translations for a content item in a language
 */
export async function deleteTranslations(
    contentType: string,
    contentId: number | string,
    language: string
): Promise<number> {
    const res = await api.delete(`/api/translations/${contentType}/${contentId}/${language}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete translations');
    return data.deletedCount;
}

/**
 * Check if translations are outdated
 */
export async function checkOutdated(
    contentType: string,
    contentId: number | string,
    language: string,
    currentSourceFields: Record<string, string>
): Promise<Record<string, OutdatedResult>> {
    const res = await api.post('/api/translations/check-outdated', {
        contentType,
        contentId,
        language,
        currentSourceFields,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to check outdated');
    return data.results;
}

/**
 * Bulk translate multiple content items
 */
export async function bulkTranslate(
    contentType: string,
    items: Array<{ contentId: number | string; fields: Record<string, string> }>,
    language: string,
    sourceLanguage: string = 'en'
): Promise<Record<string, any>> {
    const res = await api.post('/api/translations/bulk-translate', {
        contentType,
        items,
        language,
        sourceLanguage,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Bulk translation failed');
    return data.results;
}
