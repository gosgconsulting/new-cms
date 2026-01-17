import shadowlineHero from "../../../../../lovable-ecom-main/src/assets/shadowline-1.jpg";

const LargeHero = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="w-full aspect-[16/9] mb-3 overflow-hidden">
        <img
          src={shadowlineHero}
          alt="Modern jewelry collection"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h2 className="text-sm font-normal text-foreground mb-1">Modern Heritage</h2>
        <p className="text-sm font-light text-foreground">
          Contemporary jewelry crafted with timeless elegance
        </p>
      </div>
    </section>
  );
};

export default LargeHero;
