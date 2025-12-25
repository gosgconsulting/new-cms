import React from 'react';

interface ContactInfoProps {
  // No properties defined
}

const ContactInfo: React.FC<ContactInfoProps> = ({
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-gray-500">Contact Info Component</p>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
