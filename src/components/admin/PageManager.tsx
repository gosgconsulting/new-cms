import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Eye, Plus, Copy, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PageContentEditor from "./PageContentEditor";

const PageManager = () => {
  const [pages, setPages] = useState([
    {
      id: 1,
      title: "Home",
      slug: "/",
      metaTitle: "GO SG - Digital Marketing Agency Singapore",
      metaDescription: "Leading digital marketing agency in Singapore offering SEO, web design, and paid advertising services.",
      status: "published",
      lastModified: "2024-01-15"
    },
    {
      id: 2,
      title: "Website Design",
      slug: "/services/website-design",
      metaTitle: "Website Design Services Singapore | GO SG",
      metaDescription: "Professional website design and development services in Singapore. Custom, responsive websites that convert.",
      status: "published",
      lastModified: "2024-01-14"
    },
    {
      id: 3,
      title: "SEO Services",
      slug: "/services/seo",
      metaTitle: "SEO Services Singapore | Search Engine Optimization",
      metaDescription: "Boost your website rankings with our expert SEO services in Singapore. Increase organic traffic and visibility.",
      status: "published",
      lastModified: "2024-01-13"
    },
    {
      id: 4,
      title: "Contact",
      slug: "/contact",
      metaTitle: "Contact GO SG | Digital Marketing Agency Singapore",
      metaDescription: "Get in touch with GO SG for your digital marketing needs. We're here to help grow your business online.",
      status: "published",
      lastModified: "2024-01-12"
    }
  ]);

  const [editingPage, setEditingPage] = useState<any>(null);
  const [contentEditingPage, setContentEditingPage] = useState<any>(null);

  const templates = [
    {
      id: "homepage",
      name: "Homepage Template",
      description: "Complete homepage with hero section, services carousel, testimonials, and CTA",
      viewUrl: "/templates/homepage",
      preview: {
        hero: "Your Main Headline Here",
        services: ["Service 1", "Service 2", "Service 3", "Service 4"],
        features: ["Feature/Benefit 1", "Feature/Benefit 2", "Feature/Benefit 3"],
        cta: "Your Call to Action"
      }
    },
    {
      id: "landing",
      name: "Landing Page Template", 
      description: "Focused landing page with hero, benefits, testimonials, and conversion CTA",
      viewUrl: "/templates/landing-page",
      preview: {
        hero: "Landing Page Headline",
        benefits: ["Key Benefit 1", "Key Benefit 2", "Key Benefit 3"],
        features: ["Feature 1", "Feature 2", "Feature 3"],
        cta: "Convert Now"
      }
    },
    {
      id: "contact",
      name: "Contact Page Template",
      description: "Contact page with form, location info, and contact details",
      viewUrl: "/templates/contact",
      preview: {
        hero: "Get In Touch",
        sections: ["Contact Form", "Office Location", "Contact Information"],
        cta: "Send Message"
      }
    }
  ];

  const handleEditPage = (page: any) => {
    setEditingPage({ ...page });
  };

  const handleSavePage = () => {
    if (editingPage) {
      setPages(pages.map(page => 
        page.id === editingPage.id ? editingPage : page
      ));
      setEditingPage(null);
    }
  };

  const handleCreateFromTemplate = (templateId: string) => {
    console.log(`Creating page from template: ${templateId}`);
    // In a real implementation, this would create a new page based on the template
  };

  const handleViewTemplate = (viewUrl: string) => {
    window.open(viewUrl, '_blank');
  };

  const handleEditContent = (page: any) => {
    setContentEditingPage(page);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Page Manager</h1>
          <p className="text-gray-600 mt-2">Manage your website pages and SEO settings</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Page
        </Button>
      </div>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList>
          <TabsTrigger value="pages">All Pages</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>All Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.map((page) => (
                  <div key={page.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{page.title}</h3>
                          <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                            {page.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>URL:</strong> {page.slug}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Meta Title:</strong> {page.metaTitle}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Meta Description:</strong> {page.metaDescription}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last modified: {page.lastModified}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditContent(page)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
                            <DialogHeader>
                              <DialogTitle>Edit Page Content: {page.title}</DialogTitle>
                            </DialogHeader>
                            <div className="overflow-y-auto max-h-[80vh]">
                              {contentEditingPage && (
                                <PageContentEditor 
                                  pageTitle={contentEditingPage.title}
                                  pageId={contentEditingPage.id.toString()}
                                />
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditPage(page)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Page Settings: {page.title}</DialogTitle>
                            </DialogHeader>
                            {editingPage && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Page Title</label>
                                  <Input
                                    value={editingPage.title}
                                    onChange={(e) => setEditingPage({
                                      ...editingPage,
                                      title: e.target.value
                                    })}
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium mb-2">Meta Title</label>
                                  <Input
                                    value={editingPage.metaTitle}
                                    onChange={(e) => setEditingPage({
                                      ...editingPage,
                                      metaTitle: e.target.value
                                    })}
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium mb-2">Meta Description</label>
                                  <Textarea
                                    value={editingPage.metaDescription}
                                    onChange={(e) => setEditingPage({
                                      ...editingPage,
                                      metaDescription: e.target.value
                                    })}
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setEditingPage(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSavePage}>
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Page Templates</CardTitle>
              <p className="text-sm text-gray-600">
                Pre-built page templates with placeholder content to get you started quickly
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-center space-x-2 mb-3">
                      <Copy className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description}
                    </p>
                    
                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">PREVIEW:</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        {template.id === 'homepage' && (
                          <>
                            <div>• {template.preview.hero}</div>
                            <div>• Services: {template.preview.services?.join(', ')}</div>
                            <div>• Features: {template.preview.features?.join(', ')}</div>
                            <div>• {template.preview.cta}</div>
                          </>
                        )}
                        {template.id === 'landing' && (
                          <>
                            <div>• {template.preview.hero}</div>
                            <div>• Benefits: {template.preview.benefits?.join(', ')}</div>
                            <div>• Features: {template.preview.features?.join(', ')}</div>
                            <div>• {template.preview.cta}</div>
                          </>
                        )}
                        {template.id === 'contact' && (
                          <>
                            <div>• {template.preview.hero}</div>
                            <div>• Sections: {template.preview.sections?.join(', ')}</div>
                            <div>• {template.preview.cta}</div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => handleViewTemplate(template.viewUrl)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => handleCreateFromTemplate(template.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Page
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PageManager;
