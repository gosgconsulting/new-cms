import { Card, CardContent } from "@/components/ui/card";
import Pagination from "./Pagination";
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
  isNew?: boolean;
}

const products: Product[] = [
  { id: 1, name: "Chef's Selection Box", category: "Curated Sets", price: "€45", image: pantheonImage, isNew: true },
  { id: 2, name: "Korean Essentials Kit", category: "Essentials", price: "€32", image: eclipseImage },
  { id: 3, name: "Premium Gochujang", category: "Ingredients", price: "€18", image: haloImage, isNew: true },
  { id: 4, name: "Traditional Kimchi", category: "Ingredients", price: "€22", image: obliqueImage },
  { id: 5, name: "Chef's Tool Set", category: "Tools", price: "€65", image: lintelImage },
  { id: 6, name: "Recipe Collection", category: "Collections", price: "€28", image: shadowlineImage },
  { id: 7, name: "Sesame Oil Premium", category: "Ingredients", price: "€24", image: pantheonImage },
  { id: 8, name: "Doenjang Paste", category: "Ingredients", price: "€19", image: eclipseImage },
  { id: 9, name: "Bamboo Steamer", category: "Tools", price: "€42", image: haloImage },
  { id: 10, name: "Stone Bowl Set", category: "Tools", price: "€58", image: obliqueImage },
  { id: 11, name: "Korean BBQ Set", category: "Curated Sets", price: "€75", image: lintelImage },
  { id: 12, name: "Fermentation Kit", category: "Essentials", price: "€38", image: shadowlineImage },
  { id: 13, name: "Rice Vinegar", category: "Ingredients", price: "€15", image: pantheonImage },
  { id: 14, name: "Seaweed Snacks", category: "Ingredients", price: "€12", image: eclipseImage },
  { id: 15, name: "Chef's Knife", category: "Tools", price: "€85", image: haloImage },
  { id: 16, name: "Banchan Collection", category: "Curated Sets", price: "€52", image: obliqueImage },
  { id: 17, name: "Soy Sauce Premium", category: "Ingredients", price: "€16", image: lintelImage },
  { id: 18, name: "Korean Spice Mix", category: "Ingredients", price: "€14", image: shadowlineImage },
  { id: 19, name: "Clay Pot", category: "Tools", price: "€48", image: pantheonImage },
  { id: 20, name: "Home Dining Starter", category: "Essentials", price: "€68", image: eclipseImage },
  { id: 21, name: "Miso Paste", category: "Ingredients", price: "€21", image: haloImage },
  { id: 22, name: "Korean Tea Set", category: "Curated Sets", price: "€55", image: obliqueImage },
  { id: 23, name: "Rice Cooker Premium", category: "Tools", price: "€95", image: lintelImage },
  { id: 24, name: "Chef's Recipe Book", category: "Collections", price: "€35", image: shadowlineImage },
];

const ProductGrid = () => {
  return (
    <section className="w-full px-6 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ThemeLink key={product.id} to={`/product/${product.id}`}>
            <Card className="border border-border-light shadow-none bg-card group cursor-pointer hover:border-border transition-all duration-200">
              <CardContent className="p-0">
                <div className="aspect-square mb-4 overflow-hidden bg-muted/5 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/[0.01]"></div>
                  {product.isNew && (
                    <div className="absolute top-3 left-3 px-2 py-1 text-xs font-body font-medium text-primary bg-background/95">
                      NEW
                    </div>
                  )}
                </div>
                <div className="space-y-1 px-1 pb-4">
                  <p className="text-sm font-body font-light text-foreground/70">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-heading font-medium text-foreground">{product.name}</h3>
                    <p className="text-sm font-body font-light text-foreground">{product.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ThemeLink>
        ))}
      </div>

      <Pagination />
    </section>
  );
};

export default ProductGrid;
