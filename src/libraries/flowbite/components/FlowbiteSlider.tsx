"use client";

import React, { useEffect, useRef, useState } from "react";

export type FlowbiteSlide = {
  image: { src: string; alt?: string };
  caption?: string;
  button?: { label: string; link: string };
};

export type FlowbiteSliderProps = {
  slides: FlowbiteSlide[];
  options?: {
    autoplay?: boolean;
    intervalMs?: number;
    loop?: boolean;
    arrows?: boolean;
    dots?: boolean;
    pauseOnHover?: boolean;
    keyboard?: boolean;
    aspectRatio?: "16/9" | "4/3" | "1/1" | "21/9";
    transition?: { type?: "slide" | "fade"; durationMs?: number };
    overlay?: {
      enabled?: boolean;
      mode?: "solid" | "gradient";
      color?: string;         // e.g. 'black'
      opacity?: number;       // 0..1
      className?: string;     // optional override, e.g. 'bg-black/30'
      gradient?: {
        from?: string;
        to?: string;
        direction?: "to-t" | "to-b" | "to-l" | "to-r" | "to-tr" | "to-tl" | "to-br" | "to-bl";
      };
      zIndex?: number;        // defaults under content, above image
      pointerEventsNone?: boolean;
      blur?: boolean;
    };
  };
  ariaLabel?: string;
  className?: string;
};

const ratioToClass: Record<NonNullable<FlowbiteSliderProps["options"]>["aspectRatio"], string> = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]"
};

const FlowbiteSlider: React.FC<FlowbiteSliderProps> = ({
  slides,
  options,
  ariaLabel = "Carousel",
  className = ""
}) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const {
    autoplay = false,
    intervalMs = 5000,
    loop = true,
    arrows = true,
    dots = true,
    pauseOnHover = true,
    keyboard = true,
    aspectRatio = "16/9",
    transition = { type: "slide", durationMs: 350 },
    overlay = {
      enabled: false,
      mode: "solid",
      color: "black",
      opacity: 0.3,
      pointerEventsNone: true,
    }
  } = options || {};

  const duration = transition?.durationMs ?? 350;
  const transitionClass =
    transition?.type === "fade"
      ? "transition-opacity"
      : "transition-transform";

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;
    const start = () => {
      stop();
      timerRef.current = window.setInterval(() => {
        setIndex((i) => {
          const next = i + 1;
          return next >= slides.length ? (loop ? 0 : i) : next;
        });
      }, intervalMs) as unknown as number;
    };
    const stop = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    start();
    return () => stop();
  }, [autoplay, intervalMs, loop, slides.length]);

  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard]);

  if (!slides || slides.length === 0) return null;

  const next = () => {
    setIndex((i) => (i + 1 >= slides.length ? (loop ? 0 : i) : i + 1));
  };
  const prev = () => {
    setIndex((i) => (i - 1 < 0 ? (loop ? slides.length - 1 : i) : i - 1));
  };
  const goto = (i: number) => setIndex(i);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={`relative w-full ${className}`}
    >
      <div
        className={`relative overflow-hidden rounded-lg ${ratioToClass[aspectRatio] || "aspect-[16/9]"}`}
        onMouseEnter={(e) => {
          if (pauseOnHover && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }}
        onMouseLeave={(e) => {
          if (pauseOnHover && autoplay && slides.length > 1 && !timerRef.current) {
            timerRef.current = window.setInterval(() => next(), intervalMs) as unknown as number;
          }
        }}
      >
        <div
          className={`flex h-full w-full ${transitionClass} duration-[${duration}ms]`}
          style={{
            transform:
              transition?.type === "fade"
                ? undefined
                : `translateX(-${index * 100}%)`,
            opacity: transition?.type === "fade" ? 1 : undefined
          }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className={`shrink-0 w-full h-full relative`}
              aria-hidden={i !== index}
            >
              <img
                src={s.image.src}
                alt={s.image.alt || `Slide ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              {/* Overlay layer (over image, under content) */}
              {overlay?.enabled && (
                <div
                  className={[
                    "absolute inset-0",
                    overlay.pointerEventsNone !== false ? "pointer-events-none" : "",
                    overlay.blur ? "backdrop-blur-sm" : "",
                    overlay.className
                      ? overlay.className
                      : overlay.mode === "solid"
                        ? "" // handled via inline style below
                        : overlay.mode === "gradient"
                          ? `bg-gradient-${overlay.gradient?.direction || "to-t"}`
                          : ""
                  ].join(" ")}
                  style={
                    overlay.className
                      ? undefined
                      : overlay.mode === "solid"
                        ? {
                            backgroundColor: overlay.color || "black",
                            opacity: typeof overlay.opacity === "number" ? overlay.opacity : 0.3,
                            zIndex: overlay.zIndex ?? 5
                          }
                        : {
                            // gradient fallback if className not supplied
                            backgroundImage: `linear-gradient(${(overlay.gradient?.direction || "to top").replace("to-", "to ")}, ${overlay.gradient?.from || "rgba(0,0,0,0.4)"} , ${overlay.gradient?.to || "rgba(0,0,0,0.0)"})`,
                            zIndex: overlay.zIndex ?? 5
                          }
                  }
                  aria-hidden="true"
                />
              )}
              {(s.caption || s.button) && (
                <div className="absolute inset-0 flex items-end md:items-center justify-center p-4 z-10">
                  <div className="max-w-2xl text-center text-white space-y-3">
                    {s.caption && (
                      <p className="text-base md:text-lg lg:text-xl drop-shadow">
                        {s.caption}
                      </p>
                    )}
                    {s.button && (
                      <a
                        href={s.button.link}
                        className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {s.button.label}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {arrows && slides.length > 1 && (
          <>
            <button
              aria-label="Previous slide"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow"
            >
              ‹
            </button>
            <button
              aria-label="Next slide"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow"
            >
              ›
            </button>
          </>
        )}

        {dots && slides.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goto(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FlowbiteSlider;