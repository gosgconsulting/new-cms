import React from "react";

const sampleCart = [
  { id: "prod-001", name: "Storefront Starter Pack", price: "SGD 99", qty: 1 },
  { id: "prod-002", name: "Growth Bundle", price: "SGD 149", qty: 1 },
];

const Cart: React.FC = () => {
  return (
    <div className="w-full">
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Your Cart</h1>

          {sampleCart.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <a
                href="/theme/storefront/shop"
                className="mt-4 inline-flex items-center px-5 py-2.5 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
              >
                Go to shop
              </a>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-6">
              <ul className="divide-y">
                {sampleCart.map((item) => (
                  <li key={item.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.price} × {item.qty}
                      </p>
                    </div>
                    <a
                      href="/theme/storefront/shop"
                      className="text-sm inline-flex items-center px-3 py-1.5 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
                    >
                      Remove
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex gap-3">
                <a
                  href="/theme/storefront/checkout"
                  className="inline-flex items-center px-5 py-2.5 rounded-md bg-brandPurple text-white border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
                >
                  Proceed to checkout
                </a>
                <a
                  href="/theme/storefront/shop"
                  className="inline-flex items-center px-5 py-2.5 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
                >
                  Continue shopping
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cart;