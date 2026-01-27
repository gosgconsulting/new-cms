import { Button } from "@/components/ui/button";
import Pagination from "./Pagination";
import { ThemeLink } from "../ThemeLink";
import { products as allProducts } from "./products";
import { ArrowRight } from "lucide-react";

interface ProductGridProps {
  activeTab?: string; // "All" or category label
  sortBy?: "featured" | "price-low" | "price-high" | "newest" | "name";
}

function parsePrice(price: string) {
  const n = Number(String(price).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function categoryPastelBg(category: string) {
  // Pastel backgrounds inspired by the provided reference.
  const map: Record<string, string> = {
    Tea: "bg-[#FFD6E8]",
  };
  return map[category] ?? "bg-[#FFE2F1]";
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
      {/* Shop-style product tiles (category header, image, title+price, button) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {products.map((product) => (
          <div key={product.id} className="w-full">
            <ThemeLink
              to={`/product/${product.id}`}
              className="block overflow-hidden rounded-[28px] border border-black/10"
            >
              {/* Category header */}
              <div className="bg-[#B0006B] text-white text-center py-5 px-4">
                <div className="font-heading font-semibold text-2xl leading-none">
                  {product.category}
                </div>
              </div>

              {/* Image */}
              <div
                className={
                  "flex items-center justify-center " +
                  categoryPastelBg(product.category) +
                  " px-8 py-12"
                }
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-56 object-contain"
                  loading="lazy"
                />
              </div>
            </ThemeLink>

            {/* Title + price (no sub description) */}
            <ThemeLink to={`/product/${product.id}`} className="block mt-6">
              <h3 className="font-body font-black uppercase tracking-tight text-[#B0006B] text-2xl leading-tight">
                {product.name}
              </h3>
              {product.price ? (
                <div className="mt-2 font-body font-extrabold text-[#B0006B] text-lg">
                  {product.price}
                </div>
              ) : null}
            </ThemeLink>

            {/* Button */}
            <div className="mt-6">
              <Button
                asChild
                className="rounded-full w-full bg-[#B0006B] hover:bg-[#97005C] text-white h-14 text-lg font-body font-semibold"
              >
                <ThemeLink
                  to={`/product/${product.id}`}
                  className="flex items-center justify-center gap-2"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-5 w-5" />
                </ThemeLink>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Pagination />
    </section>
  );
}