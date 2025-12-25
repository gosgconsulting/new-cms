import React from 'react';

interface ImageGalleryProps {
  images: any[]; // default: [{"src":"/placeholder.svg","alt":"Gallery image 1","title":"Image 1"},{"src":"/placeholder.svg","alt":"Gallery image 2","title":"Image 2"},{"src":"/placeholder.svg","alt":"Gallery image 3","title":"Image 3"}]
  layout?: string; // default: "grid"
  columns?: number; // default: 3
  gap?: string; // default: "1rem"
  aspectRatio?: string; // default: "16/9"
  enableLightbox?: boolean; // default: true
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  layout = 'grid',
  columns = 3,
  gap = '1rem',
  aspectRatio = '16/9',
  enableLightbox = true,
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {Array.isArray(images) && images.length > 0 && (
          <div
            className={layout === 'grid' ? 'grid' : 'flex flex-wrap'}
            style={{
              gap,
              ...(layout === 'grid'
                ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
                : {}),
            }}
          >
            {images.map((img: any, idx: number) => {
              const src = img?.src || img?.url || '/placeholder.svg';
              const alt = img?.alt || img?.title || `Image ${idx + 1}`;
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-lg"
                  style={{ aspectRatio }}
                >
                  <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageGallery;