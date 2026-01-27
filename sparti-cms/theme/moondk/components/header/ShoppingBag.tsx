import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeLink } from "../ThemeLink";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  category: string;
}

interface ShoppingBagProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (id: number, newQuantity: number) => void;
  onViewFavorites?: () => void;
}

const ShoppingBag = ({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  onViewFavorites,
}: ShoppingBagProps) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("€", "").replace(",", ""));
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 h-screen">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 h-screen" onClick={onClose} />

      {/* Off-canvas panel */}
      <div className="absolute right-0 top-0 h-screen w-96 bg-background border-l border-border animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-heading font-medium text-foreground">Shopping Bag</h2>
          <button
            onClick={onClose}
            className="p-2 text-foreground hover:text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6">
          {/* Mobile favorites toggle */}
          {onViewFavorites && (
            <div className="md:hidden mb-6 pb-6 border-b border-border">
              <button
                onClick={onViewFavorites}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg text-nav-foreground hover:text-nav-hover hover:border-nav-hover transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                <span className="text-sm font-light">View Favorites</span>
              </button>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center">
                Your shopping bag is empty.
                <br />
                Continue shopping to add items to your bag.
              </p>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#F2EFDC] rounded-2xl p-4 relative"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => updateQuantity(item.id, 0)}
                      className="absolute top-3 right-3 p-1 text-foreground/60 hover:text-foreground transition-colors"
                      aria-label="Remove item"
                    >
                      <X size={16} />
                    </button>

                    <div className="flex gap-4">
                      {/* Product image */}
                      <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground mb-1">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Volume {item.category}
                        </p>

                        {/* Quantity selector and price */}
                        <div className="flex items-center justify-between">
                          {/* Quantity selector */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-foreground hover:bg-white/80 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-medium text-foreground w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-foreground hover:bg-white/80 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Price tag */}
                          <div className="bg-white rounded-full px-3 py-1">
                            <span className="text-sm font-medium text-foreground">{item.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Amount Summary */}
              <div className="border-t border-border-light pt-6 mb-6">
                <h3 className="text-base font-semibold text-foreground mb-4">Amount</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light text-foreground">Item total</span>
                    <span className="text-sm font-light text-foreground">
                      €{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light text-foreground">Delivery fee</span>
                    <span className="text-sm font-light text-foreground">€30</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border-light">
                    <span className="text-base font-semibold text-foreground">Total</span>
                    <span className="text-base font-semibold text-foreground">
                      €{(subtotal + 30).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Checkout button */}
                <ThemeLink to="/checkout" className="block" onClick={onClose}>
                  <Button className="w-full rounded-full bg-primary hover:bg-primary-hover !text-white font-medium h-12">
                    Go to Checkout
                  </Button>
                </ThemeLink>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingBag;
