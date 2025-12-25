"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button, TextInput } from "flowbite-react";
import { Search } from "lucide-react";

interface FlowbiteBlogHeroProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Blog Hero Component
 * 
 * Hero section for blog page with title, subtitle, and search functionality
 * Following Diora pattern for data extraction
 */
const FlowbiteBlogHero: React.FC<FlowbiteBlogHeroProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions following Diora pattern
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

  // Extract component data
  const title = getHeading("title") || props.title || "SEO Insights & Expert Tips";
  const subtitle = getText("subtitle") || props.subtitle || "Stay ahead of the curve with our latest SEO strategies, industry insights, and actionable tips to grow your online presence.";
  const searchPlaceholder = getText("searchPlaceholder") || props.searchPlaceholder || "Search articles...";
  const showSearch = props.showSearch !== false; // Default to true

  return (
    <section className={`pt-32 md:pt-24 pb-12 px-4 bg-gradient-to-br from-primary/5 to-secondary/5 ${className}`}>
      <div className="container mx-auto text-center">
        <FlowbiteSection 
          title={title}
          subtitle={subtitle}
          className="mb-8"
        >
          {showSearch && (
            <div className="max-w-2xl mx-auto relative mt-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <TextInput
                  type="text"
                  placeholder={searchPlaceholder}
                  className="pl-12 pr-4 py-6 text-lg rounded-full"
                  id="blog-search"
                />
              </div>
            </div>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteBlogHero;

