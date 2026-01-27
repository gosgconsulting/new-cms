import { Utensils, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeLink } from "../ThemeLink";

import potatoNoodleImg from "../../assets/potato_noodle.jpg";
import saladImg from "../../assets/salad.jpg";
import pureeImg from "../../assets/puree.jpg";
import blossomImg from "../../assets/blossom.jpg";

type Recipe = {
  slug: string;
  title: string;
  image: string;
  time: string;
  tags: string[];
  excerpt: string;
};

const recipes: Recipe[] = [
  {
    slug: "Chilled-Barley-Tea-Broth-Potato-Noodles",
    title: "Chilled Barley Tea Broth Potato Noodles",
    image: potatoNoodleImg,
    time: "10 min",
    tags: ["Comfort", "Quick"],
    excerpt:
      "Some cravings hit hardest in warm weather. This chilled noodle bowl is clean, tangy, and deeply refreshing, built on roasted barley tea for a gentle nutty finish.",
  },
  {
    slug: "MoonDk-Sesame-Perilla-Garden-Saladl",
    title: "MoonDk Sesame Perilla Garden Salad",
    image: saladImg,
    time: "15 min",
    tags: ["Balanced", "Pantry"],
    excerpt:
      "Fresh, crunchy, and quietly addictive. This salad is built around two Korean favourites, sesame oil for warmth and perilla oil for that herby, slightly minty aroma that makes you go, oh, I missed this.",
  },
  {
    slug: "Autumn-Bingtteok-with-Charcoal-Grilled-Chestnut-Purée",
    title: "Autumn Bingtteok with Charcoal Grilled Chestnut Purée",
    image: pureeImg,
    time: "25 min",
    tags: ["Sharing", "Heritage"],
    excerpt:
      "Bingtteok is a traditional Jeju dish made by wrapping stir fried radish in a thin buckwheat pancake. Lightly seasoned to let the ingredients speak, it is a dish often served for gatherings and special occasions.",
  },
  {
    slug: "Makgeolli-Milk-Bread-with-Cherry-Blossom-Butter",
    title: "Makgeolli Milk Bread with Cherry Blossom Butter",
    image: blossomImg,
    time: "20 min",
    tags: ["Light", "Refreshing"],
    excerpt:
      "Soft, slightly tangy, and gently sweet. This makgeolli milk bread bakes up plush and aromatic, then gets paired with a cherry blossom butter that tastes like spring in one bite.",
  },
];

export default function HomeRecipesSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-body tracking-tight">
              MoonDk <span className="font-heading italic font-normal">Recipes</span>
            </h2>
            <p className="mt-2 text-sm md:text-base font-body text-foreground/70 max-w-xl">
              Chef-crafted recipes for home dining—clean, balanced, and easy to return to.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full px-6">
            <ThemeLink to="/recipes">View all recipes</ThemeLink>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recipes.map((r) => (
            <Card key={r.slug} className="rounded-[1.5rem] border-border/40 shadow-none hover:shadow-sm transition-shadow flex flex-col">
              <CardContent className="p-0 flex flex-col flex-1">
                <ThemeLink to="/recipes" className="block">
                  <div className="rounded-t-[1.5rem] overflow-hidden">
                    <img src={r.image} alt={r.title} className="w-full h-48 md:h-52 object-cover" />
                  </div>
                </ThemeLink>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-foreground/60 font-body">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {r.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Utensils className="h-3.5 w-3.5" /> {r.tags.join(" • ")}
                    </span>
                  </div>

                  <ThemeLink to="/recipes" className="block mt-2">
                    <h3 className="text-base font-heading leading-tight hover:underline underline-offset-4">
                      {r.title}
                    </h3>
                  </ThemeLink>

                  <p className="mt-2 text-sm font-body text-foreground/70 flex-1">{r.excerpt}</p>

                  <div className="mt-4">
                    <Button asChild className="rounded-full w-full bg-primary hover:bg-primary-hover !text-white">
                      <ThemeLink to="/recipes" className="!text-white">Read recipe</ThemeLink>
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