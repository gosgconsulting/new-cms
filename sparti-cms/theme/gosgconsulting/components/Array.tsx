import React from 'react';

interface ArrayProps {
  // No properties defined
}

const Array: React.FC<ArrayProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">Array Component</p>
        </div>
      </div>
    </section>
  );
};

export default Array;
