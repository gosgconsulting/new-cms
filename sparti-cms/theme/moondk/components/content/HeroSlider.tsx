import { useState, useEffect } from "react";
import { ThemeLink } from "../ThemeLink";
import { ChevronLeft, ChevronRight } from "lucide-react";

import slider1 from "../../assets/slider-1.png";
import slider2 from "../../assets/slider-2.png";
import slider3 from "../../assets/slider-3.png";
import slider4 from "../../assets/slider-4.png";

interface Slide {
  id: number;
  backgroundImage: string;
  header?: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    backgroundImage: slider1,
    header: "K-Heritage가 복 두 배 드려요!",
    title: "다다익'설'",
    subtitle: "설 명절 선물 추천아이템 최대 20% 할인과 푸짐한 사은품 혜택까지",
    ctaText: "자세히 보기",
    ctaLink: "/category/shop",
  },
  {
    id: 2,
    backgroundImage: slider2,
    title: "Traditional Korean Heritage",
    subtitle: "Discover authentic Korean products and cultural treasures",
    ctaText: "Explore Collection",
    ctaLink: "/category/shop",
  },
  {
    id: 3,
    backgroundImage: slider3,
    title: "Artisan Craftsmanship",
    subtitle: "Handcrafted items with intricate inlaid designs",
    ctaText: "View Products",
    ctaLink: "/category/shop",
  },
  {
    id: 4,
    backgroundImage: slider4,
    title: "Elegant Ceramics",
    subtitle: "Beautiful handcrafted pieces for your home",
    ctaText: "Shop Now",
    ctaLink: "/category/shop",
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const formatSlideNumber = (current: number, total: number) => {
    const currentStr = String(current + 1).padStart(2, "0");
    const totalStr = String(total).padStart(2, "0");
    return `${currentStr}/${totalStr}`;
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
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="relative w-full h-full flex flex-col lg:flex-row">
            {/* Left Side - Text Content */}
            <div
              className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-12 py-12 lg:py-16"
              style={{
                backgroundColor: "#D4A574", // Warm orangish-brown background
              }}
            >
              {slide.header && (
                <p className="text-sm lg:text-base text-[#1A1A1A] mb-4 font-body">
                  {slide.header}
                </p>
              )}
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-heading font-bold text-[#1A1A1A] mb-4 lg:mb-6 leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-base lg:text-lg text-[#1A1A1A] mb-6 lg:mb-8 max-w-xl font-body">
                  {slide.subtitle}
                </p>
              )}
              <ThemeLink
                to={slide.ctaLink}
                className="inline-block bg-[#2F5C3E] text-white hover:bg-[#1F3D2A] px-8 py-3 lg:px-10 lg:py-4 font-medium transition-colors duration-200 rounded-full w-fit"
                style={{
                  borderRadius: "9999px", // Fully rounded pill shape
                }}
              >
                {slide.ctaText}
              </ThemeLink>
            </div>

            {/* Right Side - Image */}
            <div className="w-full lg:w-1/2 relative h-64 lg:h-auto">
              <img
                src={slide.backgroundImage}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-[#2F5C3E]" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-[#2F5C3E]" />
      </button>

      {/* Slide Indicator (01/12 format) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <span className="text-sm text-white/70 font-body bg-black/30 px-3 py-1 rounded-full">
          {formatSlideNumber(currentSlide, slides.length)}
        </span>
      </div>

      {/* Bullet Navigation */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8 h-2"
                : "bg-white/50 hover:bg-white/75 w-2 h-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
