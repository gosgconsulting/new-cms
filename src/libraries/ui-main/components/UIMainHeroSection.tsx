"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface UIMainHeroSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * UI Main Hero Section Component
 * 
 * Hero section with title, description, CTA, and image
 * Uses shadcn/ui and Tailwind CSS styling
 */
const UIMainHeroSection: React.FC<UIMainHeroSectionProps> = ({
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
    return item?.content || props[key] || "";
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
    return item?.src || props[key] || "";
  };

  // Extract data
  const title = getText("title") || getText("heading");
  const description = getText("description") || getText("subtitle");
  const cta = getButton("cta");
  const image = getImage("image");

  return (
    <section className={`w-full py-12 md:py-24 lg:py-32 ${className}`}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            {title && (
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                {title}
              </h1>
            )}
            {description && (
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {cta.content && (
            <div className="space-x-4">
              <a
                href={cta.link}
                className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
              >
                {cta.content}
              </a>
            </div>
          )}
          {image && (
            <div className="mx-auto aspect-video overflow-hidden rounded-xl border bg-gray-100 dark:bg-gray-800 sm:w-full lg:order-last lg:aspect-square">
              <img
                src={image}
                alt={title || "Hero image"}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UIMainHeroSection;
