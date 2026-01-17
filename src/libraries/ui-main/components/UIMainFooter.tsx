"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface UIMainFooterProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * UI Main Footer Component
 * 
 * Footer with brand info, links, and social media
 * Uses shadcn/ui and Tailwind CSS styling
 */
const UIMainFooter: React.FC<UIMainFooterProps> = ({
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
    <footer className={`border-t ${className}`}>
      <div className="container flex flex-col flex-wrap px-4 py-10 mx-auto md:items-center lg:items-start md:flex-row md:flex-nowrap">
        <div className="flex-shrink-0 w-64 mx-auto text-center md:mx-0 md:text-left">
          <h3 className="text-lg font-bold">{brandName || "Company"}</h3>
          {brandDescription && <p className="mt-2 text-sm text-muted-foreground">{brandDescription}</p>}
        </div>
        <div className="flex flex-wrap flex-grow mt-10 -mb-10 text-center md:pl-20 md:mt-0 md:text-left">
          {footerSections.map((section: any, index: number) => (
            <div key={index} className="w-full px-4 lg:w-1/4 md:w-1/2">
              <h4 className="mb-4 text-sm font-semibold tracking-widest uppercase">{section.title || section.label}</h4>
              <ul className="mb-10 space-y-3 list-none">
                {Array.isArray(section.links) && section.links.map((link: any, linkIndex: number) => (
                  <li key={linkIndex}>
                    <a href={link.url || link.link || "#"} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label || link.text || link.content}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {copyright && (
        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">{copyright}</p>
        </div>
      )}
    </footer>
  );
};

export default UIMainFooter;
