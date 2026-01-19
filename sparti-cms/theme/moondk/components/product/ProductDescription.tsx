import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewProduct from "./ReviewProduct";

const CustomStar = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-3 h-3 ${filled ? "text-primary" : "text-muted-foreground/30"} ${
      className || ""
    }`}
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
      clipRule="evenodd"
    />
  </svg>
);

const ProductDescription = () => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCareOpen, setIsCareOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  return (
    <div className="space-y-0 mt-8 border-t border-border-light">
      <div className="border-b border-border-light">
        <Button
          variant="ghost"
          onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-body font-light rounded-none"
        >
          <span>Description</span>
          {isDescriptionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isDescriptionOpen && (
          <div className="pb-6 space-y-4">
            <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
              Our Chef's Selection Box brings together the finest Korean ingredients, carefully curated by our chef partners 
              to help you create authentic home dining experiences. Each item is selected for its quality, authenticity, and 
              ability to elevate your Korean cooking.
            </p>
            <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
              This collection includes premium gochujang, traditional kimchi, high-quality sesame oil, and doenjang paste, 
              along with a comprehensive recipe guide from our chef partners. Perfect for both beginners and experienced 
              home cooks looking to explore Korean cuisine.
            </p>
          </div>
        )}
      </div>

      <div className="border-b border-border-light">
        <Button
          variant="ghost"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-body font-light rounded-none"
        >
          <span>Product Details</span>
          {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isDetailsOpen && (
          <div className="pb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-body font-light text-foreground/70">SKU</span>
              <span className="text-sm font-body font-light text-foreground">MDK-CSB-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-body font-light text-foreground/70">Collection</span>
              <span className="text-sm font-body font-light text-foreground">Chef's Selection</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-body font-light text-foreground/70">Shelf Life</span>
              <span className="text-sm font-body font-light text-foreground">6-12 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-body font-light text-foreground/70">Storage</span>
              <span className="text-sm font-body font-light text-foreground">Cool, dry place</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-border-light">
        <Button
          variant="ghost"
          onClick={() => setIsCareOpen(!isCareOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-body font-light rounded-none"
        >
          <span>Storage & Usage</span>
          {isCareOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isCareOpen && (
          <div className="pb-6 space-y-4">
            <ul className="space-y-2">
              <li className="text-sm font-body font-light text-foreground/70">
                • Store in a cool, dry place away from direct sunlight
              </li>
              <li className="text-sm font-body font-light text-foreground/70">
                • Refrigerate after opening for best quality
              </li>
              <li className="text-sm font-body font-light text-foreground/70">
                • Use clean utensils to prevent contamination
              </li>
              <li className="text-sm font-body font-light text-foreground/70">
                • Follow recipe guide for best results
              </li>
            </ul>
            <p className="text-sm font-body font-light text-foreground/70">
              For questions about storage or usage, contact our customer service team or refer to the included recipe guide.
            </p>
          </div>
        )}
      </div>

      <div className="border-b border-border-light lg:mb-16">
        <Button
          variant="ghost"
          onClick={() => setIsReviewsOpen(!isReviewsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-body font-light rounded-none"
        >
          <div className="flex items-center gap-3">
            <span>Customer Reviews</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <CustomStar key={star} filled={star <= 4.8} />
              ))}
              <span className="text-sm font-body font-light text-foreground/70 ml-1">4.8</span>
            </div>
          </div>
          {isReviewsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isReviewsOpen && (
          <div className="pb-6 space-y-6">
            <ReviewProduct />

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar key={star} filled />
                    ))}
                  </div>
                  <span className="text-sm font-body font-light text-foreground/70">Sarah M.</span>
                </div>
                <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
                  "Excellent quality ingredients! The gochujang is authentic and the kimchi is perfectly fermented. 
                  The recipe guide helped me create restaurant-quality Korean dishes at home."
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar key={star} filled={star <= 4} />
                    ))}
                  </div>
                  <span className="text-sm font-body font-light text-foreground/70">Emma T.</span>
                </div>
                <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
                  "Great starter kit for Korean cooking! Everything is well-packaged and the ingredients are fresh. 
                  The chef's notes in the recipe guide are very helpful."
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar key={star} filled />
                    ))}
                  </div>
                  <span className="text-sm font-body font-light text-foreground/70">Jessica R.</span>
                </div>
                <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
                  "Perfect for someone new to Korean cooking. The curated selection takes the guesswork out of 
                  what to buy, and the quality is outstanding. Highly recommend!"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
