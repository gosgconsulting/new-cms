"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteWhatIsSEOSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite What is SEO Section Component
 * 
 * Displays SEO services/features in a grid
 * Following Diora pattern for data extraction
 */
const FlowbiteWhatIsSEOSection: React.FC<FlowbiteWhatIsSEOSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions
  const getHeading = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading"
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

  // Extract data
  const title = getHeading("title") || props.title || "What is SEO?";
  const subtitle = getText("subtitle") || props.subtitle || "Search Engine Optimization (SEO) is the practice of optimizing your website to rank higher in search results.";
  const services = getArray("services") || props.services || [];

  // Icon mapping - returns SVG icon component
  const getIcon = (iconName: string) => {
    const icon = iconName?.toLowerCase();
    const iconBase = { className: "w-7 h-7 text-primary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" } as const;

    const withProps = (d: string) =>
      (props: React.SVGProps<SVGSVGElement>) => {
        const merged = {
          ...iconBase,
          ...props,
          className: [iconBase.className, props.className].filter(Boolean).join(" "),
        };
        return <svg {...merged}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} /></svg>;
      };

    if (icon === "search") {
      return withProps("M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z");
    }
    if (icon === "document" || icon === "text") {
      return withProps("M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z");
    }
    if (icon === "code") {
      return withProps("M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4");
    }
    if (icon === "chart" || icon === "bar") {
      return withProps("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z");
    }
    if (icon === "link") {
      return withProps("M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1");
    }
    if (icon === "users" || icon === "user") {
      return withProps("M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z");
    }
    if (icon === "trending" || icon === "up") {
      return withProps("M13 7h8m0 0v8m0-8l-8 8-4-4-6 6");
    }
    if (icon === "target") {
      return withProps("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z");
    }
    // Default to search icon
    return withProps("M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z");
  };

  return (
    <section className={`py-20 px-4 bg-[color:var(--brand-background)] dark:bg-[#0a0a0a] ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection 
          title={title}
          subtitle={subtitle}
          className="text-center mb-16"
        >
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service: any, index: number) => {
                const Icon = getIcon(service.icon || service.iconName || "");
                const serviceTitle = service.title || service.name || "";
                const serviceDescription = service.description || service.text || "";

                return (
                  <Card
                    key={index}
                    className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    {serviceTitle && (
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {serviceTitle}
                      </h3>
                    )}
                    {serviceDescription && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {serviceDescription}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">No services available.</p>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteWhatIsSEOSection;