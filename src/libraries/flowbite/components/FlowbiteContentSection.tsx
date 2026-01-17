"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import { Button } from "flowbite-react";

interface FlowbiteContentSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Content Section Component
 *
 * Revamped to render as a clean content card on top of the theme background.
 */
const FlowbiteContentSection: React.FC<FlowbiteContentSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getHeading = (key: string, level?: number) => {
    const item = items.find(
      (i) =>
        i.key?.toLowerCase() === key.toLowerCase() &&
        i.type === "heading" &&
        (level === undefined || (i as any).level === level)
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
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") && i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
      icon: item?.icon,
    };
  };

  const title = getHeading("title") || props.title || "";
  const content = getArray("content") || (props as any).content || [];
  const button = getButton("button");

  return (
    <section className={`py-20 px-4 bg-transparent ${className}`}>
      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 p-8 md:p-10">
          {title ? (
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h2>
          ) : null}

          {content.length > 0 ? (
            <div className="space-y-4 mt-6">
              {content.map((item: any, index: number) => {
                const text = typeof item === "string" ? item : item.content || item.text || "";
                if (!text) return null;

                return (
                  <p key={index} className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
                    {text}
                  </p>
                );
              })}
            </div>
          ) : null}

          {button.content ? (
            <div className="mt-8">
              <Button
                href={button.link}
                color="primary"
                className="!bg-indigo-600 hover:!bg-indigo-700 dark:!bg-lime-300 dark:!text-slate-950 dark:hover:!bg-lime-200 px-6 py-3"
              >
                {button.content}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteContentSection;