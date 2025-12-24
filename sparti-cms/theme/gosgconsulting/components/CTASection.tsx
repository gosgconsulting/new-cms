import React from 'react';
import { Button } from './ui/button';

interface CTASectionProps {
  items?: any[];
  onContactClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ items = [], onContactClick }) => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-cyan-600">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join hundreds of businesses that have accelerated their growth with our proven digital marketing strategies.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onContactClick}
            className="bg-white text-purple-600 hover:bg-gray-100 font-medium px-8 py-3 text-lg"
          >
            Get Free Consultation
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-purple-600 font-medium px-8 py-3 text-lg"
          >
            View Case Studies
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
