import {
  LayoutTemplate,
  PencilLine,
  Search,
  Zap,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Conversion-first structure",
    description: "Hero → proof → offer → FAQs → CTA, with clear hierarchy.",
    icon: LayoutTemplate,
  },
  {
    title: "Built-in editing",
    description: "Update copy, sections, and pages from the CMS—without a developer.",
    icon: PencilLine,
  },
  {
    title: "SEO-ready",
    description: "Clean semantic structure, fast pages, and strong content organization.",
    icon: Search,
  },
  {
    title: "Fast by default",
    description: "Astro + Tailwind keeps output lean and performance high.",
    icon: Zap,
  },
  {
    title: "Tenant-aware theming",
    description: "Branding + styles load per tenant so one theme can power many sites.",
    icon: ShieldCheck,
  },
  {
    title: "Measure & iterate",
    description: "Launch quickly, then improve conversions with data and updates.",
    icon: BarChart3,
  },
];

export const Features = () => {
  return (
    <section id="features" className="pb-24 lg:pb-32">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
            Everything you need to launch
          </h2>
          <p className="text-muted-foreground mt-4 leading-snug text-balance">
            A clean marketing site foundation with CMS hooks—designed for service
            businesses.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold tracking-tight">{f.title}</h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};