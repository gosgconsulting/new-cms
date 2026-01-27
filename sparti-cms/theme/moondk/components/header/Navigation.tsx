import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { ThemeLink } from "../ThemeLink";
import ShoppingBag from "./ShoppingBag";
import { useCart } from "../../contexts/CartContext";

import logoSrc from "../../assets/logo.png";

// Placeholder images - replace with actual product images
import pantheonImage from "../../../e-shop/assets/pantheon.jpg";
import eclipseImage from "../../../e-shop/assets/eclipse.jpg";
import haloImage from "../../../e-shop/assets/halo.jpg";
import foundersImage from "../../../e-shop/assets/founders.png";

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [offCanvasType, setOffCanvasType] = useState<"favorites" | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { cartItems, updateQuantity, totalItems, isCartOpen, openCart, closeCart } = useCart();

  // Preload dropdown images for faster display
  useEffect(() => {
    const imagesToPreload = [pantheonImage, eclipseImage, haloImage, foundersImage];

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const navItems = [
    {
      name: "HOME",
      href: "/",
      submenuItems: [],
      images: [],
    },
    {
      name: "SHOP",
      href: "/category/shop",
      submenuItems: [
        "Curated Sets",
        "Ingredients",
        "Tools",
        "Recipe Collections",
        "Essentials",
      ],
      images: [],
    },
    {
      name: "RECIPES",
      href: "/recipes",
      submenuItems: [],
      images: [],
    },
    {
      name: "Beok Home Dining",
      href: "/beok",
      submenuItems: [],
      images: [],
    },
    {
      name: "CONTACT US",
      href: "/contact",
      submenuItems: [],
      images: [],
    },
  ];

  return (
    <nav
      className="relative bg-nav"
      style={{
        backgroundColor: "rgba(242, 242, 242, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Topbar */}
      <div
        className="w-full py-2 px-6 flex items-center justify-center text-sm"
        style={{
          backgroundColor: "#B6B8A1", // Updated topbar color
        }}
      >
        <div className="text-[#2F5C3E] font-body font-light">
          FREE DELIVERY FOR ORDERS OVER $150
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white">
        <div className="relative flex items-center justify-between h-20 px-6">
          {/* Left: Menu */}
          <div className="flex items-center">
            {/* Mobile hamburger button */}
            <button
              className="lg:hidden p-2 mt-0.5 text-nav-foreground hover:text-primary transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 relative">
                <span
                  className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 top-2.5" : "top-1.5"
                  }`}
                ></span>
                <span
                  className={`absolute block w-5 h-px bg-current transform transition-all duration-300 top-2.5 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 top-2.5" : "top-3.5"
                  }`}
                ></span>
              </div>
            </button>

            {/* Desktop nav items */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => {
                    if (item.submenuItems && item.submenuItems.length > 0) {
                      setActiveDropdown(item.name);
                    } else {
                      setActiveDropdown(null);
                    }
                  }}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <ThemeLink
                    to={item.href}
                    className="text-nav-foreground hover:text-primary transition-colors duration-200 text-sm font-body font-light py-2 flex items-center gap-1"
                  >
                    {item.name}
                    {item.submenuItems && item.submenuItems.length > 0 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    )}
                  </ThemeLink>
                  
                  {/* Simple dropdown below menu item */}
                  {activeDropdown === item.name && item.submenuItems && item.submenuItems.length > 0 && (
                    <div
                      className="absolute top-full left-0 mt-1 bg-white border border-border shadow-lg z-50 min-w-[200px] py-2"
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <ul className="space-y-0">
                        {item.submenuItems.map((subItem, index) => {
                          const to =
                            item.name === "SHOP"
                              ? `/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`
                              : `/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`;

                          return (
                            <li key={index}>
                              <ThemeLink
                                to={to}
                                className="text-nav-foreground hover:text-primary transition-colors duration-200 text-sm font-body font-light block px-4 py-2 hover:bg-muted/50"
                              >
                                {subItem}
                              </ThemeLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <ThemeLink to="/" className="block">
              <img
                src={logoSrc}
                alt="MOONDK"
                className="block h-14 md:h-16 w-auto object-contain"
              />
            </ThemeLink>
          </div>

          {/* Right: Utility icons */}
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-nav-foreground hover:text-primary transition-colors duration-200"
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
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
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
            <button
              className="p-2 text-nav-foreground hover:text-primary transition-colors duration-200"
              aria-label="Account"
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
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </button>
            <button
              className="p-2 text-nav-foreground hover:text-primary transition-colors duration-200 relative"
              aria-label="Shopping bag"
              onClick={openCart}
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
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-primary pointer-events-none">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* Search overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-border z-50">
          <div className="px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="flex items-center border-b border-border pb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5 text-nav-foreground mr-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="flex-1 bg-transparent text-nav-foreground placeholder:text-nav-foreground/60 outline-none text-lg font-body"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border z-50">
          <div className="px-6 py-8">
            <div className="space-y-6">
              {navItems.map((item) => (
                <div key={item.name}>
                  <ThemeLink
                    to={item.href}
                    className="text-nav-foreground hover:text-primary transition-colors duration-200 text-lg font-body font-light block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </ThemeLink>
                  <div className="mt-3 pl-4 space-y-2">
                    {item.submenuItems.map((subItem, subIndex) => {
                      const to =
                        item.name === "SHOP"
                          ? `/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`
                          : `/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`;

                      return (
                        <ThemeLink
                          key={subIndex}
                          to={to}
                          className="text-nav-foreground/70 hover:text-primary text-sm font-body font-light block py-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem}
                        </ThemeLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shopping Bag */}
      <ShoppingBag
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        onViewFavorites={() => {
          closeCart();
          setOffCanvasType("favorites");
        }}
      />

      {/* Favorites Off-canvas */}
      {offCanvasType === "favorites" && (
        <div className="fixed inset-0 z-50 h-screen">
          <div
            className="absolute inset-0 bg-black/50 h-screen"
            onClick={() => setOffCanvasType(null)}
          />

          <div className="absolute right-0 top-0 h-screen w-96 bg-background border-l border-border animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-heading font-medium text-foreground">Your Favorites</h2>
              <button
                onClick={() => setOffCanvasType(null)}
                className="p-2 text-foreground hover:text-muted-foreground transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-muted-foreground text-sm mb-6 font-body">
                You haven't added any favorites yet. Browse our collection and click the heart icon to save items you love.
              </p>

              {/* Demo actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setOffCanvasType(null)}
                >
                  Close
                </Button>
                <Button
                  className="rounded-full bg-primary hover:bg-primary-hover !text-white"
                  onClick={() => {
                    setOffCanvasType(null);
                    openCart();
                  }}
                >
                  View Bag
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;