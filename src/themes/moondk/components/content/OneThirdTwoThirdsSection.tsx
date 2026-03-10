import { ThemeLink } from "../ThemeLink";
import { ArrowRight } from "lucide-react";

import shadowlineImage from "../../../e-shop/assets/shadowline.jpg";

const OneThirdTwoThirdsSection = () => {
  return (
    <section className="w-full mb-20 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left - Text content (1/3) */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-xl md:text-2xl font-heading font-medium text-foreground leading-tight">
            Korean Home Dining
          </h2>
          <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
            Experience the warmth and authenticity of Korean home cooking with our carefully curated selection of products.
          </p>
          <ThemeLink
            to="/category/shop"
            className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:text-primary-light transition-colors duration-200"
          >
            <span>Shop All</span>
            <ArrowRight size={14} />
          </ThemeLink>
        </div>

        {/* Right - Image (2/3) */}
        <div className="md:col-span-2">
          <ThemeLink to="/category/shop" className="block">
            <div className="w-full aspect-[4/3] overflow-hidden">
              <img
                src={shadowlineImage}
                alt="Korean home dining collection"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </ThemeLink>
        </div>
      </div>
    </section>
  );
};

export default OneThirdTwoThirdsSection;
