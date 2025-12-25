"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button } from "flowbite-react";

interface FlowbiteCTASectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite CTA Section Component
 * 
 * Call-to-action section with title, description, and button
 * Following Diora pattern for data extraction
 */
const FlowbiteCTASection: React.FC<FlowbiteCTASectionProps> = ({
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

  const getButton = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  // Extract data
  const title = getHeading("title") || props.title || "";
  const description = getText("description") || props.description || "";
  const cta = getButton("cta");

  return (
    <section className={`py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800 ${className}`}>
      <div className="container mx-auto max-w-4xl">
        <FlowbiteSection className="text-center text-white">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          )}
          {cta.content && (
            <Button
              href={cta.link}
              size="xl"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              {cta.content}
            </Button>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteCTASection;

