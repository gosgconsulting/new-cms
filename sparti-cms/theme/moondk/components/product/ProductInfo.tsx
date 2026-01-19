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
                <ThemeLink to="/category/curated-sets" className="font-body font-light text-foreground/70 hover:text-primary">
                  Curated Sets
                </ThemeLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-body font-light text-foreground">Chef's Selection Box</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-body font-light text-muted-foreground mb-2">Curated Sets</p>
            <h1 className="text-3xl md:text-4xl font-heading font-medium text-foreground leading-tight">Chef's Selection Box</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-body font-light text-foreground">€45</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 py-6 border-b border-border-light">
        <div className="space-y-2">
          <h3 className="text-sm font-heading font-medium text-foreground">Description</h3>
          <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
            A carefully curated selection of premium Korean ingredients and essentials, handpicked by our chef partners. 
            This box includes everything you need to create authentic Korean home dining experiences.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-heading font-medium text-foreground">Contents</h3>
          <p className="text-sm font-body font-light text-foreground/70">
            Premium Gochujang, Traditional Kimchi, Sesame Oil, Doenjang Paste, Korean Spice Mix, and Chef's Recipe Guide
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-heading font-medium text-foreground">Chef's Notes</h3>
          <p className="text-sm font-body font-light text-foreground/70 italic leading-relaxed">
            "This selection represents the foundation of Korean home cooking. Each ingredient is sourced from trusted 
            producers and selected for its authentic flavor and quality."
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

        <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-hover font-body font-medium rounded-none">
          Add to Bag
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
