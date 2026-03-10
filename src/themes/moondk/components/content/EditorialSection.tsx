import foundersImage from "../../../e-shop/assets/founders.png";
import { ArrowRight } from "lucide-react";
import { ThemeLink } from "../ThemeLink";

const EditorialSection = () => {
  return (
    <section className="w-full mb-20 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 max-w-[630px]">
          <h2 className="text-2xl md:text-3xl font-heading font-medium text-foreground leading-tight">
            Cook Like a Chef at Home
          </h2>
          <p className="text-base font-body font-light text-foreground/70 leading-relaxed">
            MoonDk brings the essence of Korean home dining to your kitchen. Our chef-led curation ensures every product 
            meets the highest standards of quality and authenticity. From premium ingredients to carefully selected tools, 
            we help you create restaurant-quality Korean meals in the comfort of your home.
          </p>
          <ThemeLink
            to="/about/our-story"
            className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:text-primary-light transition-colors duration-200"
          >
            <span>Read our full story</span>
            <ArrowRight size={14} />
          </ThemeLink>
        </div>

        <div className="order-first md:order-last">
          <div className="w-full aspect-square overflow-hidden">
            <img
              src={foundersImage}
              alt="Korean home dining experience"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialSection;
