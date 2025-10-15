import React, { useState } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Edit, Eye, FileText, Rocket, Scale, Layout, Minus } from 'lucide-react';
import PageEditor from './PageEditor';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  type: 'page' | 'landing' | 'legal' | 'header' | 'footer';
}

// Fixed list of pages
const defaultPages: PageItem[] = [
  {
    id: '1',
    title: 'Homepage',
    slug: '/',
    status: 'published',
    type: 'page',
  },
  {
    id: '2',
    title: 'Blog',
    slug: '/blog',
    status: 'published',
    type: 'page',
  },
  {
    id: '3',
    title: 'SEO Services Landing',
    slug: '/seo-services',
    status: 'published',
    type: 'landing',
  },
  {
    id: '4',
    title: 'Privacy Policy',
    slug: '/privacy-policy',
    status: 'published',
    type: 'legal',
  },
  {
    id: '5',
    title: 'Terms of Service',
    slug: '/terms-of-service',
    status: 'published',
    type: 'legal',
  },
  {
    id: '6',
    title: 'Main Header',
    slug: '/components/header',
    status: 'published',
    type: 'header',
  },
  {
    id: '7',
    title: 'Main Footer',
    slug: '/components/footer',
    status: 'published',
    type: 'footer',
  },
];

export const PagesManager: React.FC = () => {
  const [pages] = useState<PageItem[]>(defaultPages);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'page' | 'landing' | 'legal' | 'header' | 'footer'>('page');

  const tabs = [
    { id: 'page' as const, label: 'Pages', icon: FileText },
    { id: 'landing' as const, label: 'Landing Pages', icon: Rocket },
    { id: 'legal' as const, label: 'Legals', icon: Scale },
    { id: 'header' as const, label: 'Header', icon: Layout },
    { id: 'footer' as const, label: 'Footer', icon: Minus },
  ];

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