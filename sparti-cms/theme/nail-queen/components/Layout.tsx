import React from "react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";
import { SocialMediaSticky } from "./SocialMediaSticky";
import { useEffect, useState } from "react";
import ContactPanel from "./ContactPanel";
import { useThemeBranding } from "../../../hooks/useThemeSettings";
import { getSiteName, getLogoSrc } from "../utils/settings";

interface LayoutProps {
  basePath: string;
  children: React.ReactNode;
  tenantId?: string;
}

const joinPath = (basePath: string, subPath: string) => {
  const base = basePath.replace(/\/+$/, "");
  const sub = subPath.startsWith("/") ? subPath : `/${subPath}`;
  return subPath === "" ? base : `${base}${sub}`;
};

export function Layout({ basePath, children, tenantId }: LayoutProps) {
  const location = useLocation();

  // Load branding settings from database
  const { branding, loading: brandingLoading } = useThemeBranding('nail-queen', tenantId);
  
  // Get settings from database with fallback to defaults
  const siteName = getSiteName(branding, 'Nail Queen');
  const logoSrc = getLogoSrc(branding);

  const [isContactOpen, setIsContactOpen] = useState(false);
  useEffect(() => {
    const handler = () => setIsContactOpen(true);
    window.addEventListener("nailqueen:open-contact", handler);
    return () => window.removeEventListener("nailqueen:open-contact", handler);
  }, []);

  const navItems = [
    { label: "Home", path: "" },
    { label: "Pricing", path: "/pricing" },
    { label: "Find us", path: "/find-us" },
    { label: "Gallery", path: "/gallery" },
    { label: "About", path: "/about" },
    { label: "Blog", path: "/blog" },
  ];

  const isActive = (path: string) => {
    const full = joinPath(basePath, path);
    return location.pathname === full;
  };

  return (
    <div className="min-h-screen bg-background">
      <SocialMediaSticky />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border))] bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={joinPath(basePath, "")} className="flex items-center space-x-2">
              {brandingLoading ? (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NQ</span>
                </div>
              ) : (
                <img 
                  src={logoSrc} 
                  alt={siteName} 
                  className="h-12 w-auto"
                  onError={(e) => {
                    // Fallback to NQ badge if image not found
                    const target = e.target as HTMLImageElement;
                    if (target.dataset.fallbackAdded) return;
                    target.style.display = 'none';
                    target.dataset.fallbackAdded = 'true';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-10 h-10 rounded-full bg-primary flex items-center justify-center';
                    const text = document.createElement('span');
                    text.className = 'text-white font-bold text-sm';
                    text.textContent = 'NQ';
                    fallback.appendChild(text);
                    target.parentElement?.appendChild(fallback);
                  }}
                />
              )}
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={joinPath(basePath, item.path)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive(item.path) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <button
              className="bg-nail-queen-brown text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-nail-queen-brown/90 transition-colors"
              onClick={() => setIsContactOpen(true)}
            >
              Book now
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">{children}</main>

      <ContactPanel open={isContactOpen} onOpenChange={setIsContactOpen} />

      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/6597916789"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
        </a>
      </div>

      <footer className="bg-background text-black py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-6 text-sm">
              <Link to={joinPath(basePath, "/privacy")} className="hover:text-gray-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to={joinPath(basePath, "/terms")} className="hover:text-gray-600 transition-colors">
                Terms & Conditions
              </Link>
            </div>
            <p className="text-sm text-gray-600">Copyright © 2025 {siteName}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}