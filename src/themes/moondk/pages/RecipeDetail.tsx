import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeLink } from "../components/ThemeLink";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Clock, Utensils, ShoppingCart } from "lucide-react";
import { products } from "../components/category/products";

import img1 from "../assets/slider-1.png";
import img2 from "../assets/slider-2.png";
import img3 from "../assets/slider-3.png";
import img4 from "../assets/slider-4.png";

type Recipe = {
  slug: string;
  title: string;
  image: string;
  time: string;
  tags: string[];
  excerpt: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: string;
    productId?: number; // Link to product if available
  }>;
  instructions: string[];
  chefNotes?: string;
};

const recipes: Recipe[] = [
  {
    slug: "midnight-kimchi-noodles",
    title: "Midnight Kimchi Noodles",
    image: img1,
    time: "10 min",
    tags: ["Comfort", "Quick"],
    excerpt: "A fast, deeply satisfying bowl that balances spice and tang—perfect for late-night cravings.",
    description: "This quick and comforting dish brings together the tangy heat of kimchi with the satisfying texture of noodles. Perfect for those late-night cravings when you need something deeply satisfying but don't want to spend hours in the kitchen.",
    ingredients: [
      { name: "Instant noodles", amount: "1 packet" },
      { name: "Kimchi", amount: "1/2 cup, chopped" },
      { name: "Gochujang", amount: "1 tbsp", productId: 1 },
      { name: "Sesame oil", amount: "1 tsp" },
      { name: "Green onions", amount: "2 stalks, chopped" },
      { name: "Sesame seeds", amount: "1 tsp, toasted" },
    ],
    instructions: [
      "Cook the instant noodles according to package directions, but reduce the cooking time by 1 minute.",
      "While noodles cook, heat a small pan over medium heat and sauté the kimchi for 2-3 minutes until slightly caramelized.",
      "Drain the noodles, reserving 2-3 tablespoons of the cooking water.",
      "In the same pot, combine the noodles, kimchi, gochujang, and reserved water. Toss until well combined.",
      "Drizzle with sesame oil and top with green onions and sesame seeds.",
      "Serve immediately while hot.",
    ],
    chefNotes: "The key to this dish is using well-fermented kimchi. The older the kimchi, the more complex the flavor. If your kimchi is very fresh, add a splash of rice vinegar to enhance the tang.",
  },
  {
    slug: "everyday-gochujang-rice-bowl",
    title: "Everyday Gochujang Rice Bowl",
    image: img2,
    time: "15 min",
    tags: ["Balanced", "Pantry"],
    excerpt: "Clean and balanced flavours with pantry-friendly ingredients—our go-to weekday bowl.",
    description: "A perfectly balanced bowl that combines the umami depth of gochujang with fresh vegetables and perfectly cooked rice. This is our go-to weekday meal—simple, satisfying, and endlessly customizable.",
    ingredients: [
      { name: "Cooked rice", amount: "1 cup" },
      { name: "Gochujang", amount: "1-2 tbsp", productId: 1 },
      { name: "Sesame oil", amount: "1 tsp" },
      { name: "Soy sauce", amount: "1 tsp" },
      { name: "Cucumber", amount: "1/2, sliced" },
      { name: "Carrot", amount: "1/2, julienned" },
      { name: "Spinach", amount: "1 cup, blanched" },
      { name: "Fried egg", amount: "1" },
      { name: "Sesame seeds", amount: "1 tsp" },
    ],
    instructions: [
      "Prepare the gochujang sauce by mixing gochujang, sesame oil, and soy sauce in a small bowl. Adjust gochujang amount based on your spice preference.",
      "Blanch the spinach in boiling water for 30 seconds, then immediately transfer to ice water. Squeeze out excess water and season with a pinch of salt and sesame oil.",
      "Julienne the carrot and slice the cucumber thinly.",
      "Fry an egg sunny-side up or to your preference.",
      "Place the warm rice in a bowl and arrange the vegetables around it.",
      "Top with the fried egg and drizzle the gochujang sauce over everything.",
      "Garnish with sesame seeds and serve immediately.",
    ],
    chefNotes: "This bowl is all about balance. Feel free to add any vegetables you have on hand—bell peppers, bean sprouts, or even leftover roasted vegetables work beautifully.",
  },
  {
    slug: "seasonal-banchan-collection",
    title: "Seasonal Banchan Collection",
    image: img3,
    time: "25 min",
    tags: ["Sharing", "Heritage"],
    excerpt: "A small spread of seasonal sides to share—gentle, comforting, and distinctly Korean.",
    description: "Banchan are the small side dishes that accompany every Korean meal. This collection features three essential banchan that showcase the gentle, comforting flavors of Korean home cooking.",
    ingredients: [
      { name: "Spinach", amount: "1 bunch" },
      { name: "Bean sprouts", amount: "2 cups" },
      { name: "Cucumber", amount: "1 large" },
      { name: "Sesame oil", amount: "2 tbsp" },
      { name: "Soy sauce", amount: "2 tbsp" },
      { name: "Garlic", amount: "2 cloves, minced" },
      { name: "Sesame seeds", amount: "2 tbsp, toasted" },
      { name: "Gochugaru", amount: "1 tsp (optional)" },
    ],
    instructions: [
      "For Spinach Namul: Blanch spinach in boiling water for 30 seconds, then immediately transfer to ice water. Squeeze out excess water and mix with 1 tbsp sesame oil, 1 tbsp soy sauce, 1 clove minced garlic, and 1 tbsp sesame seeds.",
      "For Bean Sprout Namul: Blanch bean sprouts in boiling water for 2 minutes, then drain and cool. Mix with 1 tbsp sesame oil, 1 tbsp soy sauce, 1 clove minced garlic, and 1 tbsp sesame seeds.",
      "For Cucumber Oi Muchim: Slice cucumber thinly and salt for 10 minutes. Rinse and squeeze out water. Mix with 1 tsp gochugaru (if using), 1 tsp sesame oil, and 1 tsp sesame seeds.",
      "Arrange all three banchan in small serving dishes.",
      "Serve at room temperature as side dishes.",
    ],
    chefNotes: "These banchan can be made ahead and stored in the refrigerator for up to 3 days. They're perfect for meal prep and add depth to any Korean meal.",
  },
  {
    slug: "soy-sesame-cold-noodles",
    title: "Soy & Sesame Cold Noodles",
    image: img4,
    time: "20 min",
    tags: ["Light", "Refreshing"],
    excerpt: "Bright, chilled noodles with clean finishes—for quiet afternoons and warm evenings.",
    description: "A refreshing cold noodle dish that's perfect for warm weather. The clean, bright flavors of soy and sesame create a dish that's both satisfying and light—ideal for quiet afternoons or warm summer evenings.",
    ingredients: [
      { name: "Soba noodles", amount: "200g" },
      { name: "Soy sauce", amount: "3 tbsp" },
      { name: "Sesame oil", amount: "2 tbsp" },
      { name: "Rice vinegar", amount: "1 tbsp" },
      { name: "Sugar", amount: "1 tsp" },
      { name: "Cucumber", amount: "1/2, julienned" },
      { name: "Carrot", amount: "1/2, julienned" },
      { name: "Green onions", amount: "2 stalks, chopped" },
      { name: "Sesame seeds", amount: "2 tbsp, toasted" },
      { name: "Hard-boiled egg", amount: "1, sliced (optional)" },
    ],
    instructions: [
      "Cook the soba noodles according to package directions. Once cooked, immediately rinse under cold water until completely cool.",
      "Prepare the sauce by whisking together soy sauce, sesame oil, rice vinegar, and sugar until the sugar dissolves.",
      "Julienne the cucumber and carrot into thin matchsticks.",
      "Chop the green onions finely.",
      "Arrange the cold noodles in a serving bowl and top with the julienned vegetables.",
      "Drizzle the sauce over the noodles and vegetables.",
      "Garnish with toasted sesame seeds and green onions.",
      "Add sliced hard-boiled egg if desired.",
      "Toss everything together just before serving.",
    ],
    chefNotes: "The key to great cold noodles is ensuring they're completely chilled before serving. You can even refrigerate the cooked noodles for 30 minutes before assembling the dish for an extra refreshing experience.",
  },
];

export default function RecipeDetailPage({ recipeSlug }: { recipeSlug: string }) {
  const recipe = recipes.find((r) => r.slug === recipeSlug);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-6 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-2xl font-heading mb-4">Recipe not found</h1>
            <ThemeLink to="/recipes" className="text-primary hover:underline">
              Back to Recipes
            </ThemeLink>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get products that match recipe ingredients
  const recipeProducts = recipe.ingredients
    .filter((ing) => ing.productId)
    .map((ing) => {
      const product = products.find((p) => p.id === ing.productId);
      return product ? { ...product, ingredientName: ing.name } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-6 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <ThemeLink to="/" className="font-body font-light text-foreground/70 hover:text-primary">
                    Home
                  </ThemeLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <ThemeLink to="/recipes" className="font-body font-light text-foreground/70 hover:text-primary">
                    Recipes
                  </ThemeLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-body font-light text-foreground">{recipe.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Recipe Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 text-sm text-foreground/60 font-body mb-4">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> {recipe.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <Utensils className="h-4 w-4" /> {recipe.tags.join(" • ")}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading leading-tight mb-6">{recipe.title}</h1>
            <p className="text-base font-body text-foreground/80 leading-relaxed mb-8">{recipe.description}</p>
          </div>

          {/* Recipe Image */}
          <div className="mb-10 rounded-[1.5rem] overflow-hidden">
            <img src={recipe.image} alt={recipe.title} className="w-full h-auto object-cover" />
          </div>

          {/* Ingredients List - Single Column */}
          <div className="mb-10">
            <h2 className="text-2xl font-heading mb-4">Ingredients:</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-base font-body text-foreground/80">
                  • {ingredient.name}{ingredient.amount && ` — ${ingredient.amount}`}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions - Single Column */}
          <div className="mb-10">
            <h2 className="text-2xl font-heading mb-4">Steps:</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-base font-body text-foreground/80 leading-relaxed">
                  {index + 1}. {instruction}
                </li>
              ))}
            </ol>
          </div>

          {/* Chef's Notes */}
          {recipe.chefNotes && (
            <div className="mb-10">
              <h3 className="text-lg font-heading mb-2">Chef's Notes:</h3>
              <p className="text-base font-body text-foreground/80 leading-relaxed">{recipe.chefNotes}</p>
            </div>
          )}

          {/* Shop Ingredients Section */}
          {recipeProducts.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-heading">Shop Ingredients</h2>
              </div>
              <p className="text-base font-body text-foreground/70 mb-6">
                Get the premium ingredients used in this recipe delivered to your door.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recipeProducts.map((product) => (
                  <Card key={product.id} className="rounded-[1.5rem] border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <ThemeLink to={`/product/${product.id}`} className="block">
                        <div className="rounded-t-[1.5rem] overflow-hidden bg-white">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-contain p-6"
                          />
                        </div>
                      </ThemeLink>

                      <div className="p-4">
                        <ThemeLink to={`/product/${product.id}`} className="block">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="text-base font-heading leading-tight hover:underline underline-offset-4 flex-1">
                              {product.name}
                            </h3>
                            <span className="text-lg font-body font-medium text-foreground whitespace-nowrap">
                              {product.price}
                            </span>
                          </div>
                        </ThemeLink>

                        <Button
                          asChild
                          className="rounded-full w-full bg-primary hover:bg-primary-hover !text-white mt-4"
                        >
                          <ThemeLink to={`/product/${product.id}`} className="!text-white">
                            Add to Bag
                          </ThemeLink>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Back to Recipes */}
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="rounded-full">
              <ThemeLink to="/recipes">Back to All Recipes</ThemeLink>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
