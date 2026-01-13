import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function GallerySlider() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const galleryImages = [
    {
      id: 1,
      title: "Ballet Excellence",
      subtitle: "Royal Academy of Dance Certified Training",
      image:
        "https://images.pexels.com/photos/8612992/pexels-photo-8612992.jpeg",
      description:
        "Our students master classical ballet technique through RAD syllabus, developing grace, strength, and artistry in our beautiful studios.",
    },
    {
      id: 2,
      title: "Performance Opportunities",
      subtitle: "Annual Showcases & Competition Success",
      image:
        "https://images.pexels.com/photos/5278773/pexels-photo-5278773.jpeg",
      description:
        "Students shine on stage through our annual recitals, competitions, and special performances throughout Singapore.",
    },
    {
      id: 3,
      title: "Contemporary Expression",
      subtitle: "Modern Dance & Creative Movement",
      image:
        "https://images.pexels.com/photos/3737633/pexels-photo-3737633.jpeg",
      description:
        "Explore contemporary dance forms that emphasize creativity, emotion, and personal expression in movement.",
    },
    {
      id: 4,
      title: "Youth Development",
      subtitle: "Building Confidence & Character",
      image:
        "https://images.pexels.com/photos/8923183/pexels-photo-8923183.jpeg",
      description:
        "Our youth programs focus on personal growth, discipline, and self-expression through the art of dance.",
    },
    {
      id: 5,
      title: "Adult Classes",
      subtitle: "Never Too Late to Start",
      image:
        "https://images.pexels.com/photos/7319333/pexels-photo-7319333.jpeg",
      description:
        "Adult dancers discover joy, fitness, and community in our welcoming and supportive environment.",
    },
    {
      id: 6,
      title: "Competition Training",
      subtitle: "Excellence in Performance",
      image:
        "https://images.pexels.com/photos/7319717/pexels-photo-7319717.jpeg",
      description:
        "Dedicated students train for competitions with personalized coaching and advanced technique development.",
    },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  // Get the images to display (previous, current, next)
  const getVisibleImages = () => {
    const images = [];
    const totalImages = galleryImages.length;

    // We want to show 3 images: 1 before, current (center), 1 after
    for (let i = -1; i <= 1; i++) {
      const index = (currentImageIndex + i + totalImages) % totalImages;
      images.push({
        ...galleryImages[index],
        position: i, // -1, 0 (center), 1
        originalIndex: index,
      });
    }

    return images;
  };

  return (
    <section id="gallery" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dynamic Title Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
            {galleryImages[currentImageIndex].title}
          </h2>
          <p className="text-2xl font-body font-light text-gray-300 mb-4">
            {galleryImages[currentImageIndex].subtitle}
          </p>
          <p
            className="text-xl font-body font-light"
            style={{ color: "#dc4c81" }}
          >
            Hover for enhanced view
          </p>
        </div>

        {/* Gallery Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-dance-white/90 hover:bg-dance-white text-dance-black p-3 rounded-full shadow-lg transition-all duration-300"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-dance-white/90 hover:bg-dance-white text-dance-black p-3 rounded-full shadow-lg transition-all duration-300"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* 3D Center-Focus Carousel with Overlapping */}
          <div
            className="relative flex justify-center items-center px-16"
            style={{ height: "650px" }}
          >
            {getVisibleImages().map((imageData, index) => {
              const isCenter = imageData.position === 0;
              const isLeft = imageData.position === -1;
              const isRight = imageData.position === 1;

              return (
                <div
                  key={`${imageData.id}-${imageData.position}`}
                  className={`absolute transition-all duration-500 ${
                    isCenter
                      ? "w-[800px] z-20 scale-100"
                      : "w-96 z-10 scale-90 opacity-70 cursor-pointer"
                  }`}
                  style={{
                    left: isCenter ? "50%" : isLeft ? "20%" : "80%",
                    transform: isCenter
                      ? "translateX(-50%)"
                      : isLeft
                        ? "translateX(-30%)"
                        : "translateX(-70%)",
                  }}
                  onClick={() => {
                    if (!isCenter) {
                      // Navigate to the clicked image
                      const targetIndex = imageData.originalIndex;
                      const currentIndex = galleryImages.findIndex(
                        (img) => img.id === galleryImages[currentImageIndex].id,
                      );
                      const diff = targetIndex - currentIndex;

                      if (diff > 0) {
                        // Click right image - go next
                        nextImage();
                      } else if (diff < 0) {
                        // Click left image - go previous
                        prevImage();
                      }
                    }
                  }}
                >
                  <div
                    className={`relative aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-500 group ${
                      isCenter
                        ? "shadow-2xl border-4 border-white hover:shadow-3xl"
                        : "shadow-lg hover:shadow-xl hover:scale-95"
                    }`}
                  >
                    <img
                      src={imageData.image}
                      alt={imageData.title}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        isCenter
                          ? "group-hover:scale-110"
                          : "group-hover:scale-105"
                      }`}
                      draggable={false}
                    />

                    {/* Hover Overlay - only show on center image */}
                    {isCenter && (
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-6 text-center">
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                            {imageData.title}
                          </h3>
                          <p className="text-gray-200 text-sm md:text-base">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Integer nec odio. Praesent libero. Sed cursus
                            ante dapibus diam.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Text overlay - always visible for center image, hidden on hover */}
                    {isCenter && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                        <div className="absolute bottom-6 left-6 right-6 text-white transform transition-all duration-500">
                          <h3 className="text-2xl font-heading font-bold mb-2 transform translate-y-0 transition-transform duration-500">
                            {imageData.title}
                          </h3>
                          <p className="text-base font-body font-light text-dance-pink mb-3 transform translate-y-0 transition-transform duration-500">
                            {imageData.subtitle}
                          </p>
                          <p className="text-sm font-body font-light leading-relaxed transform translate-y-0 transition-transform duration-500">
                            {imageData.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
