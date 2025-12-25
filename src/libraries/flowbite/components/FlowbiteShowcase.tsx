"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteShowcaseProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Showcase Component
 * 
 * Displays a grid of category/showcase items with images, headings, and buttons
 * Following Diora pattern for data extraction
 */
const FlowbiteShowcase: React.FC<FlowbiteShowcaseProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions following Diora pattern
  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const getHeading = (itemsArray: SchemaItem[], key: string, level?: number) => {
    const item = itemsArray.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading" &&
      (level === undefined || (i as any).level === level)
    ) as any;
    return item?.content || "";
  };

  const getButton = (itemsArray: SchemaItem[], key: string) => {
    const item = itemsArray.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
      icon: item?.icon
    };
  };

  const findImageItem = (itemsArray: any[]) => {
    return itemsArray.find(
      (i) => i?.type === "image" && typeof i?.src === "string"
    ) || null;
  };

  // Get showcase items from items array (Moski format: items array with key "items")
  // Moski format: items array contains objects with src, link, content/title, type: "image"
  let showcaseItems = getArray("items") || getArray("showcase") || props.items || props.showcase || [];
  
  // If showcaseItems is empty, try to extract from direct items (Moski format)
  if (showcaseItems.length === 0 && items.length > 0) {
    // Look for items that are images with links (Moski format)
    const imageItems = items.filter((i: any) => 
      i.type === "image" && (i.src || i.link)
    );
    if (imageItems.length > 0) {
      showcaseItems = imageItems.map((item: any) => ({
        src: item.src,
        link: item.link || item.url || "#",
        content: item.content || item.title || "",
        title: item.title || item.content || ""
      }));
    }
  }

  // Get title if exists
  const title = getHeading(items, "title") || props.title || "";

  if (showcaseItems.length === 0) {
    return (
      <FlowbiteSection title={title || undefined} className={className}>
        <div className="text-center py-12">
          <p className="text-gray-500">No showcase items to display.</p>
        </div>
      </FlowbiteSection>
    );
  }

  return (
    <FlowbiteSection title={title || undefined} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showcaseItems.map((item: any, index: number) => {
          // Extract data from item (Moski format: image with src, link, content/title)
          const imageSrc = item.src || item.image || item.imageSrc || "";
          const itemLink = item.link || item.url || "#";
          const itemTitle = item.content || item.title || item.name || "";
          const itemDescription = item.description || item.text || "";

          return (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              href={itemLink}
            >
              {imageSrc && (
                <div className="relative overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={itemTitle || `Showcase ${index + 1}`}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                {itemTitle && (
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {itemTitle}
                  </h3>
                )}
                {itemDescription && (
                  <p className="text-gray-600 text-sm mb-3">{itemDescription}</p>
                )}
                <div className="flex items-center text-primary font-medium group-hover:underline">
                  View more
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </FlowbiteSection>
  );
};

export default FlowbiteShowcase;

