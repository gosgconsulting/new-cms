"use client";

import React from 'react';

const images = [
  '/theme/landingpage/assets/testimonial-1.jpg',
  '/theme/landingpage/assets/testimonial-2.jpg',
  '/theme/landingpage/assets/incorporation-services.jpg',
  '/theme/landingpage/assets/accounting-dashboard.jpg',
  '/theme/landingpage/assets/corporate-secretarial.jpg',
  '/theme/landingpage/assets/hero-business.jpg',
  '/uploads/file-1761550194730-867434602.png',
  '/uploads/file-1761550182690-941103926.png',
  '/uploads/file-1761550170132-494582814.png',
  '/uploads/file-1761550163789-455632927.png',
  '/uploads/file-1761550175143-386391927.png',
  '/uploads/file-1761550188342-962703871.png',
];

const GallerySection: React.FC = () => {
  return (
    <section id="gallery" className="bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 text-center">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((src, idx) => (
            <div key={idx} className="aspect-square overflow-hidden rounded-lg border border-border">
              <img
                src={src}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/theme/landingpage/assets/placeholder.svg';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;