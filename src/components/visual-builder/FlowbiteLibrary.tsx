"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { applyFlowbiteTheme, getAvailableFlowbiteThemes } from "../../utils/flowbiteThemeManager";
import FlowbiteSection from "../../libraries/flowbite/components/FlowbiteSection";
import type { ComponentSchema, SchemaItem } from "../../../sparti-cms/types/schema";
import FlowbiteComponentPreview from "./FlowbiteComponentPreview";

// Diora Template Components - Sample data for preview
const dioraComponents: Array<{ id: string; name: string; description: string; sampleSchema: ComponentSchema }> = [
  {
    id: "hero",
    name: "Hero Section",
    description: "Full-width hero section with image, title, description, button, and scroll arrow",
    sampleSchema: {
      key: "hero-section",
      type: "HeroSection",
      items: [
        { key: "title", type: "heading", content: "Welcome to Our Brand", level: 1 },
        { key: "description", type: "text", content: "Discover our amazing products and services" },
        { key: "button", type: "button", content: "Get Started", link: "/contact" },
        { key: "showScrollArrow", type: "boolean", value: true },
        { key: "image", type: "image", src: "/placeholder.svg", alt: "Hero image" }
      ]
    }
  },
  {
    id: "services",
    name: "Services Section",
    description: "Grid of service cards with images, titles, descriptions, and buttons",
    sampleSchema: {
      key: "services-section",
      type: "ServicesSection",
      items: [
        { key: "title", type: "heading", content: "Our Services", level: 2 },
        { key: "subtitle", type: "text", content: "What we offer" },
        {
          key: "services",
          type: "array",
          items: [
            {
              items: [
                { key: "image", type: "image", src: "/placeholder.svg", alt: "Service 1", title: "Service One" },
                { key: "button", type: "button", content: "Learn More", link: "#" }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: "features",
    name: "Features Section",
    description: "Feature cards showcasing key features with images and descriptions",
    sampleSchema: {
      key: "features-section",
      type: "FeaturesSection",
      items: [
        { key: "title", type: "heading", content: "Key Features", level: 2 },
        { key: "subtitle", type: "text", content: "What makes us special" },
        {
          key: "features",
          type: "array",
          items: [
            { src: "/placeholder.svg", alt: "Feature 1", title: "Feature One", description: "Description here" }
          ]
        }
      ]
    }
  },
  {
    id: "ingredients",
    name: "Ingredients Section",
    description: "Grid of ingredient items with images, names, and benefits",
    sampleSchema: {
      key: "ingredients-section",
      type: "IngredientsSection",
      items: [
        { key: "title", type: "heading", content: "Ingredients", level: 2 },
        {
          key: "ingredients",
          type: "array",
          items: [
            { src: "/placeholder.svg", name: "Ingredient One", benefit: "Benefit description" }
          ]
        }
      ]
    }
  },
  {
    id: "team",
    name: "Team Section",
    description: "Team member cards with photos, names, roles, and descriptions",
    sampleSchema: {
      key: "team-section",
      type: "TeamSection",
      items: [
        { key: "title", type: "heading", content: "Our Team", level: 2 },
        {
          key: "teamMembers",
          type: "array",
          items: [
            { src: "/placeholder.svg", name: "John Doe", role: "CEO", description: "Team member description" }
          ]
        }
      ]
    }
  },
  {
    id: "about",
    name: "About Section",
    description: "About section with title, description, image, and optional button",
    sampleSchema: {
      key: "about-section",
      type: "AboutSection",
      items: [
        { key: "title", type: "heading", content: "About Us", level: 2 },
        { key: "description", type: "text", content: "Learn more about our company and mission" },
        { key: "image", type: "image", src: "/placeholder.svg", alt: "About image" }
      ]
    }
  }
];

const FlowbiteLibrary: React.FC = () => {
  const themes = getAvailableFlowbiteThemes();
  const [styleId, setStyleId] = useState<string>(() => {
    try {
      return localStorage.getItem("flowbite-theme") || "default";
    } catch {
      return "default";
    }
  });

  useEffect(() => {
    applyFlowbiteTheme(styleId as any);
    try {
      localStorage.setItem("flowbite-theme", styleId);
    } catch {}
  }, [styleId]);

  const sections = dioraComponents.map(c => ({ id: c.id, title: c.name }));

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div>
          <h2 className="text-lg font-semibold">Flowbite Design Library</h2>
          <p className="text-sm text-gray-500">Diora template components - Default Flowbite components.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Style:</span>
          <div className="relative">
            <select
              value={styleId}
              onChange={(e) => setStyleId(e.target.value)}
              className="w-[180px] appearance-none rounded-md border px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left: Sidebar */}
        <aside className="hidden lg:block sticky top-0 h-[calc(100vh-64px)] w-64 min-w-64 max-w-64 border-r bg-white p-4 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Design System</div>
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScrollTo(s.id)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right: Content */}
        <div className="flex-1 p-6 space-y-10">
          {dioraComponents.map((component) => (
            <FlowbiteSection key={component.id} title={component.name} id={component.id}>
              <div className="mb-4">
                <p className="text-sm text-gray-600">{component.description}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <FlowbiteComponentPreview schema={component.sampleSchema} />
              </div>
            </FlowbiteSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowbiteLibrary;