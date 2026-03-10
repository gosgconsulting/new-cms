import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeLink } from "../ThemeLink";

import slide1 from "../../assets/green_hero.jpeg";
import slide2 from "../../assets/20240514_161154.jpg";
import slide3 from "../../assets/roof.png";

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
  gradient: string;
};

const slides: Slide[] = [
  {
    id: 1,
    titleStart: "Curated",
    emphasized: "Korean",
    titleEnd: "Taste",
    description:
      "A journey through Korea, poured with intention, shaped by tradition and quiet craftsmanship.",
    ctaText: "Shop all",
    ctaTo: "/category/shop",
    image: slide1,
    bg: "#F6B7C1",
    accent: "#B2458A",
    gradient: "linear-gradient(90deg, rgba(246,183,193,0.55) 0%, rgba(246,183,193,0.40) 40%, rgba(246,183,193,0.12) 70%, rgba(246,183,193,0.00) 100%)",
  },
  {
    id: 2,
    titleStart: "Natural Flavours",
    emphasized: "Korean",
    titleEnd: "Contemporary Cuisine",
    description:
      "Premium ingredients and tools to make restaurant-quality meals at home.",
    ctaText: "Explore",
    ctaTo: "/category/curated-sets",
    image: slide2,
    bg: "#F3C3B4",
    accent: "#2F5C3E",
    gradient: "linear-gradient(90deg, rgba(243,195,180,0.55) 0%, rgba(243,195,180,0.40) 40%, rgba(243,195,180,0.12) 70%, rgba(243,195,180,0.00) 100%)",
  },
  {
    id: 3,
    titleStart: "Opening",
    emphasized: "Offers",
    titleEnd: "available for a limited time",
    description:
      "PROMO CODE: moondk10 Minimum order $88 Valid until November 2025",
    ctaText: "Shop new",
    ctaTo: "/category/new-in",
    image: slide3,
    bg: "#E9C5C9",
    accent: "#2F5C3E",
    gradient: "linear-gradient(90deg, rgba(233,197,201,0.55) 0%, rgba(233,197,201,0.40) 40%, rgba(233,197,201,0.12) 70%, rgba(233,197,201,0.00) 100%)",
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
      style={{ 
        backgroundColor: slide.bg,
        transition: 'background-color 0.8s ease-in-out'
      }}
    >
      {/* Render all slides with smooth transitions */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={s.image}
            alt=""
            className="h-full w-full object-cover object-[70%_center]"
          />
          {/* Soft overlay to keep text readable */}
          <div className="absolute inset-0 bg-white/10" />
          <div
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              background: s.gradient,
            }}
          />
        </div>
      ))}

      <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20 min-h-[600px] flex items-center z-20">
        <div className="max-w-xl transition-opacity duration-500 ease-in-out">
          <h1 className="font-body text-5xl md:text-6xl leading-[0.95] tracking-tight text-[#1A1A1A]">
            {slide.id === 3 ? (
              <>
                <span className="whitespace-nowrap">{slide.titleStart} <span className="font-heading italic font-normal text-black">{slide.emphasized}</span> {slide.titleEnd.split(' ')[0]}</span>
                <span className="block">{slide.titleEnd.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">{slide.titleStart} <span className="font-heading italic font-normal text-black">{slide.emphasized}</span></span>
                <span className="block">{slide.titleEnd}</span>
              </>
            )}
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
