import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getCart, createOrder } from '../services/shopApi';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  price: number;
}

interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  shipping_address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  payment_method: 'PAYSTACK' | 'STRIPE' | '';
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    shipping_address: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    payment_method: '',
  });

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

  useEffect(() => {
    const fetchCart = async () => {
      const userId = getUserId();
      if (!userId) {
        setError('Please log in to checkout');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getCart(userId);
        if (!data || !data.items || data.items.length === 0) {
          setError('Your cart is empty');
          setLoading(false);
          return;
        }
        setCart(data);

        // Pre-fill form with user data if available
        try {
          const session = localStorage.getItem('sparti-user-session');
          if (session) {
            const userData = JSON.parse(session);
            if (userData.user) {
              setFormData((prev) => ({
                ...prev,
                name: userData.user.first_name && userData.user.last_name
                  ? `${userData.user.first_name} ${userData.user.last_name}`
                  : prev.name,
                email: userData.user.email || prev.email,
              }));
            }
          }
        } catch (err) {
          // Ignore errors in pre-filling
        }
      } catch (err: any) {
        console.error('Error fetching cart:', err);
        setError(err.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.payment_method) {
      alert('Please select a payment method');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Please log in to complete checkout');
      }

      const orderData = {
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        amount: calculateTotal(),
        total: Math.round(calculateTotal() * 100), // Convert to cents
        ref: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        payment_method: formData.payment_method,
      };

      const order = await createOrder(orderData);

      // Redirect to success page or show success message
      alert('Order placed successfully!');
      navigate('/theme/gosgconsulting');
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Checkout Error</h2>
          <p className="text-muted-foreground mb-6">{error || 'Your cart is empty'}</p>
          <button
            onClick={() => navigate('/theme/gosgconsulting/shop')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shipping_address" className="block text-sm font-medium mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      id="shipping_address"
                      name="shipping_address"
                      required
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="zip" className="block text-sm font-medium mb-2">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        required
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Payment Method *</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                    <input
                      type="radio"
                      name="payment_method"
                      value="STRIPE"
                      checked={formData.payment_method === 'STRIPE'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Stripe</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                    <input
                      type="radio"
                      name="payment_method"
                      value="PAYSTACK"
                      checked={formData.payment_method === 'PAYSTACK'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Paystack</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product_name} x {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !formData.payment_method}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
