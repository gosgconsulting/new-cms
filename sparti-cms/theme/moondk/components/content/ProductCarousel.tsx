import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeLink } from "../ThemeLink";

import pantheonImage from "../../../e-shop/assets/pantheon.jpg";
import eclipseImage from "../../../e-shop/assets/eclipse.jpg";
import haloImage from "../../../e-shop/assets/halo.jpg";
import obliqueImage from "../../../e-shop/assets/oblique.jpg";
import lintelImage from "../../../e-shop/assets/lintel.jpg";
import shadowlineImage from "../../../e-shop/assets/shadowline.jpg";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
}

const products: Product[] = [
  { id: 1, name: "Chef's Selection Box", category: "Curated Sets", price: "€45", image: pantheonImage },
  { id: 2, name: "Korean Essentials Kit", category: "Essentials", price: "€32", image: eclipseImage },
  { id: 3, name: "Premium Gochujang", category: "Ingredients", price: "€18", image: haloImage },
  { id: 4, name: "Traditional Kimchi", category: "Ingredients", price: "€22", image: obliqueImage },
  { id: 5, name: "Chef's Tool Set", category: "Tools", price: "€65", image: lintelImage },
  { id: 6, name: "Recipe Collection", category: "Collections", price: "€28", image: shadowlineImage },
];

const ProductCarousel = () => {
  return (
    <section className="w-full mb-20 px-6">
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
                      <div className="absolute inset-0 bg-black/[0.02]"></div>
                      {(product.id === 1 || product.id === 3) && (
                        <div className="absolute top-2 left-2 px-2 py-1 text-xs font-body font-medium text-primary bg-background/90">
                          NEW
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-body font-light text-foreground/70">{product.category}</p>
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-heading font-medium text-foreground">{product.name}</h3>
                        <p className="text-sm font-body font-light text-foreground">{product.price}</p>
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
