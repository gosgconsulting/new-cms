import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Shop: React.FC = () => {
  const products = [
    { id: "p-1", name: "Sample Product A", price: "SGD 99", image: "/placeholder.svg" },
    { id: "p-2", name: "Sample Product B", price: "SGD 149", image: "/placeholder.svg" },
    { id: "p-3", name: "Sample Product C", price: "SGD 199", image: "/placeholder.svg" },
    { id: "p-4", name: "Sample Product D", price: "SGD 249", image: "/placeholder.svg" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="pt-24 md:pt-20 pb-12 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Shop</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Your store is set up. We’ll define the UI and database later—this page is ready to deploy.
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="container mx-auto">
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
                      <button
                        className="inline-flex items-center px-4 py-2 rounded-md bg-brandPurple text-white hover:bg-brandPurple hover:text-white border border-brandPurple transition-colors"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button className="inline-flex items-center px-5 py-2.5 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors">
                View cart
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;