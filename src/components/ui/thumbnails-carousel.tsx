import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

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
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  if (!images || images.length === 0) {
    return null;
  }

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  const onThumbClick = (index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  };

  // Update selected index when main carousel changes
  if (emblaApi) {
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }

  return (
    <div className="max-w-2xl p-2 mx-auto">
      <div className="overflow-hidden rounded-lg shadow-lg mb-4" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <img
                src={image.full}
                alt={`Slide ${index + 1}`}
                className="w-full h-80 object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={scrollPrev}
          className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0"
        >
          ←
        </button>

        <div className="overflow-hidden flex-1 px-2" ref={emblaThumbsRef}>
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onThumbClick(index)}
                className={cn(
                  "shrink-0 border-2 rounded-md overflow-hidden cursor-pointer transition-all hover:border-gray-300",
                  selectedIndex === index ? "border-blue-500" : "border-transparent"
                )}
              >
                <img
                  src={image.thumb}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-16 h-12 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={scrollNext}
          className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0"
        >
          →
        </button>
      </div>
    </div>
  );
}
