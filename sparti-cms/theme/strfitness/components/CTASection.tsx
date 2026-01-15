import React from 'react';
import { Button } from '@/components/ui/button';

interface CTAProps {
  onPrimaryClick?: () => void;
}

const CTASection: React.FC<CTAProps> = ({ onPrimaryClick }) => {
  return (
    <section id="location" className="border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-3">Location</h2>
        <p className="text-muted-foreground mb-6">Private training space in Singapore. Sessions by appointment only.</p>
        <div className="flex gap-3">
          <Button onClick={onPrimaryClick}>Book Your 1‑on‑1 Personal Training Session</Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;