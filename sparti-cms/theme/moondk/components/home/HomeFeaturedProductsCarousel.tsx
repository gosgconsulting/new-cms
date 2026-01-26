import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import type { CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

import { ThemeLink } from "../ThemeLink";

import p1 from "../../assets/slider-1.png";
import p2 from "../../assets/slider-2.png";
import p3 from "../../assets/slider-3.png";
import p4 from "../../assets/slider-4.png";

type Product = {
  id: number;
  title: string;
  description: string;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  badges: Array<{ text: string; tone: "pink" | "purple" }>;
  image: string;
};

const products: Product[] = [
  {
    id: 101,
    title: "옥수수수염차",
    description: "고소하고 깔끔한 옥수수수염 블렌드",
    priceLabel: "₩19,900",
    rating: 4.9,
    reviewCount: 8536,
    badges: [{ text: "BESTSELLER", tone: "pink" }],
    image: p1,
  },
  {
    id: 102,
    title: "검은콩차",
    description: "진한 풍미의 블랙빈 티",
    priceLabel: "₩17,900",
    rating: 4.8,
    reviewCount: 5715,
    badges: [{ text: "BESTSELLER", tone: "pink" }],
    image: p2,
  },
  {
    id: 103,
    title: "보리차",
    description: "매일 마시기 좋은 구수한 보리차",
    priceLabel: "₩15,900",
    rating: 4.9,
    reviewCount: 13828,
    badges: [
      { text: "BESTSELLER", tone: "pink" },
      { text: "SAVE 20%", tone: "purple" },
    ],
    image: p3,
  },
  {
    id: 104,
    title: "헛개차",
    description: "깊고 은은한 헛개 향의 프리미엄 티",
    priceLabel: "₩21,900",
    rating: 4.8,
    reviewCount: 12386,
    badges: [{ text: "SAVE 20%", tone: "purple" }],
    image: p4,
  },
];

function Rating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.round(rating);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < fullStars;
          return (
            <Star
              key={i}
              className={
                "h-4 w-4 " +
                (filled ? "text-[#FF4D7D] fill-[#FF4D7D]" : "text-[#FF4D7D]/25")
              }
            />
          );
        })}
      </div>
      <span className="text-sm font-body text-foreground/60">({reviewCount})</span>
    </div>
  );
}

function Badge({ text, tone }: { text: string; tone: "pink" | "purple" }) {
  const cls =
    tone === "pink"
      ? "bg-[#FF7FA6] text-white"
      : "bg-[#E66BFF]/20 text-[#9C2FB2]";

  return (
    <span
      className={
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-body font-medium tracking-wide " +
        cls
      }
    >
      {text}
    </span>
  );
}

export default function HomeFeaturedProductsCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!api) return;

    const update = () => {
      // 0..1
      setProgress(api.scrollProgress());
    };

    update();
    api.on("scroll", update);
    api.on("reInit", update);
    api.on("select", update);

    return () => {
      api.off("scroll", update);
      api.off("select", update);
    };
  }, [api]);

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading">Featured</h2>
            <p className="mt-2 text-sm md:text-base font-body text-foreground/70">
              Clean product cards with strong CTAs—built for fast browsing.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full px-7">
            <ThemeLink to="/category/shop">Shop all</ThemeLink>
          </Button>
        </div>

        <div className="mt-10">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
              containScroll: "trimSnaps",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-5">
              {products.map((p) => (
                <CarouselItem
                  key={p.id}
                  className="pl-5 basis-[85%] sm:basis-1/2 lg:basis-1/4"
                >
                  <div className="h-full rounded-2xl bg-[#F7F7F7] p-2">
                    <div className="h-full rounded-2xl bg-white shadow-sm border border-border/40 overflow-hidden">
                      {/* Top */}
                      <div className="relative px-6 pt-6 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            {p.badges
                              .filter((b) => b.text === "BESTSELLER")
                              .map((b) => (
                                <Badge key={b.text} text={b.text} tone={b.tone} />
                              ))}
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end">
                            {p.badges
                              .filter((b) => b.text !== "BESTSELLER")
                              .map((b) => (
                                <Badge key={b.text} text={b.text} tone={b.tone} />
                              ))}
                          </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                          <ThemeLink to={`/product/${p.id}`} className="block">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="h-44 w-auto object-contain"
                            />
                          </ThemeLink>
                        </div>
                      </div>

                      {/* Middle */}
                      <div className="px-6 pb-6">
                        <Rating rating={p.rating} reviewCount={p.reviewCount} />

                        <ThemeLink
                          to={`/product/${p.id}`}
                          className="block mt-4"
                        >
                          <h3 className="text-xl font-body font-bold tracking-tight uppercase">
                            {p.title}
                          </h3>
                        </ThemeLink>
                        <p className="mt-2 text-sm font-body text-foreground/70">
                          {p.description}
                        </p>

                        {/* CTA */}
                        <div className="mt-7">
                          <Button
                            asChild
                            className="w-full rounded-full h-12 text-base font-body font-semibold text-white"
                            style={{
                              background:
                                "linear-gradient(90deg, #B2458A 0%, #8B2BB8 100%)",
                            }}
                          >
                            <ThemeLink to={`/product/${p.id}`}>
                              SHOP NOW - {p.priceLabel}
                            </ThemeLink>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Bottom controls */}
          <div className="mt-10 flex items-center gap-4">
            <div className="relative h-1 w-full rounded-full bg-border/50">
              <div
                className="absolute left-0 top-0 h-1 rounded-full bg-foreground/80"
                style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="h-11 w-11 rounded-full border border-border/60 bg-background hover:bg-accent transition-colors flex items-center justify-center disabled:opacity-40"
                aria-label="Previous"
                onClick={() => api?.scrollPrev()}
                disabled={!api?.canScrollPrev()}
              >
                <span className="sr-only">Previous</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="h-11 w-11 rounded-full border border-border/60 bg-background hover:bg-accent transition-colors flex items-center justify-center disabled:opacity-40"
                aria-label="Next"
                onClick={() => api?.scrollNext()}
                disabled={!api?.canScrollNext()}
              >
                <span className="sr-only">Next</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
