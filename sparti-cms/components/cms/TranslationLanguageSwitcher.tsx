import React, { useState, useEffect } from 'react';
import { fetchContentLanguages, type ContentLanguage } from '../../services/translationApi';

interface TranslationLanguageSwitcherProps {
    contentType: 'page' | 'post';
    contentId: number | string;
    currentLanguage: string;
    defaultLanguage: string;
    availableLanguages: string[];
    onLanguageChange: (language: string) => void;
    onTranslateAll?: () => void;
}

const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English', zh: '中文', ms: 'Malay', ta: 'Tamil', fr: 'French',
    es: 'Spanish', de: 'German', ja: '日本語', ko: '한국어', it: 'Italian',
    pt: 'Portuguese', ru: 'Russian', ar: 'العربية', hi: 'Hindi', th: 'Thai',
    vi: 'Vietnamese', id: 'Indonesian', nl: 'Dutch', pl: 'Polish', sv: 'Swedish',
    default: 'Default',
};

type TranslationStatusType = 'not_started' | 'in_progress' | 'reviewed' | 'published';

function getOverallStatus(lang: ContentLanguage | undefined): TranslationStatusType {
    if (!lang || lang.fieldCount === 0) return 'not_started';
    if (lang.publishedCount > 0) return 'published';
    if (lang.reviewedCount > 0) return 'reviewed';
    return 'in_progress';
}

const statusColors: Record<TranslationStatusType, string> = {
    not_started: '#9CA3AF',
    in_progress: '#F59E0B',
    reviewed: '#3B82F6',
    published: '#10B981',
};

const statusLabels: Record<TranslationStatusType, string> = {
    not_started: 'Not started',
    in_progress: 'In progress',
    reviewed: 'Reviewed',
    published: 'Published',
};

const TranslationLanguageSwitcher: React.FC<TranslationLanguageSwitcherProps> = ({
    contentType,
    contentId,
    currentLanguage,
    defaultLanguage,
    availableLanguages,
    onLanguageChange,
    onTranslateAll,
}) => {
    const [contentLanguages, setContentLanguages] = useState<ContentLanguage[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!contentId) return;
        setLoading(true);
        fetchContentLanguages(contentType, contentId)
            .then(langs => setContentLanguages(langs || []))
            .catch(err => {
                console.error('[translation] Error fetching languages:', err);
                setContentLanguages([]);
            })
            .finally(() => setLoading(false));
    }, [contentType, contentId]);

    const allLanguages = [defaultLanguage, ...availableLanguages.filter(l => l !== defaultLanguage)];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                    <path d="M2 5h7M9 3v2M4 5a48.071 48.071 0 0 0 4.5 7.5M12 12l-3.5-3.5" />
                    <path d="M14.5 3h6.5l-4 14.5" />
                    <path d="M12.5 8.5l3 3" />
                </svg>
                <span style={styles.title}>Languages</span>
                {onTranslateAll && currentLanguage !== defaultLanguage && (
                    <button
                        onClick={onTranslateAll}
                        style={styles.translateAllBtn}
                        title="AI translate all fields"
                    >
                        🤖 Translate All
                    </button>
                )}
            </div>

            <div style={styles.tabs}>
                {allLanguages.map(lang => {
                    const langData = contentLanguages.find(cl => cl.language === lang);
                    const status = lang === defaultLanguage ? 'published' : getOverallStatus(langData);
                    const isActive = lang === currentLanguage;
                    const label = LANGUAGE_NAMES[lang] || lang.toUpperCase();

                    return (
                        <button
                            key={lang}
                            onClick={() => onLanguageChange(lang)}
                            style={{
                                ...styles.tab,
                                ...(isActive ? styles.tabActive : {}),
                                borderBottomColor: isActive ? '#6366F1' : 'transparent',
                            }}
                            title={`${label} — ${statusLabels[status as TranslationStatusType]}`}
                        >
                            <span
                                style={{
                                    ...styles.statusDot,
                                    backgroundColor: statusColors[status as TranslationStatusType],
                                }}
                            />
                            <span style={styles.tabLabel}>{label}</span>
                            {lang === defaultLanguage && (
                                <span style={styles.defaultBadge}>Default</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {loading && <div style={styles.loading}>Loading translation status…</div>}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        padding: '8px 12px',
        marginBottom: 16,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 8,
        fontSize: 13,
        color: '#6B7280',
        fontWeight: 500,
    },
    title: {
        flex: 1,
    },
    translateAllBtn: {
        padding: '4px 10px',
        fontSize: 12,
        border: '1px solid #6366F1',
        borderRadius: 6,
        background: 'white',
        color: '#6366F1',
        cursor: 'pointer',
        fontWeight: 500,
        transition: 'all 0.15s',
    },
    tabs: {
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        border: 'none',
        borderBottom: '2px solid transparent',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: 13,
        color: '#374151',
        borderRadius: '6px 6px 0 0',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap' as const,
    },
    tabActive: {
        background: 'white',
        fontWeight: 600,
        color: '#6366F1',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        flexShrink: 0,
    },
    tabLabel: {},
    defaultBadge: {
        fontSize: 10,
        color: '#9CA3AF',
        background: '#F3F4F6',
        padding: '1px 5px',
        borderRadius: 4,
        fontWeight: 400,
    },
    loading: {
        fontSize: 12,
        color: '#9CA3AF',
        padding: '4px 0',
    },
};

export default TranslationLanguageSwitcher;
