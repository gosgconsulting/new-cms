import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ThemeLink } from "../ThemeLink";
import { products } from "../category/products";

export default function HomeNewArrivalsSection() {
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);

  if (newArrivals.length === 0) return null;

  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-body tracking-tight">
              New <span className="font-heading italic font-normal">arrivals</span>
            </h2>
            <p className="mt-3 text-sm md:text-base font-body text-foreground/70 max-w-xl">
              Freshly curated essentials—just landed.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-full px-8">
            <ThemeLink to="/category/new-in">Shop new</ThemeLink>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((p) => (
            <Card
              key={p.id}
              className="rounded-[1.5rem] border-none shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                <ThemeLink to={`/product/${p.id}`} className="block">
                  <div className="relative rounded-t-[1.5rem] overflow-hidden bg-white">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-52 md:h-56 object-contain p-10"
                    />
                  </div>
                </ThemeLink>

                <div className="p-4">
                  <ThemeLink to={`/product/${p.id}`} className="block">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-heading leading-tight hover:underline underline-offset-4 flex-1">
                        {p.name}
                      </h3>
                      <span className="text-lg font-body font-medium text-foreground whitespace-nowrap">
                        {p.price}
                      </span>
                    </div>
                  </ThemeLink>

                  <div className="mt-4">
                    <Button asChild className="rounded-full w-full bg-primary hover:bg-primary-hover !text-white">
                      <ThemeLink to={`/product/${p.id}`} className="!text-white">View product</ThemeLink>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
