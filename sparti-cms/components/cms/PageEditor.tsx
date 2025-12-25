import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../src/components/ui/button';
import { ScrollArea } from '../../../src/components/ui/scroll-area';
import { Separator } from '../../../src/components/ui/separator';
import { Badge } from '../../../src/components/ui/badge';
import { ArrowLeft, Save, Loader2, Settings, Code, FileText } from 'lucide-react';
import { FileCode } from 'lucide-react';
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
import SectionContentList from '../../../src/components/SectionContentList';
import CodeViewerDialog from './PageEditor/CodeViewerDialog';

// Contents Panel Component
interface ContentsPanelProps {
  components: ComponentSchema[];
  extractContentFromComponents: (components: ComponentSchema[]) => Array<{
    type: 'heading' | 'paragraph' | 'list' | 'text' | 'image';
    level?: number;
    text: string;
    componentType?: string;
    componentId?: string;
    imageUrl?: string;
    alt?: string;
  }>;
}

const ContentsPanel: React.FC<ContentsPanelProps> = ({ components, extractContentFromComponents }) => {
  const content = extractContentFromComponents(components);

  // Group content by componentId/componentType
  const groupedContent = React.useMemo(() => {
    const groups: Record<string, typeof content> = {};
    
    content.forEach((item) => {
      const groupKey = item.componentId || item.componentType || 'unknown';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return groups;
  }, [content]);

  // Get component type name for display
  const getComponentDisplayName = (componentId: string) => {
    const component = components.find(c => (c.key || '').includes(componentId) || componentId.includes(c.key || ''));
    if (component) {
      const type = component.type || '';
      // Convert camelCase/PascalCase to readable format
      return type
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim() || componentId;
    }
    return componentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (content.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Content Found</h3>
        <p className="text-muted-foreground">
          Add components with text content to see the page contents here.
        </p>
      </div>
    );
  }

  // Render content item with Word-like styling
  const renderContentItem = (item: typeof content[0], index: number) => {
    const key = `${item.componentId}-${index}`;
    
    switch (item.type) {
      case 'heading': {
        const HeadingTag = `h${item.level || 2}` as keyof JSX.IntrinsicElements;
        const level = item.level || 2;
        
        // Word-like heading styles
        const headingStyles = {
          1: 'text-[2rem] leading-[1.2] mb-4 font-bold text-gray-900', // 32px, like Word H1
          2: 'text-[1.5rem] leading-[1.3] mb-3 font-semibold text-gray-900', // 24px, like Word H2
          3: 'text-[1.25rem] leading-[1.4] mb-2 font-semibold text-gray-800', // 20px, like Word H3
          4: 'text-[1.125rem] leading-[1.4] mb-2 font-semibold text-gray-800', // 18px
          5: 'text-base leading-[1.5] mb-1 font-semibold text-gray-700', // 16px
          6: 'text-sm leading-[1.5] mb-1 font-semibold text-gray-700', // 14px
        };
        
        return (
          <HeadingTag
            key={key}
            className={headingStyles[level as keyof typeof headingStyles] || headingStyles[2]}
          >
            {item.text}
          </HeadingTag>
        );
      }
      case 'paragraph':
        return (
          <p
            key={key}
            className="text-[0.9375rem] leading-[1.6] mb-3 text-gray-700"
            style={{ fontFamily: 'inherit' }}
          >
            {item.text}
          </p>
        );
      case 'list':
        return (
          <li
            key={key}
            className="text-[0.9375rem] leading-[1.6] mb-2 ml-6 list-disc text-gray-700"
          >
            {item.text}
          </li>
        );
      case 'image':
        return (
          <div 
            key={key} 
            className="mb-4 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
          >
            <img
              src={item.imageUrl || ''}
              alt={item.alt || 'Image'}
              className="w-full h-auto max-h-64 object-cover"
            />
            {item.alt && (
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">{item.alt}</p>
              </div>
            )}
          </div>
        );
      case 'text':
      default:
        return (
          <div
            key={key}
            className="text-[0.9375rem] leading-[1.6] mb-2 text-gray-700"
          >
            {item.text}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          Page Contents
        </h2>
      </div>

      {/* Grouped sections with grid layout */}
      <div className="space-y-6">
        {Object.entries(groupedContent).map(([groupKey, items]) => {
          const componentName = getComponentDisplayName(groupKey);
          const componentType = items[0]?.componentType || 'section';
          
          return (
            <div
              key={groupKey}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-medium uppercase tracking-wide">
                    {componentType}
                  </Badge>
                  <h3 className="text-sm font-semibold text-gray-600">{componentName}</h3>
                </div>
                <span className="text-xs text-gray-400">{items.length} items</span>
              </div>

              {/* Grid Layout for Content */}
              <div 
                className="grid gap-4"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))'
                }}
              >
                {items.map((item, index) => {
                  // For images, make them span full width in their grid cell
                  if (item.type === 'image') {
                    return (
                      <div key={`${item.componentId}-${index}`} className="col-span-full">
                        {renderContentItem(item, index)}
                      </div>
                    );
                  }
                  
                  // For other content, render normally in grid
                  return (
                    <div key={`${item.componentId}-${index}`} className="min-w-0">
                      {renderContentItem(item, index)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold mb-3 flex items-center text-gray-800">
          <Settings className="h-4 w-4 mr-2" />
          Content Statistics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Items:</span>
            <span className="ml-2 font-medium text-gray-900">{content.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Headings:</span>
            <span className="ml-2 font-medium text-gray-900">{content.filter(c => c.type === 'heading').length}</span>
          </div>
          <div>
            <span className="text-gray-600">Paragraphs:</span>
            <span className="ml-2 font-medium text-gray-900">{content.filter(c => c.type === 'paragraph').length}</span>
          </div>
          <div>
            <span className="text-gray-600">Images:</span>
            <span className="ml-2 font-medium text-gray-900">{content.filter(c => c.type === 'image').length}</span>
          </div>
          <div>
            <span className="text-gray-600">Sections:</span>
            <span className="ml-2 font-medium text-gray-900">{Object.keys(groupedContent).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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

interface PageEditorProps {
  pageId: string;
  onBack: () => void;
  currentTenantId: string;
  currentThemeId: string;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageId, onBack, currentTenantId, currentThemeId }) => {
  const { user } = useAuth();
  const [pageData, setPageData] = useState<PageWithLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [components, setComponents] = useState<ComponentSchema[]>([]);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [selectedComponentForAI, setSelectedComponentForAI] = useState<ComponentSchema | null>(null);
  const [showSEOForm, setShowSEOForm] = useState(false);
  const [showContents, setShowContents] = useState(false);
  // Holds AI-proposed or manually prepared output versions of components
  const [proposedComponents, setProposedComponents] = useState<ComponentSchema[] | null>(null);
  const [originalComponents, setOriginalComponents] = useState<ComponentSchema[]>([]);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [pageFileHint, setPageFileHint] = useState<string | null>(null);

  // JSON Editor hook
  const {
    showEditor: showJSONEditor,
    jsonString,
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
        
        // Determine API endpoint based on tenant + theme
        let apiUrl: string;
        if (currentTenantId && currentThemeId) {
          // Use tenant + theme combination
          if (currentThemeId === 'custom') {
            // Custom theme: use tenant-based endpoint
            apiUrl = `/api/pages/${pageId}?tenantId=${currentTenantId}`;
          } else {
            // Specific theme: use tenant + theme endpoint
            apiUrl = `/api/pages/${pageId}?tenantId=${currentTenantId}&themeId=${currentThemeId}`;
          }
        } else {
          console.error('No tenant or theme ID available');
          toast.error('Failed to load page data: No tenant or theme selected');
          setLoading(false);
          return;
        }
        
        const response = await api.get(apiUrl);
        const data = await response.json();
        
        // Convert testimonials sections to proper items structure if needed
        if (data.page && data.page.layout && data.page.layout.components) {
          try {
            const { convertLayoutTestimonialsToItems } = await import('../../utils/convertTestimonialsToItems.js');
            data.page.layout = convertLayoutTestimonialsToItems(data.page.layout);
          } catch (error) {
            console.log('[testing] Note: Could not convert testimonials structure:', error);
          }
        }

        if (data.success) {
          setPageData(data.page);

          if (data.page.layout?.components) {
            const layoutComponents = isValidComponentsArray(data.page.layout.components)
              ? data.page.layout.components
              : [];
            setComponents(layoutComponents);
            // store snapshot to detect unsaved/manual changes
            setOriginalComponents(JSON.parse(JSON.stringify(layoutComponents)));
          } else {
            setComponents([]);
            setOriginalComponents([]);
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

    // Fetch if we have either tenantId (tenant mode) or themeId (theme mode)
    if (currentTenantId && currentThemeId) {
      fetchPageData();
    }
  }, [pageId, currentTenantId, currentThemeId]);

  // Update page field
  const updateField = useCallback((field: keyof PageData, value: string | boolean) => {
    if (pageData) {
      setPageData({ ...pageData, [field]: value });
    }
  }, [pageData]);

  // Extract readable/editable content from components (text + images)
  const extractContentFromComponents = useCallback((components: ComponentSchema[]) => {
    const content: Array<{
      type: 'heading' | 'paragraph' | 'list' | 'text' | 'image';
      level?: number;
      text: string;
      componentType?: string;
      componentId?: string;
      imageUrl?: string;
      alt?: string;
    }> = [];

    const extractFromProps = (props: any, componentType: string, componentId: string) => {
      if (!props) return;

      // Common text properties to extract
      const textProperties = [
        'title', 'heading', 'headingLine1', 'headingLine2', 'subtitle', 
        'description', 'content', 'text', 'label', 'buttonText', 
        'ctaButtonText', 'badgeText', 'name', 'tagline'
      ];
      // Common image-like keys
      const imageKeys = ['src', 'url', 'image'];

      const headingProperties = [
        'title', 'heading', 'headingLine1', 'headingLine2', 'name'
      ];

      const paragraphProperties = [
        'description', 'content', 'text', 'subtitle', 'tagline'
      ];

      Object.entries(props).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() && textProperties.includes(key)) {
          if (headingProperties.includes(key)) {
            // Determine heading level based on property name and component type
            let level = 2;
            if (key === 'title' || key === 'heading') level = 1;
            if (key === 'headingLine1') level = 1;
            if (key === 'headingLine2') level = 2;
            if (componentType.includes('hero')) level = 1;
            
            content.push({
              type: 'heading',
              level,
              text: value.trim(),
              componentType,
              componentId
            });
          } else if (paragraphProperties.includes(key)) {
            content.push({
              type: 'paragraph',
              text: value.trim(),
              componentType,
              componentId
            });
          } else {
            content.push({
              type: 'text',
              text: value.trim(),
              componentType,
              componentId
            });
          }
        } else if (Array.isArray(value)) {
          // Handle arrays (like lists, features, etc.)
          value.forEach((item, index) => {
            if (typeof item === 'string' && item.trim()) {
              content.push({
                type: 'list',
                text: item.trim(),
                componentType,
                componentId: `${componentId}-item-${index}`
              });
            } else if (typeof item === 'object' && item) {
              // If array item is an image-like object
              const url = typeof (item as any).src === 'string' ? (item as any).src
                : typeof (item as any).url === 'string' ? (item as any).url
                : typeof (item as any).image === 'string' ? (item as any).image
                : '';
              if (url) {
                content.push({
                  type: 'image',
                  text: '', // not used for images
                  imageUrl: url,
                  alt: typeof (item as any).alt === 'string' ? (item as any).alt : undefined,
                  componentType,
                  componentId: `${componentId}-item-${index}`
                });
              }
              extractFromProps(item, componentType, `${componentId}-item-${index}`);
            }
          });
        } else if (typeof value === 'object' && value) {
          // If object looks like an image
          const url = imageKeys
            .map(k => (value as any)[k])
            .find(v => typeof v === 'string' && v.trim());
          if (typeof url === 'string') {
            content.push({
              type: 'image',
              text: '',
              imageUrl: url,
              alt: typeof (value as any).alt === 'string' ? (value as any).alt : undefined,
              componentType,
              componentId
            });
          }
          // Recursively extract from nested objects (to catch deeper text fields)
          extractFromProps(value, componentType, `${componentId}-${key}`);
        }
      });
    };

    components.forEach((component, index) => {
      const componentType = component.type || 'unknown';
      const componentId = component.key || `component-${index}`;
      
      extractFromProps((component as any).props ?? (component.items as any), componentType, componentId);
    });

    return content;
  }, []);

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

      // refresh snapshot after successful save
      setOriginalComponents(JSON.parse(JSON.stringify(components)));
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
    setShowContents(false);
    setSelectedComponentForAI(components[index] || null);
  }, [components]);

  const handleSEOFormOpen = useCallback(() => {
    setShowSEOForm(true);
    setSelectedComponentIndex(null);
    setShowContents(false);
  }, []);

  // Attempt to detect page file from context when pageData loads
  useEffect(() => {
    try {
      const ctx: any = pageData;
      const hint =
        ctx?.layout?.pageFilePath ||
        ctx?.page_file_path ||
        ctx?.page_file_name ||
        null;
      if (hint) setPageFileHint(hint);
    } catch {}
  }, [pageData]);

  // Memoized selected component
  const selectedComponent = useMemo(() => {
    if (selectedComponentIndex === null || !isValidComponentsArray(components)) {
      return null;
    }
    return components[selectedComponentIndex] || null;
  }, [selectedComponentIndex, components]);

  // Render right panel
  const renderRightPanel = () => {
    if (showContents) {
      // Page-level view: SEO at top, then single contents preview
      return (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <SEOForm pageData={pageData} onFieldChange={updateField} />
          </div>

          <ContentsPanel
            components={components}
            extractContentFromComponents={extractContentFromComponents}
          />
        </div>
      );
    }

    if (showSEOForm) {
      return <SEOForm pageData={pageData} onFieldChange={updateField} />;
    }

    if (selectedComponentIndex !== null) {
      // Per-section view without tabs: show editor, then a single preview (output if present, else original)
      const selected = selectedComponent;
      const proposedForSelected = proposedComponents?.find((c) => c.key === selected?.key) || null;

      const renderSectionContents = (comp: ComponentSchema | null) => {
        const items = comp ? extractContentFromComponents([comp]) : [];
        return (
          <div className="space-y-4 mt-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Section Contents
              </h3>
              <p className="text-sm text-muted-foreground">
                Readable text from this section
              </p>
            </div>
            <SectionContentList items={items} />
          </div>
        );
      };

      // NEW: Render the AI Output section with Apply button
      const renderOutputContents = (comp: ComponentSchema | null) => {
        const items = comp ? extractContentFromComponents([comp]) : [];
        return (
          <div className="space-y-4 mt-8 border-t pt-6">
            <div className="border-b pb-2 flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  AI Output
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedComponentIndex === null || !selected || !comp) return;
                    const normalized = {
                      ...comp,
                      key: comp.key || selected.key,
                      type: comp.type || selected.type,
                    };
                    updateComponent(selectedComponentIndex, normalized);
                    setProposedComponents((prev) => {
                      if (!prev) return prev;
                      const key = normalized.key;
                      const filtered = prev.filter((c) => c.key !== key);
                      return filtered.length > 0 ? filtered : null;
                    });
                    toast.success('Output applied to this section');
                  }}
                >
                  Apply Output
                </Button>
              </div>
            </div>

            <SectionContentList items={items} variant="output" />
          </div>
        );
      };

      return (
        <div className="w-full">
          {/* Interactive editor for the selected component */}
          <ComponentEditorPanel
            component={selected}
            componentIndex={selectedComponentIndex}
            components={components}
            onUpdate={updateComponent}
          />

          {/* Single preview: always show the current component content */}
          {renderSectionContents(selected)}

          {/* NEW: Show AI Output draft below the section contents with Apply button */}
          {proposedForSelected ? renderOutputContents(proposedForSelected) : null}
        </div>
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
              onClick={() => setShowCodeViewer(true)}
              title="Open the detected page source code"
            >
              <FileCode className="h-4 w-4 mr-2" />
              Code
            </Button>
          )}
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

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {/* Sections acts like old Contents (click to show contents panel) */}
              <Button
                variant={showContents ? "default" : "ghost"}
                className="w-full justify-start text-lg font-semibold py-3"
                onClick={() => {
                  setShowContents(true);
                  setShowSEOForm(false);
                  setSelectedComponentIndex(null);
                  // Signal AI chat to use the full page schema (page-level context)
                  setSelectedComponentForAI({ __scope: 'page', schema: { components } } as any);
                }}
              >
                Sections
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

        {/* Right Sidebar - Editor */}
        <div className="w-[420px] min-w-[420px] max-w-[420px] flex-shrink-0 border-l bg-background">
          <AIAssistantChat 
            className="h-full w-full"
            pageContext={pageData ? {
              slug: pageData.slug,
              pageName: pageData.page_name,
              tenantId: currentTenantId || undefined
            } : null}
            currentComponents={components}
            onUpdateComponents={setComponents}
            onProposedComponents={(proposals) => {
              // Auto-apply proposals into components by key or by best-effort type match.
              setComponents((prev) => {
                const next = [...prev]
                const matchIndex = (proposal: any) => {
                  if (proposal.key) {
                    const idx = next.findIndex((c) => c.key === proposal.key)
                    if (idx !== -1) return idx
                  }
                  if (proposal.type) {
                    const lower = String(proposal.type).toLowerCase()
                    const byType = next.findIndex((c) => (c.type || '').toLowerCase() === lower)
                    if (byType !== -1) return byType
                    const byName = next.findIndex((c) => c.name && c.name.toLowerCase().includes(lower))
                    if (byName !== -1) return byName
                  }
                  return -1
                }
                proposals.forEach((p: any) => {
                  if (!p) return
                  const idx = matchIndex(p)
                  if (idx !== -1) {
                    // Preserve original key if missing
                    const incoming = { ...p, key: p.key || next[idx].key, type: p.type || next[idx].type }
                    next[idx] = incoming
                  }
                })
                return next
              })
              // Also keep a snapshot of the latest proposals for page-level preview (if elsewhere needed)
              setProposedComponents((prev) => {
                const list = Array.isArray(prev) ? [...prev] : []
                proposals.forEach((p: any) => {
                  if (!p) return
                  const key = p.key || (components.find((c) => (c.type || '').toLowerCase() === String(p.type || '').toLowerCase())?.key)
                  if (!key) return
                  const idx = list.findIndex((c) => c.key === key)
                  const normalized = { ...p, key }
                  if (idx >= 0) list[idx] = normalized
                  else list.push(normalized)
                })
                return list
              })
            }}
            onOpenJSONEditor={openJSONEditor}
            selectedComponentJSON={selectedComponentForAI || ({ __scope: 'page', schema: { components } } as any)}
            onComponentSelected={() => {}}
          />
        </div>
      </div>

      {/* Code Viewer Dialog */}
      <CodeViewerDialog
        open={showCodeViewer}
        onOpenChange={setShowCodeViewer}
        pageSlug={pageData.slug}
        pageName={pageData.page_name}
        tenantId={currentTenantId}
        initialFileHint={pageFileHint}
      />

      {/* JSON Editor Dialog */}
      <JSONEditorDialog
        open={showJSONEditor}
        onOpenChange={closeJSONEditor}
        editorRef={setEditorRef}
        jsonString={jsonString}
        jsonError={jsonError}
        onSave={handleSave}
      />
    </div>
  );
};

export default PageEditor;