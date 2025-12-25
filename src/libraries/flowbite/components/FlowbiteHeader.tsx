"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type MenuItem = {
  id?: string;
  link?: string;
  label?: string;
  dropdown?: any;
};

type HeaderSchema = {
  logo?: { src?: string; alt?: string; height?: string };
  menu?: MenuItem[];
  topBar?: { enabled?: boolean; message?: string; showCloseButton?: boolean };
  showCart?: boolean;
  showSearch?: boolean;
  showAccount?: boolean;
  showWishlist?: boolean;
  showLanguageSwitcher?: boolean;
  button?: { link?: string; label?: string };
  contactButton?: string;
  [key: string]: any;
};

interface MasterHeaderProps {
  tenantId?: string | null;
  language?: string;
  onContactClick?: () => void;
  className?: string;
}

const MasterHeader: React.FC<MasterHeaderProps> = ({
  tenantId,
  language,
  onContactClick,
  className = "",
}) => {
  const [schema, setSchema] = useState<HeaderSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTopBar, setShowTopBar] = useState<boolean>(true);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const params = language ? `?language=${encodeURIComponent(language)}` : "";
    const controller = new AbortController();
    fetch(`/api/v1/header${params}`, {
      headers: tenantId ? { "X-Tenant-Id": tenantId } : {},
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return data?.data || null;
      })
      .then((data) => {
        setSchema(data);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [tenantId, language]);

  const menu = useMemo(() => (schema?.menu && Array.isArray(schema.menu) ? schema.menu : []), [schema]);

  const Logo = () => {
    const src = schema?.logo?.src || "";
    const alt = schema?.logo?.alt || "Logo";
    const heightCls = schema?.logo?.height || "h-8";
    if (!src) {
      return (
        <span className="inline-flex items-center font-bold text-xl">
          {alt || "Site"}
        </span>
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        className={`${heightCls} w-auto`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    );
  };

  const CTA = () => {
    const btn = schema?.button;
    const contactText = schema?.contactButton;
    if (onContactClick && (btn?.label || contactText)) {
      return (
        <Button
          onClick={onContactClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {contactText || btn?.label || "Contact"}
        </Button>
      );
    }
    if (btn?.label && btn?.link) {
      return (
        <a
          href={btn.link}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {btn.label}
        </a>
      );
    }
    return null;
  };

  const TopBar = () => {
    if (!schema?.topBar?.enabled || !showTopBar) return null;
    return (
      <div className="w-full bg-secondary text-secondary-foreground text-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center relative">
          <span className="truncate">{schema.topBar?.message || ""}</span>
          {schema.topBar?.showCloseButton && (
            <button
              type="button"
              onClick={() => setShowTopBar(false)}
              className="absolute right-3 text-secondary-foreground/70 hover:text-secondary-foreground"
              aria-label="Close announcement"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <header className={`sticky top-0 z-50 bg-background/95 backdrop-blur border-b ${className}`}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="w-24 h-6 bg-muted rounded animate-pulse" />
          <div className="w-40 h-8 bg-muted rounded animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <div className="sticky top-0 z-50">
      <TopBar />
      <header className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b ${className}`}>
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Logo />
            </a>
            <nav className="hidden md:flex items-center gap-6">
              {menu.map((item, idx) => (
                <a
                  key={item.id || idx}
                  href={item.link || "#"}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label || "Menu"}
                </a>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <CTA />
            </div>
            <button
              type="button"
              className="md:hidden bg-transparent border-0"
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                {mobileOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
          {mobileOpen && (
            <div className="md:hidden pb-4 border-t">
              <nav className="flex flex-col gap-4 pt-4">
                {menu.map((item, idx) => (
                  <a
                    key={item.id || idx}
                    href={item.link || "#"}
                    onClick={() => setMobileOpen(false)}
                    className="text-foreground"
                  >
                    {item.label || "Menu"}
                  </a>
                ))}
                <div className="pt-2">
                  <CTA />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default MasterHeader;