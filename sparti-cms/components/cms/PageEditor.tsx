import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../src/components/ui/button';
import { ScrollArea } from '../../../src/components/ui/scroll-area';
import { Separator } from '../../../src/components/ui/separator';
import { Badge } from '../../../src/components/ui/badge';
import { ArrowLeft, Save, Loader2, Settings, Code, FileText } from 'lucide-react';
import { FileCode } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
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
import SectionContentList from '@/components/SectionContentList';
import CodeViewerDialog from './PageEditor/CodeViewerDialog';

// REMOVED: Inline ContentsPanel and VisualEditorRenderer usage

// Visual Editor Panel Component - Shows full page preview
// interface ContentsPanelProps {
//   components: ComponentSchema[];
//   extractContentFromComponents: (components: ComponentSchema[]) => ContentItem[];
//   registry?: Record<string, React.ComponentType<any>>; // NEW
// }

// const ContentsPanel: React.FC<ContentsPanelProps> = ({ components, registry }) => {
//   if (!components || components.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//         <h3 className="text-lg font-semibold mb-2">No Components Found</h3>
//         <p className="text-muted-foreground">
//           Add components to see the visual preview here.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="border-b pb-4">
//         <h2 className="text-2xl font-bold flex items-center">
//           <FileText className="h-6 w-6 mr-2" />
//           Visual Editor
//         </h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           Full page preview using actual component implementations from the theme registry.
//         </p>
//       </div>

//       {/* Full visual editor with all components */}
//       <div className="w-full">
//         <VisualEditorRenderer components={components} registry={registry} />
//       </div>
//     </div>
//   );
// };

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
  const [assistantClosed, setAssistantClosed] = useState(false); // NEW: track assistant visibility
  const [isSavingRef, setIsSavingRef] = useState(false); // Prevent useEffect from overwriting during save

  // JSON Editor hook - use a wrapper to prevent updates during save
  const handleComponentsChange = useCallback((newComponents: ComponentSchema[]) => {
    if (!isSavingRef) {
      setComponents(newComponents);
    } else {
      console.log('[testing] Blocked components update during save');
    }
  }, [isSavingRef]);

  const {
    showEditor: showJSONEditor,
    jsonString,
    jsonError,
    setEditorRef,
    openEditor: openJSONEditor,
    closeEditor: closeJSONEditor,
  } = useJSONEditor({
    components,
    onComponentsChange: handleComponentsChange,
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
    // Don't fetch if we're currently saving to avoid overwriting saved state
    if (isSavingRef) {
      console.log('[testing] Skipping fetchPageData - save in progress');
      return;
    }

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
        // NOTE: This only transforms data in memory for display - does NOT modify database
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
            
            // Remove duplicates based on component key to prevent duplicate sections
            const uniqueComponents = layoutComponents.filter((component, index, self) => {
              // If component has a key, use it for deduplication
              if (component.key) {
                return index === self.findIndex(c => c.key === component.key);
              }
              // If no key, use type + index as fallback
              return index === self.findIndex((c, i) => 
                c.type === component.type && 
                (c.key || `component-${i}`) === (component.key || `component-${index}`)
              );
            });
            
            // Only update if not currently saving
            if (!isSavingRef) {
              setComponents(uniqueComponents);
              // store snapshot to detect unsaved/manual changes
              setOriginalComponents(JSON.parse(JSON.stringify(uniqueComponents)));
            } else {
              console.log('[testing] Blocked components update from fetchPageData - save in progress');
            }
          } else {
            if (!isSavingRef) {
              setComponents([]);
              setOriginalComponents([]);
            }
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
  }, [pageId, currentTenantId, currentThemeId, isSavingRef]);

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

  // Handle save with optional version saving
  const handleSave = useCallback(async (saveVersion = false, comment: string | null = null) => {
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

      // Include themeId when available and not 'custom' to ensure correct page is updated
      const layoutRequestBody: any = {
        layout_json: { components },
        tenantId: currentTenantId
      };
      if (currentThemeId && currentThemeId !== 'custom') {
        layoutRequestBody.themeId = currentThemeId;
      }

      const layoutResponse = await api.put(`/api/pages/${pageId}/layout`, layoutRequestBody);

      if (!layoutResponse.ok) {
        throw new Error('Failed to update page layout');
      }

      // Save version if requested
      if (saveVersion) {
        try {
          const versionResponse = await api.post(`/api/pages/${pageId}/versions`, {
            pageData: {
              page_name: pageData.page_name || '',
              slug: pageData.slug || '',
              meta_title: pageData.meta_title || '',
              meta_description: pageData.meta_description || '',
              seo_index: pageData.seo_index || false,
              status: pageData.status || 'draft',
              page_type: pageData.page_type || 'page',
              campaign_source: pageData.campaign_source || null,
              conversion_goal: pageData.conversion_goal || null,
              legal_type: pageData.legal_type || null,
              last_reviewed_date: pageData.last_reviewed_date || null,
            },
            layoutJson: { components },
            comment: comment,
            tenantId: currentTenantId
          });

          if (versionResponse.ok) {
            console.log('[testing] Page version saved successfully');
          }
        } catch (versionError) {
          console.error('[testing] Error saving page version (non-blocking):', versionError);
          // Don't throw - version saving is optional
        }
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
  }, [pageData, pageId, currentTenantId, currentThemeId, components]);

  // Handle save from JSON Editor - ensures JSON is parsed and saved correctly
  const handleJSONEditorSave = useCallback(async () => {
    console.log('[testing] ========== JSON Editor Save Started ==========');
    console.log('[testing] Pre-save check:', {
      hasPageData: !!pageData,
      hasJsonError: !!jsonError,
      jsonErrorValue: jsonError,
      pageId: pageId,
      pageIdType: typeof pageId,
      currentTenantId: currentTenantId,
      currentThemeId: currentThemeId,
      jsonStringLength: jsonString?.length || 0
    });

    if (!pageData) {
      console.error('[testing] Save aborted: pageData is missing');
      toast.error('Page data is missing. Cannot save.');
      return;
    }

    if (jsonError) {
      console.error('[testing] Save aborted: JSON has errors:', jsonError);
      toast.error('Please fix JSON errors before saving.');
      return;
    }

    try {
      setSaving(true);
      setIsSavingRef(true); // Block useEffect and component updates during save
      
      // Log JSON string before parsing
      console.log('[testing] Step 1: JSON String (first 500 chars):', jsonString.substring(0, 500));
      console.log('[testing] Step 1: JSON String length:', jsonString.length);
      
      // Parse the current JSON string to ensure we have the latest changes
      let componentsToSave: ComponentSchema[];
      try {
        const parsed = JSON.parse(jsonString);
        console.log('[testing] Step 2: JSON parsed successfully');
        console.log('[testing] Step 2: Parsed type:', Array.isArray(parsed) ? 'array' : typeof parsed);
        console.log('[testing] Step 2: Parsed keys:', Object.keys(parsed));
        
        // Handle both array and object with components property
        if (Array.isArray(parsed)) {
          componentsToSave = parsed;
          console.log('[testing] Step 2: Using array format, components count:', componentsToSave.length);
        } else if (parsed.components && Array.isArray(parsed.components)) {
          componentsToSave = parsed.components;
          console.log('[testing] Step 2: Using object.components format, components count:', componentsToSave.length);
        } else {
          throw new Error('JSON must be an array of components or an object with a components array');
        }
        
        console.log('[testing] Step 2: Components to save (first component):', componentsToSave[0] ? {
          type: componentsToSave[0].type,
          key: componentsToSave[0].key,
          propsKeys: Object.keys(componentsToSave[0].props || {})
        } : 'empty');
      } catch (parseError: any) {
        console.error('[testing] Step 2: Error parsing JSON:', {
          error: parseError.message,
          stack: parseError.stack,
          jsonPreview: jsonString.substring(0, 200)
        });
        setIsSavingRef(false); // Reset flag on error
        toast.error('Invalid JSON format. Please fix errors before saving.');
        return;
      }

      console.log('[testing] Step 3: Preparing save request:', {
        pageId: pageId,
        pageIdType: typeof pageId,
        tenantId: currentTenantId,
        themeId: currentThemeId,
        componentsCount: componentsToSave.length,
        layoutJsonStructure: { components: componentsToSave }
      });

      // Don't update components state here - wait until after successful save and reload

      // Include themeId when available and not 'custom' to ensure correct page is updated
      const layoutRequestBody: any = {
        layout_json: { components: componentsToSave },
        tenantId: currentTenantId
      };
      if (currentThemeId && currentThemeId !== 'custom') {
        layoutRequestBody.themeId = currentThemeId;
      }

      console.log('[testing] Step 4: Request body:', {
        ...layoutRequestBody,
        layout_json: { 
          ...layoutRequestBody.layout_json, 
          components: `[${componentsToSave.length} components]` 
        }
      });
      console.log('[testing] Step 4: API endpoint:', `/api/pages/${pageId}/layout`);

      const layoutResponse = await api.put(`/api/pages/${pageId}/layout`, layoutRequestBody);

      console.log('[testing] Step 5: API Response:', {
        status: layoutResponse.status,
        statusText: layoutResponse.statusText,
        ok: layoutResponse.ok,
        headers: Object.fromEntries(layoutResponse.headers.entries())
      });

      if (!layoutResponse.ok) {
        const errorText = await layoutResponse.text();
        console.error('[testing] Step 5: API Error Response:', {
          status: layoutResponse.status,
          statusText: layoutResponse.statusText,
          errorText: errorText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to save layout' };
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to update page layout');
      }

      const responseData = await layoutResponse.json();
      console.log('[testing] Step 5: API Success Response:', responseData);

      // Wait a bit for database to commit
      console.log('[testing] Step 6: Waiting 500ms for database commit...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reload page data to ensure UI reflects saved state
      const apiUrl = currentThemeId && currentThemeId !== 'custom' 
        ? `/api/pages/${pageId}?tenantId=${currentTenantId}&themeId=${currentThemeId}&_t=${Date.now()}`
        : `/api/pages/${pageId}?tenantId=${currentTenantId}&_t=${Date.now()}`;
      
      console.log('[testing] Step 7: Reloading page data from:', apiUrl);
      const reloadResponse = await api.get(apiUrl);
      const reloadData = await reloadResponse.json();
      
      console.log('[testing] Step 7: Reload response:', {
        success: reloadData.success,
        hasPage: !!reloadData.page,
        hasLayout: !!reloadData.page?.layout,
        hasComponents: !!reloadData.page?.layout?.components,
        componentsCount: reloadData.page?.layout?.components?.length || 0
      });
      
      if (reloadData.success && reloadData.page?.layout?.components) {
        const reloadedComponents = reloadData.page.layout.components;
        console.log('[testing] Step 7: Reloaded components count:', reloadedComponents.length);
        console.log('[testing] Step 7: Comparing saved vs reloaded:', {
          savedCount: componentsToSave.length,
          reloadedCount: reloadedComponents.length,
          match: componentsToSave.length === reloadedComponents.length
        });
        
        // Now update components with reloaded data
        setComponents(reloadedComponents);
        setOriginalComponents(JSON.parse(JSON.stringify(reloadedComponents)));
        setPageData(reloadData.page); // Update pageData to reflect saved state
      } else {
        console.warn('[testing] Step 7: Reload did not return expected data structure');
        // Fallback: use the saved components if reload fails
        setComponents(componentsToSave);
        setOriginalComponents(JSON.parse(JSON.stringify(componentsToSave)));
      }

      // Reset save flag after updating state
      setIsSavingRef(false);

      console.log('[testing] ========== JSON Editor Save Completed Successfully ==========');
      toast.success('JSON schema saved successfully');
    } catch (error: any) {
      console.error('[testing] ========== JSON Editor Save Failed ==========');
      console.error('[testing] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        code: error?.code
      });
      setIsSavingRef(false); // Reset flag on error
      toast.error(error?.message || 'Failed to save JSON schema');
    } finally {
      setSaving(false);
      // Ensure flag is reset even if something goes wrong
      if (isSavingRef) {
        console.warn('[testing] Resetting isSavingRef flag in finally block');
        setIsSavingRef(false);
      }
      console.log('[testing] ========== JSON Editor Save Handler Finished ==========');
    }
  }, [pageData, pageId, currentTenantId, currentThemeId, jsonString, jsonError, isSavingRef]);

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

          {/* REMOVED: Inline full-page Visual Editor; use the dedicated Visual Editor instead */}
        </div>
      );
    }

    if (showSEOForm) {
      return <SEOForm pageData={pageData} onFieldChange={updateField} />;
    }

    if (selectedComponentIndex !== null) {
      // Per-section view without tabs: show editor, then a single preview
      const selected = selectedComponent;

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

      // Note: AI Output section removed - outputs are now auto-applied and saved

      return (
        <div className="w-full">
          {/* Interactive editor for the selected component */}
          <ComponentEditorPanel
            component={selected}
            componentIndex={selectedComponentIndex}
            components={components}
            onUpdate={updateComponent}
          />

          {/* REMOVED: Inline per-section Visual Editor; use the dedicated Visual Editor instead */}

          {/* Single preview: always show the current component content */}
          {renderSectionContents(selected)}
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
        {/* Reopen button when assistant is closed */}
        {assistantClosed && (
          <button
            onClick={() => setAssistantClosed(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground shadow-lg px-3 py-2 rounded-l-full flex items-center gap-2 hover:opacity-90"
            aria-label="Open AI Assistant"
            title="Open AI Assistant"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>
        )}
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
        {!assistantClosed && (
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
              onProposedComponents={async (proposals) => {
                // Auto-apply proposals into components by key or by best-effort type match.
                let updatedComponents: ComponentSchema[] = [];
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
                  updatedComponents = next;
                  return next
                })
                
                // Clear proposed components since we're auto-applying
                setProposedComponents(null);
                
                // Auto-save the version and update layout
                if (pageData && updatedComponents.length > 0) {
                  try {
                    // Update layout in database
                    const autoSaveLayoutBody: any = {
                      layout_json: { components: updatedComponents },
                      tenantId: currentTenantId
                    };
                    if (currentThemeId && currentThemeId !== 'custom') {
                      autoSaveLayoutBody.themeId = currentThemeId;
                    }
                    const layoutResponse = await api.put(`/api/pages/${pageId}/layout`, autoSaveLayoutBody);

                    if (layoutResponse.ok) {
                      // Save as version
                      try {
                        await api.post(`/api/pages/${pageId}/versions`, {
                          pageData: {
                            page_name: pageData.page_name || '',
                            slug: pageData.slug || '',
                            meta_title: pageData.meta_title || '',
                            meta_description: pageData.meta_description || '',
                            seo_index: pageData.seo_index || false,
                            status: pageData.status || 'draft',
                            page_type: pageData.page_type || 'page',
                            campaign_source: pageData.campaign_source || null,
                            conversion_goal: pageData.conversion_goal || null,
                            legal_type: pageData.legal_type || null,
                            last_reviewed_date: pageData.last_reviewed_date || null,
                          },
                          layoutJson: { components: updatedComponents },
                          comment: 'Auto-saved from AI assistant output',
                          tenantId: currentTenantId
                        });
                        console.log('[testing] AI output auto-applied and saved as version');
                        toast.success('AI output applied and saved');
                      } catch (versionError) {
                        console.error('[testing] Error saving version (non-blocking):', versionError);
                        toast.success('AI output applied');
                      }
                    }
                  } catch (error) {
                    console.error('[testing] Error auto-saving AI output:', error);
                    toast.success('AI output applied (save failed)');
                  }
                }
              }}
              onOpenJSONEditor={openJSONEditor}
              selectedComponentJSON={selectedComponentForAI || ({ __scope: 'page', schema: { components } } as any)}
              onComponentSelected={() => {}}
              onClosedChange={(closed) => setAssistantClosed(closed)} // NEW: collapse to 2 columns
            />
          </div>
        )}
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
        onSave={handleJSONEditorSave}
      />
    </div>
  );
};

export default PageEditor;