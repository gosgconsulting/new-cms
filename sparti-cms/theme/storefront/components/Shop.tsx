import React from "react";

const products = [
  { id: "p-101", name: "Sample Product A", price: "SGD 49", image: "/placeholder.svg" },
  { id: "p-102", name: "Sample Product B", price: "SGD 79", image: "/placeholder.svg" },
  { id: "p-103", name: "Sample Product C", price: "SGD 99", image: "/placeholder.svg" },
  { id: "p-104", name: "Sample Product D", price: "SGD 129", image: "/placeholder.svg" },
  { id: "p-105", name: "Sample Product E", price: "SGD 159", image: "/placeholder.svg" },
  { id: "p-106", name: "Sample Product F", price: "SGD 199", image: "/placeholder.svg" }
];

const Shop: React.FC = () => {
  return (
    <div className="w-full">
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Shop</h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Browse our products. We’ll connect real data later — this page is ready for theme preview.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-44 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-muted-foreground">{p.price}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="inline-flex items-center px-4 py-2 rounded-md bg-brandPurple text-white border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors">
                      Add to cart
                    </button>
                    <button className="inline-flex items-center px-4 py-2 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;