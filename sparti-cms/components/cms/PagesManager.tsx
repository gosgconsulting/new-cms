import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Edit, Eye, FileText, Rocket, Scale, Layout, Minus, Monitor, Code, FileCode, RefreshCw } from 'lucide-react';
import { toast } from '../../../src/hooks/use-toast';
import PageEditor from './PageEditor';
import HeaderSchemaEditor from './HeaderSchemaEditor';
import FooterSchemaEditor from './FooterSchemaEditor';
import { useAuth } from '../auth/AuthProvider';
import { getDummyPages, isDevelopmentTenant } from '../admin/DevelopmentTenantData';
import api from '../../utils/api';
import { AIAssistantChat } from '../../../src/components/AIAssistantChat';
import { VisualEditorJSONDialog } from './VisualEditorJSONDialog';
import CodeViewerDialog from './PageEditor/CodeViewerDialog';
import { isValidComponentsArray } from '../../utils/componentHelpers';
import { ComponentSchema } from '../../types/schema';

interface PageItem {
  id: string;
  page_name: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  page_type: 'page' | 'landing' | 'legal';
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
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [visualEditorPage, setVisualEditorPage] = useState<{ slug: string; pageName: string; id?: string } | null>(null);
  const [showJSONEditor, setShowJSONEditor] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [activeTab, setActiveTab] = useState<'page' | 'landing' | 'legal' | 'header' | 'footer'>('page');

  // NEW: builder state for custom theme visual editor
  const [builderComponents, setBuilderComponents] = useState<ComponentSchema[]>([]);
  const [builderLoading, setBuilderLoading] = useState(false);
  const [builderError, setBuilderError] = useState<string | null>(null);

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
      
      const response = await api.get(url, {
        headers: {
          'X-Tenant-Id': currentTenantId || ''
        }
      });
      
      console.log('[testing] Frontend: Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[testing] Frontend: Failed to load pages:', errorText);
        throw new Error(`Failed to load pages: ${response.status} ${response.statusText}`);
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
      setError(error instanceof Error ? error.message : 'Failed to load pages');
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

  const handleEditPage = (pageId: string) => {
    // Immediately notify parent component BEFORE setting state
    if (onEditModeChange) {
      console.log('[testing] Entering edit mode, notifying parent');
      onEditModeChange(true);
    }
    setEditingPageId(pageId);
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

  // NEW: When visual editor is open, load page layout for builder (for all themes)
  useEffect(() => {
    const loadBuilderLayout = async () => {
      if (!visualEditorPage) return;
      if (!currentTenantId || !visualEditorPage.id) return;

      try {
        setBuilderLoading(true);
        setBuilderError(null);

        // Include themeId when available and not 'custom'
        const themeParam = currentThemeId && currentThemeId !== 'custom' ? `&themeId=${currentThemeId}` : '';
        const url = `/api/pages/${visualEditorPage.id}?tenantId=${currentTenantId}${themeParam}`;
        const response = await api.get(url, {
          headers: { 'X-Tenant-Id': currentTenantId || '' }
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to load page');
        }

        const data = await response.json();
        const comps = data?.page?.layout?.components || [];
        setBuilderComponents(isValidComponentsArray(comps) ? comps : []);
      } catch (err: any) {
        setBuilderError(err?.message || 'Failed to load page layout');
        setBuilderComponents([]);
      } finally {
        setBuilderLoading(false);
      }
    };

    loadBuilderLayout();
  }, [visualEditorPage, currentThemeId, currentTenantId]);

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
      const isEditMode = editingPageId !== null || visualEditorPage !== null;
      console.log('[testing] useLayoutEffect - editingPageId:', editingPageId, 'visualEditorPage:', visualEditorPage, 'isEditMode:', isEditMode);
      onEditModeChange(isEditMode);
    }
  }, [editingPageId, visualEditorPage, onEditModeChange]);

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
            <h2 className="text-lg font-semibold">Visual Editor: {visualEditorPage.pageName}</h2>
            <span className="text-sm text-muted-foreground">{pageUrl}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodeViewer(true)}
              title="View the page source code"
            >
              <FileCode className="h-4 w-4 mr-2" />
              Code
            </Button>
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
              onClick={() => window.open(pageUrl, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
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
              ) : builderError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6 text-sm text-red-700">
                  {builderError}
                </div>
              ) : builderComponents.length === 0 ? (
                <div className="bg-white border rounded-lg p-8 m-6 text-center text-muted-foreground">
                  No components found in layout. Use JSON to add sections.
                </div>
              ) : (
                <div className="w-full space-y-0">
                  {builderComponents.map((component, index) => (
                    <div key={index} className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            {(component as any).name || component.type || `Section ${index + 1}`}
                          </h3>
                          {(component as any).key ? (
                            <p className="text-sm text-gray-600 truncate">Key: {(component as any).key}</p>
                          ) : null}
                        </div>
                        {/* No per-section page actions here; actions above apply to the whole page */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant panel */}
          <AIAssistantChat 
            className="h-full" 
            pageContext={visualEditorPage ? {
              slug: visualEditorPage.slug,
              pageName: visualEditorPage.pageName
            } : null}
          />
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
      </div>
    );
  }

  // Show editor if a page is being edited
  if (editingPageId) {
    return (
      <PageEditor 
        pageId={editingPageId} 
        currentTenantId={currentTenantId}
        currentThemeId={currentThemeId}
        onBack={() => {
          setEditingPageId(null);
          if (onEditModeChange) {
            onEditModeChange(false);
          }
        }} 
      />
    );
  }

  // Header and footer editors will be rendered within the tab content

  // Filter and sort pages based on active tab (only for page types)
  const filteredPages = ['page', 'landing', 'legal'].includes(activeTab) 
    ? pages
        .filter(page => {
          const matches = page.page_type === activeTab;
          if (!matches) {
            console.log(`[testing] Frontend: Filtering out page "${page.page_name}" (page_type: ${page.page_type}, activeTab: ${activeTab})`);
          }
          return matches;
        })
        .sort((a, b) => {
          // Homepage first
          if (a.slug === '/' || a.slug === '/home') return -1;
          if (b.slug === '/' || b.slug === '/home') return 1;
          
          // Then sort by created_at (newest first)
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        })
    : [];
  
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
            {activeTab === 'header' ? (
              <HeaderSchemaEditor 
                onBack={() => setActiveTab('page')} 
              />
            ) : activeTab === 'footer' ? (
              <FooterSchemaEditor 
                onBack={() => setActiveTab('page')} 
              />
            ) : (
              <>
            <div>
            </div>

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
                          <Monitor className="h-4 w-4 mr-2" />
                          Visual Editor
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEditPage(page.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPage(page.slug)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Slug Editing:</strong> Click on any slug to edit it. Homepage slug cannot be changed. 
                If you change the blog slug, remember to update blog post URLs in the frontend code.
                <br />
                <strong>SEO Index:</strong> Click on "Index" or "No Index" badges to toggle whether the page should be indexed by search engines.
              </p>
            </div> */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesManager;