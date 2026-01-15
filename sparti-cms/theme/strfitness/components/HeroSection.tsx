import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onPrimaryClick?: () => void;
}

const HeroSection: React.FC<HeroProps> = ({ onPrimaryClick }) => {
  return (
    <section className="relative border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          1‑on‑1 Personal Training for Performance and Longevity
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          Personalised coaching in a physiotherapy‑informed environment. Assessment‑led, structured, and built for long‑term results—rehab, competition prep, and long‑term health.
        </p>
        <div className="flex gap-3">
          <Button onClick={onPrimaryClick}>Book a 1‑on‑1 Session</Button>
          <a href="#why" className="px-5 py-2.5 rounded-md border border-border hover:bg-muted text-sm md:text-base">
            Why STR
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;