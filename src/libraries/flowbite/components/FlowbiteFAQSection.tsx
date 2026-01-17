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
import { Minus, Plus } from "lucide-react";

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
 * Styled to match the provided reference (rounded dark blocks with + / - circle).
 * Includes light + dark variants automatically.
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
    <section className={`relative overflow-hidden py-20 px-4 ${className}`}>
      <div className="container mx-auto relative">
        <div className="mx-auto max-w-5xl">
          <FlowbiteSection title={title} subtitle={subtitle} className="mb-10" />

          {faqItems.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-none rounded-2xl bg-slate-100 dark:bg-slate-800/70 px-5 sm:px-7"
                >
                  <AccordionTrigger
                    className="group no-underline hover:no-underline py-6 [&>svg]:hidden"
                  >
                    <div className="flex w-full items-center justify-between gap-6">
                      <span className="text-left text-xl sm:text-2xl font-medium text-slate-900 dark:text-white">
                        {item.question}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-slate-950 shrink-0">
                        <Plus className="h-5 w-5 group-data-[state=open]:hidden" />
                        <Minus className="h-5 w-5 hidden group-data-[state=open]:block" />
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-200 leading-relaxed">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No FAQ items available.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteFAQSection;