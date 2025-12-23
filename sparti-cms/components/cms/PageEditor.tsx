import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../src/components/ui/button';
import { ScrollArea } from '../../../src/components/ui/scroll-area';
import { Separator } from '../../../src/components/ui/separator';
import { ArrowLeft, Save, Loader2, Settings, Code } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthProvider';
import { ComponentSchema } from '../../types/schema';
import api from '../../utils/api';
import { useJSONEditor } from '../../hooks/useJSONEditor';
import { useComponentOperations } from '../../hooks/useComponentOperations';
import { isValidComponentsArray } from '../../utils/componentHelpers';
import { SEOForm } from './PageEditor/SEOForm';
import { ComponentEditorPanel } from './PageEditor/ComponentEditorPanel';
import { ComponentListItem } from './PageEditor/ComponentListItem';
import { JSONEditorDialog } from './PageEditor/JSONEditorDialog';
import { EmptyState, ComponentsErrorState, ComponentsEmptyState } from './PageEditor/EmptyStates';
import { AIAssistantChat } from '../../../src/components/AIAssistantChat';

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
  const { currentTenantId, user } = useAuth();
  const [pageData, setPageData] = useState<PageWithLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [components, setComponents] = useState<ComponentSchema[]>([]);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [showSEOForm, setShowSEOForm] = useState(false);
  const [selectedComponentForAI, setSelectedComponentForAI] = useState<ComponentSchema | null>(null);

  // JSON Editor hook
  const {
    showEditor: showJSONEditor,
    jsonError,
    setEditorRef,
    openEditor: openJSONEditor,
    closeEditor: closeJSONEditor,
  } = useJSONEditor({
    components,
    onComponentsChange: setComponents,
  });

  // Component operations hook
  const { removeComponent, updateComponent } = useComponentOperations({
    components,
    setComponents,
    selectedComponentIndex,
    setSelectedComponentIndex,
  });

  // Fetch page data
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/pages/${pageId}?tenantId=${currentTenantId}`);
        const data = await response.json();

        if (data.success) {
          setPageData(data.page);

          if (data.page.layout?.components) {
            const layoutComponents = isValidComponentsArray(data.page.layout.components)
              ? data.page.layout.components
              : [];
            setComponents(layoutComponents);
          } else {
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

    if (currentTenantId) {
      fetchPageData();
    }
  }, [pageId, currentTenantId]);

  // Update page field
  const updateField = useCallback((field: keyof PageData, value: string | boolean) => {
    if (pageData) {
      setPageData({ ...pageData, [field]: value });
    }
  }, [pageData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!pageData) return;

    try {
      setSaving(true);

      const pageResponse = await api.put(`/api/pages/${pageId}`, {
        page_name: pageData.page_name || '',
        meta_title: pageData.meta_title || '',
        meta_description: pageData.meta_description || '',
        seo_index: pageData.seo_index || false,
        tenantId: currentTenantId
      });

      if (!pageResponse.ok) {
        throw new Error('Failed to update page data');
      }

      const layoutResponse = await api.put(`/api/pages/${pageId}/layout`, {
        layout_json: { components },
        tenantId: currentTenantId
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
  }, [pageData, pageId, currentTenantId, components]);

  // Handle component selection
  const handleComponentSelect = useCallback((index: number) => {
    setSelectedComponentIndex(index);
    setShowSEOForm(false);
  }, []);

  const handleSEOFormOpen = useCallback(() => {
    setShowSEOForm(true);
    setSelectedComponentIndex(null);
  }, []);

  // Memoized selected component
  const selectedComponent = useMemo(() => {
    if (selectedComponentIndex === null || !isValidComponentsArray(components)) {
      return null;
    }
    return components[selectedComponentIndex] || null;
  }, [selectedComponentIndex, components]);

  // Render right panel
  const renderRightPanel = () => {
    if (showSEOForm) {
      return <SEOForm pageData={pageData} onFieldChange={updateField} />;
    }

    if (selectedComponentIndex !== null) {
      return (
        <ComponentEditorPanel
          component={selectedComponent}
          componentIndex={selectedComponentIndex}
          components={components}
          onUpdate={updateComponent}
        />
      );
    }

    return (
      <EmptyState
        title="Select a Component"
        description="Choose a component from the left panel to edit its settings"
      />
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading page data...</span>
      </div>
    );
  }

  // Error state
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
            <h2 className="text-xl font-bold">Edit Page: {pageData.page_name || 'Untitled'}</h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{pageData.slug || 'no-slug'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user?.is_super_admin && (
            <Button
              variant="outline"
              size="sm"
              onClick={openJSONEditor}
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
      <div className="flex-1 flex overflow-hidden relative">
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
                onClick={handleSEOFormOpen}
              >
                <Settings className="h-4 w-4 mr-2" />
                SEO Settings
              </Button>

              <Separator className="my-2" />

              {/* Components List */}
              {isValidComponentsArray(components) && components.length > 0 && (
                components.map((component, index) => (
                  <ComponentListItem
                    key={component.key}
                    component={component}
                    index={index}
                    isSelected={selectedComponentIndex === index}
                    onSelect={handleComponentSelect}
                    onSendToAI={(comp) => setSelectedComponentForAI(comp)}
                  />
                ))
              )}

              {!isValidComponentsArray(components) && (
                <ComponentsErrorState onReset={() => setComponents([])} />
              )}

              {isValidComponentsArray(components) && components.length === 0 && (
                <ComponentsEmptyState />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Middle Panel - Settings */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {renderRightPanel()}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - AI Assistant */}
        <AIAssistantChat 
          className="h-full" 
          pageContext={pageData ? {
            slug: pageData.slug,
            pageName: pageData.page_name,
            tenantId: currentTenantId || undefined
          } : null}
          currentComponents={components}
          onUpdateComponents={setComponents}
          onOpenJSONEditor={openJSONEditor}
          selectedComponentJSON={selectedComponentForAI}
          onComponentSelected={() => {
            // Clear the selection after it's been processed
            setSelectedComponentForAI(null);
          }}
        />
      </div>

      {/* JSON Editor Dialog */}
      <JSONEditorDialog
        open={showJSONEditor}
        onOpenChange={closeJSONEditor}
        editorRef={setEditorRef}
        jsonError={jsonError}
        onSave={handleSave}
      />
    </div>
  );
};

export default PageEditor;