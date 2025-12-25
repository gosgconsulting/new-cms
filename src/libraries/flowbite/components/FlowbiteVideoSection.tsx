"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";

interface FlowbiteVideoSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Video Section Component
 * 
 * Displays video embed with title and description
 * Following Diora pattern for data extraction
 */
const FlowbiteVideoSection: React.FC<FlowbiteVideoSectionProps> = ({
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

  const getEmbed = (key: string = "video") => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "embed"
    ) as any;
    return item?.embedUrl || item?.url || "";
  };

  // Extract data
  const title = getHeading("title") || props.title || "";
  const description = getText("description") || props.description || "";
  const videoUrl = getEmbed("video") || props.videoUrl || "";

  return (
    <section className={`py-20 px-4 bg-white ${className}`}>
      <div className="container mx-auto max-w-4xl">
        <FlowbiteSection 
          title={title}
          className="text-center mb-12"
        >
          {description && (
            <p className="text-lg text-gray-600 mb-8">{description}</p>
          )}
          
          {videoUrl && (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={videoUrl}
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title || "Video"}
              />
            </div>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteVideoSection;

