"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button, Card } from "flowbite-react";

interface FlowbiteWhyChooseUsSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Why Choose Us Section Component
 * 
 * Displays reasons to choose the service/product
 * Following Diora pattern for data extraction
 */
const FlowbiteWhyChooseUsSection: React.FC<FlowbiteWhyChooseUsSectionProps> = ({
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

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
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
  const badge = getText("badge") || props.badge || "";
  const title = getHeading("title") || props.title || "";
  const description = getText("description") || props.description || "";
  const reasons = getArray("reasons");
  const cta = getButton("cta");
  const sectionLabel = title || (component as any).name || "reasons";

  return (
    <section className={`py-20 px-4 bg-[color:var(--brand-background)] dark:bg-[#0a0a0a] ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection className="mb-12">
          {badge && (
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide text-center mb-2">
              {badge}
            </p>
          )}
          {title && (
            <h2 
              className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
          {description && (
            <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-12">{description}</p>
          )}

          {/* Reasons Grid */}
          {reasons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {reasons.map((reason: any, index: number) => {
                const reasonItems = Array.isArray(reason.items) ? reason.items : [];
                const reasonTitle = reasonItems.find((item: any) => 
                  item.key?.toLowerCase() === "title" || item.type === "heading"
                )?.content || reason.title || "";
                const reasonDesc = reasonItems.find((item: any) => 
                  item.key?.toLowerCase() === "description" || item.type === "text"
                )?.content || reason.description || "";

                return (
                  <Card key={index} className="text-center h-full">
                    {reasonTitle && (
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {reasonTitle}
                      </h3>
                    )}
                    {reasonDesc && (
                      <p className="text-gray-700 dark:text-gray-300">{reasonDesc}</p>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center">No {sectionLabel} to display</p>
          )}

          {/* CTA */}
          {cta.content && (
            <div className="text-center">
              <Button
                href={cta.link}
                size="xl"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {cta.content}
              </Button>
            </div>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteWhyChooseUsSection;

