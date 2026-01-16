"use client";

import React from 'react';

interface AboutProps {
  title: string;
  description: string;
}

const AboutSection: React.FC<AboutProps> = ({ title, description }) => {
  return (
    <section id="about" className="bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">{title}</h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border">
            <img src="/theme/landingpage/assets/incorporation-services.jpg" alt="About 1" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border">
            <img src="/theme/landingpage/assets/accounting-dashboard.jpg" alt="About 2" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border">
            <img src="/theme/landingpage/assets/corporate-secretarial.jpg" alt="About 3" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border">
            <img src="/theme/landingpage/assets/testimonial-2.jpg" alt="About 4" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;