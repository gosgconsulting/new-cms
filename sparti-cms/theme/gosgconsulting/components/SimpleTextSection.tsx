import React from 'react';

interface SimpleTextSectionProps {
  items?: Array<{
    key: string;
    type: string;
    content?: string;
    level?: number;
  }>;
}

const SimpleTextSection: React.FC<SimpleTextSectionProps> = ({ items = [] }) => {
  const title = items.find(item => item.type === 'heading')?.content;
  const text = items.find(item => item.type === 'text')?.content;

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {title && (
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
        )}
        {text && (
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {text}
          </p>
        )}
      </div>
    </section>
  );
};

export default SimpleTextSection;
