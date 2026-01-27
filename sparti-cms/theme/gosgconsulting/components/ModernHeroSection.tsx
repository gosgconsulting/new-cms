"use client";

import React, { useState } from 'react';
import Reveal from "@/libraries/flowbite/components/Reveal";
import { useInViewOnce } from "@/libraries/flowbite/hooks/useInViewOnce";
import type { ComponentSchema } from "../../../types/schema";
import FloatingDataCard from './FloatingDataCard';
import { Mail, Check } from 'lucide-react';

interface ModernHeroSectionProps {
  component: ComponentSchema;
  className?: string;
  onContactClick?: () => void;
  onPopupOpen?: (popupName: string, email?: string) => void;
}

const ModernHeroSection: React.FC<ModernHeroSectionProps> = ({
  component,
  className = "",
  onContactClick,
  onPopupOpen,
}) => {
  const props = component.props || {};
  const items = component.items || [];
  const [email, setEmail] = useState('');

  const { ref: sectionRef, inView: sectionInView } = useInViewOnce<HTMLElement>({
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.1,
  });

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getImage = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || "";
  };

  const title = getText("title") || props.title || "You have Got Business We Have Brilliant Minds";
  const description = getText("description") || props.description || "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur occaecat cupida.";
  const emailPlaceholder = getText("emailPlaceholder") || props.emailPlaceholder || "Enter your email";
  const personImage = getImage("personImage") || props.personImage || "/theme/gosgconsulting/assets/hero-person.png";

  const handleGetStarted = () => {
    if (onPopupOpen) {
      // Pass the email to the popup handler
      onPopupOpen('contact', email);
    } else if (onContactClick) {
      onContactClick();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only proceed if email is valid
    if (email.trim()) {
      handleGetStarted();
    }
  };

  return (
    <section
      ref={sectionRef as any}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to right, #f0f9e8 0%, #fff 50%, #ffe5d4 100%)',
      }}
    >
      {/* Background decorative icons */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-20 left-1/4 w-16 h-16">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-gray-400">
            <path d="M3 15C3 17.2091 4.79086 19 7 19H17C19.2091 19 21 17.2091 21 15C21 12.7909 19.2091 11 17 11H7C4.79086 11 3 12.7909 3 15Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div className="absolute top-32 right-1/4 w-12 h-12">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-gray-400">
            <rect x="3" y="12" width="4" height="8" fill="currentColor"/>
            <rect x="9" y="8" width="4" height="12" fill="currentColor"/>
            <rect x="15" y="4" width="4" height="16" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            {/* Main Heading */}
            <Reveal direction="up" delayMs={0}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                {title.includes('known') ? (
                  <>
                    <span style={{ color: '#2D1C59' }}>
                      {title.split('known')[0]}
                    </span>
                    <span 
                      className="bg-gradient-to-r from-[#FF6B35] to-[#FFA500] bg-clip-text text-transparent"
                    >
                      known
                    </span>
                    {title.split('known')[1] && (
                      <span style={{ color: '#2D1C59' }}>
                        {title.split('known')[1]}
                      </span>
                    )}
                  </>
                ) : title.includes('Revenue') ? (
                  <>
                    <span style={{ color: '#2D1C59' }}>
                      {title.split('Revenue')[0]}
                    </span>
                    <span 
                      className="bg-gradient-to-r from-[#FF6B35] to-[#FFA500] bg-clip-text text-transparent"
                    >
                      Revenue
                    </span>
                    {title.split('Revenue')[1] && (
                      <span style={{ color: '#2D1C59' }}>
                        {title.split('Revenue')[1]}
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#2D1C59' }}>{title}</span>
                )}
              </h1>
            </Reveal>

            {/* Description */}
            <Reveal direction="up" delayMs={90}>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                {description}
              </p>
            </Reveal>

            {/* Email Input + Button CTA */}
            <Reveal direction="up" delayMs={160}>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={emailPlaceholder}
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full font-semibold text-white whitespace-nowrap transition-all shadow-sm"
                  style={{
                    background: 'linear-gradient(to right, #FF6B35, #FFA500)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #FF5722, #FF9800)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #FF6B35, #FFA500)';
                  }}
                >
                  Get Started
                </button>
              </form>
            </Reveal>

            {/* Sub-text */}
            <Reveal direction="up" delayMs={240}>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="w-4 h-4 text-green-500" />
                <span>98% of clients increased results within 30 days</span>
              </div>
            </Reveal>
          </div>

          {/* Right Column - Person Image with Floating Cards */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <Reveal direction="left" delayMs={300}>
              <div className="relative w-full max-w-md lg:max-w-lg">
                {/* Abstract Orange Circle */}
                <div
                  className="absolute bottom-0 right-0 w-64 h-64 lg:w-80 lg:h-80 rounded-full opacity-20"
                  style={{
                    background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)',
                    transform: 'translate(20%, 20%)',
                  }}
                />

                {/* Person Image */}
                <div className="relative z-10">
                  <div className="relative overflow-hidden" style={{ borderRadius: '0 3rem 3rem 0' }}>
                    <img
                      src={personImage}
                      alt="Team member"
                      className="w-full h-auto object-contain relative z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    {/* Gradient overlay on right side for blending */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to right, transparent 70%, rgba(255, 229, 212, 0.6) 85%, rgba(240, 249, 232, 0.4) 100%)',
                        borderRadius: '0 3rem 3rem 0',
                      }}
                    />
                  </div>
                </div>

                {/* Floating Data Cards */}
                <FloatingDataCard
                  type="audience"
                  position={{ top: '10%', left: '-10%' }}
                />
                <FloatingDataCard
                  type="sales"
                  position={{ bottom: '15%', right: '-5%' }}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHeroSection;
