// Main Sparti Builder exports
export { SpartiBuilder } from '@/components/cms/SpartiBuilder';
export { SpartiBuilderProvider, useSpartiBuilder } from '@/components/cms/SpartiBuilderProvider';
export { SpartiToolbar } from '@/components/cms/SpartiToolbar';
export { ContentEditPanel } from '@/components/cms/ContentEditPanel';

// CMS Module exports
export { SpartiCMS } from '@/components/cms/SpartiCMS';
export { SpartiCMSWrapper } from '@/components/cms/SpartiCMSWrapper';
export { AuthProvider, useAuth } from '@/components/cms/auth/AuthProvider';
export { default as ProtectedRoute } from '@/components/cms/auth/ProtectedRoute';
export { CMSSettingsProvider, useCMSSettings } from '@/context/CMSSettingsContext';
export type { CMSSettings, TypographySettings, ColorSettings, LogoSettings, MediaItem } from '@/context/CMSSettingsContext';

// Core functionality
export { UniversalElementDetector } from '@/lib/cms/core/universal-detector';
export * from '@/types/cms';

// Component Registry
export { componentRegistry, ComponentRegistry } from '@/lib/cms/registry';
export type { ComponentDefinition, ComponentProperty } from '@/lib/cms/registry/types';

// Hooks
export { default as useDatabase } from '@/hooks/cms/useDatabase';
export { useSpartiEditor } from '@/hooks/cms/useSpartiEditor';

// Utilities
export * from '@/utils/cms/component-detector';
