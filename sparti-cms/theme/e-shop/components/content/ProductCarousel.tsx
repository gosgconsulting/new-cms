import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeLink } from "../ThemeLink";

import pantheonImage from "../../../../../lovable-ecom-main/src/assets/pantheon.jpg";
import eclipseImage from "../../../../../lovable-ecom-main/src/assets/eclipse.jpg";
import haloImage from "../../../../../lovable-ecom-main/src/assets/halo.jpg";
import obliqueImage from "../../../../../lovable-ecom-main/src/assets/oblique.jpg";
import lintelImage from "../../../../../lovable-ecom-main/src/assets/lintel.jpg";
import shadowlineImage from "../../../../../lovable-ecom-main/src/assets/shadowline.jpg";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
}

const products: Product[] = [
  { id: 1, name: "Pantheon", category: "Earrings", price: "€2,850", image: pantheonImage },
  { id: 2, name: "Eclipse", category: "Bracelets", price: "€3,200", image: eclipseImage },
  { id: 3, name: "Halo", category: "Earrings", price: "€1,950", image: haloImage },
  { id: 4, name: "Oblique", category: "Earrings", price: "€1,650", image: obliqueImage },
  { id: 5, name: "Lintel", category: "Earrings", price: "€2,250", image: lintelImage },
  { id: 6, name: "Shadowline", category: "Bracelets", price: "€3,950", image: shadowlineImage },
];

const ProductCarousel = () => {
  return (
    <section className="w-full mb-16 px-6">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4"
            >
              <ThemeLink to={`/product/${product.id}`}>
                <Card className="border-none shadow-none bg-transparent group">
                  <CardContent className="p-0">
                    <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 bg-black/[0.03]"></div>
                      {(product.id === 1 || product.id === 3) && (
                        <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-black">
                          NEW
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-light text-foreground">{product.category}</p>
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
                        <p className="text-sm font-light text-foreground">{product.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ThemeLink>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Keep this import used so tree-shaking doesn't drop images when tweaking */}
      <img src={shadowlineImage} alt="" className="hidden" />
    </section>
  );
};

export default ProductCarousel;
