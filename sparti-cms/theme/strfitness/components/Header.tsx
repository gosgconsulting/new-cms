import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string | null;
  onContactClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  tenantName = 'STR',
  tenantSlug = 'strfitness',
  logoSrc,
  onContactClick
}) => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  const nav = [
    { label: 'Why STR', id: 'why' },
    { label: 'Who It’s For', id: 'who' },
    { label: 'Approach', id: 'approach' },
    { label: 'Coach', id: 'coach' },
    { label: 'Location', id: 'location' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2">
          {logoSrc ? (
            <img src={logoSrc} alt={tenantName} className="h-8 w-auto" />
          ) : (
            <span className="font-semibold text-lg">{tenantName}</span>
          )}
          <span className="text-xs text-muted-foreground">1‑on‑1 Personal Training</span>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <button key={n.id} onClick={() => scrollTo(n.id)} className="text-sm text-muted-foreground hover:text-foreground">
              {n.label}
            </button>
          ))}
          <Button onClick={onContactClick} className="ml-2">Book a 1‑on‑1 Session</Button>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18"/>
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
            {nav.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="text-sm text-muted-foreground text-left">
                {n.label}
              </button>
            ))}
            <Button onClick={onContactClick}>Book a 1‑on‑1 Session</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;