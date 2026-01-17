"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface PrelineFooterProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Preline Footer Component
 * 
 * Footer with brand info, links, and social media
 * Uses Preline/Tailwind CSS styling
 */
const PrelineFooter: React.FC<PrelineFooterProps> = ({
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
    <footer className={`mt-auto bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-[85rem] py-10 px-4 sm:px-6 lg:px-8 lg:pt-20 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div className="col-span-full lg:col-span-1">
            <h4 className="text-xs font-semibold uppercase text-gray-900">{brandName || "Company"}</h4>
            {brandDescription && <p className="mt-3 text-sm text-gray-500">{brandDescription}</p>}
          </div>
          {footerSections.map((section: any, index: number) => (
            <div key={index}>
              <h4 className="text-xs font-semibold uppercase text-gray-900">{section.title || section.label}</h4>
              <div className="mt-3 space-y-3">
                {Array.isArray(section.links) && section.links.map((link: any, linkIndex: number) => (
                  <p key={linkIndex}>
                    <a className="inline-flex gap-x-2 text-sm text-gray-500 hover:text-gray-800" href={link.url || link.link || "#"}>
                      {link.label || link.text || link.content}
                    </a>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        {copyright && (
          <div className="mt-5 sm:mt-12 grid gap-y-2 sm:gap-y-0 sm:flex sm:justify-between">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">{copyright}</p>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default PrelineFooter;
