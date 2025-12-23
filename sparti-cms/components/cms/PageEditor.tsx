import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../src/components/ui/button';
import { ScrollArea } from '../../../src/components/ui/scroll-area';
import { Separator } from '../../../src/components/ui/separator';
import { ArrowLeft, Save, Loader2, Settings, Code, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../src/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../src/components/ui/accordion';
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

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          Page Contents
        </h2>
      </div>

      <div className="prose prose-sm max-w-none space-y-3">
        {content.map((item, index) => {
          const key = `${item.componentId}-${index}`;
          switch (item.type) {
            case 'heading': {
              const HeadingTag = `h${item.level || 2}` as keyof JSX.IntrinsicElements;
              return (
                <HeadingTag
                  key={key}
                  className={`font-bold text-foreground ${
                    item.level === 1 ? 'text-3xl' :
                    item.level === 2 ? 'text-2xl' :
                    item.level === 3 ? 'text-xl' : 'text-lg'
                  }`}
                  title={`From ${item.componentType} (${item.componentId})`}
                >
                  {item.text}
                </HeadingTag>
              );
            }
            case 'paragraph':
              return (
                <p
                  key={key}
                  className="text-foreground leading-relaxed"
                  title={`From ${item.componentType} (${item.componentId})`}
                >
                  {item.text}
                </p>
              );
            case 'list':
              return (
                <li
                  key={key}
                  className="text-foreground ml-4 list-disc"
                  title={`From ${item.componentType} (${item.componentId})`}
                >
                  {item.text}
                </li>
              );
            case 'image':
              return (
                <div key={key} className="inline-block" title={`From ${item.componentType} (${item.componentId})`}>
                  <img
                    src={item.imageUrl || ''}
                    alt={item.alt || 'Image'}
                    className="w-40 h-24 object-cover rounded border"
                  />
                </div>
              );
            case 'text':
            default:
              return (
                <div
                  key={key}
                  className="text-foreground"
                  title={`From ${item.componentType} (${item.componentId})`}
                >
                  {item.text}
                </div>
              );
          }
        })}
      </div>

      <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
        <h4 className="font-semibold mb-2 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Content Statistics
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Items:</span>
            <span className="ml-2 font-medium">{content.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Headings:</span>
            <span className="ml-2 font-medium">{content.filter(c => c.type === 'heading').length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Paragraphs:</span>
            <span className="ml-2 font-medium">{content.filter(c => c.type === 'paragraph').length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Images:</span>
            <span className="ml-2 font-medium">{content.filter(c => c.type === 'image').length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Components:</span>
            <span className="ml-2 font-medium">{components.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [selectedComponentForAI, setSelectedComponentForAI] = useState<ComponentSchema | null>(null);
  const [showSEOForm, setShowSEOForm] = useState(false);
  const [showContents, setShowContents] = useState(false);
  // Holds AI-proposed or manually prepared output versions of components
  const [proposedComponents, setProposedComponents] = useState<ComponentSchema[] | null>(null);
  const [originalComponents, setOriginalComponents] = useState<ComponentSchema[]>([]);

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

  // Helper to merge AI proposals consistently
  const handleProposedComponentsMerge = useCallback((proposals: any[]) => {
    setProposedComponents((prev) => {
      const next = [...(prev || [])];
      proposals.forEach((p: any) => {
        if (!p) return;
        let proposal = { ...p };
        if (!proposal.key) {
          const match =
            components.find((c) => c.type === proposal.type) ||
            components.find((c) => c.name && proposal.type && c.name.toLowerCase().includes(String(proposal.type).toLowerCase())) ||
            components.find((c) => proposal.type && c.type.toLowerCase().includes(String(proposal.type).toLowerCase()));
          if (match) {
            proposal.key = match.key;
            proposal.type = match.type; // normalize to existing type
          }
        }
        if (proposal.key) {
          const idx = next.findIndex((c: any) => c && c.key === proposal.key);
          if (idx >= 0) {
            next[idx] = proposal;
          } else {
            next.push(proposal);
          }
        }
      });
      return next;
    });
  }, [components]);

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
    // Also focus the AI assistant on this component
    setSelectedComponentForAI(components[index] || null);
  }, [components]);

  const handleSEOFormOpen = useCallback(() => {
    setShowSEOForm(true);
    setSelectedComponentIndex(null);
    setShowContents(false);
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
    if (showContents) {
      // Page-level view: SEO at top, then tabs for Original vs AI Assistant
      const hasOutput = Array.isArray(proposedComponents) && proposedComponents.length > 0;

      return (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <SEOForm pageData={pageData} onFieldChange={updateField} />
          </div>

          <Tabs defaultValue={hasOutput ? "output" : "original"} className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="output">AI Assistant</TabsTrigger>
              </TabsList>
              <span className="text-xs text-muted-foreground">Original shows current content; AI Assistant is the chat</span>
            </div>

            <TabsContent value="original">
              <ContentsPanel components={components} extractContentFromComponents={extractContentFromComponents} />
            </TabsContent>

            <TabsContent value="output">
              <div className="mb-4">
                <AIAssistantChat 
                  className="h-full w-full"
                  pageContext={pageData ? {
                    slug: pageData.slug,
                    pageName: pageData.page_name,
                    tenantId: currentTenantId || undefined
                  } : null}
                  currentComponents={components}
                  onUpdateComponents={setComponents}
                  onProposedComponents={handleProposedComponentsMerge}
                  onOpenJSONEditor={openJSONEditor}
                  selectedComponentJSON={selectedComponentForAI || ({ __scope: 'page', schema: { components } } as any)}
                  onComponentSelected={() => {}}
                />
              </div>
              {hasOutput && (
                <div className="mt-4 p-3 rounded border bg-muted/30 text-xs text-muted-foreground">
                  Drafts exist for some sections. Open a section to review/apply, or keep using the AI Assistant.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      );
    }

    if (showSEOForm) {
      return <SEOForm pageData={pageData} onFieldChange={updateField} />;
    }

    if (selectedComponentIndex !== null) {
      // Build per-section data
      const selected = selectedComponent;
      const originalForSelected = originalComponents.find((c) => c.key === selected?.key) || null;
      const proposedForSelected = proposedComponents?.find((c) => c.key === selected?.key) || null;
      const hasOutput = Boolean(proposedForSelected);
      const otherDrafts = (proposedComponents || []).filter((c) => c.key !== selected?.key);

      // Helper to render contents for a given component
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
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground">No text content found in this section.</div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {items.map((item, index) => {
                  const key = `${item.componentId}-${index}`;
                  switch (item.type) {
                    case 'heading': {
                      const HeadingTag = `h${item.level || 2}` as keyof JSX.IntrinsicElements;
                      return (
                        <HeadingTag
                          key={key}
                          className={`font-bold text-foreground ${
                            item.level === 1 ? 'text-2xl mb-3' :
                            item.level === 2 ? 'text-xl mb-2' :
                            item.level === 3 ? 'text-lg mb-2' :
                            'text-base mb-2'
                          }`}
                        >
                          {item.text}
                        </HeadingTag>
                      );
                    }
                    case 'paragraph':
                      return (
                        <p key={key} className="text-foreground mb-3 leading-relaxed">
                          {item.text}
                        </p>
                      );
                    case 'list':
                      return (
                        <li key={key} className="text-foreground mb-2 ml-4 list-disc">
                          {item.text}
                        </li>
                      );
                    case 'text':
                    default:
                      return (
                        <div key={key} className="text-foreground mb-2 px-3 py-2 rounded">
                          <div className="mt-1">{item.text}</div>
                        </div>
                      );
                  }
                })}
              </div>
            )}
          </div>
        );
      };

      // Always render tabs; AI Assistant tab contains the chat
      return (
        <div className="w-full">
          <Tabs defaultValue={hasOutput ? "output" : "original"} className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="output">AI Assistant</TabsTrigger>
              </TabsList>
              <Button
                onClick={() => {
                  if (selectedComponentIndex !== null && proposedForSelected) {
                    updateComponent(selectedComponentIndex, proposedForSelected);
                    setProposedComponents((prev) =>
                      prev ? prev.filter((c) => c.key !== proposedForSelected.key) : prev
                    );
                    toast.success('Applied output to this section');
                  }
                }}
                variant="outline"
                size="sm"
                disabled={!proposedForSelected}
                title={proposedForSelected ? 'Apply output to this section' : 'No output available to apply'}
              >
                Apply Output
              </Button>
            </div>

            <TabsContent value="original" className="space-y-4">
              {/* Original editor (interactive) */}
              <ComponentEditorPanel
                component={selected}
                componentIndex={selectedComponentIndex}
                components={components}
                onUpdate={updateComponent}
              />
              {renderSectionContents(selected)}
            </TabsContent>

            <TabsContent value="output" className="space-y-4">
              {/* Chat embedded here */}
              <div className="mb-4">
                <AIAssistantChat 
                  className="h-full w-full"
                  pageContext={pageData ? {
                    slug: pageData.slug,
                    pageName: pageData.page_name,
                    tenantId: currentTenantId || undefined
                  } : null}
                  currentComponents={components}
                  onUpdateComponents={setComponents}
                  onProposedComponents={handleProposedComponentsMerge}
                  onOpenJSONEditor={openJSONEditor}
                  selectedComponentJSON={selectedComponentForAI || selected || null}
                  onComponentSelected={() => {}}
                />
              </div>
              {hasOutput ? (
                <>
                  {/* Output preview (read-only) */}
                  <ComponentEditorPanel
                    component={proposedForSelected}
                    componentIndex={selectedComponentIndex}
                    components={proposedForSelected ? proposedComponents || components : components}
                    onUpdate={() => { /* read-only */ }}
                  />
                  {renderSectionContents(proposedForSelected as ComponentSchema)}
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg border bg-muted/30 text-sm text-muted-foreground">
                    No output draft for this section yet. Use Edit mode in the AI chat while this section is focused to generate one.
                  </div>
                  {otherDrafts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Other drafted sections</h4>
                      <Accordion type="single" collapsible className="w-full">
                        {otherDrafts.map((comp) => (
                          <AccordionItem key={comp.key || comp.type} value={comp.key || comp.type}>
                            <AccordionTrigger>
                              {comp.type || comp.key || 'Section'}
                            </AccordionTrigger>
                            <AccordionContent>
                              {renderSectionContents(comp as ComponentSchema)}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
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

        {/* JSON Editor Dialog */}
        <JSONEditorDialog
          open={showJSONEditor}
          onOpenChange={closeJSONEditor}
          editorRef={setEditorRef}
          jsonError={jsonError}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default PageEditor;