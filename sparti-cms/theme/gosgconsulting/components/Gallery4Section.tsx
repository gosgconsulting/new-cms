import React from 'react';
import { Button } from './ui/button';

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

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
}

const Gallery4Section: React.FC<Gallery4SectionProps> = ({ items = [], onContactClick }) => {
  // Services data for GOSG
  const servicesData: ServiceItem[] = [
    {
      id: "website-design",
      title: "Website Design",
      description: "User Experience & Development",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&auto=format&fit=crop&q=80",
      features: ["Responsive Design", "UX/UI Optimization", "Fast Loading", "SEO Ready"]
    },
    {
      id: "seo",
      title: "SEO",
      description: "Search Engine Optimization",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80",
      features: ["Keyword Research", "On-Page SEO", "Technical SEO", "Link Building"]
    },
    {
      id: "sem",
      title: "SEM",
      description: "Search Engine Marketing",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80",
      features: ["Google Ads", "Bing Ads", "Campaign Management", "ROI Optimization"]
    },
    {
      id: "social-ads",
      title: "Social Ads",
      description: "Social Media Advertising",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=900&auto=format&fit=crop&q=80",
      features: ["Facebook Ads", "Instagram Ads", "LinkedIn Ads", "Audience Targeting"]
    },
    {
      id: "assets-creation",
      title: "Assets Creation",
      description: "Creative Design & Branding",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&auto=format&fit=crop&q=80",
      features: ["Graphic Design", "Brand Identity", "Marketing Materials", "Visual Content"]
    },
    {
      id: "tracking-reporting",
      title: "Tracking & Reporting",
      description: "Analytics & Performance",
      image: "https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=900&auto=format&fit=crop&q=80",
      features: ["Google Analytics", "Performance Reports", "ROI Tracking", "Data Insights"]
    },
  ];

  return (
    <section className="w-full bg-white py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive digital marketing solutions designed to drive growth and deliver measurable results for your business.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {servicesData.map((service, index) => (
            <div
              key={service.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={onContactClick}
                  className="w-full h-12 bg-white rounded-lg text-neutral-900 font-bold hover:bg-neutral-200 transition-colors border-0"
                >
                  Learn More
                </Button>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery4Section;
