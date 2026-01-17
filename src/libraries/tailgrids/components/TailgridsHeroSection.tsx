"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface TailgridsHeroSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Tailgrids Hero Section Component
 * 
 * Hero section with title, description, CTA, and image
 * Uses Tailgrids/Tailwind CSS styling
 */
const TailgridsHeroSection: React.FC<TailgridsHeroSectionProps> = ({
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
    <section className={`relative overflow-hidden bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          {title && (
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {description}
            </p>
          )}
          {cta.content && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href={cta.link}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {cta.content}
              </a>
            </div>
          )}
          {image && (
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <img
                  src={image}
                  alt={title || "Hero image"}
                  className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TailgridsHeroSection;
