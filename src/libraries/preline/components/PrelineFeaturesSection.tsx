"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface PrelineFeaturesSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Preline Features Section Component
 * 
 * Features grid with icons, titles, and descriptions
 * Uses Preline/Tailwind CSS styling
 */
const PrelineFeaturesSection: React.FC<PrelineFeaturesSectionProps> = ({
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
    <section className={`bg-white py-24 sm:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(title || description) && (
          <div className="mx-auto max-w-2xl lg:text-center">
            {title && (
              <h2 className="text-base font-semibold leading-7 text-blue-600">{title}</h2>
            )}
            {description && (
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature: any, index: number) => (
              <div key={index} className="relative pl-16">
                {feature.icon && (
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    {feature.title}
                  </dt>
                )}
                {!feature.icon && feature.title && (
                  <dt className="text-base font-semibold leading-7 text-gray-900">{feature.title}</dt>
                )}
                {feature.description && (
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default PrelineFeaturesSection;
