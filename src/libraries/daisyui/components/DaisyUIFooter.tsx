"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface DaisyUIFooterProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI Footer Component
 * 
 * Footer section using DaisyUI footer utility classes
 */
const DaisyUIFooter: React.FC<DaisyUIFooterProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || props[key] || "";
  };

  const getImage = (key: string = "logo") => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return {
      src: item?.src || props[key] || "",
      alt: item?.alt || props[`${key}Alt`] || "",
    };
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const logo = getImage("logo");
  const brandName = getText("brandName") || getText("title");
  const description = getText("description");
  const copyright = getText("copyright") || `© ${new Date().getFullYear()} All rights reserved.`;
  const footerSections = getArray("sections");
  const socialLinks = getArray("socialLinks");

  return (
    <footer className={`footer bg-base-200 text-base-content p-10 ${className}`}>
      <nav>
        <h6 className="footer-title">
          {logo.src ? (
            <img src={logo.src} alt={logo.alt || brandName || "Logo"} className="h-8" />
          ) : (
            brandName || "Brand"
          )}
        </h6>
        {description && <p className="text-sm opacity-70">{description}</p>}
      </nav>
      {footerSections.map((section: any, idx: number) => (
        <nav key={idx}>
          <h6 className="footer-title">{section.title || "Links"}</h6>
          {Array.isArray(section.links) && section.links.map((link: any, linkIdx: number) => (
            <a key={linkIdx} href={link.link || "#"} className="link link-hover">
              {link.label || link.content || "Link"}
            </a>
          ))}
        </nav>
      ))}
      {socialLinks.length > 0 && (
        <nav>
          <h6 className="footer-title">Social</h6>
          <div className="grid grid-flow-col gap-4">
            {socialLinks.map((social: any, idx: number) => (
              <a key={idx} href={social.link || "#"} className="link link-hover">
                {social.label || social.content || "Social"}
              </a>
            ))}
          </div>
        </nav>
      )}
      <aside>
        <p className="text-sm opacity-70">{copyright}</p>
      </aside>
    </footer>
  );
};

export default DaisyUIFooter;
