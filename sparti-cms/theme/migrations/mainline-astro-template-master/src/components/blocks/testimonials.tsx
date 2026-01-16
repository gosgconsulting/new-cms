import { ArrowRight } from "lucide-react";

import { DashedLine } from "../dashed-line";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const withBase = (path: string) => {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  if (path.startsWith("/")) return normalizedBase.replace(/\/$/, "") + path;
  return normalizedBase + path;
};

const items = [
  {
    quote:
      "Our homepage finally explains our offer clearly — enquiries improved within weeks.",
    author: "Operations Lead",
    role: "Services",
    company: "Singapore",
    image: "/testimonials/amy-chase.webp",
  },
  {
    quote:
      "We can update pricing and FAQs ourselves now. No more waiting on a dev.",
    author: "Founder",
    role: "Consulting",
    company: "APAC",
    image: "/testimonials/kevin-yam.webp",
  },
  {
    quote:
      "Fast pages, clean structure, and a CMS that doesn't get in the way.",
    author: "Marketing Manager",
    role: "B2B",
    company: "Regional",
    image: "/testimonials/jonas-kotara.webp",
  },
];

export const Testimonials = ({
  className,
  dashedLineClassName,
}: {
  className?: string;
  dashedLineClassName?: string;
}) => {
  return (
    <>
      <section
        id="testimonials"
        className={cn("overflow-hidden py-24 lg:py-32", className)}
      >
        <div className="container">
          <div className="space-y-4">
            <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
              Loved by teams who ship fast
            </h2>
            <p className="text-muted-foreground max-w-md leading-snug">
              Clear messaging + conversion structure — with tenant-aware branding.
            </p>
            <Button variant="outline" className="shadow-sm" asChild>
              <a href={withBase("/contact")}>
                Book a call <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>

          <div className="relative mt-8 -mr-[max(3rem,calc((100vw-80rem)/2+3rem))] md:mt-12 lg:mt-16">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {items.map((testimonial, index) => (
                  <CarouselItem
                    key={index}
                    className="xl:basis-1/3.5 grow basis-4/5 sm:basis-3/5 md:basis-2/5 lg:basis-[28%] 2xl:basis-[24%]"
                  >
                    <Card className="bg-muted h-full overflow-hidden border-none">
                      <CardContent className="flex h-full flex-col p-0">
                        <div className="relative h-[240px]">
                          <img
                            src={testimonial.image}
                            alt={testimonial.author}
                            className="size-full object-cover object-top"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-8 p-6">
                          <blockquote className="font-display text-lg leading-snug font-medium md:text-xl">
                            {testimonial.quote}
                          </blockquote>
                          <div className="space-y-0.5">
                            <div className="text-foreground font-semibold">
                              {testimonial.author}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {testimonial.role} · {testimonial.company}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-8 flex gap-3">
                <CarouselPrevious className="bg-muted hover:bg-muted/80 static size-14.5 translate-x-0 translate-y-0 transition-colors [&>svg]:size-6" />
                <CarouselNext className="bg-muted hover:bg-muted/80 static size-14.5 translate-x-0 translate-y-0 transition-colors [&>svg]:size-6" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>
      <DashedLine
        orientation="horizontal"
        className={cn("mx-auto max-w-[80%]", dashedLineClassName)}
      />
    </>
  );
};