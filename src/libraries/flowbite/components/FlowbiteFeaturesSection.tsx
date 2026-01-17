"use client";

import React, { useMemo, useRef } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { ArrowLeft, ArrowRight, Clock, Heart, Users } from "lucide-react";

interface FlowbiteFeaturesSectionProps {
  component: ComponentSchema;
  className?: string;
}

type Feature = { title: string; description: string; icon?: string };

function iconForFeature(icon: string | undefined, index: number) {
  const key = String(icon || "").toLowerCase();
  if (key.includes("time") || key.includes("clock")) return Clock;
  if (key.includes("heart") || key.includes("care")) return Heart;
  if (key.includes("user") || key.includes("community") || key.includes("team")) return Users;

  return [Clock, Users, Heart][index % 3];
}

function iconBgForIndex(index: number) {
  const bgs = [
    "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300",
    "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300",
    "bg-lime-100 dark:bg-lime-500/15 text-lime-700 dark:text-lime-300",
  ];
  return bgs[index % bgs.length];
}

/**
 * Flowbite Features Section Component
 *
 * Used as an "Our solution / services" intro section.
 * Displays cards as a horizontal slider when there are many items, with arrows below.
 */
const FlowbiteFeaturesSection: React.FC<FlowbiteFeaturesSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const scrollerRef = useRef<HTMLDivElement>(null);

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

  const title = getHeading("title") || (props as any).title || "Our solution";
  const subtitle =
    getText("subtitle") ||
    (props as any).subtitle ||
    "A complete growth package designed to fix the bottlenecks above and turn attention into leads.";

  const features = useMemo<Feature[]>(() => {
    const featuresArray = getArray("features");
    const out: Feature[] = [];

    if (featuresArray.length === 0) {
      for (let i = 1; i <= 30; i++) {
        const featureKey = `feature${i}`;
        const featureItems = getArray(featureKey);
        if (featureItems.length > 0) {
          const titleItem = featureItems.find(
            (item: any) => item.key?.toLowerCase() === "title" || item.type === "heading"
          );
          const descItem = featureItems.find(
            (item: any) => item.key?.toLowerCase() === "description" || item.type === "text"
          );
          const iconItem = featureItems.find((item: any) => item.key?.toLowerCase() === "icon");

          if (titleItem || descItem) {
            out.push({
              title: titleItem?.content || "",
              description: descItem?.content || "",
              icon: iconItem?.content || iconItem?.icon,
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
        const iconItem = featureItems.find((item: any) => item.key?.toLowerCase() === "icon");

        out.push({
          title: titleItem?.content || (feature as any).title || "",
          description: descItem?.content || (feature as any).description || "",
          icon: iconItem?.content || (feature as any).icon,
        });
      } else {
        out.push({
          title: (feature as any).title || "",
          description: (feature as any).description || "",
          icon: (feature as any).icon,
        });
      }
    }

    return out;
  }, [items]);

  const showArrows = features.length > 3;

  const scrollByCards = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(320, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  const card = (feature: Feature, index: number) => {
    const Icon = iconForFeature(feature.icon, index);
    const bg = iconBgForIndex(index);

    return (
      <div
        key={index}
        className="snap-start min-w-[280px] md:min-w-[360px] rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
      >
        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${bg}`}>
          <Icon className="h-7 w-7" />
        </div>

        {feature.title ? (
          <h3 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">
            {feature.title}
          </h3>
        ) : null}

        {feature.description ? (
          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-200">
            {feature.description}
          </p>
        ) : null}
      </div>
    );
  };

  // For <= 3 cards: keep the 3-column layout like the reference.
  const isGrid = features.length <= 3;

  return (
    <section className={`relative overflow-hidden py-20 px-4 ${className}`}>
      <div className="container mx-auto relative">
        <div className="mx-auto max-w-6xl">
          <FlowbiteSection title={title} subtitle={subtitle} className="text-center mb-12" />

          {features.length > 0 ? (
            isGrid ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((f, idx) => card(f, idx))}
              </div>
            ) : (
              <>
                <div
                  ref={scrollerRef}
                  className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scroll-px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {features.map((f, idx) => card(f, idx))}
                </div>

                {showArrows ? (
                  <div className="mt-8 flex justify-center gap-6">
                    <button
                      type="button"
                      onClick={() => scrollByCards("prev")}
                      className="h-14 w-14 rounded-2xl border-2 border-amber-500 text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center justify-center"
                      aria-label="Previous"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollByCards("next")}
                      className="h-14 w-14 rounded-2xl border-2 border-amber-500 text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center justify-center"
                      aria-label="Next"
                    >
                      <ArrowRight className="h-6 w-6" />
                    </button>
                  </div>
                ) : null}
              </>
            )
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">No items to display</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteFeaturesSection;