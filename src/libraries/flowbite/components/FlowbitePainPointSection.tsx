"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { AlertTriangle, BarChart3, CircleX, Sparkles } from "lucide-react";

interface FlowbitePainPointSectionProps {
  component: ComponentSchema;
  className?: string;
}

type PainPoint = { text: string; icon?: string };

function pickIcon(name?: string) {
  const key = String(name || "").toLowerCase();
  if (key.includes("spark")) return Sparkles;
  if (key.includes("bar") || key.includes("chart")) return BarChart3;
  if (key === "x" || key.includes("close") || key.includes("times")) return CircleX;
  return AlertTriangle;
}

/**
 * Flowbite Pain Point Section Component
 *
 * Revamped to match the Master theme hero styling and to support the schema
 * used by /theme/master (keys: hint, heading, bullets).
 */
const FlowbitePainPointSection: React.FC<FlowbitePainPointSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getHeading = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "heading"
    ) as any;
    return item?.content || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const title =
    getHeading("heading") ||
    getHeading("title") ||
    (props as any).heading ||
    (props as any).title ||
    "Your marketing should be generating leads.";

  const subtitle =
    getText("hint") ||
    getText("subtitle") ||
    (props as any).hint ||
    (props as any).subtitle ||
    "If you're not getting consistent leads, something in the funnel is broken.";

  const points = useMemo<PainPoint[]>(() => {
    const raw =
      getArray("bullets") ||
      getArray("painPoints") ||
      (props as any).bullets ||
      (props as any).painPoints ||
      (props as any).items ||
      [];

    if (!Array.isArray(raw)) return [];

    return raw
      .map((p: any) => {
        const text = p?.text || p?.content || p?.title || p?.label || "";
        const icon = p?.icon || p?.iconName || p?.type || "";
        return text ? { text, icon } : null;
      })
      .filter(Boolean) as PainPoint[];
  }, [items, props]);

  return (
    <section className={`relative overflow-hidden py-20 px-4 ${className}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-indigo-400/15 via-sky-400/10 to-lime-400/15 blur-3xl" />
        <div className="absolute -bottom-48 left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-lime-400/10 via-sky-400/10 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="container mx-auto relative">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="inline-flex items-center gap-2 badge-neutral text-xs">
              <span className="h-2 w-2 rounded-full bg-brand-primary" />
              <span>{subtitle}</span>
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">
              {title}
            </h2>

            <p className="mt-4 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              We identify the bottleneck, fix the messaging, and align every section to one goal: conversions.
            </p>
          </div>

          <div className="space-y-4">
            {points.length > 0 ? (
              points.map((p, index) => {
                const Icon = pickIcon(p.icon);

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="icon-container-accent h-10 w-10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-base text-gray-800 dark:text-gray-100 leading-relaxed">
                        {p.text}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No items to display.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowbitePainPointSection;
