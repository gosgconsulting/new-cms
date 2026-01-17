"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface PrelineHeroSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Preline Hero Section Component
 * 
 * Hero section with title, description, CTA, and image
 * Uses Preline/Tailwind CSS styling
 */
const PrelineHeroSection: React.FC<PrelineHeroSectionProps> = ({
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
    <section className={`relative overflow-hidden ${className}`}>
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-24">
        <div className="text-center">
          {title && (
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-800">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-3 text-gray-600">
              {description}
            </p>
          )}
          {cta.content && (
            <div className="mt-7 sm:mt-12 mx-auto sm:flex sm:justify-center gap-x-6">
              <a
                className="inline-flex justify-center items-center gap-x-3 text-center bg-blue-600 hover:bg-blue-700 border border-transparent text-sm lg:text-base font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition py-3 px-4 text-white"
                href={cta.link}
              >
                {cta.content}
              </a>
            </div>
          )}
          {image && (
            <div className="mt-10 sm:mt-20">
              <img
                className="w-full max-w-4xl mx-auto"
                src={image}
                alt={title || "Hero image"}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PrelineHeroSection;
