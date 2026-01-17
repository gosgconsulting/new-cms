"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../components/ui/accordion";
import { Plus } from "lucide-react";
import Reveal from "./Reveal";

interface FlowbiteFAQSectionProps {
  component: ComponentSchema;
  className?: string;
}

type FAQItem = { question: string; answer: string };

function extractQAFromArrayItems(arrItems: any[]): FAQItem | null {
  if (!Array.isArray(arrItems)) return null;
  const q = arrItems.find((x: any) => x?.key?.toLowerCase() === "question")?.content;
  const a = arrItems.find((x: any) => x?.key?.toLowerCase() === "answer")?.content;
  if (typeof q === "string" && typeof a === "string") return { question: q, answer: a };
  return null;
}

/**
 * Flowbite FAQ Section Component
 *
 * Adds scroll reveal and micro-interactions:
 * - smooth accordion height animation (already provided by the shared Accordion component)
 * - plus icon rotates + changes color on open
 */
const FlowbiteFAQSection: React.FC<FlowbiteFAQSectionProps> = ({
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

  const title = getHeading("title") || (props as any).title || "Frequently Asked Questions";
  const subtitle = getText("subtitle") || (props as any).subtitle || "";

  const faqItems = useMemo<FAQItem[]>(() => {
    const fromProps = (props as any).faqItems || (props as any).items;
    if (Array.isArray(fromProps) && fromProps.length > 0) {
      const mapped = fromProps
        .map((it: any) => {
          const q = it?.question || it?.title || "";
          const a = it?.answer || it?.content || it?.description || "";
          return q && a ? { question: q, answer: a } : null;
        })
        .filter(Boolean) as FAQItem[];
      if (mapped.length > 0) return mapped;
    }

    const flat = getArray("faqItems");
    const out: FAQItem[] = [];

    if (flat.length > 0) {
      const hasQAFields = flat.some((x: any) => x?.question || x?.answer);
      if (hasQAFields) {
        flat.forEach((x: any) => {
          const q = x?.question || x?.title || "";
          const a = x?.answer || x?.content || x?.description || "";
          if (q && a) out.push({ question: q, answer: a });
        });
      } else {
        for (let i = 0; i < flat.length; i++) {
          const item = flat[i];
          if (item?.key?.toLowerCase() === "question") {
            const question = item?.content || "";
            const next = flat[i + 1];
            if (next?.key?.toLowerCase() === "answer") {
              const answer = next?.content || "";
              if (question && answer) out.push({ question, answer });
              i++;
            }
          }
        }
      }
    }

    const numberedArrays = items
      .filter((it: any) => it?.type === "array" && /^faq\d+$/i.test(String(it?.key || "")))
      .sort((a: any, b: any) => {
        const an = parseInt(String(a.key).replace(/\D/g, ""), 10);
        const bn = parseInt(String(b.key).replace(/\D/g, ""), 10);
        return an - bn;
      });

    for (const a of numberedArrays) {
      const qa = extractQAFromArrayItems(a.items || []);
      if (qa) out.push(qa);
    }

    return out;
  }, [items, props]);

  return (
    <section
      className={`relative overflow-hidden py-20 px-4 bg-[color:var(--bg-primary)] ${className}`}
    >
      <div className="container mx-auto relative">
        <div className="mx-auto max-w-5xl">
          <Reveal direction="up">
            <FlowbiteSection title={title} subtitle={subtitle} className="mb-10" />
          </Reveal>

          {faqItems.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <Reveal key={index} direction="up" delayMs={80 + index * 90}>
                  <AccordionItem
                    value={`item-${index}`}
                    className="rounded-2xl border border-[color:var(--border-color)] bg-[color:color-mix(in srgb, var(--bg-secondary) 55%, white)] px-5 sm:px-7 transition-shadow data-[state=open]:shadow-[var(--shadow-2)]"
                  >
                    <AccordionTrigger className="group no-underline hover:no-underline py-6 [&>svg]:hidden cursor-pointer">
                      <div className="flex w-full items-center justify-between gap-6">
                        <span className="text-left text-xl sm:text-2xl font-semibold text-[color:var(--text-primary)]">
                          {item.question}
                        </span>
                        <span className="icon-container-secondary h-11 w-11 rounded-full shrink-0 transition-colors duration-200 group-data-[state=open]:bg-white group-data-[state=open]:text-[color:var(--brand-secondary)]">
                          <Plus className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-45" />
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <p className="text-base sm:text-lg text-[color:var(--text-secondary)] leading-relaxed">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Reveal>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-[color:var(--text-muted)]">No FAQ items available.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteFAQSection;