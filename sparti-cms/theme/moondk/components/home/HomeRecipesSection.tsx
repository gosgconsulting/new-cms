import { Utensils, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeLink } from "../ThemeLink";

import img1 from "../../assets/slider-1.png";
import img2 from "../../assets/slider-2.png";
import img3 from "../../assets/slider-3.png";
import img4 from "../../assets/slider-4.png";

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
    slug: "midnight-kimchi-noodles",
    title: "Midnight Kimchi Noodles",
    image: img1,
    time: "10 min",
    tags: ["Comfort", "Quick"],
    excerpt:
      "A fast, deeply satisfying bowl that balances spice and tang—perfect for late-night cravings.",
  },
  {
    slug: "everyday-gochujang-rice-bowl",
    title: "Everyday Gochujang Rice Bowl",
    image: img2,
    time: "15 min",
    tags: ["Balanced", "Pantry"],
    excerpt:
      "Clean and balanced flavours with pantry-friendly ingredients—our go-to weekday bowl.",
  },
  {
    slug: "seasonal-banchan-collection",
    title: "Seasonal Banchan Collection",
    image: img3,
    time: "25 min",
    tags: ["Sharing", "Heritage"],
    excerpt:
      "A small spread of seasonal sides to share—gentle, comforting, and distinctly Korean.",
  },
  {
    slug: "soy-sesame-cold-noodles",
    title: "Soy & Sesame Cold Noodles",
    image: img4,
    time: "20 min",
    tags: ["Light", "Refreshing"],
    excerpt:
      "Bright, chilled noodles with clean finishes—for quiet afternoons and warm evenings.",
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
            <Card key={r.slug} className="rounded-[1.5rem] border-border/40 shadow-none hover:shadow-sm transition-shadow">
              <CardContent className="p-0">
                <ThemeLink to="/recipes" className="block">
                  <div className="rounded-t-[1.5rem] overflow-hidden">
                    <img src={r.image} alt={r.title} className="w-full h-48 md:h-52 object-cover" />
                  </div>
                </ThemeLink>

                <div className="p-4">
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

                  <p className="mt-2 text-sm font-body text-foreground/70">{r.excerpt}</p>

                  <div className="mt-4">
                    <Button asChild className="rounded-full w-full">
                      <ThemeLink to="/recipes">Read recipe</ThemeLink>
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