import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Pagination from "./Pagination";
import { ThemeLink } from "../ThemeLink";
import { products as allProducts } from "./products";

interface ProductGridProps {
  activeTab?: string; // "All" or category label
  sortBy?: "featured" | "price-low" | "price-high" | "newest" | "name";
}

function parsePrice(price: string) {
  const n = Number(String(price).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const ProductGrid = ({
  activeTab = "All",
  sortBy = "featured",
}: ProductGridProps) => {
  const filtered =
    activeTab && activeTab !== "All"
      ? allProducts.filter((p) => p.category === activeTab)
      : allProducts;

  const products = [...filtered].sort((a, b) => {
    if (sortBy === "price-low") return parsePrice(a.price) - parsePrice(b.price);
    if (sortBy === "price-high") return parsePrice(b.price) - parsePrice(a.price);
    if (sortBy === "newest") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <section className="w-full px-6 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <Card
            key={product.id}
            className="border border-primary/60 shadow-none bg-white rounded-[1.5rem] overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="relative bg-white aspect-square">
                {product.isNew && (
                  <div className="absolute top-4 left-4 text-xs font-body font-medium text-primary">
                    NEW
                  </div>
                )}
                <ThemeLink to={`/product/${product.id}`} className="block h-full w-full">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-10"
                  />
                </ThemeLink>
              </div>

              <div className="bg-[#F2EFDC] px-5 py-4">
                <p className="text-sm font-body font-light text-primary">{product.category}</p>
                <div className="mt-1 flex items-end justify-between gap-4">
                  <h3 className="text-base font-heading font-medium text-foreground leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-sm font-body font-light text-foreground whitespace-nowrap">
                    {product.price}
                  </p>
                </div>

                <Button
                  asChild
                  className="mt-4 w-full rounded-full bg-primary hover:bg-primary/90"
                >
                  <ThemeLink to={`/product/${product.id}`}>View product</ThemeLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination />
    </section>
  );
};

export default ProductGrid;