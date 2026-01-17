"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DaisyUISection from "./DaisyUISection";

interface DaisyUIFAQSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI FAQ Section Component
 * 
 * Displays FAQ items in an accordion using DaisyUI collapse classes
 */
const DaisyUIFAQSection: React.FC<DaisyUIFAQSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

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

  const title = getText("title") || "Frequently Asked Questions";
  const subtitle = getText("subtitle");
  const faqItems = getArray("faqItems") || props.faqItems || props.items || [];

  return (
    <DaisyUISection title={title} subtitle={subtitle} className={className}>
      {faqItems.length > 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2">
            {faqItems.map((item: any, index: number) => {
              const question = item.question || item.title || "";
              const answer = item.answer || item.content || item.description || "";

              return (
                <div key={index} className="collapse collapse-plus bg-base-200">
                  <input type="radio" name="faq-accordion" defaultChecked={index === 0} />
                  <div className="collapse-title text-xl font-medium">
                    {question}
                  </div>
                  <div className="collapse-content">
                    <p>{answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-center opacity-70">No FAQ items available.</p>
      )}
    </DaisyUISection>
  );
};

export default DaisyUIFAQSection;
