import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import SchemaEditor from './SchemaEditor';
import { useAuth } from '../auth/AuthProvider';
import { ComponentSchema } from '../../types/schema';
import { needsMigration, getSchemaVersion } from '../../utils/schema-migration';

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
  const { currentTenant } = useAuth();
  const [pageData, setPageData] = useState<PageWithLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [components, setComponents] = useState<ComponentSchema[]>([]);
  const [schemaVersion, setSchemaVersion] = useState<string>('unknown');
  const [needsMigrationFlag, setNeedsMigrationFlag] = useState(false);

  // Fetch page data from database
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/pages/${pageId}?tenantId=${currentTenant.id}`);
        const data = await response.json();
        
        if (data.success) {
          setPageData(data.page);
          
          // Handle layout data - check if it's the new format or old format
          if (data.page.layout) {
            // Check if it's the new format (has components with items array)
            if (data.page.layout.components && Array.isArray(data.page.layout.components) && 
                data.page.layout.components.length > 0 && 
                data.page.layout.components[0].items) {
              // It's the new format
              setComponents(data.page.layout.components);
            } else {
              // It's the old format, convert it using migration utility
              console.log('[testing] Old format detected, converting to new format');
              try {
                const { migrateOldSchemaToNew } = await import('../../utils/schema-migration');
                const newSchema = migrateOldSchemaToNew(data.page.layout);
                setComponents(newSchema.components);
              } catch (error) {
                console.error('[testing] Migration failed, using fallback:', error);
                // Fallback: create a simple component
                const fallbackFormat: ComponentSchema[] = [
                  {
                    component: 'TextBlock',
                    items: [
                      {
                        type: 'text' as const,
                        value: { en: 'Content from old format', fr: 'Contenu de l\'ancien format' }
                      }
                    ]
                  }
                ];
                setComponents(fallbackFormat);
              }
            }
            
            // Check schema version and migration status
            const version = getSchemaVersion(data.page.layout);
            setSchemaVersion(version);
            setNeedsMigrationFlag(needsMigration(data.page.layout));
          } else {
            // No layout data, start with empty components
            setComponents([]);
            setSchemaVersion('unknown');
            setNeedsMigrationFlag(false);
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

  const handleSave = async () => {
    if (!pageData) return;
    
    try {
      setSaving(true);
      
      // Update page data
      const pageResponse = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_name: pageData.page_name,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          seo_index: pageData.seo_index,
          tenantId: currentTenant.id
        }),
      });

      if (!pageResponse.ok) {
        throw new Error('Failed to update page data');
      }

      // Update page layout with new schema format
      const layoutResponse = await fetch(`/api/pages/${pageId}/layout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layout_json: { components },
          tenantId: currentTenant.id
        }),
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Edit Page: {pageData.page_name}</h2>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">{pageData.slug}</p>
              <Badge variant={schemaVersion === '2.0' ? 'default' : 'secondary'}>
                Schema v{schemaVersion}
              </Badge>
              {needsMigrationFlag && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Migration Available
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {needsMigrationFlag && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Trigger migration in SchemaEditor
                toast.info('Use the "Migrate to New Format" button in the Schema Editor below');
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Migrate Schema
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

      {/* SEO Meta Information */}
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

      {/* Schema Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Page Components</CardTitle>
          <CardDescription>Edit the components that make up this page</CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaEditor
            components={components}
            onChange={setComponents}
            onSave={handleSave}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PageEditor;
