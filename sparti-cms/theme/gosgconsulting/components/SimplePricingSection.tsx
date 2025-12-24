import React from 'react';
import { Button } from './ui/button';

interface SimplePricingSectionProps {
  items?: any[];
  onContactClick?: () => void;
}

const SimplePricingSection: React.FC<SimplePricingSectionProps> = ({ items = [], onContactClick }) => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Get started with our comprehensive digital marketing solutions
        </p>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Full-Stack Growth Package
          </h3>
          <div className="text-4xl font-bold text-purple-600 mb-6">
            Starting at $3,500<span className="text-lg text-gray-600">/month</span>
          </div>
          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Website Design & Development
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              SEO & Content Marketing
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Google & Social Ads
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Analytics & Reporting
            </li>
          </ul>
          <Button
            onClick={onContactClick}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white py-3"
          >
            Get Free Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SimplePricingSection;
