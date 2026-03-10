import React from 'react';

interface SimpleListSectionProps {
  items?: Array<{
    key: string;
    type: string;
    content?: string;
    items?: Array<{
      key: string;
      content: string;
    }>;
  }>;
}

const SimpleListSection: React.FC<SimpleListSectionProps> = ({ items = [] }) => {
  const title = items.find(item => item.type === 'heading')?.content;
  const listItems = items.find(item => item.type === 'list')?.items || [];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {title && (
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listItems.map((item, index) => (
            <div key={item.key || index} className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-4 shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">{item.content}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimpleListSection;

