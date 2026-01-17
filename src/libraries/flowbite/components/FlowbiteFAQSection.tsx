"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../components/ui/accordion";

interface FlowbiteFAQSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite FAQ Section Component
 */
const FlowbiteFAQSection: React.FC<FlowbiteFAQSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getHeading = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "heading"
    ) as any;
    return item?.content || "";
  };

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const title = getHeading("title") || props.title || "Frequently Asked Questions";
  const subtitle = getText("subtitle") || props.subtitle || "";
  const faqItems = getArray("faqItems") || props.faqItems || (props as any).items || [];

  return (
    <section className={`py-20 px-4 bg-transparent ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection title={title} subtitle={subtitle} className="text-center mb-12">
          {faqItems.length > 0 ? (
            <div className="max-w-4xl mx-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 sm:p-6">
              <Accordion type="single" collapsible>
                {faqItems.map((item: any, index: number) => {
                  const question = item.question || item.title || "";
                  const answer = item.answer || item.content || item.description || "";

                  return (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600 dark:text-gray-300">{answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No FAQ items available.</p>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteFAQSection;