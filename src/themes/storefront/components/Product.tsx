import React from "react";

const sampleProduct = {
  id: "prod-001",
  name: "Storefront Starter Pack",
  price: "SGD 99",
  image: "/placeholder.svg",
  description:
    "A simple starter product to preview the Storefront theme. We’ll connect real product data later.",
  features: ["Responsive design", "Easy setup", "Ready to scale"],
};

const Product: React.FC = () => {
  return (
    <div className="w-full">
      <section className="py-16 px-4 bg-linear-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="rounded-lg border overflow-hidden bg-card">
              <img
                src={sampleProduct.image}
                alt={sampleProduct.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {sampleProduct.name}
              </h1>
              <p className="text-muted-foreground text-lg">{sampleProduct.price}</p>
              <p className="mt-4 text-gray-700">{sampleProduct.description}</p>
              <ul className="mt-4 space-y-2">
                {sampleProduct.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 inline-block w-2 h-2 rounded-full bg-brandPurple"></span>
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-3">
                <a
                  href="/theme/storefront/cart"
                  className="inline-flex items-center px-5 py-2.5 rounded-md bg-brandPurple text-white border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
                >
                  Add to cart
                </a>
                <a
                  href="/theme/storefront/shop"
                  className="inline-flex items-center px-5 py-2.5 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
                >
                  Back to shop
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Product;