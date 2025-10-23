import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { ScrollArea } from '../../../src/components/ui/scroll-area';
import { Separator } from '../../../src/components/ui/separator';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle, RefreshCw, Settings, Eye, Trash2, GripVertical, Code } from 'lucide-react';
import { toast } from 'sonner';
import SchemaEditor from './SchemaEditor';
import ComponentEditor from './ComponentEditor';
import { useAuth } from '../auth/AuthProvider';
import { ComponentSchema } from '../../types/schema';
import api from '../../utils/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../../../src/components/ui/dialog"


interface PageEditorProps {
  pageId: string;
  onBack: () => void;
}

interface PageData {
  id: string;
  page_name: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  seo_index: boolean;
  status: string;
  page_type: string;
  created_at: string;
  updated_at: string;
}

interface PageLayout {
  components: ComponentSchema[];
  _version?: {
    version: string;
    migratedAt?: string;
    migratedFrom?: string;
  };
}

interface PageWithLayout extends PageData {
  layout?: PageLayout;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageId, onBack }) => {
  const { currentTenant, user } = useAuth();
  const [pageData, setPageData] = useState<PageWithLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [components, setComponents] = useState<ComponentSchema[]>([]);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [showSEOForm, setShowSEOForm] = useState(false);
  const [showJSONEditor, setShowJSONEditor] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (showJSONEditor) {
      setJsonString(JSON.stringify(components, null, 2));
      setJsonError(null);
    }
  }, [showJSONEditor]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJsonString = e.target.value;
    setJsonString(newJsonString);
    try {
      const parsed = JSON.parse(newJsonString);
      setComponents(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError('Invalid JSON format.');
    }
  };

  // Fetch page data from database
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/pages/${pageId}?tenantId=${currentTenant.id}`);
        const data = await response.json();
        
        if (data.success) {
          setPageData(data.page);
          
          // Handle layout data
          if (data.page.layout && data.page.layout.components) {
            setComponents(data.page.layout.components);
          } else {
            // No layout data, start with empty components
            setComponents([]);
          }
        } else {
          toast.error('Failed to load page data');
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
        toast.error('Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    if (currentTenant.id) {
      fetchPageData();
    }
  }, [pageId, currentTenant.id]);

  const updateField = (field: keyof PageData, value: string | boolean) => {
    if (pageData) {
      setPageData({ ...pageData, [field]: value });
    }
  };


  const removeComponent = (index: number) => {
    const newComponents = components.filter((_, i) => i !== index);
    setComponents(newComponents);
    if (selectedComponentIndex === index) {
      setSelectedComponentIndex(null);
    } else if (selectedComponentIndex !== null && selectedComponentIndex > index) {
      setSelectedComponentIndex(selectedComponentIndex - 1);
    }
  };

  const updateComponent = (index: number, updatedComponent: ComponentSchema) => {
    const newComponents = [...components];
    newComponents[index] = updatedComponent;
    setComponents(newComponents);
  };

  const getComponentTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'TextBlock': 'Text Block',
      'HeroSection': 'Hero Section',
      'Showcase': 'Showcase',
      'ProductGrid': 'Product Grid',
      'Reviews': 'Reviews',
      'Newsletter': 'Newsletter',
      'ImageBlock': 'Image Block',
      'VideoBlock': 'Video Block'
    };
    return typeMap[type] || type;
  };


  const handleSave = async () => {
    if (!pageData) return;
    
    try {
      setSaving(true);
      
      // Update page data
      const pageResponse = await api.put(`/api/pages/${pageId}`, {
        page_name: pageData.page_name,
        meta_title: pageData.meta_title,
        meta_description: pageData.meta_description,
        seo_index: pageData.seo_index,
        tenantId: currentTenant.id
      });

      if (!pageResponse.ok) {
        throw new Error('Failed to update page data');
      }

      // Update page layout with new schema format
      const layoutResponse = await api.put(`/api/pages/${pageId}/layout`, {
        layout_json: { components },
        tenantId: currentTenant.id
      });

      if (!layoutResponse.ok) {
        throw new Error('Failed to update page layout');
      }

      toast.success('Page saved successfully');
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const renderRightPanel = () => {
    if (showSEOForm) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>SEO & Meta Information</CardTitle>
                <CardDescription>Configure page title and meta description for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                    id="page-title"
                    value={pageData.page_name}
                    onChange={(e) => updateField('page_name', e.target.value)}
                    placeholder="Page Title"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                    id="meta-title"
                    value={pageData.meta_title}
                    onChange={(e) => updateField('meta_title', e.target.value)}
                    placeholder="Meta Title (60 characters max)"
                    maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                    {pageData.meta_title.length}/60 characters
                </p>
                </div>
                <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                    id="meta-description"
                    value={pageData.meta_description}
                    onChange={(e) => updateField('meta_description', e.target.value)}
                    placeholder="Meta Description (160 characters max)"
                    rows={3}
                    maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                    {pageData.meta_description.length}/160 characters
                </p>
                </div>
                <div className="space-y-2">
                <Label htmlFor="seo-index">SEO Index</Label>
                <div className="flex items-center space-x-2">
                    <input
                    type="checkbox"
                    id="seo-index"
                    checked={pageData.seo_index}
                    onChange={(e) => updateField('seo_index', e.target.checked)}
                    className="rounded"
                    />
                    <Label htmlFor="seo-index" className="text-sm">
                    Allow search engines to index this page
                    </Label>
                </div>
                </div>
            </CardContent>
        </Card>
      );
    }

    if (selectedComponentIndex !== null) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>
                {getComponentTypeDisplayName(components[selectedComponentIndex].type)} Settings
                </CardTitle>
                <CardDescription>
                Configure the properties of this component
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ComponentEditor
                schema={components[selectedComponentIndex]}
                onChange={(updatedComponent) => {
                    updateComponent(selectedComponentIndex, updatedComponent);
                }}
                />
            </CardContent>
        </Card>
      );
    }

    return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
            <div className="text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Select a Component</h3>
            <p className="text-sm">Choose a component from the left panel to edit its settings</p>
            </div>
        </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading page data...</span>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Page not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Edit Page: {pageData.page_name}</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{pageData.slug}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {user?.is_super_admin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowJSONEditor(true)}
            >
              <Code className="h-4 w-4 mr-2" />
              JSON Editor
            </Button>
          )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel - Components List */}
      <div className="w-80 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Page Components</h3>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {/* SEO Settings Button */}
            <Button
              variant={showSEOForm ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setShowSEOForm(true);
                setSelectedComponentIndex(null);
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              SEO Settings
            </Button>
            
            <Separator className="my-2" />
            
            {/* Components List */}
            {components.map((component, index) => (
              <div
                key={component.key}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedComponentIndex === index
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => {
                  setSelectedComponentIndex(index);
                  setShowSEOForm(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {getComponentTypeDisplayName(component.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {component.key}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComponent(index);
                    }}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {components.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No components available</p>
                <p className="text-xs">This page has no components to edit</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Settings */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {renderRightPanel()}
          </div>
        </ScrollArea>
      </div>
    </div>
    <Dialog open={showJSONEditor} onOpenChange={setShowJSONEditor}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Page Schema JSON Editor</DialogTitle>
          <DialogDescription>
            Edit the complete page structure. Be careful with this editor.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
            <Textarea
                value={jsonString}
                onChange={handleJsonChange}
                className="w-full h-full font-mono text-sm resize-none"
                placeholder="Enter page schema as JSON..."
            />
             {jsonError && <p className="text-destructive text-sm mt-2">{jsonError}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
                onClick={() => {
                    handleSave();
                    setShowJSONEditor(false);
                }}
                disabled={!!jsonError}
            >
                Save & Close
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  );
};

export default PageEditor;
