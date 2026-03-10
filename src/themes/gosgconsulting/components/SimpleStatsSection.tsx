import React from 'react';

interface SimpleStatsSectionProps {
  items?: any[];
}

const SimpleStatsSection: React.FC<SimpleStatsSectionProps> = ({ items = [] }) => {
  const defaultStats = [
    { label: 'Clients Served', value: '500+' },
    { label: 'Revenue Generated', value: '$10M+' },
    { label: 'Years Experience', value: '8+' },
    { label: 'Success Rate', value: '95%' }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-500/10 to-cyan-500/10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Proven Results
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Numbers that speak for our success
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {defaultStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimpleStatsSection;

