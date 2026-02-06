import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeLink } from "../ThemeLink";
import { useCart } from "../../contexts/CartContext";
import { products } from "../category/products";

interface ProductInfoProps {
  productId?: string;
}

const ProductInfo = ({ productId }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Get product data from products array
  const product = products.find((p) => p.id.toString() === productId);
  const productName = product?.name || "Hovenia Dulcis Extract (헛개수)";
  const productPrice = product?.price || "€37";
  const productImage = product?.image || "";
  const productCategory = product?.category || "Product";

  // Product descriptions mapping
  const productDescriptions: Record<string, string> = {
    "2": "A traditional tea base made from Korean-grown corn silk – proudly sourced from our local land. We insist on using only carefully selected, premium ingredients to ensure the highest quality.\n\nEnjoy its deep aroma, nutty richness, and clean natural taste. Experience the pure essence of corn silk, just as nature intended.",
    "3": "Black bean tea base 97% concentrate. A drink made from domestic black beans. Using Korean black beans It is a traditional tea solution with a solid foundation. For the best quality, we insists on only selected ingredients.\n\nIt has excellent taste, aroma, and savory taste.It tastes like black bean tea. Experience it!.",
    "4": "Earthy, toasty, and endlessly comforting — this is the flavor that feels like coming home. Our roasted barley tea is slow-brewed for depth and smoothness, offering that calm, nutty aroma that softens even the busiest days.\n\nServe it hot or cold, and feel that quiet nostalgia take over — one sip at a time.",
    "5": "There's a reason sesame oil is at the heart of every Korean kitchen — it's not just for seasoning; it's for remembering.\n\nOur premium roasted sesame oil is made from hand-selected seeds, pressed slowly to preserve every note of warmth and nuttiness. The result is a rich, amber oil that elevates anything it touches — from a simple bowl of rice to your most elaborate dish.\n\nOne drizzle, and you're back at the table you grew up around — that aroma, that comfort, that taste you suddenly crave.",
    "6": "Marbled, tender, and rich with umami — this is more than meat; it's the taste that defines Korean tables.\n\nFrom hanwoo cuts to barbecue-ready selections, every piece is curated for perfect sear and unforgettable savor. The kind of flavor that stops conversation mid-sentence — because everyone's too busy tasting.",
    "7": "This is not just oil — it's the taste that lingers long after the meal ends.\n\nOur perilla oil is crafted from pure roasted perilla seeds, cold-pressed to retain its deep, earthy flavor and rich fragrance. It's the kind of taste that hits you unexpectedly — a little smoky, a little sweet, and completely unforgettable.\n\nWhether you drizzle it over noodles, season your banchan, or dip your grilled meats, it turns every bite into a craving reborn.",
    "8": "The Essence of Korean Craving\n\nTwo oils. Two emotions.\n\nGolden warmth and bold longing — the foundation of every unforgettable taste.",
    "9": "Clean, crisp, and dangerously smooth — our soju is crafted for the moments that start quietly and end in laughter.\n\nEach sip carries warmth and spirit, awakening that unmistakable Korean joy that lives between friends, stories, and spontaneous cravings.",
    "10": "Specification: 200g (2 servings)\nConsumption period: 2 years\nIngredients: Flour (domestic), red soup powder (domestic), refined salt, canola oil\nFeature Point: The noodles made by aging are the first in Korea to have the best chewy texture in 3 minutes 40 seconds. Through the 12 steps of HACCP certification and 8 aging processes, the best cooking time/time does not blow even if you miss the timing.",
    "11": "500g (for 5 servings)\nConsumption period: 2 years\nIngredients: Flour (made in the US and AUS), plum powder (Korea), sweet pumpkin powder (Korea), matecha (Korea), black rice powder (Korea), dental red pigment (Korea), green palm PD (Korea), refined salt canola oil.\nFeature Point: The best chewy texture in Korea after 12 steps of HACCP certification and 8 aging processes to make the best dry texture. 2 minutes and 30 seconds easy cooking time/time even if you miss the timing.",
    "12": "200g (2 servings)\nIngredients: Potato flour (domestic), refined salt, canola oil\n\nThe first potato noodles in Korea that offer a perfect balance of chewiness and softness in just 3 minutes. Through 12 steps of HACCP certification and 8 aging processes, these noodles retain their ideal texture even if the cooking time is slightly off.",
    "13": "500g (for 5 servings)\nIngredients: Flour (domestic), Hanrabong orange powder (Korea), refined salt, canola oil\n\nThe noodles made with Hanrabong, a unique citrus fruit from Jeju, offer a refreshing and chewy texture in just 3 minutes. Thanks to 12-step HACCP certification and 8 aging processes, they deliver the perfect texture and flavor, with a forgiving cooking time that ensures great results even if you miss the timing.",
  };

  // Default description for product 1 and any other products
  const defaultDescription = "Premium Hovenia Dulcis extract (헛개수), a traditional Korean beverage concentrate known for its refreshing taste and health benefits. This premium extract is made from 100% domestic Hovenia Dulcis fruit, carefully processed to preserve its natural flavor and nutrients.";

  const productDescription = productDescriptions[productId || ""] || defaultDescription;

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAddToBag = () => {
    addToCart({
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: quantity,
      category: productCategory,
    });
  };

  return (
    <div className="space-y-8">
      <div className="hidden lg:block">
        <Breadcrumb>
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
                <ThemeLink to="/category/shop" className="font-body font-light text-foreground/70 hover:text-primary">
                  Shop
                </ThemeLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-body font-light text-foreground">{productName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

        <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-body font-light text-muted-foreground mb-2">Product</p>
            <h1 className="text-3xl md:text-4xl font-heading font-medium text-foreground leading-tight">{productName}</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-body font-light text-foreground">{productPrice}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 py-6 border-b border-border-light">
        <div className="space-y-2">
          <h3 className="text-sm font-heading font-medium text-foreground">Description</h3>
          <p className="text-sm font-body font-light text-foreground/70 leading-relaxed whitespace-pre-line">
            {productDescription}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-heading font-medium text-foreground">Product Details</h3>
          <p className="text-sm font-body font-light text-foreground/70">
            Net Weight: 420g (875kcal). Made with 100% domestic Korean Hovenia Dulcis. Ready to mix with water for a 
            refreshing traditional Korean beverage.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-heading font-medium text-foreground">Chef's Notes</h3>
          <p className="text-sm font-body font-light text-foreground/70 italic leading-relaxed">
            "Hovenia Dulcis has been cherished in Korean tradition for generations. This premium extract captures the 
            essence of this unique fruit, perfect for creating authentic Korean home dining experiences."
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-body font-light text-foreground">Quantity</span>
          <div className="flex items-center border border-border-light">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="h-10 flex items-center px-4 text-sm font-body font-light min-w-12 justify-center border-l border-r border-border-light">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button 
          className="w-full h-12 bg-primary !text-white hover:bg-primary-hover font-body font-medium rounded-full"
          onClick={handleAddToBag}
        >
          Add to Bag
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
