"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface HyperUIFooterProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * HyperUI Footer Component
 * 
 * Footer with brand info, links, and social media
 * Uses HyperUI/Tailwind CSS v4 styling
 */
const HyperUIFooter: React.FC<HyperUIFooterProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions
  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || props[key] || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const brandName = getText("brandName") || getText("companyName");
  const brandDescription = getText("brandDescription");
  const footerSections = getArray("footerSections");
  const socialLinks = getArray("socialLinks");
  const copyright = getText("copyright");

  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-screen-xl px-4 py-8 mx-auto lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div>
            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">{brandName || "Company"}</h2>
            {brandDescription && <p className="text-gray-500">{brandDescription}</p>}
          </div>
          {footerSections.map((section: any, index: number) => (
            <div key={index}>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">{section.title || section.label}</h2>
              <ul className="text-gray-500 font-medium">
                {Array.isArray(section.links) && section.links.map((link: any, linkIndex: number) => (
                  <li key={linkIndex} className="mb-4">
                    <a href={link.url || link.link || "#"} className="hover:underline">
                      {link.label || link.text || link.content}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {copyright && (
          <div className="px-4 py-6 border-t border-gray-200 md:flex md:items-center md:justify-between">
            <span className="text-sm text-gray-500 sm:text-center">{copyright}</span>
          </div>
        )}
      </div>
    </footer>
  );
};

export default HyperUIFooter;
