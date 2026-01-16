"use client";

import React from 'react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Tech Startup Founder',
    image: '/theme/landingpage/assets/testimonial-1.jpg',
    quote:
      "ACATR's filing agents completed our incorporation in 24 hours and their accountants handle all our compliance.",
  },
  {
    name: 'Marcus Rodriguez',
    role: 'International Entrepreneur',
    image: '/theme/landingpage/assets/testimonial-2.jpg',
    quote:
      'Remote-friendly incorporation with perfect ACRA compliance. Their support kept us penalty-free.',
  },
  {
    name: 'Lisa Thompson',
    role: 'Small Business Owner',
    image: '/theme/landingpage/assets/testimonial-1.jpg',
    quote:
      'Professional accounting saved us 20+ hours monthly with clear IRAS and GST compliance.',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-sm text-muted-foreground">Testimonials</div>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Public Cheers For Us!</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-20 h-20 rounded-full object-cover border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/theme/landingpage/assets/placeholder.svg';
                  }}
                />
                <div className="mt-3 font-semibold text-foreground">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
                <p className="mt-4 text-sm text-muted-foreground max-w-sm">{t.quote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;