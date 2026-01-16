import { useState, useEffect } from "react";

import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const withBase = (path: string) => {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  if (path.startsWith("/")) return normalizedBase.replace(/\/$/, "") + path;
  return normalizedBase + path;
};

const ITEMS = [
  {
    label: "Features",
    href: "/#features",
    dropdownItems: [
      {
        title: "Conversion-first structure",
        href: "/#features",
        description: "Proven sections that drive enquiries",
      },
      {
        title: "Tenant-aware theming",
        href: "/#features",
        description: "Branding + styles per tenant",
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = ({
  logoSrc,
  siteName = "Sparti",
}: {
  logoSrc?: string | null;
  siteName?: string;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return (
    <section
      className={cn(
        "bg-background/70 absolute left-1/2 z-50 w-[min(92%,900px)] -translate-x-1/2 rounded-4xl border backdrop-blur-md transition-all duration-300",
        "top-5 lg:top-12",
      )}
    >
      <div className="flex items-center justify-between px-6 py-3">
        <a href={withBase("/")} className="flex shrink-0 items-center gap-2">
          {logoSrc ? (
            <img src={logoSrc} alt={siteName} className="h-6 w-auto" />
          ) : (
            <span className="text-sm font-semibold">{siteName}</span>
          )}
        </a>

        {/* Desktop Navigation */}
        <NavigationMenu className="max-lg:hidden">
          <NavigationMenuList>
            {ITEMS.map((link) =>
              link.dropdownItems ? (
                <NavigationMenuItem key={link.label}>
                  <NavigationMenuTrigger className="data-[state=open]:bg-accent/50 bg-transparent! px-1.5">
                    {link.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-[420px] space-y-2 p-4">
                      {link.dropdownItems.map((item) => (
                        <li key={item.title}>
                          <a
                            href={withBase(item.href)}
                            className="group hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-4 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none"
                          >
                            <div className="space-y-1.5 transition-transform duration-300 group-hover:translate-x-1">
                              <div className="text-sm leading-none font-medium">
                                {item.title}
                              </div>
                              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                {item.description}
                              </p>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={link.label}>
                  <a
                    href={withBase(link.href)}
                    className={cn(
                      "relative bg-transparent px-1.5 text-sm font-medium transition-opacity hover:opacity-75",
                      pathname === withBase(link.href) && "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </a>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA */}
        <div className="flex items-center gap-2.5">
          <a href={withBase("/contact")} className="max-lg:hidden">
            <Button>
              <span className="relative z-10">Book a call</span>
            </Button>
          </a>

          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            className="text-muted-foreground relative flex size-8 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <div className="absolute top-1/2 left-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
              <span
                aria-hidden="true"
                className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`}
              ></span>
              <span
                aria-hidden="true"
                className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "opacity-0" : ""}`}
              ></span>
              <span
                aria-hidden="true"
                className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/*  Mobile Menu Navigation */}
      <div
        className={cn(
          "bg-background fixed inset-x-0 top-[calc(100%+1rem)] flex flex-col rounded-2xl border p-6 transition-all duration-300 ease-in-out lg:hidden",
          isMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-4 opacity-0",
        )}
      >
        <nav className="divide-border flex flex-1 flex-col divide-y">
          {ITEMS.map((link) =>
            link.dropdownItems ? (
              <div key={link.label} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === link.label ? null : link.label,
                    )
                  }
                  className="text-foreground flex w-full items-center justify-between text-base font-medium"
                >
                  {link.label}
                  <ChevronRight
                    className={cn(
                      "size-4 transition-transform duration-200",
                      openDropdown === link.label ? "rotate-90" : "",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openDropdown === link.label
                      ? "mt-4 max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0",
                  )}
                >
                  <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                    {link.dropdownItems.map((item) => (
                      <a
                        key={item.title}
                        href={withBase(item.href)}
                        className="hover:bg-accent group block rounded-md p-2 transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                      >
                        <div className="transition-transform duration-200 group-hover:translate-x-1">
                          <div className="text-primary font-medium">
                            {item.title}
                          </div>

                          <p className="text-muted-foreground mt-1 text-sm">
                            {item.description}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={link.label}
                href={withBase(link.href)}
                className={cn(
                  "text-foreground hover:text-foreground/80 py-4 text-base font-medium transition-colors first:pt-0 last:pb-0",
                  pathname === withBase(link.href) && "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ),
          )}
          <a href={withBase("/contact")} className="pt-4">
            <Button className="w-full">Book a call</Button>
          </a>
        </nav>
      </div>
    </section>
  );
};