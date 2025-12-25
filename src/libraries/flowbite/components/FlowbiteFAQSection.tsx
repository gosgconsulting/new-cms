"use client";

import React, { useState } from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Accordion } from "flowbite-react";

interface FlowbiteFAQSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite FAQ Section Component
 * 
 * Displays FAQ items in an accordion
 * Following Diora pattern for data extraction
 */
const FlowbiteFAQSection: React.FC<FlowbiteFAQSectionProps> = ({
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
  const title = getHeading("title") || props.title || "Frequently Asked Questions";
  const subtitle = getText("subtitle") || props.subtitle || "";
  const faqItems = getArray("faqItems") || props.faqItems || props.items || [];

  return (
    <section className={`py-20 px-4 ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection 
          title={title}
          subtitle={subtitle}
          className="text-center mb-12"
        >
          {faqItems.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <Accordion>
                {faqItems.map((item: any, index: number) => {
                  const question = item.question || item.title || "";
                  const answer = item.answer || item.content || item.description || "";

                  return (
                    <Accordion.Panel key={index}>
                      <Accordion.Title>{question}</Accordion.Title>
                      <Accordion.Content>
                        <p className="text-gray-600">{answer}</p>
                      </Accordion.Content>
                    </Accordion.Panel>
                  );
                })}
              </Accordion>
            </div>
          ) : (
            <p className="text-center text-gray-500">No FAQ items available.</p>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteFAQSection;

