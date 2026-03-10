import { ChevronLeft } from "lucide-react";
import { ThemeLink } from "../ThemeLink";

import logoSrc from "../../assets/logo.png";

const CheckoutHeader = () => {
  return (
    <header className="w-full bg-background border-b border-border-light">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="relative flex items-center justify-between">
          {/* Left side - Continue Shopping */}
          <ThemeLink
            to="/"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-body font-light hidden sm:inline">Continue Shopping</span>
          </ThemeLink>

          {/* Center - Logo */}
          <ThemeLink to="/" className="absolute left-1/2 transform -translate-x-1/2">
            <img
              src={logoSrc}
              alt="MOONDK"
              className="h-10 w-auto object-contain block"
            />
          </ThemeLink>

          {/* Right side - Empty spacer to maintain layout */}
          <div className="w-0 sm:w-auto"></div>
        </div>
      </div>
    </header>
  );
};

export default CheckoutHeader;