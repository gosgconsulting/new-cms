import React from 'react';

interface WhyChooseUsSectionProps {
  // No properties defined
}

const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">Why Choose Us Section Component</p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
