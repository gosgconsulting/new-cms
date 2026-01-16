"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const withBase = (path: string) => {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  if (path.startsWith("/")) return normalizedBase.replace(/\/$/, "") + path;
  return normalizedBase + path;
};

const plans = [
  {
    name: "Starter",
    price: "$499",
    description: "A clean launch-ready site foundation.",
    features: [
      "Conversion-first homepage",
      "Core pages (about, contact)",
      "Tenant branding wired",
      "Basic CMS sections",
    ],
  },
  {
    name: "Growth",
    price: "$999",
    description: "Best for teams who want more proof + clarity.",
    highlight: true,
    features: [
      "Everything in Starter",
      "Pricing + FAQ sections",
      "Blog ready",
      "SEO + performance pass",
    ],
  },
  {
    name: "Scale",
    price: "$1,999",
    description: "For ongoing iteration and advanced pages.",
    features: [
      "Everything in Growth",
      "More landing pages",
      "Integrations support",
      "Ongoing optimization",
    ],
  },
] as const;

export const Pricing = ({ className }: { className?: string }) => {
  return (
    <section id="pricing" className={cn("py-24 lg:py-32", className)}>
      <div className="container max-w-5xl">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
            Pricing
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl leading-snug text-balance">
            Simple packages you can customize. Replace these values later with
            CMS-driven pricing.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-5 md:mt-14 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "rounded-3xl",
                plan.highlight && "outline-primary origin-top outline-4",
              )}
            >
              <CardContent className="flex flex-col gap-6 px-6 py-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-foreground font-semibold">{plan.name}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {plan.description}
                      </p>
                    </div>
                    {plan.highlight && (
                      <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                        Most popular
                      </span>
                    )}
                  </div>
                  <div className="mt-5">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      one-time
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="text-muted-foreground flex items-center gap-2"
                    >
                      <Check className="size-5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  asChild
                >
                  <a href={withBase("/contact")}>Book a call</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};