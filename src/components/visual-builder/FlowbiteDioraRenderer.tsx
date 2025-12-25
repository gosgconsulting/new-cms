"use client";

import React, { useState } from "react";
import type { ComponentSchema, SchemaItem } from "../../../sparti-cms/types/schema";
import FlowbiteSection from "@/libraries/flowbite/components/FlowbiteSection";
import { SpartiBuilderProvider, useSpartiBuilder } from "../../../sparti-cms/components/SpartiBuilderProvider";
import { ElementSelector } from "../../../sparti-cms/components/ElementSelector";
import { EditingOverlay } from "../../../sparti-cms/components/EditingOverlay";
import { ContentEditPanel } from "../../../sparti-cms/components/ContentEditPanel";
import EditorToggle from "./EditorToggle";
import "../../../sparti-cms/components/sparti-builder.css";

interface FlowbiteDioraRendererProps {
  components: ComponentSchema[];
}

const getText = (items: SchemaItem[], key: string) => {
  const item = items.find(
    (i) =>
      i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
  ) as any;
  return item?.content || "";
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
  const slides = getArray(items, "slides").filter((s: any) => !!s?.src);
  const welcomeText = getText(items, "welcomeText");
  const logo = items.find(
    (i) => i.key?.toLowerCase() === "logo" && i.type === "image"
  ) as any;

  // If no slides array or empty, try fallback single image item
  const fallbackImg = (items.find((i) => i.type === "image") as any) || null;
  const hasSlides = slides.length > 0;
  const [index, setIndex] = useState(0);

  const currentImg = hasSlides ? slides[index] : fallbackImg;
  if (!currentImg?.src) return null;

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full min-h-[50vh] sm:min-h-[60vh] overflow-hidden rounded-lg">
      <img
        src={currentImg.src}
        alt={currentImg.alt || "Hero"}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/placeholder.svg";
        }}
      />
      <div className="absolute inset-0 bg-black/30" data-sparti-ignore />
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          {welcomeText ? (
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white mb-4">
              {welcomeText}
            </span>
          ) : null}
          {logo?.src ? (
            <div className="flex justify-center">
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
        </div>
      </div>

      {hasSlides && slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 z-10">
          <button
            onClick={prev}
            className="rounded-lg bg-white/80 px-3 py-1 text-sm hover:bg-white"
            aria-label="Previous slide"
          >
            Prev
          </button>
          <div className="flex items-center gap-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="rounded-lg bg-white/80 px-3 py-1 text-sm hover:bg-white"
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
  const title = getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const services = getArray(items, "services");

  const cards = services
    .map((col: any) => (Array.isArray(col?.items) ? col.items : []))
    .map((colItems: any[]) => {
      const img = findImageItem(colItems);
      const btn = colItems.find(
        (i) => i?.type === "button" && typeof i?.content === "string"
      );
      return { img, btn };
    })
    .filter((c) => c.img?.src);

  if (cards.length === 0 && !title && !subtitle) return null;

  return (
    <FlowbiteSection title={title || undefined} subtitle={subtitle || undefined}>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="aspect-[4/3] bg-gray-100">
              <img
                src={card.img.src}
                alt={
                  card.img.alt || card.img.title || `Service ${idx + 1}`
                }
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="space-y-1 p-4">
              <div className="flex items-center gap-2">
                {card.img?.title ? (
                  <h3 className="text-base font-semibold">
                    {card.img.title}
                  </h3>
                ) : null}
                {card.img?.price ? (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                    {card.img.price}
                  </span>
                ) : null}
              </div>
              {card.img?.alt ? (
                <p className="line-clamp-3 text-xs text-gray-500">
                  {card.img.alt}
                </p>
              ) : null}
              {card.btn?.content ? (
                <a
                  href={card.btn.link || "#"}
                  className="mt-3 inline-block rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
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
  const title = getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const features = getArray(items, "features").filter((f: any) => !!f?.src);

  if (features.length === 0 && !title && !subtitle) return null;

  return (
    <FlowbiteSection title={title || undefined} subtitle={subtitle || undefined}>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f: any, idx: number) => (
          <div
            key={idx}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="aspect-[4/3] bg-gray-100">
              <img
                src={f.src}
                alt={f.alt || f.title || `Feature ${idx + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="space-y-1 p-4">
              {f?.title ? (
                <h3 className="text-base font-semibold">{f.title}</h3>
              ) : null}
              {f?.description ? (
                <p className="text-sm text-gray-600">{f.description}</p>
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
  const ingredients = getArray(items, "ingredients").filter(
    (ing: any) => !!ing?.src || !!ing?.name || !!ing?.benefit
  );

  if (ingredients.length === 0 && !title && !subtitle) return null;

  return (
    <FlowbiteSection title={title || undefined} subtitle={subtitle || undefined}>
      <div
        className="mt-8 grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        {ingredients.map((ing: any, idx: number) => (
          <div key={idx} className="rounded-lg border bg-white p-3">
            <div className="aspect-square overflow-hidden rounded bg-gray-100">
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
              <h4 className="mt-2 text-sm font-semibold">{ing.name}</h4>
            ) : null}
            {ing?.benefit ? (
              <p className="text-xs text-gray-600">{ing.benefit}</p>
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
  const team = getArray(items, "teamMembers").filter(
    (m: any) => !!m?.src || !!m?.name
  );

  if (team.length === 0 && !title && !subtitle) return null;

  return (
    <FlowbiteSection title={title || undefined} subtitle={subtitle || undefined}>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m: any, idx: number) => (
          <div
            key={idx}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
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
            <div className="space-y-1 p-4">
              {m?.name ? (
                <h3 className="text-base font-semibold">{m.name}</h3>
              ) : null}
              {m?.role ? (
                <p className="text-xs text-gray-500">{m.role}</p>
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
  const title = getText(items, "title");
  const description = getText(items, "description");
  const imageItem = items.find(
    (i) => i.key?.toLowerCase() === "image" && i.type === "image"
  ) as any;

  if (!title && !description && !imageItem?.src) return null;

  return (
    <FlowbiteSection containerClassName="grid items-center gap-6 md:grid-cols-2">
      <div className="space-y-3">
        {title ? (
          <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
        ) : null}
        {description ? (
          <p className="text-sm md:text-base text-gray-600">{description}</p>
        ) : null}
      </div>
      {imageItem?.src ? (
        <div className="overflow-hidden rounded-lg border bg-gray-100">
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
}) => {
  if (!components || components.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No components to render
      </div>
    );
  }

  // Inner visual content that consumes builder context components
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

            return null;
          })}
        </main>
      </ElementSelector>
    );
  };

  return (
    // Provider holds components; visual content reads from context
    <SpartiBuilderProvider components={components}>
      <VisualContent />
      <EditingOverlay />
      <ContentEditPanel />
      <EditorToggle />
    </SpartiBuilderProvider>
  );
};

export default FlowbiteDioraRenderer;