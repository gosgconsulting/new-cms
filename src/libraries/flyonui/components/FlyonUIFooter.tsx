"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface FlyonUIFooterProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * FlyonUI Footer Component
 * 
 * Footer with brand info, links, and social media
 */
const FlyonUIFooter: React.FC<FlyonUIFooterProps> = ({
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
    <footer className={`footer bg-base-200 text-base-content p-10 ${className}`}>
      <nav>
        <h6 className="footer-title">{brandName || "Company"}</h6>
        {brandDescription && <p className="text-sm">{brandDescription}</p>}
      </nav>
      {footerSections.map((section: any, index: number) => (
        <nav key={index}>
          <h6 className="footer-title">{section.title || section.label}</h6>
          {Array.isArray(section.links) && section.links.map((link: any, linkIndex: number) => (
            <a key={linkIndex} href={link.url || link.link || "#"} className="link link-hover">
              {link.label || link.text || link.content}
            </a>
          ))}
        </nav>
      ))}
      {socialLinks.length > 0 && (
        <nav>
          <h6 className="footer-title">Social</h6>
          <div className="grid grid-flow-col gap-4">
            {socialLinks.map((link: any, index: number) => (
              <a key={index} href={link.url || link.link || "#"} className="link link-hover">
                {link.label || link.text || link.content}
              </a>
            ))}
          </div>
        </nav>
      )}
      {copyright && (
        <aside className="col-span-full text-center mt-8">
          <p>{copyright}</p>
        </aside>
      )}
    </footer>
  );
};

export default FlyonUIFooter;
