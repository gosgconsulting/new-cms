import { ArrowRight, X, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { ThemeLink } from "../ThemeLink";
import ShoppingBag, { type CartItem } from "./ShoppingBag";

import logoSrc from "../../assets/logo.svg";

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
  const [isShoppingBagOpen, setIsShoppingBagOpen] = useState(false);

  // Shopping bag state with mock items
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Chef's Selection Box",
      price: "€45",
      image: pantheonImage,
      quantity: 1,
      category: "Curated Sets",
    },
    {
      id: 2,
      name: "Korean Home Essentials",
      price: "€32",
      image: eclipseImage,
      quantity: 1,
      category: "Essentials",
    },
  ]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((items) => items.filter((item) => item.id !== id));
    } else {
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Preload dropdown images for faster display
  useEffect(() => {
    const imagesToPreload = [pantheonImage, eclipseImage, haloImage, foundersImage];

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const popularSearches = [
    "Chef's Selection",
    "Korean Ingredients",
    "Home Dining Sets",
    "Curated Products",
    "Recipe Collections",
    "Chef Tools",
  ];

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
      images: [
        {
          src: pantheonImage,
          alt: "Curated Sets",
          label: "Curated Sets",
          to: "/category/curated-sets",
        },
        {
          src: haloImage,
          alt: "Ingredients",
          label: "Ingredients",
          to: "/category/ingredients",
        },
      ],
    },
    {
      name: "RECIPES",
      href: "/recipes",
      submenuItems: [],
      images: [],
    },
    {
      name: "BEOK",
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
        className="w-full py-2 px-6 flex items-center justify-between text-sm"
        style={{
          backgroundColor: "#9CAF88", // Sage green background
        }}
      >
        <div className="text-[#2F5C3E] font-body font-light">
          FREE DELIVERY FOR ORDERS OVER $150
        </div>
        <ThemeLink
          to="/category/shop"
          className="text-[#2F5C3E] font-body font-light flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          SHOP NOW
          <ChevronRight size={14} />
        </ThemeLink>
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
                className="block h-12 md:h-14 w-auto object-contain"
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
              onClick={() => setIsShoppingBagOpen(true)}
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

      {/* Full width dropdown */}
      {activeDropdown && (
        <div
          className="absolute top-full left-0 right-0 bg-background border-b border-border z-50"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="px-6 py-8">
            <div className="flex justify-between w-full">
              {/* Left side - Menu items */}
              <div className="flex-1">
                <ul className="space-y-2">
                  {navItems
                    .find((item) => item.name === activeDropdown)
                    ?.submenuItems.map((subItem, index) => {
                      const to =
                        activeDropdown === "SHOP"
                          ? `/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`
                          : `/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`;

                      return (
                        <li key={index}>
                          <ThemeLink
                            to={to}
                            className="text-nav-foreground hover:text-primary transition-colors duration-200 text-sm font-body font-light block py-2"
                          >
                            {subItem}
                          </ThemeLink>
                        </li>
                      );
                    })}
                </ul>
              </div>

              {/* Right side - Images */}
              <div className="flex space-x-6">
                {navItems
                  .find((item) => item.name === activeDropdown)
                  ?.images.map((image, index) => (
                    <ThemeLink
                      key={index}
                      to={image.to}
                      className="w-[400px] h-[280px] cursor-pointer group relative overflow-hidden block"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                      />
                      <div className="absolute bottom-2 left-2 text-white text-xs font-light flex items-center gap-1">
                        <span>{image.label}</span>
                        <ArrowRight size={12} />
                      </div>
                    </ThemeLink>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border z-50">
          <div className="px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-8">
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

              <div>
                <h3 className="text-nav-foreground text-sm font-body font-light mb-4">
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-3">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      className="text-nav-foreground hover:text-primary text-sm font-body font-light py-2 px-4 border border-border rounded-full transition-colors duration-200 hover:border-primary"
                    >
                      {search}
                    </button>
                  ))}
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
        isOpen={isShoppingBagOpen}
        onClose={() => setIsShoppingBagOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        onViewFavorites={() => {
          setIsShoppingBagOpen(false);
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
                  className="rounded-none"
                  onClick={() => setOffCanvasType(null)}
                >
                  Close
                </Button>
                <Button
                  className="rounded-none bg-primary hover:bg-primary-hover"
                  onClick={() => {
                    setOffCanvasType(null);
                    setIsShoppingBagOpen(true);
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