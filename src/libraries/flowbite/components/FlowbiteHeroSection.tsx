"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import { Button } from "flowbite-react";

interface FlowbiteHeroSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Hero Section Component
 * 
 * Hero section with title, description, CTA, and image
 * Following Diora pattern for data extraction
 */
const FlowbiteHeroSection: React.FC<FlowbiteHeroSectionProps> = ({
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

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const getImage = (key: string = "image") => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || "";
  };

  // Extract data
  const motto = getText("motto") || props.motto || "";
  const title = getText("title") || props.title || "";
  const description = getText("description") || props.description || "";
  const cta = getButton("cta");
  const image = getImage("image") || props.image || "";

  return (
    <section className={`relative bg-gradient-to-br from-gray-50 to-white py-20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            {motto && (
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {motto}
              </p>
            )}
            {title && (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {description}
              </p>
            )}
            {cta.content && (
              <div className="pt-4">
                <Button
                  href={cta.link}
                  size="xl"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {cta.content}
                </Button>
              </div>
            )}
          </div>

          {/* Image */}
          {image && (
            <div className="relative">
              <img
                src={image}
                alt={title || "Hero image"}
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteHeroSection;

