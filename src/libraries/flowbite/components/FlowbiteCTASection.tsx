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
 * Simplified to match the provided reference:
 * - single gradient banner
 * - centered title + CTA button
 * - no nested inner card/banner
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
      (i) =>
        i.key?.toLowerCase() === key.toLowerCase() &&
        typeof (i as any).content === "string"
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
    <section
      className={[
        "relative overflow-hidden py-20 px-4",
        // Use brand gradient variables, plus a subtle purple wash like the reference
        "bg-brand-gradient",
        className,
      ].join(" ")}
    >
      {/* subtle vignette/glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div className="absolute -top-24 left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute -bottom-32 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-violet-500/25 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl relative">
        <div className="text-center">
          {title ? (
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-4 text-lg text-white/90 max-w-3xl mx-auto">
              {description}
            </p>
          ) : null}

          {cta.content ? (
            <div className="mt-10 flex justify-center">
              <a href={cta.link} className="btn-cta-light w-full sm:w-auto">
                {cta.content}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteCTASection;