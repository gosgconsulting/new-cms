import React, { useState } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Edit, Eye } from 'lucide-react';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  type: string;
}

// Fixed list of pages
const defaultPages: PageItem[] = [
  {
    id: '1',
    title: 'Homepage',
    slug: '/',
    status: 'published',
    type: 'core',
  },
  {
    id: '2',
    title: 'Blog',
    slug: '/blog',
    status: 'published',
    type: 'core',
  },
  {
    id: '3',
    title: 'Privacy Policy',
    slug: '/privacy-policy',
    status: 'published',
    type: 'legal',
  },
  {
    id: '4',
    title: 'Terms of Service',
    slug: '/terms-of-service',
    status: 'published',
    type: 'legal',
  },
  {
    id: '5',
    title: 'About Us',
    slug: '/about',
    status: 'published',
    type: 'content',
  },
  {
    id: '6',
    title: 'Contact',
    slug: '/contact',
    status: 'published',
    type: 'content',
  },
];

export const PagesManager: React.FC = () => {
  const [pages] = useState<PageItem[]>(defaultPages);

  const handleEditPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    console.log('Edit page:', page);
    // In real implementation, navigate to page editor
  };

  const handleViewPage = (slug: string) => {
    window.open(slug, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pages</h2>
          <p className="text-muted-foreground">Manage your website pages</p>
        </div>
      </div>

      <div className="grid gap-4">
        {pages.map((page) => (
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
                  <Badge variant="outline" className="text-xs">
                    {page.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{page.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewPage(page.slug)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleEditPage(page.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> These are the core pages of your website. To add custom pages, please contact support.
        </p>
      </div>
    </div>
  );
};

export default PagesManager;