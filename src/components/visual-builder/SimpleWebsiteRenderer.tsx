"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../sparti-cms/types/schema";

interface SimpleWebsiteRendererProps {
  components: ComponentSchema[];
}

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const getText = (items: SchemaItem[], key: string) => {
  const item = items.find((i) => i.key?.toLowerCase() === key.toLowerCase() && typeof i.content === "string");
  return item ? String(item.content) : "";
};

const getArray = (items: SchemaItem[], key: string) => {
  const arr = items.find((i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array");
  return Array.isArray(arr?.items) ? arr!.items as any[] : [];
};

const findImageItem = (items: any[]) => {
  return items.find((i) => i.type === "image" && typeof i.src === "string");
};

const findButtonItem = (items: any[]) => {
  return items.find((i) => i.type === "button" && typeof i.content === "string");
};

const normalizeType = (comp: ComponentSchema) =>
  (comp.type || comp.name || comp.key || "").toLowerCase();

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "");

/* Section renderers */

const HeroSection = ({ items }: { items: SchemaItem[] }) => {
  const slides = getArray(items, "slides");
  const heroImg = findImageItem(slides) || (items.find((i) => i.type === "image") as any) || null;
  const welcomeText = getText(items, "welcomeText");
  const logoItem = items.find((i) => i.key?.toLowerCase() === "logo" && i.type === "image") as any;

  return (
    <section className="relative w-full min-h-[60vh] overflow-hidden">
      {heroImg?.src ? (
        <>
          <img
            src={heroImg.src}
            alt={heroImg.alt || "Hero"}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      ) : null}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-4xl">
          {welcomeText ? (
            <h1 className="text-white font-semibold tracking-tight" style={{ fontSize: "clamp(2rem, 8vw, 5rem)" }}>
              {welcomeText}
            </h1>
          ) : null}
        </div>
      </div>
      {logoItem?.src ? (
        <div className="absolute top-6 left-6">
          <img
            src={logoItem.src}
            alt={logoItem.alt || "Logo"}
            className="h-12 w-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      ) : null}
    </section>
  );
};

const ServicesSection = ({ items }: { items: SchemaItem[] }) => {
  const title = getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const servicesColumns = getArray(items, "services"); // columns array

  // Each column is itself an array with an image + button
  const cards = servicesColumns.map((col: any) => {
    const colItems = Array.isArray(col.items) ? col.items : [];
    const img = findImageItem(colItems);
    const btn = findButtonItem(colItems);
    return { img, btn };
  });

  return (
    <section className="w-full py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-2xl md:text-3xl font-semibold text-center">{title}</h2>}
        {subtitle && <p className="text-sm md:text-base text-muted-foreground text-center mt-2">{subtitle}</p>}

        <div className="mt-8 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {cards.map((card, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden bg-white">
              {card.img?.src ? (
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={card.img.src}
                    alt={card.img.alt || card.img.title || `Service ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                </div>
              ) : null}
              <div className="p-4 space-y-1">
                {card.img?.title ? <h3 className="text-sm font-semibold">{card.img.title}</h3> : null}
                {card.img?.price ? <p className="text-xs text-muted-foreground">{card.img.price}</p> : null}
                {card.img?.alt ? <p className="text-xs text-muted-foreground line-clamp-3">{stripTags(card.img.alt)}</p> : null}
                {card.btn?.content ? (
                  <a
                    href={card.btn.link || "#"}
                    className="inline-block mt-3 px-3 py-2 text-sm rounded bg-foreground text-background hover:opacity-90"
                  >
                    {card.btn.content}
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = ({ items }: { items: SchemaItem[] }) => {
  const title = getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const features = getArray(items, "features"); // array of image+title+description

  return (
    <section className="w-full py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-2xl md:text-3xl font-semibold text-center">{title}</h2>}
        {subtitle && <p className="text-sm md:text-base text-muted-foreground text-center mt-2">{subtitle}</p>}

        <div className="mt-8 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {features.map((f: any, idx: number) => (
            <div key={idx} className="border rounded-lg overflow-hidden bg-white">
              {f?.src ? (
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={f.src}
                    alt={f.alt || f.title || `Feature ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                </div>
              ) : null}
              <div className="p-4 space-y-1">
                {f?.title ? <h3 className="text-sm font-semibold">{f.title}</h3> : null}
                {f?.description ? <p className="text-xs text-muted-foreground line-clamp-3">{stripTags(f.description)}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const IngredientsSection = ({ items }: { items: SchemaItem[] }) => {
  const title = getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const ingredients = getArray(items, "ingredients");

  return (
    <section className="w-full py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-2xl md:text-3xl font-semibold text-center">{title}</h2>}
        {subtitle && <p className="text-sm md:text-base text-muted-foreground text-center mt-2">{subtitle}</p>}

        <div className="mt-8 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {ingredients.map((ing: any, idx: number) => (
            <div key={idx} className="border rounded-lg bg-white p-3 space-y-2">
              <div className="aspect-square bg-muted rounded overflow-hidden">
                {ing?.src ? (
                  <img
                    src={ing.src}
                    alt={ing.name || `Ingredient ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                ) : null}
              </div>
              {ing?.name ? <h4 className="text-sm font-semibold">{ing.name}</h4> : null}
              {ing?.benefit ? <p className="text-xs text-muted-foreground line-clamp-4">{stripTags(ing.benefit)}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TeamSection = ({ items }: { items: SchemaItem[] }) => {
  const title = getText(items, "title");
  const subtitle = getText(items, "subtitle");
  const team = getArray(items, "teamMembers");

  return (
    <section className="w-full py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-2xl md:text-3xl font-semibold text-center">{title}</h2>}
        {subtitle && <p className="text-sm md:text-base text-muted-foreground text-center mt-2">{subtitle}</p>}

        <div className="mt-8 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {team.map((m: any, idx: number) => (
            <div key={idx} className="border rounded-lg overflow-hidden bg-white">
              {m?.src ? (
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={m.src}
                    alt={m.name || `Member ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                </div>
              ) : null}
              <div className="p-4 space-y-1">
                {m?.name ? <h3 className="text-sm font-semibold">{m.name}</h3> : null}
                {m?.role ? <p className="text-xs text-muted-foreground">{m.role}</p> : null}
                {m?.description ? <p className="text-xs text-muted-foreground line-clamp-3">{stripTags(m.description)}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = ({ items }: { items: SchemaItem[] }) => {
  const title = getText(items, "title");
  const description = getText(items, "description");
  const imageItem = items.find((i) => i.key?.toLowerCase() === "image" && i.type === "image") as any;

  return (
    <section className="w-full py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          {title && <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>}
          {description && <p className="text-sm md:text-base text-muted-foreground">{stripTags(description)}</p>}
        </div>
        {imageItem?.src ? (
          <div className="rounded-lg overflow-hidden border bg-muted">
            <img
              src={imageItem.src}
              alt={imageItem.alt || "About image"}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
};

const GenericSection = ({ component }: { component: ComponentSchema }) => {
  const items = Array.isArray(component.items) ? component.items : [];
  const texts = items.filter((i) => i.type === "text" && typeof i.content === "string");
  const images = items.filter((i) => i.type === "image" && typeof (i as any).src === "string");

  return (
    <section className="w-full py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {texts.map((t, idx) => (
            <p key={idx} className="text-sm md:text-base text-muted-foreground">
              {stripTags(String(t.content))}
            </p>
          ))}
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          {images.map((img: any, idx: number) => (
            <div key={idx} className="aspect-video rounded overflow-hidden border bg-muted">
              <img
                src={img.src}
                alt={img.alt || `Image ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SimpleWebsiteRenderer: React.FC<SimpleWebsiteRendererProps> = ({ components }) => {
  return (
    <main className="w-full">
      {components.map((comp, idx) => {
        const t = normalizeType(comp);

        if (t.includes("herosection") || t.includes("hero")) {
          return <HeroSection key={comp.key || idx} items={comp.items || []} />;
        }
        if (t.includes("servicessection") || t.includes("services")) {
          return <ServicesSection key={comp.key || idx} items={comp.items || []} />;
        }
        if (t.includes("featuressection") || t.includes("features")) {
          return <FeaturesSection key={comp.key || idx} items={comp.items || []} />;
        }
        if (t.includes("ingredientssection") || t.includes("ingredients")) {
          return <IngredientsSection key={comp.key || idx} items={comp.items || []} />;
        }
        if (t.includes("teamsection") || t.includes("team")) {
          return <TeamSection key={comp.key || idx} items={comp.items || []} />;
        }
        if (t.includes("aboutsection") || t.includes("about")) {
          return <AboutSection key={comp.key || idx} items={comp.items || []} />;
        }
        // Fallback generic renderer
        return <GenericSection key={comp.key || idx} component={comp} />;
      })}
    </main>
  );
};

export default SimpleWebsiteRenderer;