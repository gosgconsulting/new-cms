import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThumbnailsCarousel } from "@/components/ui/thumbnails-carousel";

import { Layout } from "../components/Layout";

type GalleryItem = {
  id: number;
  category: string;
  title: string;
  image: string;
};

export default function GalleryPage({ basePath }: { basePath: string }) {
  const [activeFilter, setActiveFilter] = useState("manicures");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const asset = (path: string) => `${basePath.replace(/\/+$/, "")}/assets/${path.replace(/^\/+/, "")}`;

  const galleryItems = useMemo(
    () => [
      {
        id: 1,
        category: "manicures",
        title: "French tips",
        image: asset("gallery/Nail_Queen/french_tips/11.jpg"),
      },
      {
        id: 2,
        category: "manicures",
        title: "Metalic",
        image: asset("gallery/manicures/metalic.png"),
      },
      {
        id: 3,
        category: "manicures",
        title: "3D",
        image: asset("gallery/manicures/3d.JPG"),
      },
      {
        id: 4,
        category: "manicures",
        title: "3D flower",
        image: asset("gallery/Nail_Queen/3d_flower/4.jpg"),
      },
      {
        id: 5,
        category: "manicures",
        title: "Extension",
        image: asset("gallery/manicures/extension.png"),
      },
      {
        id: 6,
        category: "manicures",
        title: "Ombre",
        image: asset("gallery/Nail_Queen/ombre/n32.jpg"),
      },
      {
        id: 7,
        category: "manicures",
        title: "BIAB",
        image: asset("gallery/Nail_Queen/biab/9.jpg"),
      },
      {
        id: 8,
        category: "manicures",
        title: "Cat eye",
        image: asset("gallery/Nail_Queen/cateyes/6copy.jpg"),
      },
      {
        id: 9,
        category: "manicures",
        title: "Crystal",
        image: asset("gallery/manicures/crytal.jpg"),
      },
      {
        id: 10,
        category: "manicures",
        title: "2D",
        image: asset("gallery/Nail_Queen/2d/f1.jpg"),
      },
      {
        id: 11,
        category: "manicures",
        title: "Seasonal design",
        image: asset("gallery/Nail_Queen/seasonal_design/a.jpg"),
      },
      {
        id: 12,
        category: "pedicures",
        title: "Pedicure Service",
        image:
          "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 13,
        category: "pedicures",
        title: "Foot Care",
        image:
          "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 14,
        category: "pedicures",
        title: "Spa Treatment",
        image:
          "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 15,
        category: "eyebrows",
        title: "Brow Shaping",
        image:
          "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 16,
        category: "eyebrows",
        title: "Threading",
        image:
          "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 17,
        category: "eyelashes",
        title: "Lash Extensions",
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 18,
        category: "eyelashes",
        title: "Volume Lashes",
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 19,
        category: "treatment",
        title: "Nail Treatment",
        image:
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 20,
        category: "treatment",
        title: "Hand Care",
        image:
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    [basePath]
  );

  const filterCategories = [
    { id: "manicures", label: "Manicures" },
    { id: "pedicures", label: "Pedicures" },
    { id: "eyebrows", label: "Eyebrows" },
    { id: "eyelashes", label: "Eyelashes" },
    { id: "treatment", label: "Treatment" },
  ];

  const filteredItems = galleryItems.filter((item) => item.category === activeFilter);

  // Generate carousel images for a gallery item
  // For "French tips", use all images from the french_tips directory
  // For other items, use the same image multiple times
  const generateCarouselImages = (item: GalleryItem) => {
    // Special handling for French tips - use first 15 showable images from the directory
    if (item.title === "French tips") {
      const frenchTipsImages = [
        "1.jpg",
        "11.jpg",
        "12.jpg",
        "2_copy.jpg",
        "4.jpg",
        "5.jpg",
        "6.jpg",
        "7.jpg",
        "8.jpg",
        "9.jpg",
        "a_copy.jpg",
        "a3.jpg",
        "bb14abcd8b703b2e6261_2.JPG",
        "c_copy_2.jpg",
        "hl2.jpg",
      ];

      return frenchTipsImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/french_tips/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for Metalic - use all images from the directory
    if (item.title === "Metalic") {
      const metalicImages = [
        "3_2.png",
        "a2_2.jpg",
        "c1.jpg",
        "c2.PNG",
        "c3.jpg",
        "c5.jpg",
        "c6.jpg",
        "c7.PNG",
        "IMG_0337_copy_2.jpg",
        "IMG_2660_copy.jpg",
        "IMG_4704_copy.jpg",
        "IMG_5596_copy_2.jpg",
        "IMG_5847.jpg",
        "IMG_5861.png",
        "IMG_6380.jpg",
        "IMG_6992_2.png",
        "IMG_8651_copy_2.JPG",
        "IMG_9854.jpg",
        "k.jpg",
        "sc_2.jpg",
        "vvdf.jpg",
      ];

      return metalicImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/Metalic/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for 3D - use all images from the directory
    if (item.title === "3D") {
      const threeDImages = [
        "1_2.jpg",
        "10.PNG",
        "11_copy.jpg",
        "4.jpg",
        "4_1.png",
        "8_copy.jpg",
        "ds_f.jpg",
        "g_copy.jpg",
        "i.jpg",
        "IMG_0399.jpg",
        "IMG_1815.JPG",
        "IMG_1859.jpg",
        "IMG_2232_copy.jpg",
        "IMG_3054_copy.jpg",
        "IMG_3304_copy.jpg",
        "IMG_5541_copy.png",
        "IMG_8037_copy.JPG",
        "IMG_8651_copy 2.JPG",
        "IMG_8717_copy.jpg",
        "IMG_9233.JPG",
        "IMG_9345_copy.jpg",
        "kitty.jpg",
        "NAIL_QUEEN.PNG",
        "sn_1.jpg",
      ];

      return threeDImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/3d/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for 3D flower - use all images from the directory
    if (item.title === "3D flower") {
      const threeDFlowerImages = [
        "2_copy_2_2.jpg",
        "2_copy_2.jpg",
        "4_copy.jpg",
        "4.jpg",
        "5.jpg",
        "6_copy.jpg",
        "9_copy.jpg",
        "a3.jpg",
        "cover_3d.jpg",
        "IMG_5758_copy_2.jpg",
        "IMG_8813.JPG",
        "IMG_8995_copy.jpg",
        "IMG_9084.JPG",
        "vdvf.jpg",
      ];

      return threeDFlowerImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/3d_flower/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for Extension - use all images from the directory
    if (item.title === "Extension") {
      const extensionImages = [
        "1_2.jpg",
        "1_22.png",
        "1_3.jpg",
        "11.jpg",
        "11_copy.jpg",
        "12_2.jpg",
        "2_3.jpg",
        "2_33.png",
        "3.jpg",
        "3_2.jpg",
        "5_copy.jpg",
        "7.jpg",
        "9_copy.jpg",
        "a.jpg",
        "a3_2.jpg",
        "b2.jpg",
        "bb14abcd8b703b2e6261_2.JPG",
        "bfewfwf.jpg",
        "cc_2.jpg",
        "dscs.jpg",
        "fe.jpg",
        "hl1.jpg",
        "hl5.jpg",
        "hl6.jpg",
        "IMG_2298_copy.jpg",
        "IMG_2384.jpg",
        "IMG_3084.jpg",
        "IMG_3957_copy_2.jpg",
        "IMG_4918_copy_2.JPG",
        "IMG_5373_2_copy.png",
        "IMG_5661.jpg",
        "IMG_5731_copy.jpg",
        "IMG_6828.png",
        "IMG_7035_copy.jpg",
        "IMG_7474.png",
        "IMG_7544_copy.png",
        "IMG_8395_copy.jpg",
        "n2_2.jpg",
        "sc_2.jpg",
      ];

      return extensionImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/extension/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for Ombre - use all images from the directory
    if (item.title === "Ombre") {
      const ombreImages = [
        "1_3.jpg",
        "9_copy.jpg",
        "b3.jpg",
        "b4.jpg",
        "IMG_0098_2.jpg",
        "IMG_1421_copy.jpg",
        "IMG_2436.jpg",
        "IMG_2932_copy_2.PNG",
        "IMG_3093.jpg",
        "IMG_5324.jpg",
        "IMG_5432.jpg",
        "IMG_5592_copy.jpg",
        "IMG_5695_copy.png",
        "IMG_8367.JPG",
        "IMG_9101.jpg",
        "IMG_9256_copy_2.jpg",
        "IMG_9854.jpg",
        "jjkhn.jpg",
        "kitty_3.jpg",
        "n32.jpg",
      ];

      return ombreImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/ombre/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for BIAB - use all images from the directory
    if (item.title === "BIAB") {
      const biabImages = [
        "3.png",
        "6.jpg",
        "68519af7bd7fcd40d22a652160c79bbf.JPG",
        "9.jpg",
        "cdsc.png",
        "IMG_0135.png",
        "IMG_0321.HEIC",
        "IMG_1671.HEIC",
        "IMG_2660_copy.jpg",
        "IMG_2696_copy.jpg",
        "IMG_4242.heic",
        "IMG_4793_copy.jpg",
        "IMG_4967.png",
        "IMG_5277.png",
        "IMG_5292.png",
        "IMG_5396.png",
        "IMG_5411 copy.jpg",
        "IMG_5492.png",
        "IMG_5557.png",
        "IMG_7083 copy.jpg",
        "IMG_7474.png",
        "IMG_7505.png",
        "IMG_7591 copy.png",
        "kitty 2.jpg",
        "medium length stunning.PNG",
        "n.jpg",
        "R1.png",
        "R2.png",
        "R3.png",
        "R4.png",
        "R5.png",
        "short nail tn.jpg",
        "vdcd.jpg",
      ];

      return biabImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/biab/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for Cat eye - use all images from the directory
    if (item.title === "Cat eye") {
      const catEyeImages = [
        "1_3.jpg",
        "12_2.jpg",
        "6copy.jpg",
        "9copy.jpg",
        "a.jpg",
        "b.jpg",
        "b3.jpg",
        "b4.jpg",
        "c 2.jpg",
        "cc.jpg",
        "e_copy.jpg",
        "hl5.jpg",
        "IMG_0337_copy_2.jpg",
        "IMG_1815.JPG",
        "IMG_2298_copy.jpg",
        "IMG_2401_copy.jpg",
        "IMG_3957_copy_2.jpg",
        "IMG_4959_copy.jpg",
        "IMG_5533.png",
        "IMG_5559_copy_2.jpg",
        "IMG_6513_copy_2.jpg",
        "IMG_6750_Recovered.png",
        "IMG_7030_copy.jpg",
        "IMG_9450_copy.jpg",
        "z.jpg",
      ];

      return catEyeImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/cateyes/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for Crystal - use all images from the directory
    if (item.title === "Crystal") {
      const crystalImages = [
        "1_2.png",
        "1_5.PNG",
        "a_copy.jpg",
        "b_copy.jpg",
        "cc_2.jpg",
        "i.jpg",
        "IMG_0098_2.jpg",
        "IMG_1281.HEIC",
        "IMG_3057_copy.jpg",
        "IMG_4614_copy.jpg",
        "IMG_5732_copy.jpg",
        "IMG_6364.jpg",
        "IMG_6380.jpg",
        "IMG_6740.png",
        "IMG_6828.png",
        "IMG_7300_copy.jpg",
        "IMG_7453_copy_2.JPG",
        "IMG_8006_copy.jpg",
        "IMG_8040_2_copy.jpg",
        "IMG_8395_copy.png",
        "IMG_9476.HEIC",
        "IMG_9477_copy.jpg",
        "n1 2.jpg",
        "VT_2.jpg",
      ];

      return crystalImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/crystal/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for 2D - use all images from the directory
    if (item.title === "2D") {
      const twoDImages = [
        "1_2.png",
        "1_5.PNG",
        "3.png",
        "a_copy.jpg",
        "b_copy.jpg",
        "c.jpg",
        "cc_2.jpg",
        "cdsc.png",
        "f1.jpg",
        "fe.jpg",
        "i.jpg",
        "IMG_0098_2.jpg",
        "IMG_0922 copy 2.jpg",
        "IMG_0985.jpg",
        "IMG_1276.HEIC",
        "IMG_1279.PNG",
        "IMG_1281.HEIC",
        "IMG_1311_copy.jpg",
        "IMG_1462.HEIC",
        "IMG_1542.heic",
        "IMG_1671.HEIC",
        "IMG_1921_copy.jpg",
        "IMG_2384.HEIC",
        "IMG_2437.HEIC",
        "IMG_2467_copy.jpg",
        "IMG_2500_copy.jpg",
        "IMG_2763_copy.jpg",
        "IMG_3057_copy.jpg",
        "IMG_3580_copy.jpg",
        "IMG_4356.HEIC",
        "IMG_4614_copy.jpg",
        "IMG_4722_copy.jpg",
        "IMG_4793_copy.jpg",
        "IMG_4951_copy.jpg",
        "IMG_4959_copy.jpg",
        "IMG_5151_copy.jpg",
        "IMG_5359.jpg",
        "IMG_5373 2_copy.png",
        "IMG_5396.png",
        "IMG_5732_copy.jpg",
        "IMG_6364.jpg",
        "IMG_6380.jpg",
        "IMG_6486.png",
        "IMG_6740.png",
        "IMG_6775_copy.jpg",
        "IMG_6828.png",
        "IMG_6999.jpg",
        "IMG_7083 copy.jpg",
        "IMG_7300_copy.jpg",
        "IMG_7453_copy 2.JPG",
        "IMG_7474.png",
        "IMG_7501.png",
        "IMG_7884_copy.png",
        "IMG_7942_copy.PNG",
        "IMG_8006_copy.jpg",
        "IMG_8040 2_copy.jpg",
        "IMG_8395_copy.png",
        "IMG_8733_copy.jpg",
        "IMG_9477_copy.jpg",
        "j.JPG",
        "maritni_tn.jpg",
        "n.jpg",
        "n1_2.jpg",
        "R2.png",
        "sds.jpg",
        "Untitled-1.png",
        "vu╠â_tru╠ú 2.jpg",
        "x.png",
        "xsx.jpg",
        "z.jpg",
      ];

      return twoDImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/2d/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // Special handling for Seasonal design - use images from the seasonal_design directory
    if (item.title === "Seasonal design") {
      const seasonalDesignImages = [
        "a.jpg",
        "b.jpg",
        "c.jpg",
        "d.jpg",
        "e.jpg",
        "f.jpg",
        "g.jpg",
        "h.jpg",
        "i.jpg",
        "j.jpg",
        "k.jpg",
        "l.jpg",
        "m.jpg",
        "IMG_3915 copy 2.jpg",
        "IMG_4722 copy.jpg",
        "IMG_4729 copy.jpg",
        "IMG_4793 copy.jpg",
        "IMG_4947 copy.jpg",
        "IMG_4951 copy.jpg",
        "IMG_4959 copy.jpg",
        "IMG_5057 copy.jpg",
        "IMG_9212 copy.jpg",
        "IMG_9338 copy.jpg",
        "IMG_9450 copy.jpg",
        "IMG_9477 copy.jpg",
        "IMG_9534 copy.jpg",
      ];

      return seasonalDesignImages.map((filename) => {
        // Properly encode the filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        const imagePath = asset(`gallery/Nail_Queen/seasonal_design/${encodedFilename}`);
        return {
          full: imagePath,
          thumb: imagePath,
        };
      });
    }

    // For other items, use the same image multiple times
    const baseImage = item.image;
    const count = 6;
    
    return Array.from({ length: count }, () => ({
      full: baseImage,
      thumb: baseImage,
    }));
  };

  const handleCardClick = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
  };

  return (
    <Layout basePath={basePath}>
      <style>{`
        [data-radix-dialog-content][data-state="open"] {
          animation: dialog-enter 200ms ease-out !important;
        }
        [data-radix-dialog-content][data-state="closed"] {
          animation: dialog-exit 200ms ease-in !important;
        }
        @keyframes dialog-enter {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes dialog-exit {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
        }
      `}</style>
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold text-center text-nail-queen-brown mb-16">Gallery</h1>

          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {filterCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                  activeFilter === category.id
                    ? "bg-nail-queen-brown text-white"
                    : "bg-white text-nail-queen-brown border border-nail-queen-brown hover:bg-nail-queen-brown hover:text-white"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer"
                onClick={() => handleCardClick(item)}
              >
                <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-medium text-nail-queen-brown">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-nail-queen-brown">
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="mt-4">
              <ThumbnailsCarousel images={generateCarouselImages(selectedItem)} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
