"use client";

import React from "react";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import { SpartiBuilderProvider, useSpartiBuilder } from "../../../sparti-cms/components/SpartiBuilderProvider";
import { ElementSelector } from "../../../sparti-cms/components/ElementSelector";
import { EditingOverlay } from "../../../sparti-cms/components/EditingOverlay";
import { ContentEditPanel } from "../../../sparti-cms/components/ContentEditPanel";
import SectionList from "./SectionList";
import GenericSectionPreview from "./GenericSectionPreview";
import { ResizableDivider, useResizableDivider } from "./ResizableDivider";
import "../../../sparti-cms/components/sparti-builder.css";

interface ClassicRendererProps {
  components: ComponentSchema[];
  pageContext?: {
    pageId?: string;
    slug?: string;
    pageName?: string;
    tenantId?: string;
    themeId?: string;
  };
}

const ClassicVisualContent: React.FC<{ components: ComponentSchema[] }> = ({ components }) => {
  const { components: ctxComponents } = useSpartiBuilder();
  // Use context components if available (for real-time updates), otherwise fall back to prop
  const list = Array.isArray(ctxComponents) && ctxComponents.length > 0 ? ctxComponents : components;
  
  return (
    <ElementSelector>
      <main className="w-full p-6">
        {Array.isArray(list) && list.length > 0 ? (
          list.map((comp, idx) => (
            <GenericSectionPreview key={`classic-${idx}`} index={idx} schema={comp} />
          ))
        ) : (
          <div className="text-sm text-gray-500">No components to render</div>
        )}
      </main>
    </ElementSelector>
  );
};

const ClassicLayout: React.FC<{ components: ComponentSchema[] }> = ({ components }) => {
  const { selectedElement } = useSpartiBuilder();
  const { width, setWidth } = useResizableDivider(420, 300, 800, 'classic-editor-sidebar-width');
  
  return (
    <div className="flex w-full h-full">
      {/* Left: Sections list */}
      <SectionList />
      {/* Middle: Preview */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="w-full h-full">
          <ClassicVisualContent components={components} />
          <EditingOverlay />
        </div>
      </div>
      {/* Right: Editor sidebar */}
      {selectedElement ? (
        <>
          <ResizableDivider
            width={width}
            onWidthChange={setWidth}
            minWidth={300}
            maxWidth={800}
          />
          <div
            className="sticky top-0 h-screen border-l bg-background overflow-y-auto sparti-editor-sticky"
            style={{
              width: `${width}px`,
              minWidth: `${width}px`,
              maxWidth: `${width}px`,
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            <ContentEditPanel />
          </div>
        </>
      ) : null}
    </div>
  );
};

const ClassicRenderer: React.FC<ClassicRendererProps> = ({ components, pageContext }) => {
  return (
    <SpartiBuilderProvider
      components={components}
      pageId={pageContext?.pageId}
      slug={pageContext?.slug}
      tenantId={pageContext?.tenantId}
      themeId={pageContext?.themeId}
    >
      <ClassicLayout components={components} />
    </SpartiBuilderProvider>
  );
};

export default ClassicRenderer;