"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import { AlertTriangle, BarChart3, CircleX, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

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
 * Adds scroll-triggered stagger reveals and subtle hover micro-interactions.
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
    <section
      className={`relative overflow-hidden py-20 px-4 bg-[color:var(--bg-secondary)] ${className}`}
    >
      {/* Subtle secondary tint (support + rhythm) */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-48 right-[-10rem] h-[26rem] w-[26rem] rounded-full blur-3xl animate-master-float"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--brand-secondary) 10%, transparent), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-52 left-[-12rem] h-[26rem] w-[26rem] rounded-full blur-3xl animate-master-float"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--brand-secondary) 7%, transparent), transparent 72%)",
          }}
        />
      </div>

      <div className="container mx-auto relative">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Reveal direction="left">
            <div className="rounded-3xl border border-[color:var(--border-color)] bg-white p-8 md:p-10 shadow-[var(--shadow-2)]">
              <SectionLabel className="text-xs">{subtitle}</SectionLabel>

              <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight text-[color:var(--text-primary)] leading-tight">
                {title}
              </h2>

              <p className="mt-4 text-base text-[color:var(--text-secondary)] leading-relaxed">
                We identify the bottleneck, fix the messaging, and align every section to one goal: conversions.
              </p>
            </div>
          </Reveal>

          <div className="space-y-4">
            {points.length > 0 ? (
              points.map((p, index) => {
                const Icon = pickIcon(p.icon);
                const direction = index % 2 === 0 ? "right" : "left";

                return (
                  <Reveal key={index} direction={direction} delayMs={index * 120}>
                    <div
                      className={
                        "group rounded-2xl border border-[color:var(--border-color)] bg-white p-5 shadow-[var(--shadow-1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-2)]"
                      }
                      style={{
                        // On hover, keep it subtle: no primary block colors.
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="icon-container-secondary h-10 w-10 rounded-xl transition-transform duration-300 group-hover:scale-110">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-base text-[color:var(--text-secondary)] leading-relaxed">
                          {p.text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })
            ) : (
              <p className="text-[color:var(--text-muted)]">No {(component as any).name || getHeading("title") || "items"} to display.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowbitePainPointSection;