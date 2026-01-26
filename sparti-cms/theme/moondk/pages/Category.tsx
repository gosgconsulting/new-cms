import { useEffect, useMemo, useState } from "react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductGrid from "../components/category/ProductGrid";
import { categoryTabs, products as allProducts } from "../components/category/products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function labelFromSlug(slug: string | undefined) {
  if (!slug || slug === "shop") return "All";
  const map: Record<string, string> = {
    "curated-sets": "Curated Sets",
    "ingredients": "Ingredients",
    "tools": "Tools",
    "essentials": "Essentials",
    "recipe-collections": "Recipe Collections",
  };
  return map[slug] || "All";
}

export default function CategoryPage({ category }: { category: string }) {
  const [activeTab, setActiveTab] = useState<string>(labelFromSlug(category));
  const [sortBy, setSortBy] = useState<
    "featured" | "price-low" | "price-high" | "newest" | "name"
  >("featured");

  useEffect(() => {
    setActiveTab(labelFromSlug(category));
  }, [category]);

  const itemCount = useMemo(() => {
    return activeTab === "All"
      ? allProducts.length
      : allProducts.filter((p) => p.category === activeTab).length;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        {/* Category tabs (green style) */}
        <section className="w-full px-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {categoryTabs.map((label) => {
              const isActive = activeTab === label;
              return (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  className={
                    "rounded-full px-4 py-2 text-sm font-body border transition-colors " +
                    (isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-primary border-primary/30 hover:border-primary/60")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Top bar (NO Filters button) */}
        <section className="w-full px-6 mb-10 border-b border-border-light pb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-body font-light text-foreground">{itemCount} items</p>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-auto border-none bg-transparent text-sm font-body font-light shadow-none rounded-none pr-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border border-border-light rounded-none bg-background">
                <SelectItem value="featured" className="hover:bg-muted/50 font-body font-light">
                  Featured
                </SelectItem>
                <SelectItem value="price-low" className="hover:bg-muted/50 font-body font-light">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price-high" className="hover:bg-muted/50 font-body font-light">
                  Price: High to Low
                </SelectItem>
                <SelectItem value="newest" className="hover:bg-muted/50 font-body font-light">
                  Newest
                </SelectItem>
                <SelectItem value="name" className="hover:bg-muted/50 font-body font-light">
                  Name A-Z
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <ProductGrid activeTab={activeTab} sortBy={sortBy} />
      </main>

      <Footer />
    </div>
  );
}