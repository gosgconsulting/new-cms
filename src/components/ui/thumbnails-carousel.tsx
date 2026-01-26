import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ThumbnailsCarouselProps {
  images: Array<{
    full: string;
    thumb: string;
  }>;
  defaultPage?: number;
}

export function ThumbnailsCarousel({ images, defaultPage = 0 }: ThumbnailsCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(defaultPage);
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: defaultPage });

  if (!images || images.length === 0) {
    return null;
  }

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  // Update selected index when main carousel changes
  if (emblaApi) {
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }

  return (
    <div className="max-w-4xl p-2 mx-auto">
      <div className="relative flex items-center gap-2">
        {/* Left arrow - positioned outside the image */}
        {images.length > 1 && (
          <button
            onClick={scrollPrev}
            className="flex-shrink-0 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-10 -ml-2"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" />
          </button>
        )}
        
        <div className="relative overflow-hidden rounded-lg shadow-lg flex-1" ref={emblaRef}>
          <div className="flex">
            {images.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <img
                  src={image.full}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-[600px] object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Right arrow - positioned outside the image */}
        {images.length > 1 && (
          <button
            onClick={scrollNext}
            className="flex-shrink-0 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-10 -mr-2"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6 text-gray-900" />
          </button>
        )}
      </div>
    </div>
  );
}
