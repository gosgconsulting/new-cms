// Placeholder image - replace with actual Korean home dining hero image
import shadowlineHero from "../../../e-shop/assets/shadowline-1.jpg";

const LargeHero = () => {
  return (
    <section className="w-full mb-20 px-6">
      <div className="w-full aspect-[16/9] mb-4 overflow-hidden">
        <img
          src={shadowlineHero}
          alt="Korean home dining experience"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h2 className="text-lg font-heading font-medium text-foreground mb-2">Chef-Led Curation</h2>
        <p className="text-sm font-body font-light text-foreground/70 leading-relaxed">
          Discover premium Korean ingredients and curated products selected by our chef partners for authentic home dining experiences.
        </p>
      </div>
    </section>
  );
};

export default LargeHero;
