import { useState } from "react";
import hoveniaDulcisImage from "../../../e-shop/assets/hovenia-dulcis.png";
import cornExtractImage from "../../../e-shop/assets/corn-extract.png";
import blackBeanTeaImage from "../../../e-shop/assets/black-bean-tea.png";
import barleyTeaImage from "../../../e-shop/assets/barley-tea.png";

const ProductImageGallery = () => {
  const [selectedImage, setSelectedImage] = useState(hoveniaDulcisImage);

  const images = [hoveniaDulcisImage, cornExtractImage, blackBeanTeaImage, barleyTeaImage];

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
