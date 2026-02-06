import { useState, useEffect } from "react";
import hoveniaDulcisImage from "../../../e-shop/assets/hovenia-dulcis.png";
import cornExtractImage from "../../../e-shop/assets/corn-extract.png";
import blackBeanTeaImage from "../../../e-shop/assets/black-bean-tea.png";
import barleyTeaImage from "../../../e-shop/assets/barley-tea.png";
import barleyTeaImage1 from "../../assets/tea/BEOK-Barleytea1.jpg";
import barleyTeaImage2 from "../../assets/tea/BEOK-Barleytea2.jpg";
import barleyTeaImage7 from "../../assets/tea/BEOK-Barleytea7.jpg";
import sesameOilImage from "../../assets/oil/BEOK-sesameoil1.jpg";
import sesameOilImage2 from "../../assets/oil/BEOK-sesameoil2.jpg";
import sesameOilImage4 from "../../assets/oil/BEOK-sesameoil4.jpg";
import meatImage from "../../assets/oil/BEOK-meat1.jpg";
import perillaOilImage from "../../assets/oil/BEOK-perillaoil3.jpg";
import perillaOilImage2 from "../../assets/oil/BEOK-perillaoil2.jpg";
import perillaOilImage5 from "../../assets/oil/BEOK-perillaoil5.jpg";
import saucesImage from "../../assets/oil/BEOK-sauces2.jpg";
import saucesImageAlt from "../../assets/oil/BEOK-sauces.jpg";
import seorijuImage from "../../assets/alcohol/BEOK-seoriju3.jpg";
import seorijuImage1 from "../../assets/alcohol/BEOK-seoriju1.jpg";
import seorijuImage2 from "../../assets/alcohol/BEOK-seoriju2.jpg";
import wheatNoodleImage from "../../assets/noodles/IMG_1701.png";
import giftSetImage from "../../assets/noodles/IMG_1700.jpg";
import potatoNoodleImage from "../../assets/noodles/BEOK-Potatonoodle3.jpg";
import potatoNoodleImage4 from "../../assets/noodles/BEOK-Potatonoodle4.jpg";
import potatoNoodleImage5 from "../../assets/noodles/BEOK-Potatonoodle5.jpg";
import hanrabongNoodleImage from "../../assets/noodles/BEOK-Hanrabongnoodle3.jpg";
import hanrabongNoodleImage2 from "../../assets/noodles/BEOK-Hanrabongnoodle2.jpg";
import hanrabongNoodleImage5 from "../../assets/noodles/BEOK-Hanrabongnoodle5.jpg";

interface ProductImageGalleryProps {
  productId?: string;
}

// Map product IDs to their specific images
const productImageMap: Record<string, string> = {
  "1": hoveniaDulcisImage,
  "2": cornExtractImage,
  "3": blackBeanTeaImage,
  "4": barleyTeaImage,
  "5": sesameOilImage,
  "6": meatImage,
  "7": perillaOilImage,
  "8": saucesImage,
  "9": seorijuImage,
  "10": wheatNoodleImage,
  "11": giftSetImage,
  "12": potatoNoodleImage,
  "13": hanrabongNoodleImage,
};

const ProductImageGallery = ({ productId }: ProductImageGalleryProps) => {
  
  const getDefaultImage = () => {
    return productImageMap[productId || ""] || hoveniaDulcisImage;
  };
  
  const [selectedImage, setSelectedImage] = useState(getDefaultImage());

  // Update selected image when productId changes
  useEffect(() => {
    const imageForProduct = productImageMap[productId || ""];
    if (imageForProduct) {
      setSelectedImage(imageForProduct);
    }
  }, [productId]);

  // For products with multiple images, show all available images
  // For other products 1-13, only show their specific image
  // Otherwise, show all default images
  const specificImage = productImageMap[productId || ""];
  const images = productId === "4"
    ? [barleyTeaImage, barleyTeaImage1, barleyTeaImage2, barleyTeaImage7]
    : productId === "5"
    ? [sesameOilImage, sesameOilImage2, sesameOilImage4]
    : productId === "7"
    ? [perillaOilImage, perillaOilImage2, perillaOilImage5]
    : productId === "8"
    ? [saucesImage, saucesImageAlt]
    : productId === "9"
    ? [seorijuImage, seorijuImage1, seorijuImage2]
    : productId === "12"
    ? [potatoNoodleImage, potatoNoodleImage4, potatoNoodleImage5]
    : productId === "13"
    ? [hanrabongNoodleImage, hanrabongNoodleImage2, hanrabongNoodleImage5]
    : specificImage
    ? [specificImage]
    : [hoveniaDulcisImage, cornExtractImage, blackBeanTeaImage, barleyTeaImage];

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
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`aspect-square overflow-hidden rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
              selectedImage === image
                ? "ring-2 ring-primary ring-offset-2 shadow-md"
                : "hover:opacity-80"
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
