import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Badge } from '../../../src/components/ui/badge';
import { Loader2, Languages, RefreshCcw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthProvider';
import api from '../../utils/api';
import {
    fetchTranslationStatus,
    bulkTranslate,
    type TranslationStatus,
    type TranslationStatusItem,
} from '../../services/translationApi';

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English', zh: '中文 (Chinese)', ms: 'Bahasa Melayu', ta: 'Tamil', fr: 'French',
    es: 'Spanish', de: 'German', ja: '日本語 (Japanese)', ko: '한국어 (Korean)', it: 'Italian',
    pt: 'Portuguese', ru: 'Russian', ar: 'العربية (Arabic)', hi: 'Hindi', th: 'Thai',
    vi: 'Vietnamese', id: 'Indonesian', nl: 'Dutch', pl: 'Polish', sv: 'Swedish',
};

const TranslationCenter: React.FC = () => {
    const { currentTenantId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [translating, setTranslating] = useState(false);
    const [status, setStatus] = useState<TranslationStatus | null>(null);
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Fetch available languages
    useEffect(() => {
        const fetchLanguages = async () => {
            if (!currentTenantId) return;
            try {
                const defaultRes = await api.get(`/api/site-settings/site_language?tenantId=${currentTenantId}`);
                const defaultData = await defaultRes.json();
                const defaultLang = defaultData?.setting_value || 'en';

                const contentRes = await api.get(`/api/site-settings/site_content_languages?tenantId=${currentTenantId}`);
                const contentData = await contentRes.json();

                if (contentData?.setting_value) {
                    const allLangs = contentData.setting_value.split(',').map((l: string) => l.trim()).filter(Boolean);
                    const additional = allLangs.filter((l: string) => l !== defaultLang);
                    setAvailableLanguages(additional);
                    if (additional.length > 0 && !selectedLanguage) {
                        setSelectedLanguage(additional[0]);
                    }
                }
            } catch (err) {
                console.error('[translation] Error fetching languages:', err);
            }
        };
        fetchLanguages();
    }, [currentTenantId]);

    // Fetch translation status
    const refreshStatus = useCallback(async () => {
        if (!currentTenantId) return;
        setLoading(true);
        try {
            const data = await fetchTranslationStatus(
                selectedLanguage || undefined,
                contentTypeFilter !== 'all' ? contentTypeFilter : undefined
            );
            setStatus(data);
        } catch (err) {
            console.error('[translation] Error fetching status:', err);
        } finally {
            setLoading(false);
        }
    }, [currentTenantId, selectedLanguage, contentTypeFilter]);

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    // Handle bulk translate
    const handleBulkTranslate = async () => {
        if (!selectedLanguage || selectedItems.size === 0) {
            toast.error('Select items and a target language');
            return;
        }
        setTranslating(true);
        try {
            // Group selected items by content type
            const itemsByType: Record<string, Array<{ contentId: number | string; fields: Record<string, string> }>> = {};
            for (const key of selectedItems) {
                const [type, id] = key.split(':');
                if (!itemsByType[type]) itemsByType[type] = [];
                // For bulk translate, we pass empty fields — the backend will extract them
                itemsByType[type].push({ contentId: parseInt(id), fields: {} });
            }

            for (const [contentType, items] of Object.entries(itemsByType)) {
                await bulkTranslate(contentType, items, selectedLanguage);
            }

            toast.success(`Bulk translation initiated for ${selectedItems.size} items`);
            setSelectedItems(new Set());
            await refreshStatus();
        } catch (err: any) {
            toast.error(err.message || 'Bulk translation failed');
        } finally {
            setTranslating(false);
        }
    };

    // Toggle item selection
    const toggleItem = (key: string) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // Select all visible items
    const selectAll = () => {
        if (!status) return;
        const filtered = getFilteredItems();
        const keys = filtered.map(i => `${i.contentType}:${i.contentId}`);
        setSelectedItems(new Set(keys));
    };

    // Get filtered items
    const getFilteredItems = (): TranslationStatusItem[] => {
        if (!status) return [];
        let items = status.items;
        if (selectedLanguage) {
            items = items.filter(i => i.language === selectedLanguage);
        }
        if (contentTypeFilter !== 'all') {
            items = items.filter(i => i.contentType === contentTypeFilter);
        }
        return items;
    };

    // Calculate progress for a language
    const getLanguageProgress = (lang: string) => {
        if (!status?.byLanguage[lang]) return { percent: 0, label: 'No data' };
        const data = status.byLanguage[lang];
        if (data.total === 0) return { percent: 0, label: '0 items' };
        const percent = Math.round((data.translated / data.total) * 100);
        return { percent, label: `${data.translated}/${data.total} items` };
    };

    const getStatusBadge = (item: TranslationStatusItem) => {
        if (item.publishedFields > 0) {
            return <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Published</Badge>;
        }
        if (item.reviewedFields > 0) {
            return <Badge className="bg-blue-100 text-blue-800 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Reviewed</Badge>;
        }
        if (item.aiFields > 0) {
            return <Badge className="bg-yellow-100 text-yellow-800 text-xs"><Clock className="h-3 w-3 mr-1" />AI Generated</Badge>;
        }
        if (item.draftFields > 0) {
            return <Badge className="bg-gray-100 text-gray-800 text-xs"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
        }
        return <Badge className="bg-red-100 text-red-800 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Not Started</Badge>;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Languages className="h-6 w-6" />
                        Translation Center
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage translations across all your content
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={refreshStatus} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Language Progress Cards */}
            {availableLanguages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {availableLanguages.map(lang => {
                        const progress = getLanguageProgress(lang);
                        const isSelected = lang === selectedLanguage;
                        return (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`text-left p-4 rounded-lg border-2 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-sm">{LANGUAGE_NAMES[lang] || lang}</span>
                                    <span className="text-xs text-muted-foreground">{progress.label}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-500 h-2 rounded-full transition-all"
                                        style={{ width: `${progress.percent}%` }}
                                    />
                                </div>
                                <div className="text-xs text-right text-muted-foreground mt-1">{progress.percent}%</div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Filters & Actions */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex gap-2">
                    {['all', 'page', 'post'].map(type => (
                        <Button
                            key={type}
                            variant={contentTypeFilter === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setContentTypeFilter(type)}
                        >
                            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                        </Button>
                    ))}
                </div>
                <div className="flex-1" />
                {selectedItems.size > 0 && (
                    <Button
                        size="sm"
                        onClick={handleBulkTranslate}
                        disabled={translating || !selectedLanguage}
                    >
                        {translating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : '🤖'}
                        {translating ? 'Translating...' : `Translate ${selectedItems.size} Selected`}
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={selectAll}>
                    Select All
                </Button>
            </div>

            {/* Items Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading translation status...
                </div>
            ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.size > 0 && selectedItems.size === getFilteredItems().length}
                                        onChange={(e) => e.target.checked ? selectAll() : setSelectedItems(new Set())}
                                    />
                                </th>
                                <th className="p-3 text-left">Content</th>
                                <th className="p-3 text-left">Type</th>
                                <th className="p-3 text-left">Language</th>
                                <th className="p-3 text-left">Fields</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredItems().length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        {availableLanguages.length === 0
                                            ? 'No languages configured. Add languages in Settings to get started.'
                                            : 'No translations found. Start translating content from the page or post editors.'}
                                    </td>
                                </tr>
                            ) : (
                                getFilteredItems().map((item, idx) => {
                                    const key = `${item.contentType}:${item.contentId}`;
                                    return (
                                        <tr key={idx} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(key)}
                                                    onChange={() => toggleItem(key)}
                                                />
                                            </td>
                                            <td className="p-3 font-medium">#{item.contentId}</td>
                                            <td className="p-3 capitalize">{item.contentType}</td>
                                            <td className="p-3">{LANGUAGE_NAMES[item.language] || item.language}</td>
                                            <td className="p-3">{item.totalFields} fields</td>
                                            <td className="p-3">{getStatusBadge(item)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TranslationCenter;
