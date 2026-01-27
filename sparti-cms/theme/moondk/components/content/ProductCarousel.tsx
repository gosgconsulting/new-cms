import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeLink } from "../ThemeLink";
import { products } from "../category/products";

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
                      {product.isNew && (
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

    </section>
  );
};

export default ProductCarousel;
