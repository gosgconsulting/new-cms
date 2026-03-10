import React, { useState } from 'react';

interface TranslatableFieldProps {
    fieldName: string;
    label: string;
    value: string;
    sourceValue?: string;
    isTranslationMode: boolean;
    isOutdated?: boolean;
    translationStatus?: 'draft' | 'ai_generated' | 'reviewed' | 'published' | null;
    onTranslate?: () => void;
    onChange: (value: string) => void;
    multiline?: boolean;
    translating?: boolean;
}

const TranslatableField: React.FC<TranslatableFieldProps> = ({
    fieldName,
    label,
    value,
    sourceValue,
    isTranslationMode,
    isOutdated = false,
    translationStatus = null,
    onTranslate,
    onChange,
    multiline = false,
    translating = false,
}) => {
    const [showSource, setShowSource] = useState(false);

    if (!isTranslationMode) {
        // Default language mode: render a simple field
        return (
            <div style={styles.fieldGroup}>
                <label style={styles.label}>{label}</label>
                {multiline ? (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ ...styles.input, ...styles.textarea }}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                    />
                ) : (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        style={styles.input}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                    />
                )}
            </div>
        );
    }

    // Translation mode: show source reference and AI translate button
    return (
        <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
                <label style={styles.label}>
                    {label}
                    {translationStatus && (
                        <span style={{
                            ...styles.statusBadge,
                            background: statusBadgeColors[translationStatus]?.bg || '#F3F4F6',
                            color: statusBadgeColors[translationStatus]?.text || '#6B7280',
                        }}>
                            {translationStatus.replace('_', ' ')}
                        </span>
                    )}
                    {isOutdated && (
                        <span style={styles.outdatedBadge} title="Source text has changed since this translation">
                            ⚠️ Outdated
                        </span>
                    )}
                </label>
                <div style={styles.actions}>
                    {sourceValue && (
                        <button
                            onClick={() => setShowSource(!showSource)}
                            style={styles.sourceToggle}
                            title="Show/hide source text"
                        >
                            {showSource ? '▼' : '▶'} Source
                        </button>
                    )}
                    {onTranslate && (
                        <button
                            onClick={onTranslate}
                            disabled={translating}
                            style={{
                                ...styles.translateBtn,
                                opacity: translating ? 0.6 : 1,
                            }}
                            title="AI translate this field"
                        >
                            {translating ? '⏳' : '🤖'} {translating ? 'Translating…' : 'AI Translate'}
                        </button>
                    )}
                </div>
            </div>

            {showSource && sourceValue && (
                <div style={styles.sourceBox}>
                    <div style={styles.sourceLabel}>Source text:</div>
                    <div style={styles.sourceText}>{sourceValue}</div>
                </div>
            )}

            {multiline ? (
                <textarea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ ...styles.input, ...styles.textarea }}
                    placeholder={`Translated ${label.toLowerCase()}...`}
                />
            ) : (
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    style={styles.input}
                    placeholder={`Translated ${label.toLowerCase()}...`}
                />
            )}
        </div>
    );
};

const statusBadgeColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: '#F3F4F6', text: '#6B7280' },
    ai_generated: { bg: '#FEF3C7', text: '#92400E' },
    reviewed: { bg: '#DBEAFE', text: '#1E40AF' },
    published: { bg: '#D1FAE5', text: '#065F46' },
};

const styles: Record<string, React.CSSProperties> = {
    fieldGroup: {
        marginBottom: 16,
    },
    labelRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: '#374151',
    },
    statusBadge: {
        fontSize: 10,
        fontWeight: 500,
        padding: '2px 6px',
        borderRadius: 4,
        textTransform: 'capitalize' as const,
    },
    outdatedBadge: {
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 6px',
        borderRadius: 4,
        background: '#FEE2E2',
        color: '#991B1B',
    },
    actions: {
        display: 'flex',
        gap: 6,
        alignItems: 'center',
    },
    sourceToggle: {
        padding: '3px 8px',
        fontSize: 11,
        border: '1px solid #E5E7EB',
        borderRadius: 4,
        background: 'white',
        color: '#6B7280',
        cursor: 'pointer',
    },
    translateBtn: {
        padding: '3px 10px',
        fontSize: 11,
        border: '1px solid #6366F1',
        borderRadius: 4,
        background: '#EEF2FF',
        color: '#6366F1',
        cursor: 'pointer',
        fontWeight: 500,
    },
    sourceBox: {
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: 6,
        padding: '8px 10px',
        marginBottom: 8,
        fontSize: 12,
    },
    sourceLabel: {
        fontSize: 11,
        color: '#92400E',
        fontWeight: 600,
        marginBottom: 4,
    },
    sourceText: {
        color: '#78350F',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap' as const,
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #D1D5DB',
        borderRadius: 6,
        fontSize: 14,
        color: '#111827',
        background: 'white',
        outline: 'none',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.15s',
    },
    textarea: {
        minHeight: 80,
        resize: 'vertical' as const,
        fontFamily: 'inherit',
        lineHeight: 1.5,
    },
};

export default TranslatableField;
