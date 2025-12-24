"use client";

import React from "react";
import { Gallery4, Gallery4Item } from "@/components/ui/gallery4";

type Item = {
  key: string;
  type: string;
  content?: string;
  items?: Array<Item>;
};

interface Gallery4SectionProps {
  items?: Item[];
  onContactClick?: () => void;
}

const Gallery4Section: React.FC<Gallery4SectionProps> = ({ items = [], onContactClick }) => {
  // Services data matching the 3D circular gallery
  const servicesData: Gallery4Item[] = [
    {
      id: "website-design",
      title: "Website Design",
      description: "User Experience & Development",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "seo",
      title: "SEO",
      description: "Search Engine Optimization",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "sem",
      title: "SEM",
      description: "Search Engine Marketing",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "social-ads",
      title: "Social Ads",
      description: "Social Media Advertising",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "assets-creation",
      title: "Assets Creation",
      description: "Creative Design & Branding",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "tracking-reporting",
      title: "Tracking & Reporting",
      description: "Analytics & Performance",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=900&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <section className="w-full bg-white">
      <Gallery4
        title="Our Services"
        description="Comprehensive digital marketing solutions designed to drive growth and deliver measurable results for your business."
        items={servicesData}
        onContactClick={onContactClick}
      />
    </section>
  );
};

export default Gallery4Section;