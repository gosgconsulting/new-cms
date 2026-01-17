"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface FlowbiteWhatsIncludedProps {
  component: ComponentSchema;
  className?: string;
}

type Feature = { title: string; description: string };

/**
 * Flowbite What's Included Section Component
 *
 * Revamped to match the Master theme hero styling (glass container + cards)
 * and use the theme button styling.
 */
const FlowbiteWhatsIncludedSection: React.FC<FlowbiteWhatsIncludedProps> = ({
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

  const getButton = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const badge = getText("badge") || (props as any).badge || "";
  const title = getHeading("title") || (props as any).title || "What's included";
  const description =
    getText("description") ||
    (props as any).description ||
    "A focused breakdown of the core areas driving results.";

  const featuresRaw = getArray("features") || (props as any).features || [];
  const cta = getButton("cta");

  const features = useMemo<Feature[]>(() => {
    if (!Array.isArray(featuresRaw)) return [];

    return featuresRaw
      .map((feature: any) => {
        const featureItems = Array.isArray(feature.items) ? feature.items : [];
        const featureTitle =
          featureItems.find((item: any) => item.key?.toLowerCase() === "title" || item.type === "heading")
            ?.content || feature.title || "";
        const featureDesc =
          featureItems.find((item: any) => item.key?.toLowerCase() === "description" || item.type === "text")
            ?.content || feature.description || "";

        return featureTitle || featureDesc ? { title: featureTitle, description: featureDesc } : null;
      })
      .filter(Boolean) as Feature[];
  }, [featuresRaw]);

  return (
    <section className={`relative overflow-hidden py-20 px-4 ${className}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[22rem] w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-lime-400/12 via-sky-400/10 to-indigo-400/12 blur-3xl" />
      </div>

      <div className="container mx-auto relative">
        <div className="mx-auto max-w-6xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-8 md:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="text-center max-w-3xl mx-auto">
            {badge ? (
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                {badge}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300">
                {description}
              </p>
            ) : null}
          </div>

          {features.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="h-full rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-6"
                >
                  {feature.title ? (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                  ) : null}
                  {feature.description ? (
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {cta.content ? (
            <div className="mt-10 flex justify-center">
              <a href={cta.link} className="btn-cta">
                {cta.content}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteWhatsIncludedSection;
