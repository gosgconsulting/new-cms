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

export default function ProductGrid({
  activeTab = "All",
  sortBy = "featured",
}: ProductGridProps) {
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
      {/* Recipe-style product cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="rounded-[1.5rem] border-none shadow-md hover:shadow-lg transition-shadow w-full max-w-[280px] flex flex-col"
          >
            <CardContent className="p-0 flex flex-col flex-1">
              <ThemeLink to={`/product/${product.id}`} className="block">
                <div className="relative rounded-t-[1.5rem] overflow-hidden bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-52 md:h-56 object-contain p-10"
                  />
                </div>
              </ThemeLink>

              <div className="p-4 flex flex-col flex-1">
                <ThemeLink to={`/product/${product.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-heading leading-tight hover:underline underline-offset-4 flex-1">
                      {product.name}
                    </h3>
                    <span className="text-lg font-body font-medium text-foreground whitespace-nowrap">
                      {product.price}
                    </span>
                  </div>
                </ThemeLink>

                <div className="mt-auto pt-4">
                  <Button asChild className="rounded-full w-full bg-primary hover:bg-primary-hover !text-white">
                    <ThemeLink to={`/product/${product.id}`} className="!text-white">View product</ThemeLink>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination />
    </section>
  );
}
