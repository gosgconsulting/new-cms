"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  title: string;
  description: string;
  address?: string[];
  onPrimaryClick?: () => void;
}

const HeroSection: React.FC<HeroProps> = ({ title, description, address = [], onPrimaryClick }) => {
  const imageSrc = '/theme/landingpage/assets/hero-business.jpg';

  return (
    <section className="relative min-h-[75vh] md:min-h-[80vh] bg-background" id="hero">
      <div className="absolute inset-0">
        <img src={imageSrc} alt="Hero" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-[320px_1fr] gap-10 items-center">
        {/* Circular brand mark */}
        <div className="flex md:block justify-center">
          <div className="relative h-64 w-64 rounded-full border-2 border-foreground/60 flex items-center justify-center bg-black/40">
            <div className="h-36 w-36 rounded-full bg-background/20 border border-foreground/30 flex items-center justify-center">
              <span className="text-2xl font-semibold tracking-widest">STR</span>
            </div>
          </div>
        </div>

        {/* Text block */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-semibold text-foreground">{title}</h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">{description}</p>

          {address.length > 0 && (
            <div className="mt-6 text-sm text-muted-foreground">
              {address.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onPrimaryClick}>
              Book a session
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;