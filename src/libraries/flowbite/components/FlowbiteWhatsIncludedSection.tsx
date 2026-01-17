"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button, Card } from "flowbite-react";

interface FlowbiteWhatsIncludedProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite What's Included Section Component
 */
const FlowbiteWhatsIncludedSection: React.FC<FlowbiteWhatsIncludedProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getHeading = (key: string, level?: number) => {
    const item = items.find(
      (i) =>
        i.key?.toLowerCase() === key.toLowerCase() &&
        i.type === "heading" &&
        (level === undefined || (i as any).level === level)
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

  const badge = getText("badge") || props.badge || "";
  const title = getHeading("title") || props.title || "";
  const description = getText("description") || props.description || "";

  const priceArray = getArray("price");
  const amount = priceArray.find((item: any) => item.key?.toLowerCase() === "amount")?.content || "";
  const currency = priceArray.find((item: any) => item.key?.toLowerCase() === "currency")?.content || "";
  const details = priceArray.find((item: any) => item.key?.toLowerCase() === "details")?.content || "";

  const features = getArray("features");
  const benefits = getArray("benefits");
  const images = getArray("images");
  const cta = getButton("cta");

  return (
    <section className={`py-20 px-4 bg-transparent ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection className="mb-12">
          {badge ? (
            <p className="text-sm font-semibold text-indigo-600 dark:text-lime-300 uppercase tracking-wide text-center mb-2">
              {badge}
            </p>
          ) : null}
          {title ? (
            <h2
              className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white text-center mb-4"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          ) : null}
          {description ? (
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 text-center mb-10">
              {description}
            </p>
          ) : null}

          {(amount || currency) ? (
            <div className="text-center mb-10">
              {amount ? (
                <span className="text-4xl font-semibold text-gray-900 dark:text-white">{amount}</span>
              ) : null}
              {currency ? (
                <span className="text-xl text-gray-600 dark:text-gray-300 ml-2">{currency}</span>
              ) : null}
              {details ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{details}</p>
              ) : null}
            </div>
          ) : null}

          {features.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {features.map((feature: any, index: number) => {
                const featureItems = Array.isArray(feature.items) ? feature.items : [];
                const featureTitle =
                  featureItems.find((item: any) => item.key?.toLowerCase() === "title" || item.type === "heading")
                    ?.content || feature.title || "";
                const featureDesc =
                  featureItems.find((item: any) => item.key?.toLowerCase() === "description" || item.type === "text")
                    ?.content || feature.description || "";

                return (
                  <Card
                    key={index}
                    className="text-left border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5"
                  >
                    {featureTitle ? (
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {featureTitle}
                      </h3>
                    ) : null}
                    {featureDesc ? (
                      <p className="text-gray-600 dark:text-gray-300">{featureDesc}</p>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          ) : null}

          {benefits.length > 0 ? (
            <div className="mb-12">
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {benefits.map((benefit: any, index: number) => {
                  const benefitText = benefit.content || benefit.text || "";
                  return (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-200">
                      <svg className="w-5 h-5 text-lime-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {benefitText}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {images.map((image: any, index: number) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt || `Image ${index + 1}`}
                  className="w-full h-auto rounded-xl border border-black/10 dark:border-white/10 shadow-sm"
                />
              ))}
            </div>
          ) : null}

          {cta.content ? (
            <div className="text-center">
              <Button href={cta.link} size="xl" className="!bg-indigo-600 hover:!bg-indigo-700 dark:!bg-lime-300 dark:!text-slate-950 dark:hover:!bg-lime-200">
                {cta.content}
              </Button>
            </div>
          ) : null}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteWhatsIncludedSection;