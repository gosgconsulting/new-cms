import React from 'react';
import { Button } from './ui/button';

interface SimpleHeaderProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  onContactClick?: () => void;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  tenantName = 'Your Site',
  tenantSlug = 'site',
  logoSrc,
  onContactClick
}) => {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `/theme/${tenantSlug}`;
  };

  const nav = [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-6">
        <div className="h-14 md:h-16 flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 bg-transparent border-0"
            aria-label="Go to homepage"
          >
            {logoSrc ? (
              <img src={logoSrc} alt={tenantName} className="h-8 w-auto" />
            ) : (
              <span className="font-bold text-lg">{tenantName}</span>
            )}
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {nav.map((n) => (
              <a key={n.label} href={n.href} className="text-sm text-muted-foreground hover:text-foreground">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button onClick={onContactClick} className="bg-primary text-primary-foreground hover:opacity-90">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;