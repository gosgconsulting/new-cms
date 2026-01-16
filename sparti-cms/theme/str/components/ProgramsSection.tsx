"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface Program {
  title: string;
  subtitle: string;
  description: string;
}

interface ProgramsProps {
  onContactClick?: () => void;
}

const defaultPrograms: Program[] = [
  {
    title: 'Singapore Company Incorporation Services',
    subtitle: 'One-Time Fee: S$1,815 (S$1,115 for Locals)',
    description:
      'Professional incorporation services for Singapore Pte. Ltd. companies, including complete documentation and secretarial setup.',
  },
  {
    title: 'Annual Ongoing Services',
    subtitle: 'S$4,300/year (varies by transaction volume)',
    description:
      'Corporate secretary, tax filing, bookkeeping, and local director support to keep your company compliant.',
  },
  {
    title: 'Additional Services & Support',
    subtitle: 'Enhanced Business Operations',
    description:
      'Registered address, payroll, GST, employment pass, and banking support for smooth operations.',
  },
];

const ProgramsSection: React.FC<ProgramsProps> = ({ onContactClick }) => {
  return (
    <section id="programmes" className="bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-10 text-center">Explore our programmes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {defaultPrograms.map((p, idx) => {
            const blackCard = idx === 0 || idx === 2;
            return (
              <div
                key={p.title}
                className={`rounded-lg border ${
                  blackCard ? 'bg-black text-foreground' : 'bg-card text-card-foreground'
                } p-6 flex flex-col justify-between min-h-[220px]`}
              >
                <div>
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <div className="mt-2 text-muted-foreground">{p.subtitle}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
                </div>
                <div className="mt-6">
                  <Button
                    className={`${blackCard ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border hover:bg-muted'}`}
                    variant={blackCard ? undefined : 'outline'}
                    onClick={onContactClick}
                  >
                    {idx === 1 ? 'Membership programme' : idx === 0 ? 'Book a session' : 'Contact us'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;