import { CheckCircle2, ArrowRight } from "lucide-react";

import { Button } from "../ui/button";

const withBase = (path: string) => {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  if (path.startsWith("/")) return normalizedBase.replace(/\/$/, "") + path;
  return normalizedBase + path;
};

const highlights = [
  "Conversion-first sections (hero, proof, FAQs, pricing)",
  "CMS-ready content and theming per tenant",
  "Fast performance + clean SEO structure",
  "Launch quickly, iterate without a dev"
];

export const Hero = () => {
  return (
    <section className="pt-28 pb-18 lg:pt-44 lg:pb-24">
      <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Sparti Master Theme
            <span className="hidden sm:inline">— Astro + shadcn/ui</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance md:text-5xl lg:text-6xl">
            Build a site that converts.
            <span className="block text-muted-foreground">Then manage it with a CMS.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A high-performing marketing website foundation for service businesses.
            Clear structure, strong CTAs, and tenant-aware branding.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <a href={withBase("/contact")}>Book a call</a>
            </Button>
            <Button size="lg" variant="outline" className="shadow-sm" asChild>
              <a href={withBase("/pricing")}>
                See pricing <ArrowRight className="ml-1.5 size-4" />
              </a>
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xl">
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-2xl font-bold">7 days</p>
              <p className="mt-1 text-xs text-muted-foreground">Typical launch timeline</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-2xl font-bold">12+</p>
              <p className="mt-1 text-xs text-muted-foreground">Conversion sections</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border bg-background/70 p-5 shadow-lg">
            <div className="overflow-hidden rounded-2xl border bg-background">
              <img
                src="/hero.webp"
                alt="Website preview"
                className="h-auto w-full object-cover"
                loading="eager"
              />
            </div>

            <div className="mt-6 grid gap-3">
              {highlights.map((h) => (
                <div key={h} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                  <p className="text-muted-foreground">{h}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute -z-10 inset-0 bg-radial from-primary/15 via-transparent to-transparent blur-2xl" />
        </div>
      </div>
    </section>
  );
};