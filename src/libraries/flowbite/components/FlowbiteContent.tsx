"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";

interface FlowbiteContentProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Content Component
 * 
 * Displays rich text content from items
 * Following Diora pattern for data extraction
 */
const FlowbiteContent: React.FC<FlowbiteContentProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions
  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && 
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getHeading = (key: string, level?: number) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading" &&
      (level === undefined || (i as any).level === level)
    ) as any;
    return item?.content || "";
  };

  // Extract content - try multiple sources
  const content = props.content || getText("content") || getText("text") || getText("body") || "";
  const title = getHeading("title") || props.title || "";

  // If no content, try to render all text items
  let finalContent = content;
  if (!finalContent && items.length > 0) {
    const textItems = items
      .filter((i: any) => i.type === "text" || i.type === "paragraph" || (typeof i.content === "string" && i.content))
      .map((i: any) => i.content)
      .filter(Boolean)
      .join("\n\n");
    finalContent = textItems;
  }

  if (!finalContent && !title) {
    return null;
  }

  return (
    <section className={`py-12 px-4 ${className}`}>
      <div className="container mx-auto max-w-4xl">
        <FlowbiteSection 
          title={title || undefined}
          className="prose prose-lg max-w-none"
        >
          {finalContent && (
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: finalContent }}
            />
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteContent;

