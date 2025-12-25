"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button, Card } from "flowbite-react";

interface FlowbiteWhatsIncludedProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite What's Included Section Component
 * 
 * Displays what's included in a package/offer
 * Following Diora pattern for data extraction
 */
const FlowbiteWhatsIncludedSection: React.FC<FlowbiteWhatsIncludedProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions
  const getHeading = (key: string, level?: number) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading" &&
      (level === undefined || (i as any).level === level)
    ) as any;
    return item?.content || "";
  };

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
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
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  // Extract data
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
    <section className={`py-20 px-4 bg-white ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection className="mb-12">
          {badge && (
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide text-center mb-2">
              {badge}
            </p>
          )}
          {title && (
            <h2 
              className="text-3xl font-bold text-gray-900 text-center mb-4"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
          {description && (
            <p className="text-lg text-gray-600 text-center mb-8">{description}</p>
          )}

          {/* Price */}
          {(amount || currency) && (
            <div className="text-center mb-8">
              {amount && (
                <span className="text-4xl font-bold text-gray-900">{amount}</span>
              )}
              {currency && (
                <span className="text-xl text-gray-600 ml-2">{currency}</span>
              )}
              {details && (
                <p className="text-sm text-gray-500 mt-2">{details}</p>
              )}
            </div>
          )}

          {/* Features Grid */}
          {features.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {features.map((feature: any, index: number) => {
                const featureItems = Array.isArray(feature.items) ? feature.items : [];
                const featureTitle = featureItems.find((item: any) => 
                  item.key?.toLowerCase() === "title" || item.type === "heading"
                )?.content || feature.title || "";
                const featureDesc = featureItems.find((item: any) => 
                  item.key?.toLowerCase() === "description" || item.type === "text"
                )?.content || feature.description || "";

                return (
                  <Card key={index} className="text-center">
                    {featureTitle && (
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {featureTitle}
                      </h3>
                    )}
                    {featureDesc && (
                      <p className="text-gray-600">{featureDesc}</p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Benefits List */}
          {benefits.length > 0 && (
            <div className="mb-12">
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {benefits.map((benefit: any, index: number) => {
                  const benefitText = benefit.content || benefit.text || "";
                  return (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {benefitText}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {images.map((image: any, index: number) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt || `Image ${index + 1}`}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              ))}
            </div>
          )}

          {/* CTA */}
          {cta.content && (
            <div className="text-center">
              <Button
                href={cta.link}
                size="xl"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {cta.content}
              </Button>
            </div>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteWhatsIncludedSection;

