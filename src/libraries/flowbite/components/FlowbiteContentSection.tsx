"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button } from "flowbite-react";

interface FlowbiteContentSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Content Section Component
 * 
 * Displays content section with background image, title, paragraphs, and button
 * Following Diora pattern for data extraction
 */
const FlowbiteContentSection: React.FC<FlowbiteContentSectionProps> = ({
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

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
      icon: item?.icon
    };
  };

  const findImageItem = (key: string) => {
    return items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i?.type === "image" && typeof i?.src === "string"
    ) as any || null;
  };

  // Extract data
  const backgroundImage = findImageItem("backgroundImage") || findImageItem("image");
  const title = getHeading("title") || props.title || "";
  const content = getArray("content") || props.content || [];
  const button = getButton("button");

  return (
    <section 
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={backgroundImage?.src ? {
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      <div className={`relative z-10 p-8 md:p-12 ${backgroundImage?.src ? 'bg-black/50' : 'bg-gray-50'}`}>
        <FlowbiteSection 
          title={title || undefined}
          className={backgroundImage?.src ? 'text-white' : ''}
        >
          {content.length > 0 && (
            <div className="space-y-4 mt-6">
              {content.map((item: any, index: number) => {
                const text = typeof item === "string" 
                  ? item 
                  : (item.content || item.text || "");
                if (!text) return null;
                
                return (
                  <p 
                    key={index} 
                    className={`text-base leading-relaxed ${
                      backgroundImage?.src ? 'text-white/90' : 'text-gray-700'
                    }`}
                  >
                    {text}
                  </p>
                );
              })}
            </div>
          )}
          
          {button.content && (
            <div className="mt-6">
              <Button
                href={button.link}
                color="primary"
                className="px-6 py-3"
              >
                {button.content}
              </Button>
            </div>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteContentSection;

