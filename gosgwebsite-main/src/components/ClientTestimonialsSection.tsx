"use client";

import React from "react";
import { motion } from "framer-motion";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

type Item = {
  key: string;
  type: string;
  content?: string;
  items?: Array<Item>;
};

interface ClientTestimonialsSectionProps {
  items?: Item[];
}

const ClientTestimonialsSection: React.FC<ClientTestimonialsSectionProps> = ({ items = [] }) => {
  // Business-focused testimonials data
  const businessTestimonials = [
    {
      text: "GO SG Consulting transformed our online presence completely. Our website traffic increased by 300% in just 6 months, and we're now ranking #1 for our main keywords.",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      name: "Sarah Chen",
      role: "CEO, TechStart Solutions",
    },
    {
      text: "The team's expertise in SEM is outstanding. Our lead generation increased by 400% while reducing our cost per acquisition. Best investment we've made.",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      name: "Marcus Johnson",
      role: "Marketing Director, GrowthCorp",
    },
    {
      text: "Their website design and SEO strategy helped us achieve a 250% increase in online bookings. The results speak for themselves.",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      name: "Lisa Rodriguez",
      role: "Owner, Bella Restaurant Group",
    },
    {
      text: "GO SG's social media advertising campaigns generated a 500% ROI. Their creative assets and targeting strategies are exceptional.",
      image: "https://randomuser.me/api/portraits/men/4.jpg",
      name: "David Kim",
      role: "Founder, Fashion Forward",
    },
    {
      text: "The comprehensive digital marketing approach delivered beyond our expectations. Our revenue increased by 180% in the first year.",
      image: "https://randomuser.me/api/portraits/women/5.jpg",
      name: "Amanda Foster",
      role: "VP Marketing, InnovateTech",
    },
    {
      text: "Their tracking and reporting system gave us insights we never had before. We can now make data-driven decisions with confidence.",
      image: "https://randomuser.me/api/portraits/men/6.jpg",
      name: "James Wilson",
      role: "COO, ScaleUp Ventures",
    },
    {
      text: "The brand identity and assets creation transformed our market presence. We went from unknown to industry leader in 18 months.",
      image: "https://randomuser.me/api/portraits/women/7.jpg",
      name: "Rachel Thompson",
      role: "Brand Manager, Luxe Lifestyle",
    },
    {
      text: "Their SEO expertise helped us dominate local search results. Our foot traffic increased by 200% and online orders by 350%.",
      image: "https://randomuser.me/api/portraits/men/8.jpg",
      name: "Michael Chang",
      role: "Owner, Chang's Electronics",
    },
    {
      text: "GO SG Consulting doesn't just deliver results, they deliver transformation. Our entire business model evolved thanks to their insights.",
      image: "https://randomuser.me/api/portraits/women/9.jpg",
      name: "Jennifer Lee",
      role: "CEO, NextGen Solutions",
    },
  ];

  // Create three columns for desktop display
  const firstColumn = businessTestimonials.slice(0, 3);
  const secondColumn = businessTestimonials.slice(3, 6);
  const thirdColumn = businessTestimonials.slice(6, 9);

  return (
    <section className="w-full bg-gradient-to-b from-slate-800 via-slate-700 to-indigo-800">
      {/* Title and subtitle above the testimonials */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          What Our Clients Say
        </h1>
        <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
          Discover how we've helped businesses achieve remarkable growth through our comprehensive digital marketing strategies.
        </p>
      </div>

      {/* Testimonials columns */}
      <div className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={15} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientTestimonialsSection;