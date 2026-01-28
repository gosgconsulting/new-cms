import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeLink } from "../ThemeLink";

import imgMain from "../../assets/about.png";
import imgStack from "../../assets/about_small.jpg";

export default function HomeAboutSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-body tracking-tight">about and Experience</h2>
        </div>
        <div className="rounded-[2rem] bg-[#F2EFDC] p-6 md:p-8 border-none shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Left: content card */}
            <div className="rounded-[1.75rem] bg-white/90 backdrop-blur p-6 md:p-8 border-none shadow-md md:order-1">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-body">Comfort first</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-heading leading-tight">
              About MoonDk
              </h3>
              <p className="mt-4 text-sm md:text-base font-body text-foreground/70">
              Korean food is more than flavour. It is comfort, rhythm, and familiarity. MoonDk exists to recreate that feeling, whether you are sharing a table with friends or making a quick bowl at midnight.
              </p>

              <div className="mt-6">
                <Button asChild className="rounded-full px-6 bg-primary hover:bg-primary-hover !text-white">
                  <ThemeLink to="/about/our-story" className="!text-white">
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ThemeLink>
                </Button>
              </div>
            </div>

            {/* Right: stacked images */}
            <div className="relative md:order-2">
              <div className="rounded-[1.5rem] overflow-hidden bg-white shadow-md">
                <img
                  src={imgMain}
                  alt="Home dining comfort"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>

              <div className="hidden sm:block absolute -bottom-6 -left-6 w-40">
                <div className="rounded-[1.25rem] overflow-hidden bg-white shadow-md">
                  <img
                    src={imgStack}
                    alt="Everyday Korean flavours"
                    className="w-full h-28 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}