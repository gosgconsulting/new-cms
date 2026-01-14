import React from "react";

const Checkout: React.FC = () => {
  return (
    <div className="w-full">
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Checkout</h1>

          <form className="rounded-lg border bg-card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-md border px-3 py-2"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                placeholder="123 Orchard Road"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input className="w-full rounded-md border px-3 py-2" placeholder="Singapore" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input className="w-full rounded-md border px-3 py-2" placeholder="238858" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input className="w-full rounded-md border px-3 py-2" placeholder="Singapore" />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <a
                href="/theme/storefront"
                className="inline-flex items-center px-5 py-2.5 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
              >
                Cancel
              </a>
              <a
                href="/theme/storefront"
                className="inline-flex items-center px-5 py-2.5 rounded-md bg-brandPurple text-white border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
              >
                Place order
              </a>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Checkout;