"use client";

import React from "react";
import { CircularGallery, GalleryItem } from "@/components/ui/circular-gallery";

type Item = {
  key: string;
  type: string;
  content?: string;
  items?: Array<Item>;
};

interface CircularGallerySectionProps {
  items?: Item[];
}

const CircularGallerySection: React.FC<CircularGallerySectionProps> = ({ items = [] }) => {
  // Updated business gallery data with service labels and 6 specific services
  const businessGalleryData: GalleryItem[] = [
    {
      common: 'Website Design',
      binomial: 'User Experience & Development',
      photo: {
        url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&auto=format&fit=crop&q=80',
        text: 'Modern website design on laptop screen',
        pos: '50% 40%',
        by: 'Domenico Loia'
      }
    },
    {
      common: 'SEO',
      binomial: 'Search Engine Optimization',
      photo: {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80',
        text: 'Analytics dashboard showing growth metrics',
        pos: '50% 30%',
        by: 'Luke Chesser'
      }
    },
    {
      common: 'SEM',
      binomial: 'Search Engine Marketing',
      photo: {
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80',
        text: 'Business growth charts and analytics',
        pos: '50% 30%',
        by: 'Carlos Muza'
      }
    },
    {
      common: 'Social Ads',
      binomial: 'Social Media Advertising',
      photo: {
        url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=900&auto=format&fit=crop&q=80',
        text: 'Social media marketing campaign dashboard',
        pos: '50% 35%',
        by: 'Merakist'
      }
    },
    {
      common: 'Assets Creation',
      binomial: 'Creative Design & Branding',
      photo: {
        url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&auto=format&fit=crop&q=80',
        text: 'Creative brand design workspace',
        pos: '50% 45%',
        by: 'Balázs Kétyi'
      }
    },
    {
      common: 'Tracking & Reporting',
      binomial: 'Analytics & Performance',
      photo: {
        url: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=900&auto=format&fit=crop&q=80',
        text: 'Financial growth and success metrics',
        pos: '50% 35%',
        by: 'Towfiqu barbhuiya'
      }
    }
  ];

  return (
    <section className="w-full bg-gradient-to-b from-slate-800 via-slate-700 to-indigo-800">
      {/* Title and subtitle above the scrollable section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          Our Work in Action
        </h1>
        <p className="text-lg text-neutral-300">
          Scroll to explore our comprehensive digital solutions
        </p>
      </div>

      {/* Scrollable gallery section */}
      <div style={{ height: '300vh' }}>
        <div className="w-full h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full h-full">
            <CircularGallery items={businessGalleryData} radius={500} autoRotateSpeed={0.01} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CircularGallerySection;