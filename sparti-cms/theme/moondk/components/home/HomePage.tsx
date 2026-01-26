import { useMemo, useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeLink } from "../ThemeLink";

import heroImage from "../../assets/slider-2.png";
import heroImage2 from "../../assets/slider-3.png";

type ProductCategoryKey = "bestsellers" | "new" | "ingredients" | "tools" | "sets";

type Product = {
  id: number;
  name: string;
  categoryLabel: string;
  categoryKey: ProductCategoryKey;
  price: string;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
};

const categoryTabs: Array<{ key: ProductCategoryKey; label: string }> = [
  { key: "bestsellers", label: "Bestsellers" },
  { key: "new", label: "New" },
  { key: "sets", label: "Curated Sets" },
  { key: "ingredients", label: "Ingredients" },
  { key: "tools", label: "Tools" },
];

const products: Product[] = [
  {
    id: 1,
    name: "Chef's Selection Box",
    categoryLabel: "Curated Sets",
    categoryKey: "sets",
    price: "€45",
    image: heroImage,
    badge: "Best Seller",
    rating: 4.9,
    reviews: 312,
  },
  {
    id: 3,
    name: "Premium Gochujang",
    categoryLabel: "Ingredients",
    categoryKey: "ingredients",
    price: "€18",
    image: heroImage2,
    badge: "New",
    rating: 4.8,
    reviews: 146,
  },
  {
    id: 4,
    name: "Traditional Kimchi",
    categoryLabel: "Ingredients",
    categoryKey: "ingredients",
    price: "€22",
    image: heroImage,
    rating: 4.7,
    reviews: 88,
  },
  {
    id: 5,
    name: "Chef's Tool Set",
    categoryLabel: "Tools",
    categoryKey: "tools",
    price: "€65",
    image: heroImage2,
    badge: "Limited",
    rating: 4.9,
    reviews: 204,
  },
  {
    id: 2,
    name: "Korean Essentials Kit",
    categoryLabel: "New",
    categoryKey: "new",
    price: "€32",
    image: heroImage,
    badge: "New",
    rating: 4.8,
    reviews: 129,
  },
  {
    id: 6,
    name: "Recipe Collection",
    categoryLabel: "Bestsellers",
    categoryKey: "bestsellers",
    price: "€28",
    image: heroImage2,
    badge: "Top Rated",
    rating: 5.0,
    reviews: 59,
  },
  {
    id: 11,
    name: "Korean BBQ Set",
    categoryLabel: "Curated Sets",
    categoryKey: "sets",
    price: "€75",
    image: heroImage,
    rating: 4.8,
    reviews: 91,
  },
  {
    id: 15,
    name: "Chef's Knife",
    categoryLabel: "Tools",
    categoryKey: "tools",
    price: "€85",
    image: heroImage2,
    rating: 4.9,
    reviews: 77,
  },
];

function Stars({ rating }: { rating: number }) {
  const fullStars = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < fullStars;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              filled ? "text-starYellow fill-starYellow" : "text-muted-foreground/30"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [active, setActive] = useState<ProductCategoryKey>("bestsellers");

  const visibleProducts = useMemo(() => {
    if (active === "bestsellers") return products;
    return products.filter((p) => p.categoryKey === active);
  }, [active]);

  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-10 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm font-body tracking-wide text-foreground/70">
                Korean home dining, chef-led.
              </p>
              <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-heading font-semibold leading-[1.05]">
                Curated ingredients & tools
                <span className="block">for your everyday table.</span>
              </h1>
              <p className="mt-5 text-base md:text-lg font-body text-foreground/70 max-w-xl">
                Discover heritage flavors, modern essentials, and curated sets—made
                to cook beautifully at home.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button asChild className="rounded-full bg-primary hover:bg-primary/90 px-7">
                  <ThemeLink to="/category/shop">Shop now</ThemeLink>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-7">
                  <ThemeLink to="/about/our-story">Our story</ThemeLink>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <p className="text-sm font-heading">Chef-curated</p>
                  <p className="text-sm text-foreground/70 font-body">Tested at home.</p>
                </div>
                <div>
                  <p className="text-sm font-heading">Authentic</p>
                  <p className="text-sm text-foreground/70 font-body">Heritage-first.</p>
                </div>
                <div>
                  <p className="text-sm font-heading">Beautiful</p>
                  <p className="text-sm text-foreground/70 font-body">Gift-ready.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-[#F2EFDC] via-[#EAE2E3] to-[#C9CFC7] opacity-80" />
              <div className="relative rounded-[2.25rem] overflow-hidden border border-border/40 bg-card shadow-sm">
                <img
                  src={heroImage}
                  alt="Featured collection"
                  className="h-[360px] w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="rounded-[1.5rem] bg-white/85 backdrop-blur px-4 py-3 border border-border/30">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-body text-foreground/70">This week</p>
                        <p className="text-sm font-heading">Chef's Selection Box</p>
                      </div>
                      <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90">
                        <ThemeLink to="/product/1">View</ThemeLink>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block absolute -bottom-6 -left-6 w-44">
                <Card className="rounded-[1.75rem] overflow-hidden border-border/40 shadow-sm">
                  <CardContent className="p-0">
                    <ThemeLink to="/product/3" className="block">
                      <img src={heroImage2} alt="Second feature" className="h-36 w-full object-cover" />
                    </ThemeLink>
                    <div className="p-3 bg-card">
                      <p className="text-xs font-body text-foreground/70">New</p>
                      <p className="text-sm font-heading">Premium Gochujang</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product list */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading">Shop products</h2>
              <p className="mt-2 text-sm md:text-base font-body text-foreground/70">
                A clean, soft layout centered around a scannable product grid.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryTabs.map((t) => {
                const isActive = active === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActive(t.key)}
                    className={
                      "rounded-full px-4 py-2 text-sm font-body border transition-colors " +
                      (isActive
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border/50 hover:border-border")
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {visibleProducts.map((p) => (
              <Card
                key={p.id}
                className="h-full rounded-[1.75rem] border-border/40 shadow-none hover:shadow-sm transition-shadow"
              >
                <CardContent className="p-4">
                  <ThemeLink to={`/product/${p.id}`} className="block group">
                    <div className="relative rounded-[1.25rem] overflow-hidden bg-muted/20">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="aspect-square w-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                      {p.badge && (
                        <div className="absolute top-3 left-3 rounded-full bg-white/90 border border-border/40 px-3 py-1 text-xs font-body">
                          {p.badge}
                        </div>
                      )}
                    </div>
                  </ThemeLink>

                  <div className="mt-4">
                    <p className="text-xs font-body text-foreground/70">{p.categoryLabel}</p>
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <ThemeLink to={`/product/${p.id}`} className="block">
                        <h3 className="text-sm font-heading leading-snug hover:underline underline-offset-4">
                          {p.name}
                        </h3>
                      </ThemeLink>
                      <p className="text-sm font-body">{p.price}</p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Stars rating={p.rating} />
                        <span className="text-xs text-foreground/60 font-body">({p.reviews})</span>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="mt-4 w-full rounded-full bg-primary hover:bg-primary/90"
                    >
                      <ThemeLink to={`/product/${p.id}`}>View product</ThemeLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}