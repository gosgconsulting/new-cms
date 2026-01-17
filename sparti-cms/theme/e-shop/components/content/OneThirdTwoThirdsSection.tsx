import { ThemeLink } from "../ThemeLink";

import pantheonImage from "../../../../../lovable-ecom-main/src/assets/pantheon.jpg";
import obliqueImage from "../../../../../lovable-ecom-main/src/assets/oblique.jpg";

const OneThirdTwoThirdsSection = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ThemeLink to="/category/rings" className="block">
            <div className="w-full h-[500px] lg:h-[800px] mb-3 overflow-hidden">
              <img
                src={pantheonImage}
                alt="Artisan crafted jewelry"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </ThemeLink>
          <div>
            <h3 className="text-sm font-normal text-foreground mb-1">Artisan Craft</h3>
            <p className="text-sm font-light text-foreground">
              Handcrafted pieces with meticulous attention to detail
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ThemeLink to="/category/necklaces" className="block">
            <div className="w-full h-[500px] lg:h-[800px] mb-3 overflow-hidden">
              <img
                src={obliqueImage}
                alt="Circular jewelry collection"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </ThemeLink>
          <div>
            <h3 className="text-sm font-normal text-foreground mb-1">Circular Elements</h3>
            <p className="text-sm font-light text-foreground">
              Geometric perfection meets contemporary minimalism
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OneThirdTwoThirdsSection;
