import { useState } from "react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";

export default function CategoryPage({ category }: { category: string }) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        <CategoryHeader category={category || "All Products"} />
        <FilterSortBar
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          itemCount={24}
        />
        <ProductGrid />
      </main>

      <Footer />
    </div>
  );
}
