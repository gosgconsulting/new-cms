import React from "react";

const products = [
  { id: "p-1", name: "Starter Pack", price: "SGD 99", image: "/placeholder.svg" },
  { id: "p-2", name: "Growth Bundle", price: "SGD 149", image: "/placeholder.svg" },
  { id: "p-3", name: "Pro Suite", price: "SGD 199", image: "/placeholder.svg" },
  { id: "p-4", name: "Enterprise Kit", price: "SGD 249", image: "/placeholder.svg" }
];

const Homepage: React.FC = () => {
  return (
    <div className="w-full">
      <section className="py-16 px-4 bg-linear-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Storefront</h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            A simple ecommerce homepage. We’ll refine UI and database later — this theme is ready to preview.
          </p>
          <div className="mt-6">
            <a
              href="/theme/storefront/shop"
              className="inline-flex items-center px-5 py-2.5 rounded-md bg-brandPurple text-white border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
            >
              Visit shop
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-xl font-semibold mb-4">Featured products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-40 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-muted-foreground">{p.price}</p>
                  <div className="mt-3">
                    <button className="inline-flex items-center px-4 py-2 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors">
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a
              href="/theme/storefront/shop"
              className="inline-flex items-center px-5 py-2.5 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
            >
              View all products
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;