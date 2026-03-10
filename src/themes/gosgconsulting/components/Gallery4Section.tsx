import React from 'react';
import { usePopup } from '../contexts/PopupContext';

interface InfoSection {
  id: string;
  title: string;
  description: string;
  services: string[];
  image: string;
}

interface Gallery4SectionProps {
  items?: any[];
  onContactClick?: () => void;
}

const Gallery4Section: React.FC<Gallery4SectionProps> = ({ items = [], onContactClick }) => {
  const { openPopup } = usePopup();

  const sections: InfoSection[] = items.length > 0
    ? items.map((it: any, idx: number) => ({
        id: it.id ?? `section-${idx}`,
        title: it.title ?? '',
        description: it.description ?? '',
        services: it.services ?? it.bullets ?? [],
        image: it.image ?? '/placeholder.svg',
      }))
    : [
      {
        id: 'website-conversion',
        title: 'Website & Conversion',
        description:
          'We design and improve high‑converting landing pages with continuous optimization, A/B testing, and conversion tracking.',
        services: [
          'High-converting landing page',
          'A/B testing and conversion tracking',
          'Monthly conversion improvements',
        ],
        image:
          'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'acquisition',
        title: 'Acquisition',
        description:
          'Drive qualified traffic with paid acquisition across search and social, supported by smart retargeting.',
        services: ['SEM (Search Ads)', 'Social Ads', 'Retargeting'],
        image:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'creative-production',
        title: 'Creative Production',
        description:
          'Consistent, branded creative assets that power your ads and social presence, plus copywriting that converts.',
        services: [
          'Branded creative assets (ads & social)',
          'Copywriting for conversion',
          'Design system & brand consistency',
        ],
        image:
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'seo',
        title: 'SEO',
        description:
          'Build compounding organic growth through premium backlinks, SEO content, and ongoing technical checks.',
        services: [
          'Premium SEO backlinks',
          'SEO-optimized articles',
          'Technical SEO checks',
        ],
        image:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80',
      },
    ];

  const handleLearnMore = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      openPopup('contact');
    }
  };

  return (
    <section className="w-full bg-white py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            What's included in your growth package
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Every part of the funnel works together, each tailored to your business goals.
          </p>
        </div>

        <div className="space-y-16">
          {sections.map((section, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                {/* Text column */}
                <div className={isEven ? 'order-2 md:order-1' : 'order-2 md:order-2'}>
                  <div className="space-y-5">
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-gray-700">
                      {section.description}
                    </p>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Services included
                      </h4>
                      <ul className="mt-2 space-y-2">
                        {section.services.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 inline-block w-2 h-2 rounded-full bg-gray-900"></span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={handleLearnMore}
                        className="inline-flex items-center px-5 py-2.5 rounded-full text-white font-semibold transition-all border-0 shadow-sm"
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
                        Learn more
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image column */}
                <div className={isEven ? 'order-1 md:order-2' : 'order-1 md:order-1'}>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note about consultation scoping */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            * Scopes and quantities are defined together after the consultation call to best match your objectives.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Gallery4Section;