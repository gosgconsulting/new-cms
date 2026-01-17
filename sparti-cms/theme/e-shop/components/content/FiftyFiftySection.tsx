import { ThemeLink } from "../ThemeLink";

import haloImage from "../../../../../lovable-ecom-main/src/assets/halo.jpg";
import eclipseImage from "../../../../../lovable-ecom-main/src/assets/eclipse.jpg";

const FiftyFiftySection = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ThemeLink to="/category/earrings" className="block">
            <div className="w-full aspect-square mb-3 overflow-hidden">
              <img
                src={haloImage}
                alt="Earrings collection"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </ThemeLink>
          <div>
            <h3 className="text-sm font-normal text-foreground mb-1">Organic Forms</h3>
            <p className="text-sm font-light text-foreground">
              Nature-inspired pieces with fluid, sculptural details
            </p>
          </div>
        </div>

        <div>
          <ThemeLink to="/category/bracelets" className="block">
            <div className="w-full aspect-square mb-3 overflow-hidden">
              <img
                src={eclipseImage}
                alt="Chain link bracelet"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </ThemeLink>
          <div>
            <h3 className="text-sm font-normal text-foreground mb-1">Chain Collection</h3>
            <p className="text-sm font-light text-foreground">
              Refined links and connections in precious metals
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiftyFiftySection;
