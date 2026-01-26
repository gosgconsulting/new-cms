import { ArrowRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeLink } from "../ThemeLink";

import imgMain from "../../assets/slider-4.png";
import imgStack from "../../assets/slider-1.png";

export default function HomeFineDiningSection() {
  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-body tracking-tight">Fine Dining at Beok</h2>
          <p className="mt-3 text-sm md:text-base font-body text-foreground/70 max-w-2xl mx-auto">
            At Beok, we explore natural flavour through Korean contemporary cuisine. Balanced, comforting, and ingredient-forward—with modern sensibility and seasonal courses served in Singapore.
          </p>
        </div>

        <div className="rounded-[2rem] bg-[#EAE2E3] p-6 md:p-8 border border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Left: stacked images */}
            <div className="relative order-2 md:order-1">
              <div className="rounded-[1.5rem] overflow-hidden bg-white shadow-sm border border-border/40">
                <img
                  src={imgMain}
                  alt="Beok seasonal courses"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>

              <div className="hidden sm:block absolute -bottom-6 -left-6 w-40">
                <div className="rounded-[1.25rem] overflow-hidden bg-white shadow-sm border border-border/40">
                  <img
                    src={imgStack}
                    alt="Ingredient-forward cooking"
                    className="w-full h-28 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right: content card */}
            <div className="rounded-[1.75rem] bg-white/90 backdrop-blur p-6 md:p-8 border border-border/40 order-1 md:order-2">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Utensils className="h-5 w-5" />
                <span className="text-sm font-body">Modern Korean</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-heading leading-tight">
                Experience fine dining, ingredient-forward.
              </h3>
              <p className="mt-4 text-sm md:text-base font-body text-foreground/70">
                Expect clean finishes and subtle layers that let each ingredient speak—nights that begin as a craving and end as a memory.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-6">
                  <ThemeLink to="/beok">
                    Book a table
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ThemeLink>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6">
                  <ThemeLink to="/about/our-story">Learn more</ThemeLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}