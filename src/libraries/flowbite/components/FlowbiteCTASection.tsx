"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button } from "flowbite-react";

interface FlowbiteCTASectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite CTA Section Component
 *
 * Revamped background + button styling for light/dark.
 */
const FlowbiteCTASection: React.FC<FlowbiteCTASectionProps> = ({
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

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getButton = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const title = getHeading("title") || props.title || "";
  const description = getText("description") || props.description || "";
  const cta = getButton("cta");

  return (
    <section
      className={`relative py-20 px-4 overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-lime-400/20 via-sky-400/10 to-indigo-400/20 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl relative">
        <FlowbiteSection className="text-center">
          {title ? (
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-5 text-white">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          ) : null}
          {cta.content ? (
            <Button
              href={cta.link}
              size="xl"
              className="!bg-white !text-slate-900 hover:!bg-white/90 dark:!bg-lime-300 dark:!text-slate-950 dark:hover:!bg-lime-200"
            >
              {cta.content}
            </Button>
          ) : null}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteCTASection;