"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface FlowbiteCTASectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite CTA Section Component
 *
 * Revamped to use the theme gradient (CSS variables) and match the Master hero styling.
 */
const FlowbiteCTASection: React.FC<FlowbiteCTASectionProps> = ({
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

  const getButton = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const title = getHeading("title") || (props as any).title || "";
  const description = getText("description") || (props as any).description || "";
  const cta = getButton("cta");

  return (
    <section className={`relative overflow-hidden py-20 px-4 bg-brand-gradient ${className}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-white/25 via-white/10 to-white/20 blur-3xl opacity-70" />
        <div className="absolute -bottom-56 right-[-12rem] h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl relative">
        <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 md:p-12 text-center">
          {title ? (
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-white">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          ) : null}
          {cta.content ? (
            <a href={cta.link} className="btn-cta">
              {cta.content}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteCTASection;
