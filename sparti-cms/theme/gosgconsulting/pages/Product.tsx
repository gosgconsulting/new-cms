import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Star, Loader2, ArrowLeft } from 'lucide-react';
import { getProductBySlug, getReviews, addToCart } from '../services/shopApi';

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

  // Extract product name from URL - try params first, then pathname
  const productname = productnameParam || (() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const productIndex = pathParts.indexOf('product');
    if (productIndex >= 0 && productIndex < pathParts.length - 1) {
      return pathParts[productIndex + 1];
    }
    return null;
  })();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productname) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const productData = await getProductBySlug(productname);
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        setProduct(productData);

        // Fetch reviews
        try {
          const reviewsData = await getReviews(productData.product_id);
          setReviews(reviewsData);
        } catch (err) {
          console.error('Error fetching reviews:', err);
          // Don't fail the whole page if reviews fail
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productname]);

  const handleAddToCart = async () => {
    if (!product) return;

    const userId = getUserId();
    if (!userId) {
      alert('Please log in to add items to cart');
      navigate('/theme/gosgconsulting/auth');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(userId, product.product_id, quantity);
      alert('Item added to cart!');
      navigate('/theme/gosgconsulting/cart');
    } catch (err: any) {
      console.error('Error adding to cart:', err);
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
        return userData.user?.id || null;
      }
    } catch (err) {
      console.error('Error parsing user session:', err);
    }
    return null;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || 'The product you are looking for does not exist.'}</p>
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
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-6 md:py-16">
        <button
          onClick={() => navigate('/theme/gosgconsulting/shop')}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="aspect-square bg-muted flex items-center justify-center">
                <ShoppingCart className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
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

            <div className="mb-6">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-4 mb-6">
                <label htmlFor="quantity" className="font-semibold">
                  Quantity:
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 border border-border rounded-lg text-center"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="border-t border-border pt-12">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="font-semibold">
                      {review.user_name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
