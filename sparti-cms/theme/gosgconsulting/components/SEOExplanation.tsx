import React from 'react';

interface SEOExplanationProps {
  // No properties defined
}

const SEOExplanation: React.FC<SEOExplanationProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">S E O Explanation Component</p>
        </div>
      </div>
    </section>
  );
};

export default SEOExplanation;
