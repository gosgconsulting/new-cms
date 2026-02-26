"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";

interface FlowbiteSocialMediaProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Social Media Component
 * 
 * Displays social media section (e.g., Instagram feed)
 * Following Diora pattern for data extraction
 */
const FlowbiteSocialMedia: React.FC<FlowbiteSocialMediaProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions following Diora pattern
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
  const title = getHeading("title") || props.title || "";
  const subtitle = getHeading("subtitle", 3) || getText("subtitle") || props.subtitle || "";
  const instagramHandle = props.instagramHandle || props.handle || "";
  const sectionLabel = title || (component as any).name || "Instagram";

  return (
    <FlowbiteSection 
      title={title || undefined}
      subtitle={subtitle || undefined}
      className={className}
    >
      <div className="text-center py-12">
        {instagramHandle ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Follow us on Instagram: <a href={`https://instagram.com/${instagramHandle}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">@{instagramHandle}</a>
            </p>
            {/* Instagram feed would be embedded here via Instagram API or embed */}
            <div className="mt-8 p-8 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Instagram feed will be embedded here</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">{sectionLabel} placeholder</p>
        )}
      </div>
    </FlowbiteSection>
  );
};

export default FlowbiteSocialMedia;

