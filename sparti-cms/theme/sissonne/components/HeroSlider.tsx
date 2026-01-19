import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "./ui/dialog";

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  theme: string;
}

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const slides: SlideData[] = [
    {
      id: 1,
      title: "THE SISSONNE",
      subtitle: "FAMILY",
      description:
        "Join a community where every dancer is cherished, supported, and inspired to reach their fullest potential through the transformative power of dance.",
      image:
        "https://images.pexels.com/photos/5278773/pexels-photo-5278773.jpeg",
      theme: "family",
    },
    {
      id: 2,
      title: "CELEBRATING",
      subtitle: "ACHIEVEMENTS",
      description:
        "Witness extraordinary accomplishments as our students excel in competitions, examinations, and performances on both local and international stages.",
      image:
        "https://images.pexels.com/photos/7005686/pexels-photo-7005686.jpeg",
      theme: "achievements",
    },
    {
      id: 3,
      title: "UNMATCHED",
      subtitle: "QUALITY",
      description:
        "Experience world-class instruction with internationally certified curricula, expert faculty, and state-of-the-art facilities dedicated to dance excellence.",
      image:
        "https://images.pexels.com/photos/4241697/pexels-photo-4241697.jpeg",
      theme: "quality",
    },
  ];

  // Auto-rotation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${slide.image}')`,
              filter: "brightness(0.6) contrast(1.1)",
            }}
          ></div>

          {/* Reduced Black Tint Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Additional Gradient for Text Readability */}
          <div className="absolute inset-0 bg-linear-to-br from-dance-black/30 via-transparent to-dance-black/30"></div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 text-dance-white hover:text-dance-pink transition-all duration-300"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 text-dance-white hover:text-dance-pink transition-all duration-300"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Left Click Area */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-0 bottom-0 w-1/3 z-15 bg-transparent cursor-pointer"
        aria-label="Previous slide"
      ></button>

      {/* Right Click Area */}
      <button
        onClick={nextSlide}
        className="absolute right-0 top-0 bottom-0 w-1/3 z-15 bg-transparent cursor-pointer"
        aria-label="Next slide"
      ></button>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dance-white mb-4 leading-tight">
            <span className="block hero-title">{currentSlideData.title}</span>
            <span
              className="block text-dance-pink hero-subtitle font-heading font-bold"
            >
              {currentSlideData.subtitle}
            </span>
          </h1>
          <p className="text-xl md:text-2xl hero-body font-light text-dance-gray-200 max-w-4xl mx-auto leading-relaxed mt-8">
            {currentSlideData.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a
            href="#book-trial"
            className="bg-dance-pink text-dance-white px-10 py-4 rounded-full text-lg font-button font-medium tracking-wide transition-all duration-300 transform hover:scale-105 shadow-2xl hover:opacity-90"
          >
            Book a trial
          </a>
          <button 
            onClick={() => setIsVideoOpen(true)}
            className="flex items-center space-x-3 border-2 border-dance-white text-dance-white px-8 py-4 rounded-full text-lg font-button font-medium hover:bg-dance-white hover:text-dance-black transition-all duration-300"
          >
            <Play className="h-5 w-5" />
            <span>Watch our story</span>
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "scale-125 bg-dance-pink"
                  : "bg-dance-white/50 hover:bg-dance-white/80"
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black border-none">
          <div className="relative w-full aspect-video">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 text-white hover:text-dance-pink transition-colors bg-black/50 rounded-full p-2"
              aria-label="Close video"
            >
              <X className="h-6 w-6" />
            </button>
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/jNQXAC9IVRw?autoplay=1"
              title="Sissonne Dance Academy Story"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
