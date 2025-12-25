"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Label } from "../ui/label";
import type { ComponentSchema, SchemaItem } from "../../../sparti-cms/types/schema";

type PreviewProps = {
  component: ComponentSchema;
  compact?: boolean;
};

type ArrayElement = Record<string, any>;

function toTitle(s: string) {
  if (!s) return "";
  return s
    .replace(/([A-Z])/g, " $1")
    .replace(/-/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function getHeading(items: SchemaItem[]): { text: string; level: number } | null {
  // Prefer explicit 'title' or heading-type item
  const byKey = items.find((i) => i.key?.toLowerCase() === "title" && typeof i.content === "string");
  if (byKey) return { text: String(byKey.content), level: byKey.level || 2 };
  const byType = items.find((i) => i.type === "heading" && typeof i.content === "string");
  if (byType) return { text: String(byType.content), level: byType.level || 2 };
  // Fallback to any text labeled as title/heading
  const heuristic = items.find(
    (i) =>
      typeof i.content === "string" &&
      (i.key?.toLowerCase().includes("title") || i.key?.toLowerCase().includes("heading"))
  );
  if (heuristic) return { text: String(heuristic.content), level: 2 };
  return null;
}

function getDescription(items: SchemaItem[]): string | null {
  const byDescKey = items.find(
    (i) =>
      typeof i.content === "string" &&
      (i.key?.toLowerCase() === "description" || i.key?.toLowerCase() === "subtitle" || i.key?.toLowerCase() === "content")
  );
  if (byDescKey) return String(byDescKey.content);
  const byType = items.find((i) => i.type === "text" && typeof i.content === "string");
  if (byType) return String(byType.content);
  return null;
}

function collectImages(items: SchemaItem[]): Array<{ url: string; alt?: string; title?: string }> {
  const imgs: Array<{ url: string; alt?: string; title?: string }> = [];

  // Direct image items
  items.forEach((i) => {
    if (i.type === "image") {
      const url = (i.src as string) || "";
      if (url) imgs.push({ url, alt: i.alt, title: i.label });
    }
  });

  // Look into arrays (gallery/carousel/items)
  items.forEach((i) => {
    if (i.type === "array" || i.type === "gallery" || i.type === "carousel" || Array.isArray(i.items)) {
      const arr =
        i.type === "carousel" && Array.isArray(i.images)
          ? (i.images as ArrayElement[])
          : Array.isArray(i.items)
          ? (i.items as ArrayElement[])
          : [];

      arr.forEach((el) => {
        const url =
          (typeof el?.url === "string" && el.url) ||
          (typeof el?.src === "string" && el.src) ||
          (typeof el?.image === "string" && el.image) ||
          "";
        if (url) {
          imgs.push({
            url,
            alt: typeof el?.alt === "string" ? el.alt : undefined,
            title: typeof el?.title === "string" ? el.title : undefined,
          });
        }
      });
    }
  });

  return imgs;
}

function collectArrayItems(items: SchemaItem[]): ArrayElement[] {
  const out: ArrayElement[] = [];
  items.forEach((i) => {
    if (i.type === "array" && Array.isArray(i.items)) {
      i.items.forEach((el: any) => out.push(el));
    } else if ((i.type === "gallery" || i.type === "carousel") && Array.isArray((i as any).value)) {
      (i as any).value.forEach((el: any) => out.push(el));
    }
  });
  return out;
}

const ComponentPreview: React.FC<PreviewProps> = ({ component, compact = false }) => {
  const items = Array.isArray(component.items) ? component.items : [];
  const heading = getHeading(items);
  const description = getDescription(items);
  const images = collectImages(items);
  const arrayItems = collectArrayItems(items);

  // Detect background image for hero-like sections (key hints or first image)
  const backgroundImg =
    images.find((img, idx) => {
      const keyHints = ["background", "bg", "hero", "banner"];
      const hasHint = keyHints.some((k) =>
        (component?.key || "").toLowerCase().includes(k) ||
        (component?.type || "").toLowerCase().includes(k)
      );
      return hasHint || idx === 0;
    }) || images[0];

  // Decide the layout
  const isCarousel =
    items.some((i) => i.type === "carousel") || (images.length >= 4 && !arrayItems.length);

  const isCardsGrid =
    arrayItems.length > 0 ||
    (component.type || "").toLowerCase().includes("services") ||
    (component.type || "").toLowerCase().includes("testimonials") ||
    (component.type || "").toLowerCase().includes("faq");

  const showHero =
    !isCarousel &&
    !!backgroundImg?.url &&
    !!heading?.text;

  const showSimpleSection = !isCarousel && !isCardsGrid && !showHero;

  return (
    <div className="w-full">
      {/* HERO section: full-bleed background with overlay text */}
      {showHero && (
        <div
          className="relative w-full min-h-[50vh] md:min-h-[60vh] lg:min-h-[70vh] overflow-hidden"
          style={{ backgroundColor: "#000" }}
        >
          <img
            src={backgroundImg!.url}
            alt={backgroundImg!.alt || backgroundImg!.title || "Background"}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
            <div className="max-w-4xl">
              <h1 className="text-white font-semibold tracking-tight"
                  style={{ fontSize: "clamp(2rem, 9vw, 6rem)", lineHeight: 1.1 }}>
                {heading!.text}
              </h1>
              {description && (
                <p className="mt-4 text-white/85 text-sm md:text-base max-w-2xl mx-auto">
                  {description.replace(/<[^>]+>/g, "")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Carousel: slides with optional overlay heading/desc per section */}
      {isCarousel && (
        <div className="relative w-full">
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((img, idx) => (
                <CarouselItem key={`${img.url}-${idx}`} className="basis-full">
                  <div className="relative w-full min-h-[50vh] md:min-h-[60vh] lg:min-h-[70vh] overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.alt || img.title || `Slide ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/25" />
                    {(heading?.text || description) && (
                      <div className="relative z-10 h-full flex items-center justify-center px-6 text-center">
                        <div className="max-w-4xl">
                          {heading?.text && (
                            <h2 className="text-white font-semibold tracking-tight"
                                style={{ fontSize: "clamp(1.75rem, 7vw, 4.5rem)", lineHeight: 1.1 }}>
                              {heading.text}
                            </h2>
                          )}
                          {description && (
                            <p className="mt-3 text-white/85 text-sm md:text-base max-w-2xl mx-auto">
                              {description.replace(/<[^>]+>/g, "")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* Cards grid */}
      {isCardsGrid && !isCarousel && !showHero && (
        <div className="w-full py-8">
          {description && (
            <p className="text-center text-muted-foreground mb-6">
              {description.replace(/<[^>]+>/g, "")}
            </p>
          )}
          <div
            className="grid gap-4 px-4 md:px-6"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
          >
            {(arrayItems.length ? arrayItems : items)
              .slice(0, compact ? 3 : undefined)
              .map((el: any, idx: number) => {
                const title =
                  el?.title ||
                  el?.name ||
                  el?.label ||
                  items.find((i) => i.key === "title")?.content ||
                  "";
                const text =
                  el?.description ||
                  el?.content ||
                  el?.text ||
                  items.find((i) => i.key === "description")?.content ||
                  "";
                const img =
                  (typeof el?.img === "string" && el.img) ||
                  (typeof el?.src === "string" && el.src) ||
                  (typeof el?.url === "string" && el.url) ||
                  (typeof el?.image === "string" && el.image) ||
                  "";

                return (
                  <Card key={idx} className="border bg-white">
                    <CardContent className="p-3 space-y-2">
                      {img && (
                        <div className="aspect-video rounded-md overflow-hidden border bg-muted">
                          <img
                            src={img}
                            alt={title || `Card ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      )}
                      {title && (
                        <h4 className="text-sm font-semibold">{title}</h4>
                      )}
                      {text && (
                        <p className="text-xs text-muted-foreground line-clamp-4">
                          {text.replace(/<[^>]+>/g, "")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Simple section (text + optional single image) */}
      {showSimpleSection && (
        <div className="w-full py-10 px-6 md:px-8">
          <div className="max-w-4xl mx-auto space-y-3 text-center">
            {heading?.text && (
              <h3 className="text-xl md:text-2xl font-semibold">{heading.text}</h3>
            )}
            {description && (
              <p className="text-sm md:text-base text-muted-foreground">
                {description.replace(/<[^>]+>/g, "")}
              </p>
            )}
            {!description && !heading?.text && (
              <p className="text-xs text-muted-foreground">No text content</p>
            )}
            {images[0]?.url && (
              <div className="mt-4 aspect-video rounded-md overflow-hidden border bg-muted">
                <img
                  src={images[0].url}
                  alt={images[0].alt || images[0].title || "Section image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentPreview;