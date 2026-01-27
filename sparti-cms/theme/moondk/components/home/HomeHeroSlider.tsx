import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeLink } from "../ThemeLink";

import slide1 from "../../assets/slider-2.png";
import slide2 from "../../assets/slider-3.png";
import slide3 from "../../assets/slider-4.png";

type Slide = {
  id: number;
  titleStart: string;
  emphasized: string;
  titleEnd: string;
  description: string;
  ctaText: string;
  ctaTo: string;
  image: string;
  bg: string;
  accent: string;
};

const slides: Slide[] = [
  {
    id: 1,
    titleStart: "Care for",
    emphasized: "women",
    titleEnd: "done better",
    description:
      "Clinically-backed essentials—held to higher standards for everyday wellbeing.",
    ctaText: "Shop all",
    ctaTo: "/category/shop",
    image: slide1,
    bg: "#F6B7C1",
    accent: "#B2458A",
  },
  {
    id: 2,
    titleStart: "Chef-curated",
    emphasized: "Korean",
    titleEnd: "home dining",
    description:
      "Premium ingredients and tools to make restaurant-quality meals at home.",
    ctaText: "Explore",
    ctaTo: "/category/curated-sets",
    image: slide2,
    bg: "#F3C3B4",
    accent: "#2F5C3E",
  },
  {
    id: 3,
    titleStart: "New",
    emphasized: "essentials",
    titleEnd: "for your pantry",
    description:
      "Discover fresh drops and bestsellers—beautifully packaged and gift-ready.",
    ctaText: "Shop new",
    ctaTo: "/category/new-in",
    image: slide3,
    bg: "#E9C5C9",
    accent: "#2F5C3E",
  },
];

export default function HomeHeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slide = useMemo(() => slides[index], [index]);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(t);
  }, [paused]);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ backgroundColor: slide.bg }}
    >
      <div className="absolute inset-0">
        <img
          src={slide.image}
          alt=""
          className="h-full w-full object-cover object-[70%_center]"
        />
        {/* Soft overlay to keep text readable */}
        <div className="absolute inset-0 bg-white/10" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(246,183,193,0.92) 0%, rgba(246,183,193,0.75) 40%, rgba(246,183,193,0.20) 70%, rgba(246,183,193,0.00) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20 min-h-[520px] flex items-end">
        <div className="max-w-xl">
          <h1 className="font-body text-5xl md:text-6xl leading-[0.95] tracking-tight text-[#1A1A1A]">
            {slide.titleStart} <span className="font-heading italic font-normal">{slide.emphasized}</span>
            <span className="block">{slide.titleEnd}</span>
          </h1>

          <p className="mt-6 text-base md:text-lg font-body text-[#1A1A1A]/80 max-w-md">
            {slide.description}
          </p>

          <div className="mt-8">
            <Button
              asChild
              className="rounded-full px-10 h-12 text-base uppercase tracking-wide bg-primary hover:bg-primary-hover !text-white"
            >
              <ThemeLink to={slide.ctaTo} className="!text-white">{slide.ctaText}</ThemeLink>
            </Button>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={
                  "transition-all rounded-full border border-white/60 bg-white/40 " +
                  (active ? "w-8 h-2" : "w-2.5 h-2.5 hover:bg-white/60")
                }
              />
            );
          })}
        </div>
      </div>

      {/* Slide Navigation Buttons - Positioned on left and right edges */}
      <button
        type="button"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/60 hover:bg-white/80 border border-white/40 flex items-center justify-center transition-colors z-10"
        onClick={prev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-[#1A1A1A]" />
      </button>
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/60 hover:bg-white/80 border border-white/40 flex items-center justify-center transition-colors z-10"
        onClick={next}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-[#1A1A1A]" />
      </button>
    </section>
  );
}
