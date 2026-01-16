"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  tenantName?: string;
  logoSrc?: string | null;
  onContactClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ tenantName = 'STR', logoSrc, onContactClick }) => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: 'About', id: 'about' },
    { label: 'Our Programmes', id: 'programmes' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Team', id: 'team' },
    { label: 'FAQ', id: 'faq' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerHeight = window.innerWidth < 768 ? 160 : 72;
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-18 flex items-center justify-between py-3">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-3">
            {logoSrc ? (
              <img src={logoSrc} alt={tenantName} className="h-7 w-auto" />
            ) : (
              <span className="font-semibold tracking-wide">{tenantName}</span>
            )}
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onContactClick}>
              Contact
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
            <svg className="h-6 w-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border py-3">
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="text-muted-foreground hover:text-foreground text-left py-2">
                  {item.label}
                </button>
              ))}
              <Button className="bg-primary text-primary-foreground mt-2" onClick={onContactClick}>
                Contact
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;