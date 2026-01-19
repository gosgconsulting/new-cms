import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
// import { FontSwitcher } from "./FontSwitcher"; // Removed from UI but keeping file
import logoImage from "../assets/logo.png";

interface LayoutProps {
  children: React.ReactNode;
  tenantSlug?: string;
}

export function Layout({ children, tenantSlug = 'sissonne' }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const themeBasePath = `/theme/${tenantSlug}`;

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigation = [
    { name: "Home", href: themeBasePath, type: "link" },
    { name: "Programs", href: "#programs", type: "anchor" },
    { name: "Teachers", href: "#faculty", type: "anchor" },
    { name: "Gallery", href: "#gallery", type: "anchor" },
    { name: "About", href: `${themeBasePath}/about`, type: "link" },
  ];

  const isActive = (href: string) => {
    if (href === themeBasePath) {
      return location.pathname === themeBasePath || location.pathname === `${themeBasePath}/`;
    }
    if (href.startsWith('#')) {
      // Anchor links - check if we're on homepage
      return location.pathname === themeBasePath || location.pathname === `${themeBasePath}/`;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b border-dance-gray-200 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between">
            {/* Logo */}
            <Link to={themeBasePath} className="flex items-center group">
              <img
                src={logoImage}
                alt="Sissonne Dance Academy Logo"
                className="h-20 w-auto object-contain transition-all duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-12">
              {navigation.map((item) =>
                item.type === "anchor" ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="relative text-xl font-body font-medium text-dance-black transition-all duration-300 group hover:text-dance-pink"
                  >
                    {item.name}
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-dance-pink"
                    ></span>
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative text-xl font-body font-medium transition-all duration-300 group ${
                      isActive(item.href) ? "text-dance-pink" : "text-dance-black hover:text-dance-pink"
                    }`}
                  >
                    {item.name}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 bg-dance-pink ${
                        isActive(item.href)
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                ),
              )}
            </nav>

            {/* CTA */}
            <div className="hidden lg:flex items-center">
              <a
                href="#book-trial"
                className="bg-dance-pink text-dance-white px-8 py-4 rounded-full text-sm font-button font-medium tracking-wide transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:opacity-90"
              >
                Book a trial
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-dance-black hover:text-dance-pink p-2 rounded-lg hover:bg-dance-pink/10 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-dance-white/98 backdrop-blur-xl border-b border-dance-gray-200 z-50 shadow-2xl">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) =>
                item.type === "anchor" ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-xl font-medium text-dance-black transition-colors duration-200 hover:text-dance-pink"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block text-xl font-medium transition-colors duration-200 ${
                      isActive(item.href) ? "font-semibold text-dance-pink" : "text-dance-black hover:text-dance-pink"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ),
              )}
              <div className="pt-4 border-t border-dance-gray-200 space-y-3">
                <div className="flex items-center space-x-2 text-dance-black">
                  <Phone className="h-4 w-4 text-dance-pink" />
                  <span>+65 6123 4567</span>
                </div>
                <a
                  href="#book-trial"
                  className="block text-center w-full bg-dance-pink text-dance-white px-6 py-4 rounded-full font-button font-medium tracking-wide transition-all duration-300 transform hover:scale-105 shadow-xl hover:opacity-90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Book a trial
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-dance-black text-dance-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Academy Info */}
              <div className="lg:col-span-2">
                <div className="flex flex-col space-y-3 mb-6">
                  <span className="text-3xl font-bold text-dance-white tracking-tight">
                    SISSONNE
                  </span>
                  <span className="text-sm text-dance-pink font-light tracking-[0.2em]">
                    DANCE ACADEMY
                  </span>
                </div>
                <p className="text-dance-gray-200 mb-6 max-w-md leading-relaxed">
                  Inspiring excellence in dance education through innovative
                  teaching methods and world-class instruction in the heart of
                  Singapore.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-dance-pink shrink-0" />
                    <span className="text-dance-gray-200">
                      123 Orchard Road, #05-01
                      <br />
                      Singapore 238858
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-dance-pink" />
                    <span className="text-dance-gray-200">+65 6123 4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-dance-pink" />
                    <span className="text-dance-gray-200">
                      hello@sissonnedance.sg
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-heading-cursive font-semibold text-dance-white mb-6">
                  Quick Links
                </h3>
                <div className="space-y-3">
                  {navigation.map((item) =>
                    item.type === "anchor" ? (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block text-dance-gray-200 hover:text-dance-pink transition-colors duration-200"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block text-dance-gray-200 hover:text-dance-pink transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    ),
                  )}
                </div>
              </div>

              {/* Programs */}
              <div>
                <h3 className="text-lg font-heading-cursive font-semibold text-dance-white mb-6">
                  Programs
                </h3>
                <div className="space-y-3">
                  <Link
                    to={`${themeBasePath}/programs`}
                    className="block text-dance-gray-200 hover:text-dance-pink transition-colors duration-200"
                  >
                    Ballet
                  </Link>
                  <Link
                    to={`${themeBasePath}/programs`}
                    className="block text-dance-gray-200 hover:text-dance-pink transition-colors duration-200"
                  >
                    Jazz CSTD
                  </Link>
                  <Link
                    to={`${themeBasePath}/programs`}
                    className="block text-dance-gray-200 hover:text-dance-pink transition-colors duration-200"
                  >
                    Elite Performance
                  </Link>
                  <Link
                    to={`${themeBasePath}/programs`}
                    className="block text-dance-gray-200 hover:text-dance-pink transition-colors duration-200"
                  >
                    DSA Preparation
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-dance-pink/20 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-dance-gray-200 text-sm">
                © 2024 Sissonne Dance Academy. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <Link
                  to="#"
                  className="text-dance-gray-200 hover:text-dance-pink transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="#"
                  className="text-dance-gray-200 hover:text-dance-pink transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Contact Us (WhatsApp) */}
      <a
        href="https://wa.me/659730951"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="fixed -right-[3.2rem] top-1/2 -translate-y-1/2 z-50 group"
      >
        <div
          className="flex items-center justify-center gap-2 shadow-xl text-white px-4 py-3 -rotate-90 origin-center hover:opacity-90 transition-opacity bg-dance-pink"
        >
          <span className="text-lg">👋</span>
          <span className="text-sm font-semibold tracking-wide uppercase">Contact Us</span>
        </div>
      </a>

      {/* Font Switcher Widget - Removed from UI */}
      {/* <FontSwitcher tenantSlug={tenantSlug} /> */}
    </div>
  );
}
