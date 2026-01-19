import { useState } from "react";
import pantheonImage from "../../../e-shop/assets/pantheon.jpg";
import eclipseImage from "../../../e-shop/assets/eclipse.jpg";
import haloImage from "../../../e-shop/assets/halo.jpg";
import obliqueImage from "../../../e-shop/assets/oblique.jpg";

const ProductImageGallery = () => {
  const [selectedImage, setSelectedImage] = useState(pantheonImage);

  const images = [pantheonImage, eclipseImage, haloImage, obliqueImage];

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square overflow-hidden bg-muted/5">
        <img
          src={selectedImage}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail gallery */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`aspect-square overflow-hidden border-2 transition-all duration-200 ${
              selectedImage === image
                ? "border-primary"
                : "border-border-light hover:border-border"
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
