import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Star, Loader2, ArrowLeft } from 'lucide-react';
import { getProductBySlug, getReviews, addToCart, getOrCreateGuestCart, addToGuestCart } from '../services/shopApi';

interface Product {
  product_id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  image_url: string | null;
}

interface Review {
  id: number;
  user_name: string | null;
  content: string;
  rating: number;
  date: string;
}

const Product: React.FC = () => {
  const { productname: productnameParam } = useParams<{ productname?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Extract product slug from URL - handle multiple formats
  const getProductSlug = (): string | null => {
    // First try: from URL params (if route is /theme/:tenantSlug/product/:productname)
    if (productnameParam) {
      console.log('[testing] Product slug from params:', productnameParam);
      return productnameParam;
    }

    // Second try: extract from pathname
    const pathParts = location.pathname.split('/').filter(Boolean);
    console.log('[testing] Path parts:', pathParts);
    
    // Look for 'product' in the path
    const productIndex = pathParts.indexOf('product');
    if (productIndex >= 0 && productIndex < pathParts.length - 1) {
      const slug = pathParts[productIndex + 1];
      console.log('[testing] Product slug from pathname:', slug);
      return slug;
    }

    // Third try: check if last part is the slug (for /theme/gosgconsulting/product/test)
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      // If we're on a product page but didn't find 'product' in path, the last part might be the slug
      if (location.pathname.includes('/product/')) {
        console.log('[testing] Product slug from last part:', lastPart);
        return lastPart;
      }
    }

    console.warn('[testing] Could not extract product slug from URL:', location.pathname);
    return null;
  };

  const productSlug = getProductSlug();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) {
        console.error('[testing] No product slug found');
        setError('Product slug not found in URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('[testing] Fetching product with slug:', productSlug);
        
        const productData = await getProductBySlug(productSlug);
        console.log('[testing] Product data received:', productData);
        
        if (!productData) {
          setError(`Product "${productSlug}" not found`);
          setLoading(false);
          return;
        }
        
        setProduct(productData);

        // Fetch reviews
        try {
          const reviewsData = await getReviews(productData.product_id);
          setReviews(reviewsData);
        } catch (err) {
          console.error('[testing] Error fetching reviews:', err);
          // Don't fail the whole page if reviews fail
        }
      } catch (err: any) {
        console.error('[testing] Error fetching product:', err);
        setError(err.message || `Failed to load product "${productSlug}"`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  const handleAddToCart = async () => {
    if (!product) return;

    const userId = getUserId();
    const tenantId = 'tenant-gosg';
    setAddingToCart(true);
    
    try {
      if (userId) {
        // Logged in user - add via API
        await addToCart(userId, product.product_id, quantity, tenantId);
        alert('Item added to cart!');
        navigate('/theme/gosgconsulting/cart');
      } else {
        // Guest user - get or create cart, then add item
        let cartId = null;
        const storedCartId = localStorage.getItem('sparti-guest-cart-id');
        
        if (storedCartId) {
          cartId = parseInt(storedCartId);
        } else {
          // Create new guest cart
          const cart = await getOrCreateGuestCart(tenantId);
          cartId = cart.id;
          localStorage.setItem('sparti-guest-cart-id', cartId.toString());
        }
        
        if (!cartId) {
          throw new Error('Failed to get cart ID');
        }
        
        // Add item to guest cart
        await addToGuestCart(cartId, product.product_id, quantity, tenantId);
        console.log('[testing] Item added to guest cart:', { cartId, productId: product.product_id, quantity });
        alert('Item added to cart!');
        navigate('/theme/gosgconsulting/cart');
      }
    } catch (err: any) {
      console.error('[testing] Error adding to cart:', err);
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const getUserId = (): number | null => {
    try {
      const session = localStorage.getItem('sparti-user-session');
      if (session) {
        const userData = JSON.parse(session);
        return userData.user?.id || userData.id || null;
      }
    } catch (err) {
      console.error('[testing] Error parsing user session:', err);
    }
    return null;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-foreground">Product Not Found</h2>
          <p className="text-muted-foreground mb-2">{error || 'The product you are looking for does not exist.'}</p>
          {productSlug && (
            <p className="text-sm text-muted-foreground mb-6">
              Slug: <code className="bg-muted px-2 py-1 rounded">{productSlug}</code>
            </p>
          )}
          <button
            onClick={() => navigate('/theme/gosgconsulting/shop')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12">
        <button
          onClick={() => navigate('/theme/gosgconsulting/shop')}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Shop</span>
        </button>

        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Product Image */}
            <div className="bg-muted rounded-lg overflow-hidden aspect-square">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <ShoppingCart className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </span>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(averageRating))}
                    <span className="text-sm text-muted-foreground">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-6 flex-1">
                <h2 className="text-lg font-semibold mb-2 text-foreground">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="border-t border-border pt-6 mt-auto">
                <div className="flex items-center gap-4 mb-6">
                  <label htmlFor="quantity" className="font-semibold text-foreground">
                    Quantity:
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 border border-border rounded-lg text-center bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-12 bg-card border border-border rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Customer Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-foreground">
                          {review.user_name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <div className="mt-12 bg-card border border-border rounded-lg shadow-sm p-6 md:p-8 text-center">
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
