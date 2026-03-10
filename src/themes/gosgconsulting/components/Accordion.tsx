import React from 'react';

interface AccordionProps {
  // No properties defined
}

const Accordion: React.FC<AccordionProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">Accordion Component</p>
        </div>
      </div>
    </section>
  );
};

export default Accordion;
