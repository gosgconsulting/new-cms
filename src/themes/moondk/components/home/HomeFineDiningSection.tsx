import { useState } from "react";
import { ArrowRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeLink } from "../ThemeLink";
import ContactFormSheet from "../ContactFormSheet";

import imgMain from "../../assets/rice.jpg";
import imgStack from "../../assets/small_bowl.jpg";

export default function HomeFineDiningSection() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-[#EAE2E3] p-6 md:p-8 border-none shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Left: stacked images */}
            <div className="relative order-2 md:order-1">
              <div className="rounded-[1.5rem] overflow-hidden bg-white shadow-md">
                <img
                  src={imgMain}
                  alt="Beok seasonal courses"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>

              <div className="hidden sm:block absolute -bottom-6 -left-6 w-40">
                <div className="rounded-[1.25rem] overflow-hidden bg-white shadow-md">
                  <img
                    src={imgStack}
                    alt="Ingredient-forward cooking"
                    className="w-full h-28 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right: content card */}
            <div className="rounded-[1.75rem] bg-white/90 backdrop-blur p-6 md:p-8 border-none shadow-md order-1 md:order-2">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Utensils className="h-5 w-5" />
                <span className="text-sm font-body">Modern Korean</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-heading leading-tight">
                Experience fine dining at Beok, ingredient-forward.
              </h3>
              <p className="mt-4 text-sm md:text-base font-body text-foreground/70">
              At Beok, we explore natural flavour through Korean contemporary cuisine. Balanced, comforting, and ingredient-forward—with modern sensibility and seasonal courses served in Singapore.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button 
                  onClick={() => setIsContactFormOpen(true)}
                  className="rounded-full px-6 bg-primary hover:bg-primary-hover !text-white"
                >
                  Book a table
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6">
                  <ThemeLink to="/beok-private-dinning">Learn more</ThemeLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactFormSheet
        open={isContactFormOpen}
        onOpenChange={setIsContactFormOpen}
      />
    </section>
  );
}