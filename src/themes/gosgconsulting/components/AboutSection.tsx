import React from 'react';

interface AboutSectionProps {
  // No properties defined
}

const AboutSection: React.FC<AboutSectionProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">About Section Component</p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
