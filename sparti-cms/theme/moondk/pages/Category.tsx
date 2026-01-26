import { useMemo, useState } from "react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import { categoryTabs, products as allProducts } from "../components/category/products";

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

  const itemCount = useMemo(() => {
    return activeTab === "All"
      ? allProducts.length
      : allProducts.filter((p) => p.category === activeTab).length;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        <CategoryHeader category={category || "All Products"} />

        {/* Category tabs */}
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
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border/50 hover:border-border")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <FilterSortBar
          filtersOpen={false}
          setFiltersOpen={() => {}}
          itemCount={itemCount}
        />

        <ProductGrid activeTab={activeTab} />
      </main>

      <Footer />
    </div>
  );
}