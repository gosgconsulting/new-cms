interface ProductGalleryProps {
  imageUrl: string;
  productName: string;
  additionalImages?: string[];
}

export default function ProductGallery({
  imageUrl,
  productName,
  additionalImages = [],
}: ProductGalleryProps) {
  // For now, we'll just show the main image
  // In the future, this can be extended with thumbnail gallery
  const allImages = [imageUrl, ...additionalImages];

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square overflow-hidden bg-white rounded-lg">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>

      {/* Thumbnail gallery - only show if there are additional images */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {allImages.map((image, index) => (
            <button
              key={index}
              className="aspect-square overflow-hidden border-2 border-gray-200 rounded hover:border-gray-400 transition-colors bg-white"
              aria-label={`View ${productName} image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
