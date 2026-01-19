import { Carousel } from "@ark-ui/react/carousel";

interface ThumbnailsCarouselProps {
  images: Array<{
    full: string;
    thumb: string;
  }>;
  defaultPage?: number;
}

export function ThumbnailsCarousel({ images, defaultPage = 0 }: ThumbnailsCarouselProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Carousel.Root
      defaultPage={defaultPage}
      slideCount={images.length}
      className="max-w-2xl p-2 mx-auto"
    >
      <Carousel.ItemGroup className="overflow-hidden rounded-lg shadow-lg mb-4">
        {images.map((image, index) => (
          <Carousel.Item key={index} index={index}>
            <img
              src={image.full}
              alt={`Slide ${index + 1}`}
              className="w-full h-80 object-cover"
            />
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      <div className="flex items-center gap-4">
        <Carousel.PrevTrigger className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0">
          ←
        </Carousel.PrevTrigger>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 px-2">
          {images.map((image, index) => (
            <Carousel.Indicator
              key={index}
              index={index}
              className="shrink-0 border-2 border-transparent data-[current]:border-blue-500 rounded-md overflow-hidden cursor-pointer transition-all hover:border-gray-300"
            >
              <img
                src={image.thumb}
                alt={`Thumbnail ${index + 1}`}
                className="w-16 h-12 object-cover"
              />
            </Carousel.Indicator>
          ))}
        </div>

        <Carousel.NextTrigger className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0">
          →
        </Carousel.NextTrigger>
      </div>
    </Carousel.Root>
  );
}
