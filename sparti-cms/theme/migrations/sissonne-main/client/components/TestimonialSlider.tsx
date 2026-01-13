import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export function TestimonialSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Parent of Emma, 8 years",
      content:
        "Emma has blossomed at Sissonne. The teachers are incredibly nurturing while maintaining high standards. Her confidence has soared.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: 2,
      name: "Marcus Wong",
      role: "Student, Elite Program",
      content:
        "The Elite program challenged me beyond what I thought possible. I've grown as both a dancer and a person through this journey.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    {
      id: 3,
      name: "Lisa Tan",
      role: "Parent of Rachel, 12 years",
      content:
        "Outstanding faculty and beautiful facilities. Rachel successfully gained DSA placement through their excellent preparation program.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: 4,
      name: "David Kumar",
      role: "Parent of Arjun, 10 years",
      content:
        "The structured approach to ballet training here is exceptional. Arjun has developed not just dance skills but discipline and artistry.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/66.jpg",
    },
    {
      id: 5,
      name: "Michelle Rodriguez",
      role: "Former Student, Now Professional Dancer",
      content:
        "Sissonne gave me the foundation I needed to pursue dance professionally. The technical training and artistic development were unmatched.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    },
    {
      id: 6,
      name: "Amanda Lim",
      role: "Parent of Sophie, 6 years",
      content:
        "Sophie looks forward to every class! The instructors create such a positive environment where children feel encouraged to express themselves.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    },
  ];

  const reviewsPerSlide = 3;
  const totalSlides = Math.ceil(testimonials.length / reviewsPerSlide);

  // Auto-rotation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 7000); // Change slide every 7 seconds

    return () => clearInterval(timer);
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Get testimonials for current slide
  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * reviewsPerSlide;
    return testimonials.slice(startIndex, startIndex + reviewsPerSlide);
  };

  return (
    <section className="py-20 bg-dance-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dance-black mb-6">
            Stories Of Transformation
          </h2>
          <p className="text-xl font-body font-light text-dance-gray-800 max-w-3xl mx-auto leading-relaxed">
            Hear from our{" "}
            <span className="font-handwriting text-dance-pink font-medium">
              dance family
            </span>{" "}
            about their inspiring journeys and the life-changing impact of their
            experience at Sissonne.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute -left-16 top-1/2 transform -translate-y-1/2 z-20 text-dance-gray-400 hover:text-dance-pink transition-all duration-300"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute -right-16 top-1/2 transform -translate-y-1/2 z-20 text-dance-gray-400 hover:text-dance-pink transition-all duration-300"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Testimonial Grid */}
          <div className="mx-4">
            <div className="grid md:grid-cols-3 gap-8">
              {getCurrentTestimonials().map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="bg-dance-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group"
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  {/* Rating Stars */}
                  <div className="flex space-x-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-dance-pink fill-current transition-transform duration-300 group-hover:scale-110"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="font-body font-light text-dance-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="border-t border-dance-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body font-medium text-dance-black mb-1">
                          {testimonial.name}
                        </p>
                        <p className="font-body font-light text-dance-gray-600 text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0">
                        <img
                          src={testimonial.avatar}
                          alt={`${testimonial.name} avatar`}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-12 space-x-3">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-dance-pink scale-125"
                    : "bg-dance-white/50 hover:bg-dance-white/80"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
