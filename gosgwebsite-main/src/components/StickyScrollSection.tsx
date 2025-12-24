"use client";

import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

type Item = {
  key: string;
  type: string;
  content?: string;
  items?: Array<Item>;
};

interface StickyScrollSectionProps {
  items?: Item[];
}

const StickyScrollSection: React.FC<StickyScrollSectionProps> = ({ items = [] }) => {
  // Default content if no items provided
  const defaultContent = [
    {
      title: "SEO Strategy",
      description: "We develop comprehensive SEO strategies tailored to your business goals. Our approach combines technical optimization, content strategy, and link building to drive organic growth.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-semibold">
          SEO Strategy
        </div>
      ),
    },
    {
      title: "Website Design",
      description: "Create stunning, responsive websites that convert visitors into customers. Our designs focus on user experience, performance, and your brand identity.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-semibold">
          Website Design
        </div>
      ),
    },
    {
      title: "Digital Marketing",
      description: "Comprehensive digital marketing campaigns that drive results. From social media ads to email marketing, we help you reach your target audience effectively.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white text-xl font-semibold">
          Digital Marketing
        </div>
      ),
    },
    {
      title: "Analytics & Growth",
      description: "Track your success with detailed analytics and insights. We help you understand your data and make informed decisions to accelerate your business growth.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl font-semibold">
          Analytics & Growth
        </div>
      ),
    },
  ];

  // Use default content for now (can be extended to parse items later)
  const content = defaultContent;

  return (
    <section className="w-full py-20">
      <div className="container mx-auto max-w-6xl">
        <StickyScroll content={content} />
      </div>
    </section>
  );
};

export default StickyScrollSection;