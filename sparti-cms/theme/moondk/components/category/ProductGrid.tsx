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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
<<<<<<< HEAD
          <Card
            key={product.id}
            className="rounded-[1.5rem] border-border/40 shadow-none hover:shadow-sm transition-shadow"
          >
            <CardContent className="p-0">
              <ThemeLink to={`/product/${product.id}`} className="block">
                <div className="relative rounded-t-[1.5rem] overflow-hidden bg-white">
                  {product.isNew && (
                    <div className="absolute top-4 left-4 text-xs font-body font-medium text-primary">
=======
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
>>>>>>> 687dfeb057b10a53dd9bb902c2bb43030fad2f84
                      NEW
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-52 md:h-56 object-contain p-10"
                  />
                </div>
<<<<<<< HEAD
              </ThemeLink>

              <div className="p-4">
                <div className="flex items-center justify-between gap-3 text-xs text-foreground/60 font-body">
                  <span className="truncate">{product.category}</span>
                  <span className="whitespace-nowrap">{product.price}</span>
=======
                <div className="space-y-1 px-4 pb-4">
                  <p className="text-sm font-body font-light text-foreground/70">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-heading font-medium text-foreground">{product.name}</h3>
                    <p className="text-sm font-body font-light text-foreground">{product.price}</p>
                  </div>
>>>>>>> 687dfeb057b10a53dd9bb902c2bb43030fad2f84
                </div>

                <ThemeLink to={`/product/${product.id}`} className="block mt-2">
                  <h3 className="text-base font-heading leading-tight hover:underline underline-offset-4">
                    {product.name}
                  </h3>
                </ThemeLink>

                <p className="mt-2 text-sm font-body text-foreground/70">
                  Chef-curated essentials for Korean home dining.
                </p>

                <div className="mt-4">
                  <Button
                    asChild
                    className="rounded-full w-full bg-primary hover:bg-primary/90"
                  >
                    <ThemeLink to={`/product/${product.id}`}>View product</ThemeLink>
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