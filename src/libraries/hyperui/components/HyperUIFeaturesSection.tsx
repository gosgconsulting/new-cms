"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface HyperUIFeaturesSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * HyperUI Features Section Component
 * 
 * Features grid with icons, titles, and descriptions
 * Uses HyperUI/Tailwind CSS v4 styling
 */
const HyperUIFeaturesSection: React.FC<HyperUIFeaturesSectionProps> = ({
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

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const title = getText("title") || getText("heading");
  const description = getText("description") || getText("subtitle");
  const features = getArray("features") || getArray("items");

  return (
    <section className={`bg-white py-16 ${className}`}>
      <div className="max-w-screen-xl px-4 mx-auto">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="mb-4 text-4xl font-extrabold tracking-tight leading-tight text-gray-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="mb-8 text-lg font-light text-gray-500 sm:text-xl">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature: any, index: number) => (
            <div key={index} className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
              {feature.icon && (
                <div className="mb-4 text-4xl">{feature.icon}</div>
              )}
              {feature.title && (
                <h3 className="mb-2 text-xl font-bold leading-tight text-gray-900">
                  {feature.title}
                </h3>
              )}
              {feature.description && (
                <p className="text-gray-500">{feature.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HyperUIFeaturesSection;
