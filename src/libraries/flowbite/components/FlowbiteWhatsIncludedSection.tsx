"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import { Check, Clock3 } from "lucide-react";

interface FlowbiteWhatsIncludedProps {
  component: ComponentSchema;
  className?: string;
}

type Feature = { title: string; description: string };

/**
 * Flowbite What's Included Section Component
 *
 * Redesigned to match the provided reference:
 * - soft background
 * - centered intro
 * - big rounded card with badge pill
 * - checklist items (bold headline + normal text)
 * - highlighted callout box
 * - full-width CTA button
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
  const title = getHeading("title") || (props as any).title || "";
  const description = getText("description") || (props as any).description || "";

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

  // A small "highlight" callout (dummy text if not provided)
  const calloutTitle = (props as any).calloutTitle || "Everything included";
  const calloutText =
    (props as any).calloutText ||
    "Tracking setup, monthly reporting, and ongoing optimisation — so you can stay focused on running the business.";

  return (
    <section
      className={[
        "py-24 px-4",
        "bg-[#faf8f2] dark:bg-slate-950",
        className,
      ].join(" ")}
    >
      <div className="container mx-auto">
        <div className="mx-auto max-w-6xl">
          {/* Top intro */}
          {(title || description) ? (
            <div className="text-center mb-12">
              {title ? (
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-200 max-w-3xl mx-auto">
                  {description}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Main card */}
          <div className="mx-auto max-w-4xl rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 shadow-[0_20px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.55)] p-8 sm:p-10 md:p-12">
            {badge ? (
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full bg-lime-200/70 text-slate-900 dark:bg-lime-400/15 dark:text-lime-200 px-5 py-2 text-xs font-semibold uppercase tracking-wider">
                  {badge}
                </span>
              </div>
            ) : null}

            <div className="text-center mt-6">
              <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Join the growth package
              </h3>
              <p className="mt-3 text-lg text-lime-700 dark:text-lime-200/90">
                Be contacted to learn about scope, timelines, and onboarding options.
              </p>
            </div>

            {/* Checklist */}
            {features.length > 0 ? (
              <div className="mt-10 space-y-5">
                {features.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-lime-200/70 text-lime-800 dark:bg-lime-400/15 dark:text-lime-200">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed">
                      {f.title ? (
                        <span className="font-semibold text-slate-900 dark:text-white">{f.title}: </span>
                      ) : null}
                      <span className="text-slate-600 dark:text-slate-200">{f.description}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Highlight callout */}
            <div className="mt-10 rounded-2xl border border-lime-300/60 dark:border-lime-400/20 bg-lime-50 dark:bg-lime-400/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-200/80 text-lime-800 dark:bg-lime-400/15 dark:text-lime-200">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{calloutTitle}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-200 leading-relaxed">{calloutText}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            {cta.content ? (
              <div className="mt-10">
                <a
                  href={cta.link}
                  className="btn-cta w-full h-14 rounded-2xl"
                >
                  {cta.content}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowbiteWhatsIncludedSection;