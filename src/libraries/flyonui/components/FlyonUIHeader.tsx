"use client";

import React, { useState } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface FlyonUIHeaderProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * FlyonUI Header Component
 * 
 * Navigation header with logo, menu items, and CTA
 */
const FlyonUIHeader: React.FC<FlyonUIHeaderProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];
  const [isOpen, setIsOpen] = useState(false);

  // Helper functions
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
    return item?.src || props[key] || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
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

  const logo = getImage("logo");
  const logoText = getText("logoText");
  const menuItems = getArray("menuItems");
  const cta = getButton("cta");

  return (
    <div className={`navbar bg-base-100 ${className}`}>
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          {isOpen && (
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              {menuItems.map((item: any, index: number) => (
                <li key={index}>
                  <a href={item.link || "#"}>{item.label || item.text || item.content}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {logo ? (
          <img src={logo} alt={logoText || "Logo"} className="h-8" />
        ) : logoText ? (
          <a className="btn btn-ghost text-xl">{logoText}</a>
        ) : null}
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {menuItems.map((item: any, index: number) => (
            <li key={index}>
              <a href={item.link || "#"}>{item.label || item.text || item.content}</a>
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

export default FlyonUIHeader;
