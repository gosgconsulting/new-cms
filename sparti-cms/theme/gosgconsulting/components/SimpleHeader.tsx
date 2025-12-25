import React from 'react';

interface SimpleHeaderProps {
  // No properties defined
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">Simple Header Component</p>
        </div>
      </div>
    </section>
  );
};

export default SimpleHeader;
