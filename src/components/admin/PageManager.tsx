import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, ExternalLink, Eye, Settings, FileText, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWordPressPages } from "@/hooks/use-wordpress";
import PageContentEditor from "./PageContentEditor";

const PageManager = () => {
  const [editingPage, setEditingPage] = useState<any>(null);
  const [contentEditingPage, setContentEditingPage] = useState<any>(null);

  // Fetch WordPress pages
  const { data: wordpressPages, isLoading, error } = useWordPressPages();

  // Static pages configuration
  const staticPages = [
    {
      id: 'home',
      title: 'Homepage',
      path: '/',
      component: 'Index.tsx',
      description: 'Main landing page with hero, services, and testimonials',
      status: 'active',
      wordpress_manageable: true,
    },
    {
      id: 'contact',
      title: 'Contact',
      path: '/contact',
      component: 'Contact.tsx',
      description: 'Contact form and business information',
      status: 'active',
      wordpress_manageable: true,
    },
    {
      id: 'website-design',
      title: 'Website Design Services',
      path: '/services/website-design',
      component: 'WebsiteDesignServices.tsx',
      description: 'Website design service details and case studies',
      status: 'active',
      wordpress_manageable: true,
    },
    {
      id: 'seo-services',
      title: 'SEO Services',
      path: '/services/seo',
      component: 'SEOServices.tsx',
      description: 'SEO service details and optimization strategies',
      status: 'active',
      wordpress_manageable: true,
    },
    {
      id: 'paid-advertising',
      title: 'Paid Advertising Services',
      path: '/services/paid-advertising',
      component: 'PaidAdvertisingServices.tsx',
      description: 'PPC and paid advertising campaign services',
      status: 'active',
      wordpress_manageable: true,
    },
    {
      id: 'cloud-hosting',
      title: 'Cloud Hosting Services',
      path: '/services/cloud-hosting',
      component: 'CloudHostingServices.tsx',
      description: 'Cloud hosting and infrastructure services',
      status: 'active',
      wordpress_manageable: true,
    },
  ];

  const templates = [
    {
      id: 'homepage',
      name: 'Homepage Template',
      description: 'Corporate homepage with hero, services, testimonials',
      viewUrl: '/templates/homepage',
      previewImage: '/public/lovable-uploads/35e0c5a6-18b6-412a-ac65-0197f19f1dfc.png',
    },
    {
      id: 'landing',
      name: 'Landing Page Template',
      description: 'Conversion-focused landing page',
      viewUrl: '/templates/landing-page',
      previewImage: '/public/lovable-uploads/d2d7d623-f729-433e-b350-0e40b4a32b91.png',
    },
    {
      id: 'contact',
      name: 'Contact Template',
      description: 'Contact page with form and location info',
      viewUrl: '/templates/contact',
      previewImage: '/public/lovable-uploads/d6e7a1ca-229a-4c34-83fc-e9bdf106b683.png',
    },
  ];

  const handleEditPage = (page: any) => {
    setEditingPage(page);
  };

  const handleSavePage = () => {
    // Implement page saving logic
    setEditingPage(null);
  };

  const handleCreateFromTemplate = (templateId: string) => {
    // Implement template creation logic
    console.log('Creating page from template:', templateId);
  };

  const handleViewTemplate = (viewUrl: string) => {
    window.open(viewUrl, '_blank');
  };

  const handleEditContent = (page: any) => {
    setContentEditingPage(page);
  };

  const handleConnectWordPress = () => {
    // This would open a configuration modal for WordPress connection
    console.log('Opening WordPress connection dialog');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Page Management</h2>
        </div>
        <div className="text-center py-8">Loading WordPress pages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Page Management</h2>
        <div className="space-x-2">
          <Button onClick={handleConnectWordPress} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure WordPress
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      <Tabs defaultValue="react-pages" className="w-full">
        <TabsList>
          <TabsTrigger value="react-pages">React Pages</TabsTrigger>
          <TabsTrigger value="wordpress-pages">WordPress Pages</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="react-pages" className="space-y-4">
          <div className="grid gap-4">
            {staticPages.map((page) => (
              <Card key={page.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {page.title}
                        <Badge variant={page.status === 'active' ? 'default' : 'secondary'}>
                          {page.status}
                        </Badge>
                        {page.wordpress_manageable && (
                          <Badge variant="outline">WP Ready</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{page.description}</CardDescription>
                      <p className="text-sm text-muted-foreground mt-1">
                        Path: {page.path} • Component: {page.component}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(page.path, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditContent(page)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPage(page)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wordpress-pages" className="space-y-4">
          {error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Unable to connect to WordPress. Please configure your WordPress connection.
                  </p>
                  <Button onClick={handleConnectWordPress}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure WordPress Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : wordpressPages && wordpressPages.length > 0 ? (
            <div className="grid gap-4">
              {wordpressPages.map((page) => (
                <Card key={page.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {page.title.rendered}
                          <Badge variant={page.status === 'publish' ? 'default' : 'secondary'}>
                            {page.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {page.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-1">
                          Slug: /{page.slug} • Last modified: {new Date(page.modified).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(page.link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditContent(page)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    No WordPress pages found. Create your first page or check your connection.
                  </p>
                  <Button onClick={handleConnectWordPress}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure WordPress
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewTemplate(template.viewUrl)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleCreateFromTemplate(template.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Page
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Page Settings Dialog */}
      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page Settings</DialogTitle>
          </DialogHeader>
          {editingPage && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Page Title</label>
                <p className="text-sm text-muted-foreground">{editingPage.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Path</label>
                <p className="text-sm text-muted-foreground">{editingPage.path}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-muted-foreground">{editingPage.status}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPage(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePage}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Page Content Dialog */}
      <Dialog open={!!contentEditingPage} onOpenChange={() => setContentEditingPage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Page Content</DialogTitle>
          </DialogHeader>
          {contentEditingPage && (
            <PageContentEditor 
              pageTitle={contentEditingPage.title}
              pageId={contentEditingPage.id?.toString() || contentEditingPage.slug}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageManager;