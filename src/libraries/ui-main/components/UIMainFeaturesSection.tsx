"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface UIMainFeaturesSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * UI Main Features Section Component
 * 
 * Features grid with icons, titles, and descriptions
 * Uses shadcn/ui and Tailwind CSS styling
 */
const UIMainFeaturesSection: React.FC<UIMainFeaturesSectionProps> = ({
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
    <section className={`w-full py-12 md:py-24 lg:py-32 ${className}`}>
      <div className="container px-4 md:px-6">
        {(title || description) && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {title && (
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{title}</h2>
              </div>
            )}
            {description && (
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          {features.map((feature: any, index: number) => (
            <div key={index} className="flex flex-col items-center space-y-4 text-center">
              {feature.icon && (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <div className="text-2xl">{feature.icon}</div>
                </div>
              )}
              {feature.title && (
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>
              )}
              {feature.description && (
                <p className="text-muted-foreground md:text-xl/relaxed">{feature.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UIMainFeaturesSection;
