import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { api } from '../../sparti-cms/utils/api';

interface Product {
  product_id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  image_url: string | null;
}

const Shop: React.FC = () => {
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Get tenant ID from localStorage or context
  useEffect(() => {
    const storedTenantId = localStorage.getItem('currentTenantId');
    setTenantId(storedTenantId);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shop-products', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      // Get tenant API key from localStorage
      const apiKey = localStorage.getItem('tenantApiKey');
      if (!apiKey) {
        console.warn('[testing] No tenant API key found');
        return [];
      }

      const response = await api.get('/api/shop/products', {
        headers: {
          'X-Tenant-API-Key': apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!tenantId,
  });

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
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products available at the moment.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((p: Product) => (
                    <div
                      key={p.product_id}
                      className="rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <img
                        src={p.image_url || "/placeholder.svg"}
                        alt={p.name}
                        className="w-full h-40 object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{p.name}</h3>
                        <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                          {p.description}
                        </p>
                        <p className="font-bold text-lg mb-3">${p.price.toFixed(2)}</p>
                        <div className="mt-3">
                          <button
                            className="inline-flex items-center px-4 py-2 rounded-md bg-brandPurple text-white hover:bg-brandPurple hover:text-white border border-brandPurple transition-colors w-full justify-center"
                            onClick={() => {
                              // TODO: Implement add to cart functionality
                              console.log('[testing] Add to cart:', p.product_id);
                            }}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 text-center">
                  <button 
                    className="inline-flex items-center px-5 py-2.5 rounded-md bg-white text-brandPurple border border-brandPurple hover:bg-brandPurple hover:text-white transition-colors"
                    onClick={() => {
                      // TODO: Navigate to cart page
                      console.log('[testing] View cart');
                    }}
                  >
                    View cart
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;