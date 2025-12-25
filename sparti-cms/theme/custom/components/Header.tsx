import React, { useState } from 'react';

interface HeaderProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  onContactClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  tenantName = 'Custom',
  tenantSlug = 'custom',
  logoSrc,
  onContactClick
}) => {
  const [open, setOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `/theme/${tenantSlug}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          <button onClick={handleLogoClick} className="flex items-center gap-2 bg-transparent border-0">
            {logoSrc ? (
              <img src={logoSrc} alt={tenantName} className="h-8 w-auto" />
            ) : (
              <span className="font-bold text-xl">{tenantName}</span>
            )}
          </button>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#hero" className="text-muted-foreground hover:text-foreground">Home</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">Contact</a>
            <button
              onClick={onContactClick}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
            >
              Get Started
            </button>
          </nav>
          <button
            className="md:hidden bg-transparent border-0"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              {open ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              )}
            </svg>
          </button>
        </div>
        {open && (
          <div className="md:hidden pb-4 border-t">
            <nav className="flex flex-col gap-4 pt-4">
              <a href="#hero" onClick={() => setOpen(false)} className="text-foreground">Home</a>
              <a href="#features" onClick={() => setOpen(false)} className="text-foreground">Features</a>
              <a href="#contact" onClick={() => setOpen(false)} className="text-foreground">Contact</a>
              <button
                onClick={() => {
                  setOpen(false);
                  onContactClick?.();
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
              >
                Get Started
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;