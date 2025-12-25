import React from 'react';

interface WhatsIncludedSectionProps {
  // No properties defined
}

const WhatsIncludedSection: React.FC<WhatsIncludedSectionProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">Whats Included Section Component</p>
        </div>
      </div>
    </section>
  );
};

export default WhatsIncludedSection;
