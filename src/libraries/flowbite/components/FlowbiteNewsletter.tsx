"use client";

import React, { useState } from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button, TextInput } from "flowbite-react";

interface FlowbiteNewsletterProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Newsletter Component
 * 
 * Newsletter subscription form with title, subtitle, placeholder, and button
 * Following Diora pattern for data extraction
 */
const FlowbiteNewsletter: React.FC<FlowbiteNewsletterProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];
  const [email, setEmail] = useState("");

  // Helper functions following Diora pattern
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

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
      icon: item?.icon
    };
  };

  // Extract data
  const title = getHeading("title", 2) || props.title || "Subscribe to our Newsletter";
  const subtitle = getHeading("subtitle", 3) || props.subtitle || "Stay updated with our latest news and offers.";
  const placeholder = getText("placeholder") || props.placeholder || "Enter your email";
  const button = getButton("button") || props.button || { content: "Subscribe", link: "#" };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription API call
    console.log('[testing] Newsletter subscription:', email);
    setEmail("");
  };

  return (
    <section className={`py-12 px-4 bg-primary/5 ${className}`}>
      <div className="container mx-auto max-w-2xl">
        <FlowbiteSection 
          title={title}
          subtitle={subtitle}
          className="text-center mb-6"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <TextInput
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" className="whitespace-nowrap">
              {button.content}
            </Button>
          </form>
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteNewsletter;

