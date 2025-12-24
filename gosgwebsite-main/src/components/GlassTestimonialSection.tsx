"use client";

import React from "react";
import { TestimonialStack, Testimonial } from "@/components/ui/glass-testimonial-swiper";
import { TrendingUp, Users, DollarSign, Target, Zap, Award } from "lucide-react";

type Item = {
  key: string;
  type: string;
  content?: string;
  items?: Array<Item>;
};

interface GlassTestimonialSectionProps {
  items?: Item[];
}

const GlassTestimonialSection: React.FC<GlassTestimonialSectionProps> = ({ items = [] }) => {
  // Business-focused testimonials highlighting revenue/leads growth and full team value
  const businessTestimonials: Testimonial[] = [
    {
      id: 1,
      initials: 'SM',
      name: 'Sarah Mitchell',
      role: 'CEO, TechFlow Solutions',
      quote: "GO SG increased our revenue by 340% in just 8 months. Having a whole team - SEO expert, performance marketing specialist, and website developer - working for us at just 1,000 SGD per month was incredible value. They became our internal growth team.",
      tags: [{ text: '+340% Revenue', type: 'featured' }, { text: 'Full Team', type: 'default' }],
      stats: [{ icon: TrendingUp, text: '340% growth' }, { icon: Users, text: 'Full team' }],
      avatarGradient: 'linear-gradient(135deg, #10b981, #059669)',
    },
    {
      id: 2,
      initials: 'MC',
      name: 'Marcus Chen',
      role: 'Founder, GrowthLab',
      quote: "Our leads increased by 280% within 6 months. For 1,000 SGD monthly, we got an entire marketing department - SEO specialist, ads expert, and web developer. It's like having a full agency working exclusively for us.",
      tags: [{ text: '+280% Leads', type: 'featured' }, { text: 'Agency Value', type: 'default' }],
      stats: [{ icon: Target, text: '280% leads' }, { icon: DollarSign, text: '1,000 SGD' }],
      avatarGradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    },
    {
      id: 3,
      initials: 'JR',
      name: 'Jennifer Rodriguez',
      role: 'Director, InnovateCorp',
      quote: "Revenue jumped 420% in our first year with GO SG. At 1,000 SGD per month, we have dedicated SEO, performance marketing, and development experts. Best investment we've ever made - it's like having a world-class team at startup prices.",
      tags: [{ text: '+420% Revenue', type: 'featured' }, { text: 'World-Class', type: 'default' }],
      stats: [{ icon: Award, text: '420% growth' }, { icon: Zap, text: 'Best ROI' }],
      avatarGradient: 'linear-gradient(135deg, #ec4899, #d946ef)',
    }
  ];

  return (
    <section className="w-full bg-gray-50 py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Real Results, Real Teams
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how businesses achieved remarkable growth with our dedicated full-stack team at just 1,000 SGD per month
          </p>
        </div>

        {/* Testimonial Stack */}
        <div className="relative h-[500px] flex items-center justify-center">
          <TestimonialStack testimonials={businessTestimonials} visibleBehind={2} />
        </div>
      </div>
    </section>
  );
};

export default GlassTestimonialSection;