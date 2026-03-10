import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ArrowRight } from 'lucide-react';
import { getCart, getCartById, getOrCreateGuestCart, updateCartItem, updateGuestCartItem, removeFromCart, removeFromGuestCart, associateCartWithUser } from '../services/shopApi';

interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  product_slug: string;
  price: number;
  image_url: string | null;
}

interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const navigate = useNavigate();

  // Get user ID from session (if available)
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

  // Get guest cart ID from localStorage
  const getGuestCartId = (): number | null => {
    try {
      const cartId = localStorage.getItem('sparti-guest-cart-id');
      if (cartId) {
        return parseInt(cartId);
      }
    } catch (err) {
      console.error('[testing] Error parsing guest cart ID:', err);
    }
    return null;
  };

  useEffect(() => {
    const fetchCart = async () => {
      const userId = getUserId();
      const tenantId = 'tenant-gosg';
      
      if (userId) {
        // User is logged in - check if we have a guest cart to associate
        const guestCartId = getGuestCartId();
        if (guestCartId) {
          try {
            // Associate guest cart with user
            await associateCartWithUser(guestCartId, tenantId);
            console.log('[testing] Associated guest cart with user:', guestCartId);
            // Clear guest cart ID from localStorage
            localStorage.removeItem('sparti-guest-cart-id');
          } catch (err: any) {
            console.warn('[testing] Failed to associate guest cart (may already be associated):', err);
            // Clear guest cart ID anyway
            localStorage.removeItem('sparti-guest-cart-id');
          }
        }
        
        // Fetch user's cart
        try {
          setLoading(true);
          setError(null);
          const data = await getCart(userId, tenantId);
          setCart(data);
        } catch (err: any) {
          console.error('[testing] Error fetching cart:', err);
          setError(err.message || 'Failed to load cart');
        } finally {
          setLoading(false);
        }
      } else {
        // Guest user - get or create cart, then fetch by cart_id
        try {
          setLoading(true);
          setError(null);
          
          let cartId = getGuestCartId();
          
          if (!cartId) {
            // Create new guest cart
            const newCart = await getOrCreateGuestCart(tenantId);
            cartId = newCart.id;
            if (cartId) {
              localStorage.setItem('sparti-guest-cart-id', cartId.toString());
            }
          }
          
          if (cartId) {
            // Fetch cart by ID
            const cartData = await getCartById(cartId, tenantId);
            console.log('[testing] Guest cart loaded:', cartData);
            setCart(cartData);
          } else {
            // Empty guest cart
            setCart({ id: 0, user_id: 0, items: [] });
          }
        } catch (err: any) {
          console.error('[testing] Error loading guest cart:', err);
          setError(err.message || 'Failed to load cart');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(cartItemId);
      return;
    }

    const userId = getUserId();
    const tenantId = 'tenant-gosg';
    setUpdating(cartItemId);
    
    try {
      if (userId) {
        // Logged in user - update via API
        await updateCartItem(cartItemId, newQuantity, tenantId);
        // Refresh cart
        const data = await getCart(userId, tenantId);
        setCart(data);
      } else {
        // Guest user - update via API
        await updateGuestCartItem(cartItemId, newQuantity, tenantId);
        // Refresh cart
        const cartId = getGuestCartId();
        if (cartId) {
          const data = await getCartById(cartId, tenantId);
          setCart(data);
        }
      }
    } catch (err: any) {
      console.error('[testing] Error updating cart item:', err);
      alert(err.message || 'Failed to update cart item');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    const userId = getUserId();
    const tenantId = 'tenant-gosg';
    setUpdating(cartItemId);
    
    try {
      if (userId) {
        // Logged in user - remove via API
        await removeFromCart(cartItemId, tenantId);
        // Refresh cart
        const data = await getCart(userId, tenantId);
        setCart(data);
      } else {
        // Guest user - remove via API
        await removeFromGuestCart(cartItemId, tenantId);
        // Refresh cart
        const cartId = getGuestCartId();
        if (cartId) {
          const data = await getCartById(cartId, tenantId);
          setCart(data);
        }
      }
    } catch (err: any) {
      console.error('[testing] Error removing cart item:', err);
      alert(err.message || 'Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/theme/gosgconsulting')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <button
              onClick={() => navigate('/theme/gosgconsulting/shop')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row gap-4"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-full sm:w-24 h-24 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.product_name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    ${item.price.toFixed(2)} each
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                        className="p-2 hover:bg-muted disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[3rem] text-center">
                        {updating === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                        className="p-2 hover:bg-muted disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating === item.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/theme/gosgconsulting/checkout')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/theme/gosgconsulting/shop')}
                className="w-full mt-3 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
