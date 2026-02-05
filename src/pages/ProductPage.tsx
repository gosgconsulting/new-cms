import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, Product } from "@/services/productService";
import Breadcrumbs from "@/components/product/Breadcrumbs";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const productData = await getProduct(id);
        
        if (!productData) {
          setError("Product not found");
        } else {
          setProduct(productData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToBag = () => {
    if (!product) return;
    
    // TODO: Implement cart functionality
    console.log("Add to bag:", {
      product: product.name,
      quantity,
      price: product.price,
    });
    
    // For now, just show an alert
    alert(`Added ${quantity} x ${product.name} to bag`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Loading skeleton for image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            </div>
            
            {/* Loading skeleton for content */}
            <div className="space-y-6">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
              <div className="h-10 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Product not found"}
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-emerald-800 hover:text-emerald-900 underline"
          >
            Return to home
          </button>
        </div>
      </main>
    );
  }

  // Build breadcrumb items
  const breadcrumbItems = product.breadcrumbs.map((label, index) => {
    if (index === 0) {
      return { label, path: "/" };
    }
    if (index === product.breadcrumbs.length - 1) {
      return { label };
    }
    // For category breadcrumb, you might want to link to category page
    return { label, path: `/category/${product.category.toLowerCase()}` };
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Breadcrumbs - shown on desktop, hidden on mobile (can be shown above image on mobile if needed) */}
        <div className="hidden lg:block mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Product Layout - 55% image / 45% content on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-12">
          {/* Left: Product Image */}
          <div className="lg:order-1">
            <ProductGallery
              imageUrl={product.imageUrl}
              productName={product.name}
            />
          </div>

          {/* Right: Product Info */}
          <div className="lg:order-2">
            {/* Breadcrumbs on mobile - shown above content */}
            <div className="lg:hidden mb-6">
              <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="max-w-lg lg:max-w-none">
              <ProductInfo
                category={product.category}
                name={product.name}
                price={product.price}
                description={product.description}
                details={product.details}
                chefsNotes={product.chefsNotes}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAddToBag={handleAddToBag}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
