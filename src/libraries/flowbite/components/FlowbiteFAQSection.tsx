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
 * Fixed and revamped to support the /theme/master FAQ schema style:
 * - `faqItems` can be a flat array of {key: question}/{key: answer}
 * - or multiple arrays (faq1, faq2, ...) each containing question/answer items.
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
    // 1) If props are already in {question, answer} format
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

    // 2) Support master schema: faqItems is a flat list of question/answer entries
    const flat = getArray("faqItems");
    const out: FAQItem[] = [];

    if (flat.length > 0) {
      // If it's already objects with question/answer fields
      const hasQAFields = flat.some((x: any) => x?.question || x?.answer);
      if (hasQAFields) {
        flat.forEach((x: any) => {
          const q = x?.question || x?.title || "";
          const a = x?.answer || x?.content || x?.description || "";
          if (q && a) out.push({ question: q, answer: a });
        });
      } else {
        // Pair sequentially: question then answer
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

    // 3) Also support faq1/faq2/... arrays, each with question+answer items
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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[22rem] w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400/12 via-sky-400/10 to-lime-400/12 blur-3xl" />
      </div>

      <div className="container mx-auto relative">
        <div className="mx-auto max-w-4xl">
          <FlowbiteSection title={title} subtitle={subtitle} className="text-center mb-10" />

          {faqItems.length > 0 ? (
            <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-4 sm:p-6 shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <Accordion type="single" collapsible>
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No FAQ items available.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteFAQSection;
