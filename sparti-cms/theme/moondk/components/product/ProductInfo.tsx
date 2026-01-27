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

const ProductInfo = () => {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

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
                <ThemeLink to="/category/ingredients" className="font-body font-light text-foreground/70 hover:text-primary">
                  Ingredients
                </ThemeLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-body font-light text-foreground">Hovenia Dulcis Extract (헛개수)</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

        <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-body font-light text-muted-foreground mb-2">Ingredients</p>
            <h1 className="text-3xl md:text-4xl font-heading font-medium text-foreground leading-tight">Hovenia Dulcis Extract (헛개수)</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-body font-light text-foreground">€24</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 py-6 border-b border-border-light">
        <div className="space-y-2">
          <h3 className="text-sm font-heading font-medium text-foreground">Description</h3>
          <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
            Premium Hovenia Dulcis extract (헛개수), a traditional Korean beverage concentrate known for its refreshing taste 
            and health benefits. This premium extract is made from 100% domestic Hovenia Dulcis fruit, carefully processed 
            to preserve its natural flavor and nutrients.
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

        <Button className="w-full h-12 bg-primary !text-white hover:bg-primary-hover font-body font-medium rounded-full">
          Add to Bag
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
