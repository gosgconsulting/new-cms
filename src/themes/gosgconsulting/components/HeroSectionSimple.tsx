import React from 'react';

interface HeroSectionSimpleProps {
  // No properties defined
}

const HeroSectionSimple: React.FC<HeroSectionSimpleProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">Hero Section Simple Component</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionSimple;
