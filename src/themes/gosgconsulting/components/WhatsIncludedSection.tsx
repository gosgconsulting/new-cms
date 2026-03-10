import React from 'react';
import contentStrategyImg from '../assets/seo/content-strategy-1.png';
import linkBuildingImg from '../assets/seo/link-building-1.png';
import monthlyReportImg from '../assets/seo-results-1.png';

interface Section {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  image: string;
}

interface WhatsIncludedSectionProps {
  items?: any[];
  onContactClick?: () => void;
}

const WhatsIncludedSection: React.FC<WhatsIncludedSectionProps> = () => {
  const sections: Section[] = [
    {
      id: 'blog-articles',
      title: 'Blog Articles',
      description:
        'Publish consistent, SEO-optimized content to build topical authority and drive organic growth.',
      bullets: [
        '12 blog articles per month',
        'Keyword-led topics and outlines',
        'SEO-optimized content',
      ],
      image: contentStrategyImg,
    },
    {
      id: 'backlinks',
      title: 'Backlinks',
      description:
        'Grow domain authority with quality external links acquired through outreach and partnerships.',
      bullets: [
        '10 external backlinks per month',
        'Relevant placements from trusted sites',
        'Natural anchor strategy',
      ],
      image: linkBuildingImg,
    },
    {
      id: 'monthly-report',
      title: 'Monthly Report',
      description:
        'Stay informed with transparent reporting and next steps to keep improving results.',
      bullets: [
        'Monthly performance report',
        'Insights and recommendations',
        'Next-month plan',
      ],
      image: monthlyReportImg,
    },
  ];

  return (
    <section className="w-full bg-white py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            What’s Included
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            A focused breakdown of the core deliverables in your SEO plan.
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
                        Deliverables
                      </h4>
                      <ul className="mt-2 space-y-2">
                        {section.bullets.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 inline-block w-2 h-2 rounded-full bg-gray-900"></span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
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

        {/* Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            * Scopes and quantities are defined together after the consultation call.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhatsIncludedSection;