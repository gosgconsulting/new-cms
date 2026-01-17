"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface TailgridsFooterProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Tailgrids Footer Component
 * 
 * Footer with brand info, links, and social media
 * Uses Tailgrids/Tailwind CSS styling
 */
const TailgridsFooter: React.FC<TailgridsFooterProps> = ({
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
    <footer className={`bg-white ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {socialLinks.map((link: any, index: number) => (
            <a key={index} href={link.url || link.link || "#"} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">{link.label || link.text || link.content}</span>
              {link.label || link.text || link.content}
            </a>
          ))}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          {copyright && <p className="text-center text-xs leading-5 text-gray-500">{copyright}</p>}
        </div>
      </div>
    </footer>
  );
};

export default TailgridsFooter;
