import React, { useState } from 'react';

interface AnniversarySectionProps {
  themeSlug: string;
  className?: string;
}

const AnniversarySection: React.FC<AnniversarySectionProps> = ({ 
  themeSlug, 
  className = '' 
}) => {
  const imagePath = `/theme/${themeSlug}/Assets/20th-Anniversary-Logo-Transparent_No-Border.png`;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section 
      className={`relative py-20 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(20, 85, 152, 0.04) 0%, rgba(15, 63, 111, 0.02) 50%, rgba(26, 107, 184, 0.04) 100%)',
      }}
    >
      {/* Subtle noise/grain overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Spotlight glow behind badge (left) */}
      <div 
        className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#145598] opacity-0 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 0.06 : 0.04,
        }}
      />

      {/* Soft glow behind headline (right) */}
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[#4ED1CE] opacity-[0.03] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left Column: Badge (Desktop) / Second (Mobile) */}
          <div className="order-2 md:order-1 flex justify-center md:justify-start md:items-center">
            <div className="relative">
              <img
                src={imagePath}
                alt="20th Anniversary"
                className="w-full max-w-sm md:max-w-md h-auto"
                style={{
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
                loading="lazy"
              />
            </div>
          </div>

          {/* Vertical accent divider (Desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-[#4ED1CE]/20 to-transparent" />

          {/* Right Column: Text Content (Desktop) / First (Mobile) */}
          <div className="order-1 md:order-2 text-center md:text-left">
            {/* Badge chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#145598]/5 border border-[#145598]/10 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ED1CE]" />
              <span className="text-xs font-semibold text-[#145598] uppercase tracking-[0.15em]">
                Celebrating
              </span>
            </div>

            {/* Hero Headline with subtle gradient - First on Mobile */}
            <h2 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.9] tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #145598 0%, #0f3f6f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              20 Years
            </h2>
            
            {/* Body Text with limited width */}
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-10 max-w-[60ch] mx-auto md:mx-0">
              In 2022, Optimal celebrated twenty years of predicting leadership potential and delivering talent development interventions across Asia.
            </p>

             {/* Premium CTA Link */}
             <div>
               <a
                 href="#contact"
                 className="inline-flex items-center px-6 py-3 text-white font-semibold bg-[#145598] rounded-md transition-all duration-300 text-lg sm:text-xl group motion-reduce:transition-none hover:bg-[#0f3f6f] hover:scale-105 hover:shadow-xl hover:shadow-[#145598]/30 hover:-translate-y-0.5 active:scale-100"
               >
                 <span className="relative">
                   Learn More
                 </span>
                 <span 
                   className="ml-3 transform transition-transform duration-300 motion-reduce:transform-none group-hover:translate-x-2"
                 >
                   →
                 </span>
               </a>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnniversarySection;
