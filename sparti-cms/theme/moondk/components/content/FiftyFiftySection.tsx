import { ThemeLink } from "../ThemeLink";

import haloImage from "../../../e-shop/assets/halo.jpg";
import eclipseImage from "../../../e-shop/assets/eclipse.jpg";

const FiftyFiftySection = () => {
  return (
    <section className="w-full mb-20 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ThemeLink to="/category/curated-sets" className="block">
            <div className="w-full aspect-square mb-4 overflow-hidden">
              <img
                src={haloImage}
                alt="Curated Korean home dining sets"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </ThemeLink>
          <div>
            <h3 className="text-base font-heading font-medium text-foreground mb-2">Curated Sets</h3>
            <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
              Complete Korean home dining experiences, carefully selected by our chef partners
            </p>
          </div>
        </div>

        <div>
          <ThemeLink to="/category/ingredients" className="block">
            <div className="w-full aspect-square mb-4 overflow-hidden">
              <img
                src={eclipseImage}
                alt="Premium Korean ingredients"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </ThemeLink>
          <div>
            <h3 className="text-base font-heading font-medium text-foreground mb-2">Premium Ingredients</h3>
            <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
              Authentic Korean ingredients sourced directly from trusted producers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiftyFiftySection;
