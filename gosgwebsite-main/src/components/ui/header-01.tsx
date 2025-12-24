"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import gosgLogo from "@/assets/go-sg-logo-official.png";

interface HeaderProps {
  onContactClick?: () => void;
}

export function Header({ onContactClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg border-b",
        isScrolled && "shadow-sm"
      )}
    >
      <nav className="mx-auto flex items-center justify-between px-3 py-2 md:px-4">
        {/* Brand */}
        <Link to="/" aria-label="home" className="flex items-center gap-2">
          <img
            src={gosgLogo}
            alt="GO SG Consulting"
            height={40}
            width={140}
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Right actions: only Learn More button */}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onContactClick}>Learn More</Button>
        </div>
      </nav>
    </header>
  );
}

export default Header;