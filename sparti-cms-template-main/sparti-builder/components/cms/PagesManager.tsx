import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
// Demo pages manager (no database required)
import { Input } from '../../../src/components/ui/input';
import { Card } from '../../../src/components/ui/card';
import { useToast } from '../../../src/hooks/use-toast';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
}

export const PagesManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [newPageTitle, setNewPageTitle] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Demo: Load pages from localStorage
    const demoPages = JSON.parse(localStorage.getItem('sparti-demo-pages') || '[]');
    setPages(demoPages);
  }, []);

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Demo: simulate creation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPage: PageItem = {
        id: 'demo-page-' + Date.now(),
        title: newPageTitle,
        slug: newPageTitle.toLowerCase().replace(/\s+/g, '-'),
        is_published: false,
        created_at: new Date().toISOString(),
      };

      const updatedPages = [...pages, newPage];
      setPages(updatedPages);
      
      // Demo: store in localStorage
      localStorage.setItem('sparti-demo-pages', JSON.stringify(updatedPages));
      
      setNewPageTitle('');
      
      toast({
        title: "Page Created",
        description: `Page "${newPage.title}" has been created (demo mode)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create page (demo mode)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    setIsLoading(true);
    
    try {
      // Demo: simulate deletion delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedPages = pages.filter(p => p.id !== pageId);
      setPages(updatedPages);
      
      // Demo: store in localStorage
      localStorage.setItem('sparti-demo-pages', JSON.stringify(updatedPages));
      
      toast({
        title: "Page Deleted",
        description: "Page has been deleted (demo mode)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete page (demo mode)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Pages Manager</h2>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            placeholder="Page title"
            onKeyPress={(e) => e.key === 'Enter' && handleCreatePage()}
          />
          <Button onClick={handleCreatePage} disabled={isLoading || !newPageTitle.trim()}>
            {isLoading ? 'Creating...' : 'Create Page'}
          </Button>
        </div>

        <div className="space-y-2">
          {pages.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No pages yet. Create your first page above.
            </p>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">{page.title}</h3>
                  <p className="text-sm text-muted-foreground">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    page.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {page.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeletePage(page.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default PagesManager;