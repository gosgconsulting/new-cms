"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import { Check, Clock3 } from "lucide-react";
import Reveal from "./Reveal";
import { useInViewOnce } from "../hooks/useInViewOnce";

interface FlowbiteWhatsIncludedProps {
  component: ComponentSchema;
  className?: string;
}

type Feature = { title: string; description: string };

/**
 * Flowbite What's Included Section Component
 *
 * Adds scroll-triggered entrance + checklist stagger + hover micro-states.
 */
const FlowbiteWhatsIncludedSection: React.FC<FlowbiteWhatsIncludedProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const { ref: sectionRef, inView: sectionInView } = useInViewOnce<HTMLElement>({
    rootMargin: "0px 0px -15% 0px",
    threshold: 0.15,
  });

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
      ref={sectionRef as any}
      className={[
        "py-24 px-4",
        "bg-[color:var(--brand-background)] dark:bg-[#0a0a0a]",
        className,
      ].join(" ")}
    >
      <div className="container mx-auto">
        <div className="mx-auto max-w-6xl">
          {/* Top intro */}
          {(title || description) ? (
            <div className="text-center mb-12">
              {title ? (
                <Reveal direction="up">
                  <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {title}
                  </h2>
                </Reveal>
              ) : null}
              {description ? (
                <Reveal direction="up" delayMs={90}>
                  <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                    {description}
                  </p>
                </Reveal>
              ) : null}
            </div>
          ) : null}

          {/* Main card */}
          <Reveal direction="up" delayMs={140}>
            <div className="mx-auto max-w-4xl rounded-3xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#1a1a1a] shadow-[0_20px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.7)] p-8 sm:p-10 md:p-12">
              {badge ? (
                <div className="flex justify-center">
                  <span className="badge-neutral text-xs font-semibold uppercase tracking-wider">{badge}</span>
                </div>
              ) : null}

              <div className="text-center mt-6">
                <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Join the growth package
                </h3>
                <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
                  Be contacted to learn about scope, timelines, and onboarding options.
                </p>
              </div>

              {/* Checklist */}
              {features.length > 0 ? (
                <div className="mt-10 space-y-3">
                  {features.map((f, idx) => (
                    <Reveal key={idx} direction="up" delayMs={220 + idx * 90}>
                      <div className="group rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                        <div className="flex items-start gap-4">
                          <div className="icon-container-primary mt-1 h-6 w-6 rounded-full transition-transform duration-200 group-hover:scale-110">
                            <Check className="h-4 w-4" />
                          </div>
                          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            {f.title ? (
                              <span className="font-semibold text-gray-900 dark:text-white">{f.title}: </span>
                            ) : null}
                            <span className="text-gray-700 dark:text-gray-300">{f.description}</span>
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              ) : null}

              {/* Highlight callout */}
              <Reveal direction="up" delayMs={260 + features.length * 90}>
                <div className="mt-10 rounded-2xl border border-brand-primary/30 dark:border-brand-primary/20 bg-white/60 dark:bg-[#1a1a1a] p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center h-10 w-10">
                      <Clock3 className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{calloutTitle}</p>
                      <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">{calloutText}</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* CTA */}
              {cta.content ? (
                <Reveal direction="up" delayMs={320 + features.length * 90}>
                  <div className="mt-10">
                    <a
                      href={cta.link}
                      className={
                        "btn-cta w-full h-14 rounded-2xl " +
                        (sectionInView ? "animate-master-cta-pulse-once" : "")
                      }
                    >
                      {cta.content}
                    </a>
                  </div>
                </Reveal>
              ) : null}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default FlowbiteWhatsIncludedSection;