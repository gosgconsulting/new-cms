import { useEffect, useMemo, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ThemeLink } from "../ThemeLink";

import teaImg from "../../assets/tea.jpg";
import oilImg from "../../assets/oil.jpg";
import noodleImg from "../../assets/noodle.jpg";
import alcImg from "../../assets/alc.jpg";
import personalCareImg from "../../assets/blossom.jpg";

type CategoryItem = {
  title: string;
  to: string;
  image: string;
};

const categories: CategoryItem[] = [
  { title: "Tea", to: "/category/all-products?filter=Tea", image: teaImg },
  { title: "Oil", to: "/category/all-products?filter=Oil", image: oilImg },
  { title: "Noodle", to: "/category/all-products?filter=Noodles", image: noodleImg },
  { title: "Soju", to: "/category/all-products?filter=Soju", image: alcImg },
  { title: "Personal care", to: "/category/all-products?filter=Personal%20care", image: personalCareImg },
];

export default function HomeCategoryCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);

  const slideCount = useMemo(() => categories.length, []);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setIndex(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const progress = slideCount <= 1 ? 0 : index / (slideCount - 1);

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-body tracking-tight">
              Simple solutions for <span className="font-heading italic font-normal">every need</span>
            </h2>
            <p className="mt-3 text-sm md:text-base font-body text-foreground/70 max-w-xl">
              Shop by category—curated to help you find the right essentials quickly.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-full px-8">
            <ThemeLink to="/category/shop">Shop all</ThemeLink>
          </Button>
        </div>

        <div className="mt-10">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
            }}
          >
            <CarouselContent>
              {categories.map((c) => (
                <CarouselItem
                  key={c.title}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3"
                >
                  <ThemeLink to={c.to} className="block">
                    <div className="relative overflow-hidden rounded-[1.75rem] bg-[#F7E6E6]">
                      <div className="aspect-[3/4]">
                        <img
                          src={c.image}
                          alt={c.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="rounded-2xl bg-white/85 backdrop-blur px-4 py-3 border border-white/50">
                          <p className="text-lg font-body tracking-tight text-foreground">
                            {c.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ThemeLink>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="mt-10 flex items-center gap-4">
            <div className="relative h-px w-full bg-border/50">
              <div
                className="absolute left-0 top-0 h-px bg-foreground/60"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 w-10 rounded-full border border-border/60 bg-background hover:bg-accent transition-colors flex items-center justify-center"
                aria-label="Previous"
                onClick={() => api?.scrollPrev()}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="h-10 w-10 rounded-full border border-border/60 bg-background hover:bg-accent transition-colors flex items-center justify-center"
                aria-label="Next"
                onClick={() => api?.scrollNext()}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
