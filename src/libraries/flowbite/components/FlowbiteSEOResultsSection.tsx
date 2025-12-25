"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button, Carousel } from "flowbite-react";

interface FlowbiteSEOResultsSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite SEO Results Section Component
 * 
 * Displays SEO results/case studies with slider
 * Following Diora pattern for data extraction
 */
const FlowbiteSEOResultsSection: React.FC<FlowbiteSEOResultsSectionProps> = ({
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

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
      icon: item?.icon
    };
  };

  // Extract data
  const title = getHeading("title") || props.title || "Real SEO Results";
  const subtitle = getText("subtitle") || props.subtitle || "See how we've helped businesses like yours achieve remarkable growth through strategic SEO implementation.";
  const results = getArray("results") || props.results || [];
  const button = getButton("button") || props.button || { content: "Become Our Next Case Study", link: "#" };

  return (
    <section className={`py-12 px-4 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden ${className}`}>
      <div className="container mx-auto relative z-10">
        <FlowbiteSection 
          title={title}
          subtitle={subtitle}
          className="text-center mb-12"
        >
          {results.length > 0 && (
            <div className="mt-8">
              <Carousel>
                {results.map((result: any, index: number) => (
                  <div key={index} className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <div className="text-center p-8">
                      {result.image && (
                        <img 
                          src={result.image} 
                          alt={result.title || `Result ${index + 1}`}
                          className="max-w-full h-auto mx-auto mb-4"
                        />
                      )}
                      {result.title && (
                        <h3 className="text-2xl font-bold mb-2">{result.title}</h3>
                      )}
                      {result.metric && (
                        <p className="text-xl text-primary font-semibold mb-2">{result.metric}</p>
                      )}
                      {result.description && (
                        <p className="text-gray-600">{result.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          {button.content && (
            <div className="text-center mt-8">
              <Button
                href={button.link}
                size="xl"
                className="bg-gradient-to-r from-primary to-secondary"
              >
                {button.content}
              </Button>
            </div>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteSEOResultsSection;

