import React, { Suspense, lazy, useMemo, useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Template Registry
 * 
 * Maps template names to their import paths.
 * 
 * IMPORTANT: When creating a new template, add it here for reliable loading.
 * 
 * To add a new template:
 * 1. Create folder: sparti-cms/templates/{templateName}/
 * 2. Create index.tsx with default export
 * 3. Add entry here: '{templateName}': () => import("../../sparti-cms/templates/{templateName}")
 * 
 * Templates can also be loaded dynamically if not in registry, but registry is preferred
 * for build-time optimization.
 */
const templateRegistry: Record<string, () => Promise<any>> = {
  // Known templates - add more as needed
  master: () => import("../../sparti-cms/theme/master"), // Master theme moved to theme folder
  website: () => import("../../sparti-cms/theme/storefront"), // website template uses storefront theme
  // Add more templates here:
  // 'templatename': () => import("../../sparti-cms/theme/templatename"),
};

/**
 * Dynamic Template Handler
 * 
 * Handles routes like:
 * - /theme/template/website
 * - /theme/template/master
 * - /theme/template/{any-template-name}
 * 
 * Dynamically loads templates from sparti-cms/templates/{templateName}
 */
export default function TemplateDynamic() {
  const location = useLocation();
  const { templateName } = useParams<{ templateName: string }>();
  const [TemplateComponent, setTemplateComponent] = useState<React.LazyExoticComponent<React.ComponentType<any>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract page slug from URL
  const pageSlug = useMemo(() => {
    if (!templateName) return undefined;
    
    const prefix = `/theme/template/${templateName}`;
    const rest = location.pathname.startsWith(prefix)
      ? location.pathname.slice(prefix.length)
      : "";

    const normalized = rest.replace(/^\/+/, "");
    return normalized || undefined;
  }, [location.pathname, templateName]);

  // Dynamically load template component
  useEffect(() => {
    if (!templateName) {
      setError("Template name is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Dynamic import - try to load from template registry or fallback to dynamic import
    const loadTemplate = async () => {
      try {
        let module;
        
        // First, check if template is in registry (preferred method)
        if (templateRegistry[templateName]) {
          console.log(`[testing] Loading template ${templateName} from registry`);
          module = await templateRegistry[templateName]();
        } else {
          // Fallback: try dynamic import (Vite will need to know about these at build time)
          console.log(`[testing] Template ${templateName} not in registry, trying dynamic import`);
          try {
            // Try importing from templates folder
            module = await import(`../../sparti-cms/templates/${templateName}/index.tsx`);
          } catch (firstError) {
            try {
              // Try importing folder directly
              module = await import(`../../sparti-cms/templates/${templateName}`);
            } catch (secondError) {
              throw new Error(
                `Template "${templateName}" not found in registry and dynamic import failed. ` +
                `Add it to templateRegistry in src/pages/TemplateDynamic.tsx or create it at ` +
                `sparti-cms/templates/${templateName}/index.tsx`
              );
            }
          }
        }
        
        // Check if module has default export
        if (module && module.default) {
          const LazyComponent = lazy(() => Promise.resolve(module));
          setTemplateComponent(LazyComponent);
        } else {
          throw new Error(
            `Template ${templateName} does not have a default export. ` +
            `Make sure your template exports a default component.`
          );
        }
      } catch (importError) {
        console.error(`[testing] Failed to load template ${templateName}:`, importError);
        const errorMessage = importError instanceof Error 
          ? importError.message 
          : `Failed to load template ${templateName}`;
        setError(
          `Template "${templateName}" not found.\n\n` +
          `To create this template:\n` +
          `1. Create folder: sparti-cms/templates/${templateName}/\n` +
          `2. Create file: sparti-cms/templates/${templateName}/index.tsx\n` +
          `3. Export a default component that accepts basePath and pageSlug props\n` +
          `4. Add to templateRegistry in src/pages/TemplateDynamic.tsx\n\n` +
          `Error: ${errorMessage}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateName]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !TemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Template Not Found</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{error || `Template "${templateName}" not found`}</p>
            <p className="text-sm mt-2">
              To create a new template:
            </p>
            <ol className="text-sm mt-2 list-decimal list-inside space-y-1">
              <li>Create folder: <code className="bg-muted px-1 py-0.5 rounded">sparti-cms/templates/{templateName}/</code></li>
              <li>Add <code className="bg-muted px-1 py-0.5 rounded">index.tsx</code> with default export</li>
              <li>Template should accept <code className="bg-muted px-1 py-0.5 rounded">basePath</code> and <code className="bg-muted px-1 py-0.5 rounded">pageSlug</code> props</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render template
  const basePath = `/theme/template/${templateName}`;
  
  // Special handling for website template (uses StorefrontTheme which has different props)
  if (templateName === 'website') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading template...</p>
            </div>
          </div>
        }
      >
        <TemplateComponent
          tenantName="Website Template"
          tenantSlug="template/website"
          pageSlug={pageSlug}
        />
      </Suspense>
    );
  }
  
  // Standard template rendering (accepts basePath and pageSlug)
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading template...</p>
          </div>
        </div>
      }
    >
      <TemplateComponent basePath={basePath} pageSlug={pageSlug} />
    </Suspense>
  );
}
