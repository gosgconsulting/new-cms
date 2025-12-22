import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Edit, Eye, FileText, Rocket, Scale, Layout, Minus } from 'lucide-react';
import PageEditor from './PageEditor';
import EditableSlug from './EditableSlug';
import HeaderSchemaEditor from './HeaderSchemaEditor';
import FooterSchemaEditor from './FooterSchemaEditor';
import { useAuth } from '../auth/AuthProvider';
import { getDummyPages, isDevelopmentTenant } from '../admin/DevelopmentTenantData';
import api from '../../utils/api';

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
  onEditModeChange?: (isEditing: boolean) => void;
}

export const PagesManager: React.FC<PagesManagerProps> = ({ onEditModeChange }) => {
  const { currentTenantId, user } = useAuth();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'page' | 'landing' | 'legal' | 'header' | 'footer'>('page');

  const tabs = [
    { id: 'page' as const, label: 'Pages', icon: FileText },
    // { id: 'landing' as const, label: 'Landing Pages', icon: Rocket },
    { id: 'legal' as const, label: 'Legals', icon: Scale },
    { id: 'header' as const, label: 'Header', icon: Layout },
    { id: 'footer' as const, label: 'Footer', icon: Layout },
  ];

  // Load pages from database
  useEffect(() => {
    console.log('currentTenantId', currentTenantId);
    console.log('user', user);
    if (currentTenantId) {
      loadPages();
    }
  }, [currentTenantId, user]);

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

  const handleSlugUpdate = (pageId: string, newSlug: string) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId ? { ...page, slug: newSlug } : page
      )
    );
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
    window.open(slug, '_blank');
  };

  // Notify parent component when entering/exiting edit mode
  // Use useLayoutEffect to ensure it runs synchronously before paint
  useLayoutEffect(() => {
    if (onEditModeChange) {
      const isEditMode = editingPageId !== null;
      console.log('[testing] useLayoutEffect - editingPageId:', editingPageId, 'isEditMode:', isEditMode);
      onEditModeChange(isEditMode);
    }
  }, [editingPageId, onEditModeChange]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading pages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadPages}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
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
      <div>
        {activeTab === 'page' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pages</h2>
              <p className="text-gray-600">Manage your pages. Click on any slug to edit it. Click on Index/No Index to toggle SEO indexing.</p>
            </div>

            {filteredPages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pages found for this tenant.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <Card key={page.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {page.page_name}
                          </h3>
                          <Badge 
                            variant={page.status === 'published' ? 'default' : 'secondary'}
                            className={page.status === 'published' ? 'bg-purple-600' : ''}
                          >
                            {page.status}
                          </Badge>
                          <Badge 
                            variant={page.seo_index ? 'default' : 'outline'}
                            className={`cursor-pointer ${page.seo_index ? 'bg-purple-600' : ''}`}
                            onClick={() => handleSEOIndexToggle(page.id, page.page_type, page.seo_index || false)}
                          >
                            {page.seo_index ? 'Index' : 'No Index'}
                          </Badge>
                        </div>
                        
                        <EditableSlug
                          pageId={page.id}
                          currentSlug={page.slug}
                          onSlugUpdate={handleSlugUpdate}
                        />
                        
                        {page.meta_title && (
                          <p className="text-sm text-gray-600 mt-1">
                            Meta: {page.meta_title}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
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
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'legal' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Legal Pages</h2>
              <p className="text-gray-600">Manage your legal pages like privacy policy, terms of service, etc.</p>
            </div>

            {filteredPages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No legal pages found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <Card key={page.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {page.page_name}
                          </h3>
                          <Badge 
                            variant={page.status === 'published' ? 'default' : 'secondary'}
                            className={page.status === 'published' ? 'bg-purple-600' : ''}
                          >
                            {page.status}
                          </Badge>
                          <Badge 
                            variant={page.seo_index ? 'default' : 'outline'}
                            className={`cursor-pointer ${page.seo_index ? 'bg-purple-600' : ''}`}
                            onClick={() => handleSEOIndexToggle(page.id, page.page_type, page.seo_index || false)}
                          >
                            {page.seo_index ? 'Index' : 'No Index'}
                          </Badge>
                        </div>
                        
                        <EditableSlug
                          pageId={page.id}
                          currentSlug={page.slug}
                          onSlugUpdate={handleSlugUpdate}
                        />
                        
                        {page.meta_title && (
                          <p className="text-sm text-gray-600 mt-1">
                            Meta: {page.meta_title}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PagesManager;
