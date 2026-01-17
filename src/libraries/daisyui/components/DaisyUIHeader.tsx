"use client";

import React, { useState } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface DaisyUIHeaderProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI Header Component
 * 
 * Header/navbar using DaisyUI navbar utility classes
 */
const DaisyUIHeader: React.FC<DaisyUIHeaderProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
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
  const menuItems = getArray("menuItems");
  const cta = getButton("cta");

  return (
    <div className={`navbar bg-base-100 ${className}`}>
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          {mobileOpen && (
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              {menuItems.map((item: any, idx: number) => (
                <li key={idx}>
                  <a href={item.link || "#"}>{item.label || item.content || "Link"}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <a className="btn btn-ghost text-xl" href="/">
          {logo.src ? (
            <img src={logo.src} alt={logo.alt || brandName || "Logo"} className="h-8" />
          ) : (
            brandName || "Brand"
          )}
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {menuItems.map((item: any, idx: number) => (
            <li key={idx}>
              <a href={item.link || "#"}>{item.label || item.content || "Link"}</a>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end">
        {cta.content && (
          <a href={cta.link} className="btn btn-primary">
            {cta.content}
          </a>
        )}
      </div>
    </div>
  );
};

export default DaisyUIHeader;
