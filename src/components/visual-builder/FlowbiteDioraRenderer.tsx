"use client";

import React, { useState } from "react";
import type { ComponentSchema, SchemaItem } from "../../../sparti-cms/types/schema";
import FlowbiteSection from "@/libraries/flowbite/components/FlowbiteSection";
import FlowbiteBlogHero from "@/libraries/flowbite/components/FlowbiteBlogHero";
import FlowbiteBlogGrid from "@/libraries/flowbite/components/FlowbiteBlogGrid";
import FlowbiteBlogSidebar from "@/libraries/flowbite/components/FlowbiteBlogSidebar";
import FlowbiteShowcase from "@/libraries/flowbite/components/FlowbiteShowcase";
import FlowbiteProductGrid from "@/libraries/flowbite/components/FlowbiteProductGrid";
import FlowbiteSocialMedia from "@/libraries/flowbite/components/FlowbiteSocialMedia";
import FlowbiteServicesGrid from "@/libraries/flowbite/components/FlowbiteServicesGrid";
import FlowbiteReviews from "@/libraries/flowbite/components/FlowbiteReviews";
import FlowbiteContentSection from "@/libraries/flowbite/components/FlowbiteContentSection";
import FlowbitePainPointSection from "@/libraries/flowbite/components/FlowbitePainPointSection";
import FlowbiteSEOResultsSection from "@/libraries/flowbite/components/FlowbiteSEOResultsSection";
import FlowbiteWhatIsSEOSection from "@/libraries/flowbite/components/FlowbiteWhatIsSEOSection";
import FlowbiteTestimonialsSection from "@/libraries/flowbite/components/FlowbiteTestimonialsSection";
import FlowbiteFAQSection from "@/libraries/flowbite/components/FlowbiteFAQSection";
import FlowbiteNewsletter from "@/libraries/flowbite/components/FlowbiteNewsletter";
import FlowbitePageTitle from "@/libraries/flowbite/components/FlowbitePageTitle";
import FlowbiteContent from "@/libraries/flowbite/components/FlowbiteContent";
import FlowbiteHeroSection from "@/libraries/flowbite/components/FlowbiteHeroSection";
import FlowbiteFeaturesSection from "@/libraries/flowbite/components/FlowbiteFeaturesSection";
import FlowbiteProductSection from "@/libraries/flowbite/components/FlowbiteProductSection";
import FlowbiteVideoSection from "@/libraries/flowbite/components/FlowbiteVideoSection";
import FlowbiteWhatsIncludedSection from "@/libraries/flowbite/components/FlowbiteWhatsIncludedSection";
import FlowbiteWhyChooseUsSection from "@/libraries/flowbite/components/FlowbiteWhyChooseUsSection";
import FlowbiteCTASection from "@/libraries/flowbite/components/FlowbiteCTASection";
import { SpartiBuilderProvider, useSpartiBuilder } from "../../../sparti-cms/components/SpartiBuilderProvider";
import { ResizableDivider, useResizableDivider } from "./ResizableDivider";
import { ElementSelector } from "../../../sparti-cms/components/ElementSelector";
import { EditingOverlay } from "../../../sparti-cms/components/EditingOverlay";
import { ContentEditPanel } from "../../../sparti-cms/components/ContentEditPanel";
import FlowbiteSectionList from "./FlowbiteSectionList";
import "../../../sparti-cms/components/sparti-builder.css";

interface FlowbiteDioraRendererProps {
  components: ComponentSchema[];
  pageContext?: {
    pageId?: string;
    slug?: string;
    pageName?: string;
    tenantId?: string;
    themeId?: string;
  };
}

const getText = (items: SchemaItem[], key: string) => {
  const item = items.find(
    (i) =>
      i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
  ) as any;
  return item?.content || "";
};

const getHeading = (items: SchemaItem[], key: string, level?: number) => {
  const item = items.find(
    (i) =>
      i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading" &&
      (level === undefined || (i as any).level === level)
  ) as any;
  return item?.content || "";
};

const getButton = (items: SchemaItem[], key: string) => {
  const item = items.find(
    (i) =>
      (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
  ) as any;
  return {
    content: item?.content || "",
    link: item?.link || "#",
    icon: item?.icon
  };
};

const getArray = (items: SchemaItem[], key: string) => {
  const arr = items.find(
    (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
  ) as any;
  return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
};

const findImageItem = (items: any[]) => {
  return (
    items.find(
      (i) => i?.type === "image" && typeof i?.src === "string"
    ) || null
  );
};

const normalizeType = (t?: string) => (t || "").toLowerCase();

/* Sections */

function SectionHero({ items }: { items: SchemaItem[] }) {
  // Extract all fields using Diora pattern
  const badge = items.find((i) => i.key?.toLowerCase() === "badge");
  const highlight = items.find((i) => i.key?.toLowerCase() === "highlight");
  const title = items.find((i) => i.key?.toLowerCase() === "title");
  const headingPrefix = items.find((i) => i.key?.toLowerCase() === "headingprefix");
  const headingEmphasis = items.find((i) => i.key?.toLowerCase() === "headingemphasis");
  const description = items.find((i) => i.key?.toLowerCase() === "description");
  const button = items.find((i) => i.key?.toLowerCase() === "button" && i.type === "button");
  const showScrollArrow = items.find((i) => i.key?.toLowerCase() === "showscrollarrow");
  
  // Extract image/slides (existing functionality)
  const slides = getArray(items, "slides").filter((s: any) => !!s?.src);
  const welcomeText = getText(items, "welcomeText");
  const logo = items.find(
    (i) => i.key?.toLowerCase() === "logo" && i.type === "image"
  ) as any;
  const fallbackImg = (items.find((i) => i.type === "image") as any) || null;
  const hasSlides = slides.length > 0;
  const [index, setIndex] = useState(0);

  const currentImg = hasSlides ? slides[index] : fallbackImg;
  
  // Determine title text - try multiple sources
  const titleText = 
    headingEmphasis?.content || 
    highlight?.content || 
    title?.content || 
    getHeading(items, "title", 1) || 
    getText(items, "title") || 
    "";
  
  // Determine description text
  const descriptionText = description?.content || getText(items, "description") || "";
  
  // Determine button
  const buttonData = button ? {
    content: (button as any).content || "",
    link: (button as any).link || "#",
    icon: (button as any).icon
  } : getButton(items, "button");
  
  // Check if scroll arrow should be shown
  const shouldShowScrollArrow = showScrollArrow 
    ? (showScrollArrow as any).value === true || (showScrollArrow as any).content === "true"
    : false;

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full min-h-[60vh] sm:min-h-[70vh] overflow-hidden rounded-lg pb-20">
      {currentImg?.src ? (
        <>
          <img
            src={currentImg.src}
            alt={currentImg.alt || "Hero"}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-black/40" data-sparti-ignore />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
      )}
      
      <div className="relative z-10 flex h-full items-center justify-center px-6 py-12">
        <div className="max-w-4xl text-center space-y-6">
          {/* Badge/Welcome Text */}
          {(badge?.content || welcomeText) ? (
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {badge?.content || welcomeText}
            </div>
          ) : null}
          
          {/* Logo */}
          {logo?.src ? (
            <div className="flex justify-center mb-4">
              <img
                src={logo.src}
                alt={logo.alt || "Logo"}
                className="h-12 w-auto opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : null}
          
          {/* Title */}
          {titleText ? (
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              {headingPrefix?.content ? (
                <>
                  <span>{headingPrefix.content} </span>
                  {headingEmphasis?.content ? (
                    <span className="text-blue-300">{headingEmphasis.content}</span>
                  ) : (
                    <span>{titleText}</span>
                  )}
                </>
              ) : (
                titleText
              )}
            </h1>
          ) : null}
          
          {/* Description */}
          {descriptionText ? (
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {descriptionText}
            </p>
          ) : null}
          
          {/* Button */}
          {buttonData.content ? (
            <div className="pt-4">
              <a
                href={buttonData.link || "#"}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors font-medium text-base"
              >
                {buttonData.content}
                {buttonData.icon === "arrowRight" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                )}
              </a>
            </div>
          ) : null}
        </div>
      </div>

      {/* Scroll Arrow */}
      {shouldShowScrollArrow ? (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      ) : null}

      {/* Slide Navigation */}
      {hasSlides && slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 z-10">
          <button
            onClick={prev}
            className="rounded-lg bg-white/80 px-3 py-1 text-sm hover:bg-white transition-colors"
            aria-label="Previous slide"
          >
            Prev
          </button>
          <div className="flex items-center gap-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="rounded-lg bg-white/80 px-3 py-1 text-sm hover:bg-white transition-colors"
            aria-label="Next slide"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}

function SectionServices({ items }: { items: SchemaItem[] }) {
  // Extract title - try heading first, then text
  const titleItem = items.find((i) => i.key?.toLowerCase() === "title");
  const title = titleItem?.type === "heading" 
    ? (titleItem as any).content 
    : getHeading(items, "title", 2) || getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const description = getText(items, "description");
  const services = getArray(items, "services");

  const cards = services
    .map((col: any) => (Array.isArray(col?.items) ? col.items : []))
    .map((colItems: any[]) => {
      const img = findImageItem(colItems);
      const btn = colItems.find(
        (i) => i?.type === "button" && typeof i?.content === "string"
      );
      // Extract title and description from service item
      const serviceTitle = getHeading(colItems, "title", 2) || 
                          getText(colItems, "title") || 
                          (colItems.find((i) => i.key?.toLowerCase() === "title") as any)?.content ||
                          img?.title;
      const serviceDescription = getText(colItems, "description") || 
                                 (colItems.find((i) => i.key?.toLowerCase() === "description") as any)?.content ||
                                 img?.alt;
      return { img, btn, title: serviceTitle, description: serviceDescription };
    })
    .filter((c) => c.img?.src || c.title || c.description);

  if (cards.length === 0 && !title && !subtitle) return null;

  return (
    <FlowbiteSection title={title || undefined} subtitle={subtitle || undefined}>
      {description ? (
        <p className="mt-4 text-sm text-gray-600 max-w-3xl">{description}</p>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {card.img?.src ? (
              <div className="aspect-[4/3] bg-gray-100">
                <img
                  src={card.img.src}
                  alt={
                    card.img.alt || card.img.title || card.title || `Service ${idx + 1}`
                  }
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            ) : null}
            <div className="space-y-2 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                {card.title ? (
                  <h3 className="text-base font-semibold text-gray-900">
                    {card.title}
                  </h3>
                ) : null}
                {card.img?.price ? (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                    {card.img.price}
                  </span>
                ) : null}
              </div>
              {card.description ? (
                <p className="line-clamp-3 text-sm text-gray-600">
                  {card.description}
                </p>
              ) : null}
              {card.btn?.content ? (
                <a
                  href={card.btn.link || "#"}
                  className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors font-medium"
                >
                  {card.btn.content}
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </FlowbiteSection>
  );
}

function SectionFeatures({ items }: { items: SchemaItem[] }) {
  // Extract title - try heading first, then text
  const titleItem = items.find((i) => i.key?.toLowerCase() === "title");
  const title = titleItem?.type === "heading" 
    ? (titleItem as any).content 
    : getHeading(items, "title", 2) || getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const description = getText(items, "description");
  const features = getArray(items, "features");

  // Extract all fields from each feature item
  const featureCards = features
    .map((f: any) => {
      const featureItems = Array.isArray(f?.items) ? f.items : [];
      const img = findImageItem(featureItems) || (f?.src ? f : null);
      const featureTitle = getHeading(featureItems, "title", 2) || 
                          getText(featureItems, "title") || 
                          (featureItems.find((i) => i.key?.toLowerCase() === "title") as any)?.content ||
                          f?.title;
      const featureDescription = getText(featureItems, "description") || 
                                (featureItems.find((i) => i.key?.toLowerCase() === "description") as any)?.content ||
                                f?.description;
      const featureButton = getButton(featureItems, "button");
      return { 
        img, 
        title: featureTitle, 
        description: featureDescription,
        button: featureButton,
        alt: img?.alt || f?.alt
      };
    })
    .filter((f) => f.img?.src || f.title || f.description);

  if (featureCards.length === 0 && !title && !subtitle) return null;

  return (
    <FlowbiteSection title={title || undefined} subtitle={subtitle || undefined}>
      {description ? (
        <p className="mt-4 text-sm text-gray-600 max-w-3xl">{description}</p>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((f: any, idx: number) => (
          <div
            key={idx}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {f.img?.src ? (
              <div className="aspect-[4/3] bg-gray-100">
                <img
                  src={f.img.src}
                  alt={f.alt || f.title || `Feature ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            ) : null}
            <div className="space-y-2 p-4">
              {f.title ? (
                <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
              ) : null}
              {f.description ? (
                <p className="text-sm text-gray-600">{f.description}</p>
              ) : null}
              {f.button?.content ? (
                <a
                  href={f.button.link || "#"}
                  className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors font-medium"
                >
                  {f.button.content}
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </FlowbiteSection>
  );
}

function SectionIngredients({ items }: { items: SchemaItem[] }) {
  const title = getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const description = getText(items, "description");
  const ingredients = getArray(items, "ingredients").filter(
    (ing: any) => !!ing?.src || !!ing?.name || !!ing?.benefit
  );

  if (ingredients.length === 0 && !title && !subtitle) return null;

  return (
    <FlowbiteSection title={title || undefined} subtitle={subtitle || undefined}>
      {description ? (
        <p className="mt-4 text-sm text-gray-600 max-w-3xl">{description}</p>
      ) : null}
      <div
        className="mt-8 grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        {ingredients.map((ing: any, idx: number) => (
          <div key={idx} className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-3">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              {ing?.src ? (
                <img
                  src={ing.src}
                  alt={ing.name || `Ingredient ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : null}
            </div>
            {ing?.name ? (
              <h4 className="mt-2 text-sm font-semibold text-gray-900">{ing.name}</h4>
            ) : null}
            {ing?.benefit ? (
              <p className="text-xs text-gray-600 mt-1">{ing.benefit}</p>
            ) : null}
          </div>
        ))}
      </div>
    </FlowbiteSection>
  );
}

function SectionTeam({ items }: { items: SchemaItem[] }) {
  const title = getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const description = getText(items, "description");
  const team = getArray(items, "teamMembers").filter(
    (m: any) => !!m?.src || !!m?.name
  );

  if (team.length === 0 && !title && !subtitle) return null;

  return (
    <FlowbiteSection title={title || undefined} subtitle={subtitle || undefined}>
      {description ? (
        <p className="mt-4 text-sm text-gray-600 max-w-3xl">{description}</p>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m: any, idx: number) => (
          <div
            key={idx}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {m?.src ? (
              <div className="aspect-[4/3] bg-gray-100">
                <img
                  src={m.src}
                  alt={m.name || `Member ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            ) : null}
            <div className="space-y-2 p-4">
              {m?.name ? (
                <h3 className="text-base font-semibold text-gray-900">{m.name}</h3>
              ) : null}
              {m?.role ? (
                <p className="text-xs text-gray-500 font-medium">{m.role}</p>
              ) : null}
              {m?.description ? (
                <p className="text-sm text-gray-600">{m.description}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </FlowbiteSection>
  );
}

function SectionAbout({ items }: { items: SchemaItem[] }) {
  // Extract title - try heading first, then text
  const titleItem = items.find((i) => i.key?.toLowerCase() === "title");
  const title = titleItem?.type === "heading" 
    ? (titleItem as any).content 
    : getHeading(items, "title", 2) || getText(items, "title");
  const description = getText(items, "description");
  const subtitle = getText(items, "subtitle");
  const button = getButton(items, "button");
  const imageItem = items.find(
    (i) => i.key?.toLowerCase() === "image" && i.type === "image"
  ) as any;

  if (!title && !description && !imageItem?.src) return null;

  return (
    <FlowbiteSection 
      title={title || undefined} 
      subtitle={subtitle || undefined}
      containerClassName="grid items-center gap-8 md:grid-cols-2"
    >
      <div className="space-y-4">
        {description ? (
          <p className="text-base text-gray-600 leading-relaxed">{description}</p>
        ) : null}
        {button.content ? (
          <a
            href={button.link || "#"}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors font-medium"
          >
            {button.content}
            {button.icon === "arrowRight" && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
          </a>
        ) : null}
      </div>
      {imageItem?.src ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm">
          <img
            src={imageItem.src}
            alt={imageItem.alt || "About image"}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
      ) : null}
    </FlowbiteSection>
  );
}

const FlowbiteDioraRenderer: React.FC<FlowbiteDioraRendererProps> = ({
  components,
  pageContext,
}) => {
  const VisualContent: React.FC = () => {
    const { components: ctxComponents } = useSpartiBuilder();
    const list = Array.isArray(ctxComponents) && ctxComponents.length > 0 ? ctxComponents : components;

    return (
      <ElementSelector>
        <main className="w-full">
          {list.map((comp, idx) => {
            const t = normalizeType(comp.type || comp.name || comp.key);

            if (
              t.includes("herosection") ||
              t === "herosection" ||
              t === "herosectionsimple" ||
              t.includes("herocarousel") ||
              t.includes("hero-carousel") ||
              (t.includes("hero") && t.includes("carousel")) ||
              t.includes("hero")
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <SectionHero items={comp.items || []} />
                </div>
              );
            }
            if (
              t.includes("servicessection") ||
              t.includes("services-grid") ||
              t.includes("services")
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <SectionServices items={comp.items || []} />
                </div>
              );
            }
            if (t.includes("featuressection") || t.includes("features")) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <SectionFeatures items={comp.items || []} />
                </div>
              );
            }
            if (t.includes("ingredientssection") || t.includes("ingredients")) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <SectionIngredients items={comp.items || []} />
                </div>
              );
            }
            if (t.includes("teamsection") || t.includes("team")) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <SectionTeam items={comp.items || []} />
                </div>
              );
            }
            if (t.includes("aboutsection") || t.includes("about")) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <SectionAbout items={comp.items || []} />
                </div>
              );
            }
            if (
              t.includes("bloghero") ||
              t.includes("blog-hero") ||
              (t.includes("blog") && t.includes("hero"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteBlogHero component={comp} />
                </div>
              );
            }
            if (
              t.includes("bloggrid") ||
              t.includes("blog-grid") ||
              t.includes("blogposts") ||
              (t.includes("blog") && (t.includes("grid") || t.includes("posts")))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteBlogGrid component={comp} />
                </div>
              );
            }
            if (
              t.includes("blogsidebar") ||
              t.includes("blog-sidebar") ||
              (t.includes("blog") && t.includes("sidebar"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteBlogSidebar component={comp} />
                </div>
              );
            }
            // Showcase / Category Showcase
            if (
              t.includes("showcase") ||
              t.includes("categoryshowcase") ||
              t.includes("category-showcase") ||
              (t.includes("category") && t.includes("showcase"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteShowcase component={comp} />
                </div>
              );
            }
            // Product Grid
            if (
              t.includes("productgrid") ||
              t.includes("product-grid") ||
              t.includes("productgridshowcase") ||
              (t.includes("product") && t.includes("grid"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteProductGrid component={comp} />
                </div>
              );
            }
            // Social Media / Instagram
            if (
              t.includes("socialmedia") ||
              t.includes("social-media") ||
              t.includes("instagram") ||
              t.includes("instagramsection") ||
              (t.includes("social") && t.includes("media"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteSocialMedia component={comp} />
                </div>
              );
            }
            // Services Grid
            if (
              t.includes("servicesgrid") ||
              t.includes("services-grid") ||
              (t.includes("services") && t.includes("grid"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteServicesGrid component={comp} />
                </div>
              );
            }
            // Reviews / Testimonials
            if (
              t.includes("reviews") ||
              t.includes("reviewssection") ||
              t.includes("testimonials") ||
              (t.includes("review") && !t.includes("preview"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteReviews component={comp} />
                </div>
              );
            }
            // Content Section / Brand Story
            if (
              t.includes("contentsection") ||
              t.includes("content-section") ||
              t.includes("brandstory") ||
              t.includes("brand-story") ||
              (t.includes("content") && t.includes("section"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteContentSection component={comp} />
                </div>
              );
            }
            if (
              t.includes("painpoint") ||
              t.includes("pain-point") ||
              (t.includes("pain") && t.includes("point"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbitePainPointSection component={comp} />
                </div>
              );
            }
            if (
              t.includes("seoresults") ||
              t.includes("seo-results") ||
              (t.includes("seo") && t.includes("results"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteSEOResultsSection component={comp} />
                </div>
              );
            }
            if (
              t.includes("whatisseo") ||
              t.includes("what-is-seo") ||
              (t.includes("what") && t.includes("seo"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteWhatIsSEOSection component={comp} />
                </div>
              );
            }
            if (
              t.includes("testimonials") ||
              t.includes("testimonial") ||
              t.includes("reviews")
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteTestimonialsSection component={comp} />
                </div>
              );
            }
            if (
              t.includes("faq") ||
              t.includes("accordion") ||
              t.includes("questions") ||
              t === "accordion"
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteFAQSection component={comp} />
                </div>
              );
            }
            if (
              t.includes("newsletter") ||
              t === "newsletter"
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteNewsletter component={comp} />
                </div>
              );
            }
            if (
              t.includes("pagetitle") ||
              t.includes("page-title") ||
              t === "pagetitle"
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbitePageTitle component={comp} />
                </div>
              );
            }
            if (
              (t === "content" && !t.includes("section")) ||
              (t.includes("content") && !t.includes("section") && !t.includes("image"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteContent component={comp} />
                </div>
              );
            }
            // Hero Section
            if (
              t.includes("herosection") ||
              t.includes("hero-section") ||
              (t.includes("hero") && !t.includes("blog"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteHeroSection component={comp} />
                </div>
              );
            }
            // Features Section
            if (
              t.includes("featuressection") ||
              t.includes("features-section") ||
              (t.includes("features") && t.includes("section"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteFeaturesSection component={comp} />
                </div>
              );
            }
            // Product Section
            if (
              t.includes("productsection") ||
              t.includes("product-section") ||
              (t.includes("product") && t.includes("section") && !t.includes("grid"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteProductSection component={comp} />
                </div>
              );
            }
            // Video Section
            if (
              t.includes("videosection") ||
              t.includes("video-section") ||
              (t.includes("video") && t.includes("section"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteVideoSection component={comp} />
                </div>
              );
            }
            // What's Included Section
            if (
              t.includes("whatsincludedsection") ||
              t.includes("whats-included-section") ||
              t.includes("whatsincluded") ||
              (t.includes("whats") && t.includes("included"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteWhatsIncludedSection component={comp} />
                </div>
              );
            }
            // Why Choose Us Section
            if (
              t.includes("whychooseussection") ||
              t.includes("why-choose-us-section") ||
              t.includes("whychooseus") ||
              (t.includes("why") && t.includes("choose"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteWhyChooseUsSection component={comp} />
                </div>
              );
            }
            // CTA Section
            if (
              t.includes("ctasection") ||
              t.includes("cta-section") ||
              (t.includes("cta") && t.includes("section"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteCTASection component={comp} />
                </div>
              );
            }
            // Testimonials Section (alternative to Reviews)
            if (
              t.includes("testimonialssection") ||
              t.includes("testimonials-section") ||
              (t.includes("testimonials") && t.includes("section"))
            ) {
              return (
                <div data-sparti-component-index={idx} data-sparti-section={t} key={`sec-${idx}`}>
                  <FlowbiteTestimonialsSection component={comp} />
                </div>
              );
            }

            // Only render Diora template components - skip non-Diora components
            return null;
          })}
        </main>
      </ElementSelector>
    );
  };

  const Layout: React.FC = () => {
    const { selectedElement } = useSpartiBuilder();
    const { width, setWidth } = useResizableDivider(420, 300, 800, 'flowbite-editor-sidebar-width');

    return (
      <div className="flex w-full h-full">
        {/* Left: Sections list (sticky) */}
        <FlowbiteSectionList />

        {/* Middle: preview (bigger when editor is hidden) */}
        <div className="flex-1 min-w-0 overflow-auto">
          <div className="w-full h-full">
            <VisualContent />
            <EditingOverlay />
          </div>
        </div>

        {/* Right: editor only when a section is selected */}
        {selectedElement ? (
          <>
            <ResizableDivider
              width={width}
              onWidthChange={setWidth}
              minWidth={300}
              maxWidth={800}
            />
            <div
              className="sticky top-0 h-screen border-l bg-background flex flex-col sparti-editor-sticky"
              style={{
                width: `${width}px`,
                minWidth: `${width}px`,
                maxWidth: `${width}px`,
              }}
              onWheel={(e) => {
                // Prevent scroll propagation to the center preview
                e.stopPropagation();
              }}
            >
              <ContentEditPanel />
            </div>
          </>
        ) : null}
      </div>
    );
  };

  return (
    <SpartiBuilderProvider
      components={components}
      pageId={pageContext?.pageId}
      slug={pageContext?.slug}
      tenantId={pageContext?.tenantId}
      themeId={pageContext?.themeId}
    >
      <Layout />
    </SpartiBuilderProvider>
  );
};

export default FlowbiteDioraRenderer;