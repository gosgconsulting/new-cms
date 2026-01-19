import { useState, useEffect } from "react";
import { ThemeLink } from "../ThemeLink";

import haloImage from "../../../e-shop/assets/halo.jpg";
import eclipseImage from "../../../e-shop/assets/eclipse.jpg";
import pantheonImage from "../../../e-shop/assets/pantheon.jpg";

interface Slide {
  id: number;
  backgroundImage: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    backgroundImage: haloImage,
    title: "Curated Korean Taste",
    subtitle: "Authentic ingredients for your home kitchen",
    ctaText: "Shop Curated Sets",
    ctaLink: "/category/curated-sets",
  },
  {
    id: 2,
    backgroundImage: eclipseImage,
    title: "Premium Ingredients",
    subtitle: "Sourced directly from trusted Korean producers",
    ctaText: "Explore Ingredients",
    ctaLink: "/category/ingredients",
  },
  {
    id: 3,
    backgroundImage: pantheonImage,
    title: "Chef's Selection",
    subtitle: "Curated collections by professional chefs",
    ctaText: "View Collections",
    ctaLink: "/category/chefs-picks",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section
      className="relative w-full h-[600px] lg:h-[700px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.backgroundImage}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            <h1 className="text-4xl lg:text-6xl font-heading font-bold text-white mb-4 lg:mb-6">
              {slide.title}
            </h1>
            <p className="text-lg lg:text-xl text-white/90 mb-6 lg:mb-8 max-w-2xl">
              {slide.subtitle}
            </p>
            <ThemeLink
              to={slide.ctaLink}
              className="inline-block bg-white text-black hover:bg-white/90 px-8 py-3 font-medium transition-colors duration-200"
            >
              {slide.ctaText}
            </ThemeLink>
          </div>
        </div>
      ))}

      {/* Bullet Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8 h-2.5"
                : "bg-white/50 hover:bg-white/75 w-2.5 h-2.5"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
