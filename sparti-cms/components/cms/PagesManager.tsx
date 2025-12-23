import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Edit, Eye, FileText, Rocket, Scale, Layout, Minus, Monitor, Code, FileCode } from 'lucide-react';
import PageEditor from './PageEditor';
import HeaderSchemaEditor from './HeaderSchemaEditor';
import FooterSchemaEditor from './FooterSchemaEditor';
import { useAuth } from '../auth/AuthProvider';
import { getDummyPages, isDevelopmentTenant } from '../admin/DevelopmentTenantData';
import api from '../../utils/api';
import { AIAssistantChat } from '../../../src/components/AIAssistantChat';
import { VisualEditorJSONDialog } from './VisualEditorJSONDialog';
import CodeViewerDialog from './PageEditor/CodeViewerDialog';

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
  mode?: 'tenants' | 'theme';
  currentThemeId?: string | null;
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
  mode = 'tenants',
  currentThemeId = null 
}) => {
  const { currentTenantId, user } = useAuth();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [visualEditorPage, setVisualEditorPage] = useState<{ slug: string; pageName: string } | null>(null);
  const [showJSONEditor, setShowJSONEditor] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [activeTab, setActiveTab] = useState<'page' | 'landing' | 'legal' | 'header' | 'footer'>('page');

  const tabs = [
    { id: 'page' as const, label: 'Pages', icon: FileText },
    // { id: 'landing' as const, label: 'Landing Pages', icon: Rocket },
    { id: 'legal' as const, label: 'Legals', icon: Scale },
    { id: 'header' as const, label: 'Header', icon: Layout },
    { id: 'footer' as const, label: 'Footer', icon: Layout },
  ];

  // Load pages from database or theme
  useEffect(() => {
    console.log('currentTenantId', currentTenantId);
    console.log('currentThemeId', currentThemeId);
    console.log('user', user);
    console.log('mode', mode);
    
    if (mode === 'theme') {
      // Theme mode: load pages for selected theme
      if (currentThemeId) {
        setLoading(true);
        loadThemePages(currentThemeId).then(themePages => {
          setPages(themePages);
          setLoading(false);
          setError(null);
        }).catch(err => {
          console.error('Error loading theme pages:', err);
          setPages([]);
          setLoading(false);
          setError('Failed to load theme pages');
        });
      } else {
        // No theme selected, show empty
        setPages([]);
        setLoading(false);
        setError(null);
      }
    } else if (currentTenantId) {
      // Tenants mode: load from database
      loadPages();
    } else {
      // No tenant selected
      setPages([]);
      setLoading(false);
    }
  }, [currentTenantId, currentThemeId, user, mode]);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Regular tenant - use API
      const response = await api.get(`/api/pages/all?tenantId=${currentTenantId}`, {
        headers: {
          'X-Tenant-Id': currentTenantId || ''
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load pages:', errorText);
        throw new Error(`Failed to load pages: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Error loading pages:', error);
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
    
    if (mode === 'theme' && currentThemeId) {
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
    // For tenants mode, use the slug as-is (existing behavior)
    
    window.open(url, '_blank');
  };

  const handleVisualEditor = (page: PageItem) => {
    setVisualEditorPage({
      slug: page.slug,
      pageName: page.page_name
    });
    if (onEditModeChange) {
      onEditModeChange(true);
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
    const pageUrl = mode === 'theme' && currentThemeId 
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
        <div className="flex-1 relative bg-gray-100 rounded-b-lg overflow-hidden flex">
          <div className="flex-1 relative" id="visual-editor-iframe-container">
            <iframe
              id="visual-editor-iframe"
              src={pageUrl}
              className="w-full h-full border-0"
              title={`Visual Editor: ${visualEditorPage.pageName}`}
              style={{ height: '100%' }}
            />
          </div>
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
          tenantId={mode === 'tenants' ? currentTenantId : undefined}
        />
        <VisualEditorJSONDialog
          open={showJSONEditor}
          onOpenChange={setShowJSONEditor}
          pageSlug={visualEditorPage?.slug || ''}
          pageName={visualEditorPage?.pageName || ''}
          tenantId={mode === 'tenants' ? currentTenantId : undefined}
          mode={mode}
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
        onBack={() => {
          setEditingPageId(null);
          if (onEditModeChange) {
            onEditModeChange(false);
          }
        }} 
      />
    );
  }

  // Show header schema editor
  if (activeTab === 'header') {
    return (
      <HeaderSchemaEditor 
        onBack={() => setActiveTab('page')} 
      />
    );
  }

  // Show footer schema editor
  if (activeTab === 'footer') {
    return (
      <FooterSchemaEditor 
        onBack={() => setActiveTab('page')} 
      />
    );
  }

  // Filter and sort pages based on active tab (only for page types)
  const filteredPages = ['page', 'landing', 'legal'].includes(activeTab) 
    ? pages
        .filter(page => page.page_type === activeTab)
        .sort((a, b) => {
          // Homepage first
          if (a.slug === '/' || a.slug === '/home') return -1;
          if (b.slug === '/' || b.slug === '/home') return 1;
          
          // Then sort by created_at (newest first)
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        })
    : [];

  // Show message when in theme mode but no theme is selected
  if (mode === 'theme' && !currentThemeId) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No theme selected</p>
            <p className="text-gray-400 text-sm">Please select a theme from the dropdown above to view its pages</p>
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
              if (mode === 'theme' && currentThemeId) {
                loadThemePages(currentThemeId).then(themePages => {
                  setPages(themePages);
                  setError(null);
                });
              } else {
                loadPages();
              }
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
            <div>
            </div>

            <div className="grid gap-4">
              {['header', 'footer'].includes(activeTab) ? (
                <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-600 font-medium">Click on the {activeTab} tab to configure your site's {activeTab} settings</p>
                  <p className="text-sm text-blue-500 mt-1">This will open the {activeTab} schema editor</p>
                </div>
              ) : filteredPages.length === 0 ? (
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
                        {page.page_type === 'legal' && page.version && (
                          <p className="text-xs text-purple-600">
                            Version: {page.version} | Type: {page.legal_type}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {mode === 'theme' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleVisualEditor(page)}
                            className="bg-brandPurple hover:bg-brandPurple/90"
                          >
                            <Monitor className="h-4 w-4 mr-2" />
                            Visual Editor
                          </Button>
                        )}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesManager;