import { Card, CardContent } from "@/components/ui/card";
import Pagination from "./Pagination";
import { ThemeLink } from "../ThemeLink";
import { products as allProducts } from "./products";

interface ProductGridProps {
  activeTab?: string; // "All" or category label
}

const ProductGrid = ({ activeTab = "All" }: ProductGridProps) => {
  const products =
    activeTab && activeTab !== "All"
      ? allProducts.filter((p) => p.category === activeTab)
      : allProducts;

  return (
    <section className="w-full px-6 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ThemeLink key={product.id} to={`/product/${product.id}`}>
            <Card className="border border-border-light shadow-none bg-[#F2EFDC] group cursor-pointer hover:bg-[#F5F0E0] hover:border-border transition-all duration-200 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square mb-4 overflow-hidden bg-white/50 relative rounded-t-2xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/[0.01]"></div>
                  {product.isNew && (
                    <div className="absolute top-3 left-3 px-3 py-1 text-xs font-body font-medium text-primary bg-white rounded-full">
                      NEW
                    </div>
                  )}
                </div>
                <div className="space-y-1 px-4 pb-4">
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