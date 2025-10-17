import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Edit, Eye, FileText, Rocket, Scale, Layout, Minus } from 'lucide-react';
import PageEditor from './PageEditor';
import EditableSlug from './EditableSlug';

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
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/pages/all');
      if (!response.ok) {
        throw new Error('Failed to load pages');
      }
      
      const data = await response.json();
      setPages(data.pages || []);
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

  // Filter pages based on active tab
  const filteredPages = pages.filter(page => page.type === activeTab);

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
                Manage your {tabs.find(t => t.id === activeTab)?.label.toLowerCase()}
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
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold">{page.title}</h3>
                          <Badge 
                            variant={page.status === 'published' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {page.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{page.slug}</p>
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

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> These are the core pages of your website. To add custom pages, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesManager;