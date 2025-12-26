import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Edit, Eye, FileText, Rocket, Scale, Layout, Minus, Code, RefreshCw, History, Save, Loader2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../src/components/ui/select';
import ClassicRenderer from '../../../src/components/visual-builder/ClassicRenderer';
import ThemeRenderer from '../../../src/components/visual-builder/ThemeRenderer';
import { toast } from '../../../src/hooks/use-toast';
// Header and Footer are now managed as pages, not schema editors
import { useAuth } from '../auth/AuthProvider';
import { getDummyPages, isDevelopmentTenant } from '../admin/DevelopmentTenantData';
import api from '../../utils/api';
import { VisualEditorJSONDialog } from './VisualEditorJSONDialog';
import CodeViewerDialog from './PageEditor/CodeViewerDialog';
import SEODialog from './PageEditor/SEODialog';
import SEOPage from './PageEditor/SEOPage';
import { isValidComponentsArray } from '../../utils/componentHelpers';
import FlowbiteDioraRenderer from '../../../src/components/visual-builder/FlowbiteDioraRenderer';
import { applyFlowbiteTheme } from '../../../src/utils/flowbiteThemeManager';
import { ComponentSchema } from '../../types/schema';

interface PageItem {
  id: string;
  page_name: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  page_type: 'page' | 'landing' | 'legal' | 'header' | 'footer';
  meta_title?: string;
  meta_description?: string;
  seo_index?: boolean;
  campaign_source?: string;
  conversion_goal?: string;
  legal_type?: string;
  version?: string;
  created_at?: string;
  updated_at?: string;
}

interface PagesManagerProps {
  onEditModeChange?: (isEditMode: boolean) => void;
  currentTenantId: string;
  currentThemeId: string;
}

// Hardcoded pages for themes (fallback when database and file system are unavailable)
const getHardcodedThemePages = (themeId: string): PageItem[] => {
  const now = new Date().toISOString();
  
  // Define hardcoded pages for each theme
  const themePagesMap: Record<string, PageItem[]> = {
    'landingpage': [
      {
        id: 'theme-landingpage-homepage',
        page_name: 'Homepage',
        slug: '/',
        status: 'published',
        page_type: 'page',
        meta_title: 'Homepage',
        meta_description: 'Welcome to our homepage',
        seo_index: true,
        created_at: now,
        updated_at: now,
      },
    ],
    // Add more themes here as needed
    // 'other-theme': [...]
  };
  
  // Return hardcoded pages for the theme, or default homepage if not found
  if (themePagesMap[themeId]) {
    return themePagesMap[themeId];
  }
  
  // Default: return a homepage for any theme that doesn't have specific pages defined
  return [
    {
      id: `theme-${themeId}-homepage`,
      page_name: 'Homepage',
      slug: '/',
      status: 'published',
      page_type: 'page',
      meta_title: 'Homepage',
      meta_description: 'Welcome to our homepage',
      seo_index: true,
      created_at: now,
      updated_at: now,
    },
  ];
};

// Load theme pages from API (from database, synced from pages.json)
// Falls back to hardcoded pages if API fails
const loadThemePages = async (themeId: string | null): Promise<PageItem[]> => {
  if (!themeId) {
    return [];
  }
  
  try {
    const response = await api.get(`/api/pages/theme/${themeId}`);
    if (response.ok) {
      const data = await response.json();
      const pages = data.pages || [];
      
      // If API returned pages, use them
      if (pages.length > 0) {
        return pages;
      }
      
      // If API returned empty array, fallback to hardcoded pages
      console.log(`[testing] No pages from API for theme ${themeId}, using hardcoded pages`);
      return getHardcodedThemePages(themeId);
    } else {
      console.error('Failed to fetch theme pages from API, using hardcoded pages');
      return getHardcodedThemePages(themeId);
    }
  } catch (error) {
    console.error('Error fetching theme pages, using hardcoded pages:', error);
    // Fallback to hardcoded pages when API fails
    return getHardcodedThemePages(themeId);
  }
};

export const PagesManager: React.FC<PagesManagerProps> = ({ 
  onEditModeChange, 
  currentTenantId,
  currentThemeId
}) => {
  const { user } = useAuth();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visualEditorPage, setVisualEditorPage] = useState<{ slug: string; pageName: string; id?: string } | null>(null);
  const [seoPage, setSeoPage] = useState<{ slug: string; pageName: string; id: string } | null>(null);
  const [showJSONEditor, setShowJSONEditor] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [showSEODialog, setShowSEODialog] = useState(false);
  const [selectedPageForSEO, setSelectedPageForSEO] = useState<PageItem | null>(null);
  const [activeTab, setActiveTab] = useState<'page' | 'landing' | 'legal' | 'header' | 'footer'>('page');
  const [previewMode, setPreviewMode] = useState<'flowbite' | 'classic' | 'theme'>('flowbite');
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null); // Theme selected in preview

  // NEW: builder state for custom theme visual editor
  const [builderComponents, setBuilderComponents] = useState<ComponentSchema[]>([]);
  // Use a ref to track the latest components for save operations
  // This ensures we always have the most up-to-date value even if state hasn't updated yet
  const builderComponentsRef = useRef<ComponentSchema[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    builderComponentsRef.current = builderComponents;
  }, [builderComponents]);
  
  const [builderLoading, setBuilderLoading] = useState(false);
  const [builderError, setBuilderError] = useState<string | null>(null);
  const [savingLayout, setSavingLayout] = useState(false);

  // Fetch available themes for preview selector
  const { data: availableThemes = [] } = useQuery<Array<{ id: string; name: string; slug: string }>>({
    queryKey: ['themes'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/themes');
        if (response.ok) {
          const data = await response.json();
          return data.themes || [];
        } else {
          console.error('Failed to fetch themes');
          return [];
        }
      } catch (error) {
        console.error('Error fetching themes:', error);
        return [];
      }
    },
  });

  const tabs = [
    { id: 'page' as const, label: 'Pages', icon: FileText },
    // { id: 'landing' as const, label: 'Landing Pages', icon: Rocket },
    { id: 'legal' as const, label: 'Legals', icon: Scale },
    { id: 'header' as const, label: 'Header', icon: Layout },
    { id: 'footer' as const, label: 'Footer', icon: Layout },
  ];

  // Load pages from database for tenant + theme combination
  useEffect(() => {
    console.log('[testing] Loading pages for tenant:', currentTenantId, 'theme:', currentThemeId);
    
    if (currentTenantId && currentThemeId) {
      // Load pages for tenant + theme combination
      loadPages();
    } else {
      // No tenant or theme selected, show empty
      setPages([]);
      setLoading(false);
      setError(null);
    }
  }, [currentTenantId, currentThemeId, user]);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load pages for tenant + theme combination
      // If theme is 'custom', load tenant pages without theme filter
      // Otherwise, load pages filtered by both tenant and theme
      const url = currentThemeId === 'custom' 
        ? `/api/pages/all?tenantId=${currentTenantId}`
        : `/api/pages/all?tenantId=${currentTenantId}&themeId=${currentThemeId}`;
      
      console.log('[testing] Frontend: ========== Loading Pages ==========');
      console.log('[testing] Frontend: currentTenantId:', currentTenantId);
      console.log('[testing] Frontend: currentThemeId:', currentThemeId);
      console.log('[testing] Frontend: API URL:', url);
      console.log('[testing] Frontend: Headers:', {
        'X-Tenant-Id': currentTenantId || ''
      });
      
      let response;
      try {
        response = await api.get(url, {
          headers: {
            'X-Tenant-Id': currentTenantId || ''
          }
        });
      } catch (apiError: any) {
        // If API call fails (e.g., database not ready), try to get theme pages from filesystem
        console.log('[testing] Frontend: API call failed, trying theme pages fallback:', apiError?.message);
        
        if (currentThemeId && currentThemeId !== 'custom') {
          try {
            // Try to get theme pages directly (which falls back to filesystem)
            const themePagesResponse = await api.get(`/api/pages/theme/${currentThemeId}`);
            if (themePagesResponse.ok) {
              const themePagesData = await themePagesResponse.json();
              const themePages = themePagesData.pages || [];
              console.log('[testing] Frontend: Got pages from theme API (filesystem fallback):', themePages.length);
              setPages(themePages);
              setError(null);
              return;
            }
          } catch (themeError) {
            console.log('[testing] Frontend: Theme pages API also failed:', themeError);
          }
        }
        
        // If all else fails, use hardcoded pages for the theme
        console.log('[testing] Frontend: Using hardcoded pages as fallback');
        const hardcodedPages = getHardcodedThemePages(currentThemeId || '');
        setPages(hardcodedPages);
        setError(null);
        return;
      }
      
      console.log('[testing] Frontend: Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        // If API returned error, try filesystem fallback
        const errorText = await response.text();
        console.log('[testing] Frontend: API returned error, trying filesystem fallback:', errorText);
        
        if (currentThemeId && currentThemeId !== 'custom') {
          try {
            const themePagesResponse = await api.get(`/api/pages/theme/${currentThemeId}`);
            if (themePagesResponse.ok) {
              const themePagesData = await themePagesResponse.json();
              const themePages = themePagesData.pages || [];
              console.log('[testing] Frontend: Got pages from theme API (filesystem fallback):', themePages.length);
              setPages(themePages);
              setError(null);
              return;
            }
          } catch (themeError) {
            console.log('[testing] Frontend: Theme pages API also failed:', themeError);
          }
        }
        
        // Last resort: use hardcoded pages
        const hardcodedPages = getHardcodedThemePages(currentThemeId || '');
        setPages(hardcodedPages);
        setError(null);
        return;
      }
      
      const data = await response.json();
      console.log('[testing] Frontend: Response data:', {
        success: data.success,
        total: data.total,
        pagesCount: data.pages?.length || 0,
        tenantId: data.tenantId,
        themeId: data.themeId,
        from_filesystem: data.from_filesystem
      });
      
      const receivedPages = data.pages || [];
      console.log('[testing] Frontend: Received pages:', receivedPages.length);
      
      // If no pages from database, try filesystem fallback for theme
      if (receivedPages.length === 0 && currentThemeId && currentThemeId !== 'custom') {
        console.log('[testing] Frontend: No pages from database, trying filesystem fallback');
        try {
          const themePagesResponse = await api.get(`/api/pages/theme/${currentThemeId}`);
          if (themePagesResponse.ok) {
            const themePagesData = await themePagesResponse.json();
            const themePages = themePagesData.pages || [];
            if (themePages.length > 0) {
              console.log('[testing] Frontend: Got pages from filesystem:', themePages.length);
              setPages(themePages);
              setError(null);
              return;
            }
          }
        } catch (themeError) {
          console.log('[testing] Frontend: Theme pages API failed:', themeError);
        }
      }
      
      if (receivedPages.length > 0) {
        const pageTypes = receivedPages.map(p => p.page_type).filter((v, i, a) => a.indexOf(v) === i);
        console.log('[testing] Frontend: Page types received:', pageTypes.join(', '));
        console.log('[testing] Frontend: Sample page:', {
          id: receivedPages[0].id,
          page_name: receivedPages[0].page_name,
          slug: receivedPages[0].slug,
          page_type: receivedPages[0].page_type,
          theme_id: receivedPages[0].theme_id
        });
      }
      
      setPages(receivedPages);
      console.log('[testing] Frontend: Pages set in state:', receivedPages.length);
      console.log('[testing] Frontend: ====================================');
    } catch (error) {
      console.error('[testing] Frontend: Error loading pages:', error);
      // Don't set error - try to use hardcoded pages instead
      const hardcodedPages = getHardcodedThemePages(currentThemeId || '');
      setPages(hardcodedPages);
      setError(null);
    } finally {
      setLoading(false);
    }
  };


  const handleSEOIndexToggle = async (pageId: string, pageType: string, currentIndex: boolean) => {
    try {
      const response = await api.post('/api/pages/toggle-seo-index', {
        pageId,
        pageType,
        currentIndex,
        tenantId: currentTenantId
      });

      if (!response.ok) {
        throw new Error('Failed to toggle SEO index');
      }

      const data = await response.json();
      
      // Update the page in state
      setPages(prevPages => 
        prevPages.map(page => 
          page.id === pageId ? { ...page, seo_index: data.newIndex } : page
        )
      );

    } catch (error) {
      console.error('Error toggling SEO index:', error);
      // You could add a toast notification here
    }
  };

  const handleViewPage = (slug: string) => {
    let url = slug;
    
    if (currentThemeId && currentThemeId !== 'custom') {
      // Theme mode: use /theme/{themeId}/{slug} format
      // Remove leading slash from slug if present
      const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;
      
      if (cleanSlug === '' || cleanSlug === 'home' || cleanSlug === 'index') {
        // Homepage: /theme/{themeId}
        url = `/theme/${currentThemeId}`;
      } else {
        // Other pages: /theme/{themeId}/{slug}
        url = `/theme/${currentThemeId}/${cleanSlug}`;
      }
    }
    // For custom theme, use the slug as-is (existing behavior)
    
    window.open(url, '_blank');
  };

  const handleVisualEditor = (page: PageItem) => {
    setVisualEditorPage({
      slug: page.slug,
      pageName: page.page_name,
      id: page.id
    });
    if (onEditModeChange) {
      onEditModeChange(true);
    }
  };

  const handleOpenSEO = (page: PageItem) => {
    setSeoPage({
      slug: page.slug,
      pageName: page.page_name,
      id: page.id
    });
    if (onEditModeChange) {
      onEditModeChange(true);
    }
  };

  const handleSEOSave = () => {
    // Reload pages to reflect SEO changes
    loadPages();
  };

  // Extract load function to be reusable - wrapped in useCallback to prevent dependency issues
  const loadBuilderLayout = useCallback(async () => {
    if (!visualEditorPage) return;
    if (!currentTenantId || !visualEditorPage.id) return;

    try {
      setBuilderLoading(true);
      setBuilderError(null);

      // Use previewThemeId if set, otherwise use currentThemeId
      // If previewThemeId is explicitly set to null, use 'custom' (no theme)
      const effectiveThemeId = previewThemeId !== null ? (previewThemeId || currentThemeId) : null;
      // Include themeId when available and not 'custom'
      const themeParam = effectiveThemeId && effectiveThemeId !== 'custom' ? `&themeId=${effectiveThemeId}` : '';
      // Add cache-busting parameter to ensure fresh data after save
      const cacheBuster = `&_t=${Date.now()}`;
      const url = `/api/pages/${visualEditorPage.id}?tenantId=${currentTenantId}${themeParam}${cacheBuster}`;
      
      let response;
      try {
        response = await api.get(url, {
          headers: { 'X-Tenant-Id': currentTenantId || '' }
        });
      } catch (apiError: any) {
        // If API call fails (e.g., database not ready), try to get page from filesystem
        console.log('[testing] API call failed, attempting filesystem fallback:', apiError?.message);
        
        // If we have a theme ID, try to get pages from filesystem
        if (effectiveThemeId && effectiveThemeId !== 'custom') {
          try {
            // Try to get theme pages from API (which falls back to filesystem)
            const themePagesResponse = await api.get(`/api/pages/theme/${effectiveThemeId}`);
            if (themePagesResponse.ok) {
              const themePagesData = await themePagesResponse.json();
              const themePages = themePagesData.pages || [];
              const fsPage = themePages.find((p: any) => p.id === visualEditorPage.id);
              
              if (fsPage) {
                // Found page in filesystem, show builder with empty components
                console.log('[testing] Found page in filesystem, showing builder with empty layout');
                setBuilderComponents([]);
                setBuilderError(null);
                return;
              }
            }
          } catch (fsError) {
            console.log('[testing] Filesystem fallback also failed:', fsError);
          }
        }
        
        // If all else fails, show builder with empty components
        console.log('[testing] Showing builder with empty components due to database/API unavailability');
        setBuilderComponents([]);
        setBuilderError(null);
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        // Don't throw error - show builder with empty components instead
        console.log('[testing] API returned error, showing builder with empty components:', text);
        setBuilderComponents([]);
        setBuilderError(null);
        return;
      }

      const data = await response.json();
      console.log('[testing] Loaded layout data:', {
        hasPage: !!data?.page,
        hasLayout: !!data?.page?.layout,
        hasComponents: !!data?.page?.layout?.components,
        componentsCount: data?.page?.layout?.components?.length || 0
      });
      
      const comps = data?.page?.layout?.components || [];
      const validComps = isValidComponentsArray(comps) ? comps : [];
      console.log('[testing] Setting builder components:', validComps.length);
      setBuilderComponents(validComps);

      // If Diora-like homepage layout detected, ensure default Flowbite theme is applied for preview
      const isHomepage = visualEditorPage?.slug === '/' || visualEditorPage?.slug === '/home';
      if (isHomepage && isDioraHomepageLayout(validComps)) {
        applyFlowbiteTheme('default');
      }
    } catch (err: any) {
      // Don't show error - just show empty builder
      console.log('[testing] Error loading layout, showing builder with empty components:', err?.message);
      setBuilderComponents([]);
      setBuilderError(null);
    } finally {
      setBuilderLoading(false);
    }
  }, [visualEditorPage, currentTenantId, currentThemeId, previewThemeId]);

  const handleSaveLayout = async () => {
    if (!Array.isArray(builderComponents) || builderComponents.length === 0) {
      toast({
        title: 'No changes to save',
        description: 'There are no components to save.',
        variant: 'default',
      });
      return;
    }

    if (!visualEditorPage?.id) {
      toast({
        title: 'Cannot save',
        description: 'Page context is missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Force blur any active input elements to ensure all pending changes are synced
      // This is important because inputs only call onChange on blur
      const activeElement = document.activeElement;
      if (activeElement && (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
        console.log('[testing] Blurring active input before save:', activeElement.tagName);
        activeElement.blur();
        // Wait longer for blur handlers to complete and all state updates to propagate
        // The blur will trigger onChange -> updateComponent -> onComponentsChange -> setBuilderComponents -> builderComponentsRef
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Give one more tick for React to process all state updates
      await new Promise(resolve => setTimeout(resolve, 100));

      setSavingLayout(true);
      const effectiveTenantId = currentTenantId || 'tenant-gosg';
      const targetPageId = visualEditorPage.id;

      // Use ref value to ensure we have the latest components after blur
      // The ref is updated by useEffect whenever builderComponents changes
      // Prefer ref value if it has components, otherwise fall back to state
      const componentsToSave = (builderComponentsRef.current.length > 0 || builderComponents.length === 0) 
        ? builderComponentsRef.current 
        : builderComponents;
      
      if (!Array.isArray(componentsToSave) || componentsToSave.length === 0) {
        toast({
          title: 'No changes to save',
          description: 'There are no components to save.',
          variant: 'default',
        });
        setSavingLayout(false);
        return;
      }

      // Ensure layout_json has the correct structure: { components: [...] }
      const layoutJson = { components: componentsToSave };

      // Include themeId when available and not 'custom' to ensure correct page is updated
      const requestBody: any = {
        layout_json: layoutJson,
        tenantId: effectiveTenantId
      };
      if (currentThemeId && currentThemeId !== 'custom') {
        requestBody.themeId = currentThemeId;
      }

      console.log('[testing] Saving layout:', {
        pageId: targetPageId,
        tenantId: effectiveTenantId,
        themeId: currentThemeId,
        componentsCount: componentsToSave.length,
        usingRefValue: builderComponentsRef.current.length > 0,
        requestBody: requestBody
      });

      const res = await api.put(`/api/pages/${targetPageId}/layout`, requestBody);
      
      // Check if response is OK before parsing
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Failed to save layout';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        console.error('[testing] Save failed - HTTP error:', {
          status: res.status,
          statusText: res.statusText,
          error: errorMessage
        });
        
        toast({
          title: 'Failed to save',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }
      
      const json = await res.json();
      console.log('[testing] Save response:', json);
      
      // Explicitly check for success === true
      if (json && json.success === true) {
        // Wait a bit for database to commit
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reload the page layout from database to ensure UI reflects saved state
        // Force reload by clearing any potential cache
        await loadBuilderLayout();
        
        toast({
          title: 'Layout saved',
          description: 'Your page layout has been saved successfully.',
          variant: 'default',
        });
      } else {
        console.error('[testing] Save failed - API returned failure:', json);
        toast({
          title: 'Failed to save',
          description: json?.message || json?.error || 'Failed to save layout',
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to save layout',
        variant: 'destructive',
      });
      console.error('[visual-editor] Save layout error:', e);
    } finally {
      setSavingLayout(false);
    }
  };

  // NEW: When visual editor is open, load page layout for builder (for all themes)
  useEffect(() => {
    loadBuilderLayout();
  }, [loadBuilderLayout]);

  // Initialize previewThemeId when visual editor opens
  useEffect(() => {
    if (visualEditorPage && !previewThemeId) {
      // Set initial preview theme to current theme if it's not 'custom'
      if (currentThemeId && currentThemeId !== 'custom') {
        setPreviewThemeId(currentThemeId);
      }
    }
  }, [visualEditorPage, currentThemeId, previewThemeId]);

  // Helper: determine if current layout matches Diora homepage structure
  const isDioraHomepageLayout = (components: ComponentSchema[]) => {
    if (!Array.isArray(components) || components.length === 0) return false;
    const keys = new Set(
      components
        .map((c) => (c.type || c.name || c.key || '').toLowerCase())
    );
    // Must include these six sections (case-insensitive); allow variations like servicesSection vs servicessection
    const required = [
      'herosection',
      'servicessection',
      'featuressection',
      'ingredientssection',
      'teamsection',
      'aboutsection',
    ];
    const has = (needle: string) =>
      [...keys].some((k) => k.includes(needle));
    return required.every((r) => has(r.replace('section', '')) || has(r));
  };

  const handleMigrateLayouts = async () => {
    if (!currentThemeId) {
      toast({
        title: 'Error',
        description: 'No theme selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/api/themes/${currentThemeId}/migrate-layouts`);
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Layouts Migrated',
          description: data.message || `Migrated ${data.migrated} layout(s)`,
        });
        // Reload pages to see updated layouts
        loadPages();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Migration Failed',
          description: errorData.message || 'Failed to migrate layouts',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error migrating layouts:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to migrate layouts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getThemePageUrl = (slug: string): string => {
    if (!currentThemeId) return '';
    
    const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;
    
    if (cleanSlug === '' || cleanSlug === 'home' || cleanSlug === 'index') {
      return `/theme/${currentThemeId}`;
    } else {
      return `/theme/${currentThemeId}/${cleanSlug}`;
    }
  };

  // Notify parent component when entering/exiting edit mode
  // Use useLayoutEffect to ensure it runs synchronously before paint
  useLayoutEffect(() => {
    if (onEditModeChange) {
      const isEditMode = visualEditorPage !== null || seoPage !== null;
      console.log('[testing] useLayoutEffect - visualEditorPage:', visualEditorPage, 'seoPage:', seoPage, 'isEditMode:', isEditMode);
      onEditModeChange(isEditMode);
    }
  }, [visualEditorPage, seoPage, onEditModeChange]);

  // Show SEO page if a page is being edited for SEO
  if (seoPage) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        <SEOPage
          pageId={seoPage.id}
          pageName={seoPage.pageName}
          pageSlug={seoPage.slug}
          tenantId={currentTenantId}
          themeId={currentThemeId}
          onBack={() => {
            setSeoPage(null);
            if (onEditModeChange) {
              onEditModeChange(false);
            }
          }}
          onSave={handleSEOSave}
        />
      </div>
    );
  }

  // Show visual editor if a page is being viewed (works for both tenant and theme modes, even without connection)
  if (visualEditorPage) {
    const pageUrl = (currentThemeId && currentThemeId !== 'custom')
      ? getThemePageUrl(visualEditorPage.slug)
      : visualEditorPage.slug;

    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setVisualEditorPage(null);
                if (onEditModeChange) {
                  onEditModeChange(false);
                }
              }}
            >
              <Minus className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Preview:</span>
              <Select value={previewMode} onValueChange={(v) => setPreviewMode(v as 'flowbite' | 'classic' | 'theme')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select preview" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flowbite">Flowbite</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="theme">Theme</SelectItem>
                </SelectContent>
              </Select>
              {currentTenantId && availableThemes.length > 0 && (
                <>
                  <span className="text-sm text-gray-600 ml-2">Theme:</span>
                  <Select 
                    value={previewThemeId || currentThemeId || 'custom'} 
                    onValueChange={(v) => {
                      setPreviewThemeId(v === 'custom' ? null : v);
                      // Reload layout with new theme
                      setTimeout(() => loadBuilderLayout(), 100);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      {availableThemes.map((theme) => (
                        <SelectItem key={theme.slug || theme.id} value={theme.slug || theme.id}>
                          {theme.name || theme.slug}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{pageUrl}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJSONEditor(true)}
            >
              <Code className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Versions functionality to be defined later
                console.log('[testing] Versions button clicked');
              }}
            >
              <History className="h-4 w-4 mr-2" />
              Versions
            </Button>
            {visualEditorPage && (
              <Button
                size="sm"
                onClick={handleSaveLayout}
                disabled={savingLayout || builderLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingLayout ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Unified website-style visual editor for all tenants/themes */}
        <div className="flex-1 bg-background rounded-b-lg overflow-hidden flex">
          <div className="flex-1 overflow-auto">
            <div className="w-full space-y-0">
              {builderLoading ? (
                <div className="bg-white border rounded-lg p-8 m-6 text-center text-muted-foreground">
                  Loading page layout...
                </div>
              ) : (
                <>
                  {builderError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6 text-sm text-red-700">
                      {builderError}
                    </div>
                  ) : null}

                  {/* Render selected preview mode */}
                  {previewMode === 'theme' ? (
                    (previewThemeId || currentThemeId) ? (
                      <ThemeRenderer
                        components={builderComponents}
                        themeId={previewThemeId || currentThemeId}
                        pageContext={{
                          pageId: visualEditorPage.id,
                          slug: visualEditorPage.slug,
                          pageName: visualEditorPage.pageName,
                          tenantId: currentTenantId,
                          themeId: previewThemeId || currentThemeId
                        }}
                        onComponentsChange={(updatedComponents) => {
                          console.log('[testing] Components updated in theme editor:', updatedComponents.length);
                          setBuilderComponents(updatedComponents);
                          builderComponentsRef.current = updatedComponents; // Update ref immediately
                        }}
                      />
                    ) : (
                      <div className="bg-white border rounded-lg p-8 m-6 text-center text-muted-foreground">
                        <p>Please select a theme from the Theme dropdown to preview the hardcoded theme content.</p>
                      </div>
                    )
                  ) : previewMode === 'flowbite' ? (
                    <FlowbiteDioraRenderer
                      components={builderComponents}
                      pageContext={{
                        pageId: visualEditorPage.id,
                        slug: visualEditorPage.slug,
                        pageName: visualEditorPage.pageName,
                        tenantId: currentTenantId,
                        themeId: previewThemeId || currentThemeId
                      }}
                      onComponentsChange={(updatedComponents) => {
                        console.log('[testing] Components updated in editor:', updatedComponents.length);
                        setBuilderComponents(updatedComponents);
                        builderComponentsRef.current = updatedComponents; // Update ref immediately
                      }}
                    />
                  ) : (
                    <ClassicRenderer
                      components={builderComponents}
                      pageContext={{
                        pageId: visualEditorPage.id,
                        slug: visualEditorPage.slug,
                        pageName: visualEditorPage.pageName,
                        tenantId: currentTenantId,
                        themeId: previewThemeId || currentThemeId
                      }}
                      onComponentsChange={(updatedComponents) => {
                        console.log('[testing] Components updated in classic editor:', updatedComponents.length);
                        setBuilderComponents(updatedComponents);
                        builderComponentsRef.current = updatedComponents; // Update ref immediately
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <CodeViewerDialog
          open={showCodeViewer}
          onOpenChange={setShowCodeViewer}
          pageSlug={visualEditorPage?.slug || ''}
          pageName={visualEditorPage?.pageName || ''}
          tenantId={currentTenantId}
        />
        <VisualEditorJSONDialog
          open={showJSONEditor}
          onOpenChange={setShowJSONEditor}
          pageSlug={visualEditorPage?.slug || ''}
          pageName={visualEditorPage?.pageName || ''}
          tenantId={currentTenantId}
          currentThemeId={currentThemeId}
          currentTenantId={currentTenantId}
        />
        {selectedPageForSEO && (
          <SEODialog
            open={showSEODialog}
            onOpenChange={setShowSEODialog}
            pageId={selectedPageForSEO.id}
            pageName={selectedPageForSEO.page_name}
            tenantId={currentTenantId}
            themeId={currentThemeId}
            onSave={handleSEOSave}
          />
        )}
      </div>
    );
  }

  // Filter and sort pages based on active tab (includes header and footer)
  const filteredPages = pages
    .filter(page => {
      const matches = page.page_type === activeTab;
      if (!matches) {
        console.log(`[testing] Frontend: Filtering out page "${page.page_name}" (page_type: ${page.page_type}, activeTab: ${activeTab})`);
      }
      return matches;
    })
    .sort((a, b) => {
      // Homepage first (only for regular pages)
      if (activeTab === 'page') {
        if (a.slug === '/' || a.slug === '/home') return -1;
        if (b.slug === '/' || b.slug === '/home') return 1;
      }
      
      // Then sort by created_at (newest first)
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  
  // Debug logging for filtering
  console.log(`[testing] Frontend: Total pages: ${pages.length}, Active tab: ${activeTab}, Filtered pages: ${filteredPages.length}`);
  if (pages.length > 0 && filteredPages.length === 0) {
    const pageTypes = pages.map(p => p.page_type).filter((v, i, a) => a.indexOf(v) === i);
    console.warn(`[testing] Frontend: No pages match activeTab "${activeTab}". Available page types: ${pageTypes.join(', ')}`);
    console.warn(`[testing] Frontend: Consider showing all pages or adjusting filter logic`);
  }

  // Show message when no tenant or theme is selected
  if (!currentTenantId || !currentThemeId) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No tenant or theme selected</p>
            <p className="text-gray-400 text-sm">Please select a tenant and theme from the dropdowns above to view pages</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading pages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={() => {
              loadPages();
            }} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Theme Mode: Migrate Layouts Button */}
      {currentThemeId && currentThemeId !== 'custom' && (
        <div className="bg-white rounded-lg border border-gray-200 mb-6 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Page Layouts</h3>
              <p className="text-sm text-gray-500 mt-1">
                Migrate page layouts to match your theme's component structure
              </p>
            </div>
            <Button
              onClick={handleMigrateLayouts}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Migrating...' : 'Migrate Layouts'}
            </Button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid gap-4">
              {filteredPages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} found</p>
                </div>
              ) : (
                filteredPages.map((page) => (
                  <Card key={page.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{page.page_name}</h3>
                        </div>
                        <div className="mb-1">
                          <p className="text-sm text-gray-600">{page.slug}</p>
                        </div>
                        {page.page_type === 'landing' && page.campaign_source && (
                          <p className="text-xs text-blue-600">
                            Campaign: {page.campaign_source} → {page.conversion_goal}
                          </p>
                        )}
                        {page.page_type === 'legal' && page.legal_type && (
                          <p className="text-xs text-purple-600">
                            Type: {page.legal_type}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleVisualEditor(page)}
                          className="bg-brandPurple hover:bg-brandPurple/90"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenSEO(page)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          SEO
                        </Button>
                        {page.page_type !== 'header' && page.page_type !== 'footer' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPage(page.slug)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesManager;