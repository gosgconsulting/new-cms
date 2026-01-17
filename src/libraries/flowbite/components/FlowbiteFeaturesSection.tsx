"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";

interface FlowbiteFeaturesSectionProps {
  component: ComponentSchema;
  className?: string;
}

type Feature = { title: string; description: string };

/**
 * Flowbite Features Section Component
 *
 * Revamped to match the Master theme hero styling (soft glows + glass cards).
 */
const FlowbiteFeaturesSection: React.FC<FlowbiteFeaturesSectionProps> = ({
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

  const title = getHeading("title") || (props as any).title || "Why this works";
  const subtitle =
    getText("subtitle") ||
    (props as any).subtitle ||
    "A conversion-first structure with consistent sections and beautiful light/dark styling.";

  const features = useMemo<Feature[]>(() => {
    const featuresArray = getArray("features");
    const out: Feature[] = [];

    if (featuresArray.length === 0) {
      for (let i = 1; i <= 10; i++) {
        const featureKey = `feature${i}`;
        const featureItems = getArray(featureKey);
        if (featureItems.length > 0) {
          const titleItem = featureItems.find(
            (item: any) => item.key?.toLowerCase() === "title" || item.type === "heading"
          );
          const descItem = featureItems.find(
            (item: any) => item.key?.toLowerCase() === "description" || item.type === "text"
          );
          if (titleItem || descItem) {
            out.push({
              title: titleItem?.content || "",
              description: descItem?.content || "",
            });
          }
        }
      }
      return out;
    }

    for (const feature of featuresArray) {
      if (Array.isArray((feature as any).items)) {
        const featureItems = (feature as any).items as any[];
        const titleItem = featureItems.find(
          (item: any) => item.key?.toLowerCase() === "title" || item.type === "heading"
        );
        const descItem = featureItems.find(
          (item: any) => item.key?.toLowerCase() === "description" || item.type === "text"
        );
        out.push({
          title: titleItem?.content || (feature as any).title || "",
          description: descItem?.content || (feature as any).description || "",
        });
      } else {
        out.push({
          title: (feature as any).title || "",
          description: (feature as any).description || "",
        });
      }
    }

    return out;
  }, [items]);

  return (
    <section className={`relative overflow-hidden py-20 px-4 ${className}`}>
      {/* Soft background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[22rem] w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400/15 via-sky-400/10 to-lime-400/15 blur-3xl" />
        <div className="absolute -bottom-48 left-[-8rem] h-[20rem] w-[20rem] rounded-full bg-gradient-to-tr from-lime-400/10 via-sky-400/10 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="container mx-auto relative">
        <div className="mx-auto max-w-6xl">
          <FlowbiteSection title={title} subtitle={subtitle} className="text-center mb-12" />

          {features.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group h-full rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-indigo-500/10 to-lime-400/15 text-gray-900 dark:text-white font-semibold">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      {feature.title ? (
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {feature.title}
                        </h3>
                      ) : null}
                      {feature.description ? (
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">No features to display</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteFeaturesSection;
