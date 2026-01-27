"use client";

import React from 'react';
import { TrendingUp, FileText, Zap } from 'lucide-react';
import Reveal from "@/libraries/flowbite/components/Reveal";
import { Button } from './ui/button';

interface CaseStudyBannerProps {
  className?: string;
  onContactClick?: () => void;
}

const CaseStudyBanner: React.FC<CaseStudyBannerProps> = ({ className = "", onContactClick }) => {
  const cards = [
    {
      number: "1",
      icon: TrendingUp,
      title: "30%+ Average Increase in ROI",
      description: "Proven results that drive measurable growth for your business"
    },
    {
      number: "2",
      icon: FileText,
      title: "Reporting & Tracking",
      description: "Accurate tracking & no hidden fees"
    },
    {
      number: "3",
      icon: Zap,
      title: "Performance-first",
      description: "Data-driven strategies optimized for maximum impact and conversion"
    }
  ];

  return (
    <section className={`py-16 md:py-20 px-4 ${className}`}>
      <div className="container mx-auto max-w-6xl">
        <div className="bg-gradient-to-r from-[#f0f9e8] via-white to-[#ffe5d4] rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <Reveal direction="up" delayMs={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-10" style={{ color: '#2D1C59' }}>
                Become our next case study
              </h2>
            </Reveal>

            {/* Benefits Cards */}
            <Reveal direction="up" delayMs={100}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-10">
                {cards.map((card, index) => {
                  const IconComponent = card.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFA500] flex items-center justify-center text-white font-bold text-lg">
                            {card.number}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="mb-2">
                            <IconComponent className="w-6 h-6 text-[#FF6B35] mb-2" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            {/* CTA Button */}
            <Reveal direction="up" delayMs={200}>
              <div className="text-center">
                <Button
                  onClick={onContactClick}
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full"
                >
                  Increase my sales
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyBanner;
