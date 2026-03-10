import React from 'react';

interface SEOProps {
  // No properties defined
}

const SEO: React.FC<SEOProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">S E O Component</p>
        </div>
      </div>
    </section>
  );
};

export default SEO;
