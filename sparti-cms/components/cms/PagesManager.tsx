import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Edit, Eye, FileText, Rocket, Scale, Layout, Minus } from 'lucide-react';
import PageEditor from './PageEditor';
import EditableSlug from './EditableSlug';
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

export const PagesManager: React.FC = () => {
  const { currentTenant } = useAuth();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'page' | 'landing' | 'legal'>('page');

  const tabs = [
    { id: 'page' as const, label: 'Pages', icon: FileText },
    { id: 'landing' as const, label: 'Landing Pages', icon: Rocket },
    { id: 'legal' as const, label: 'Legals', icon: Scale },
  ];

  // Load pages from database
  useEffect(() => {
    loadPages();
  }, [currentTenant]);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Check if user is logged in
      const session = localStorage.getItem('sparti-demo-session');
      console.log('[testing] PagesManager - Session data:', session);
      
      // If using Development tenant, use rich dummy data
      if (isDevelopmentTenant(currentTenant)) {
        // Convert dummy pages to PageItem format
        const dummyPages = getDummyPages().map(page => ({
          id: page.id,
          page_name: page.title,
          slug: page.slug,
          status: page.status,
          page_type: page.template === 'landing' ? 'landing' : 
                    (page.template === 'legal' ? 'legal' : 'page') as 'page' | 'landing' | 'legal',
          meta_title: page.seo?.title,
          meta_description: page.seo?.description,
          seo_index: true,
          campaign_source: page.template === 'landing' ? 'development' : undefined,
          conversion_goal: page.template === 'landing' ? 'testing' : undefined,
          legal_type: page.template === 'legal' ? 'terms' : undefined,
          version: page.template === 'legal' ? '1.0' : undefined,
          created_at: page.createdAt,
          updated_at: page.updatedAt
        }));
        
        setPages(dummyPages);
      } else {
        // Regular tenant - use API
        const response = await api.get(`/api/pages/all?tenantId=${currentTenant.id}`, {
          headers: {
            'X-Tenant-Id': currentTenant.id
          }
        });
        
        console.log('[testing] PagesManager - Response status:', response.status);
        console.log('[testing] PagesManager - Response ok:', response.ok);
        console.log('[testing] PagesManager - Response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('[testing] PagesManager - Error response:', errorText);
          throw new Error(`Failed to load pages: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[testing] PagesManager - Response data:', data);
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('[testing] Error loading pages:', error);
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
        tenantId: currentTenant.id
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

      console.log('[testing] SEO index toggled successfully:', data.newIndex);
    } catch (error) {
      console.error('[testing] Error toggling SEO index:', error);
      // You could add a toast notification here
    }
  };

  const handleEditPage = (pageId: string) => {
    setEditingPageId(pageId);
  };

  const handleViewPage = (slug: string) => {
    window.open(slug, '_blank');
  };

  // Show editor if a page is being edited
  if (editingPageId) {
    return (
      <PageEditor 
        pageId={editingPageId} 
        onBack={() => setEditingPageId(null)} 
      />
    );
  }

  // Filter and sort pages based on active tab
  const filteredPages = pages
    .filter(page => page.page_type === activeTab)
    .sort((a, b) => {
      // Homepage first
      if (a.slug === '/' || a.slug === '/home') return -1;
      if (b.slug === '/' || b.slug === '/home') return 1;
      
      // Then sort by created_at (newest first)
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

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
            <Button onClick={loadPages} className="mt-4">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Manage your {tabs.find(t => t.id === activeTab)?.label.toLowerCase()}. Click on any slug to edit it. Click on Index/No Index to toggle SEO indexing.
              </p>
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
                          <Badge 
                            variant={page.status === 'published' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {page.status}
                          </Badge>
                          <Badge 
                            variant={page.seo_index ? 'default' : 'outline'}
                            className="text-xs cursor-pointer hover:bg-opacity-80 transition-colors"
                            onClick={() => handleSEOIndexToggle(page.id, page.page_type, page.seo_index || false)}
                          >
                            {page.seo_index ? 'Index' : 'No Index'}
                          </Badge>
                        </div>
                        <div className="mb-1">
                          <EditableSlug
                            pageId={page.id}
                            pageType={page.page_type}
                            currentSlug={page.slug}
                            pageName={page.page_name}
                            isHomepage={page.slug === '/' || page.slug === '/home'}
                            onSlugUpdate={(newSlug) => handleSlugUpdate(page.id, newSlug)}
                          />
                        </div>
                        {page.meta_title && (
                          <p className="text-xs text-gray-500 truncate">
                            Meta: {page.meta_title}
                          </p>
                        )}
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

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Slug Editing:</strong> Click on any slug to edit it. Homepage slug cannot be changed. 
                If you change the blog slug, remember to update blog post URLs in the frontend code.
                <br />
                <strong>SEO Index:</strong> Click on "Index" or "No Index" badges to toggle whether the page should be indexed by search engines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesManager;