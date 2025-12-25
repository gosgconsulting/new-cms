"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";

interface FlowbitePageTitleProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Page Title Component
 * 
 * Simple page title section with heading
 * Following Diora pattern for data extraction
 */
const FlowbitePageTitle: React.FC<FlowbitePageTitleProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions
  const getHeading = (key: string, level?: number) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading" &&
      (level === undefined || (i as any).level === level)
    ) as any;
    return item?.content || "";
  };

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && 
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  // Extract data
  const title = getHeading("title") || getHeading("heading") || props.title || props.heading || "";
  const subtitle = getHeading("subtitle", 3) || getText("subtitle") || props.subtitle || "";

  if (!title) {
    return null;
  }

  return (
    <section className={`py-12 px-4 ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection 
          title={title}
          subtitle={subtitle || undefined}
          className="text-center"
        />
      </div>
    </section>
  );
};

export default FlowbitePageTitle;

