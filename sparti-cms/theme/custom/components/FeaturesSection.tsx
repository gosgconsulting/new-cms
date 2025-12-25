import React from 'react';

interface Feature {
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  { title: 'Hardcoded Content', description: 'No database setup required—content is embedded.' },
  { title: 'Responsive by Default', description: 'Layouts adapt to desktop, tablet, and mobile.' },
  { title: 'Clean Components', description: 'Small, focused components that are easy to maintain.' },
  { title: 'Fast to Preview', description: 'Open /theme/custom and see it live immediately.' },
  { title: 'Tailwind Styling', description: 'Consistent, utility-first styling across the theme.' },
  { title: 'Simple and Elegant', description: 'Minimal UI similar to our Diora visual editor simplicity.' }
];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  title = 'What You Get',
  subtitle = 'A minimal, clean foundation you can expand later',
  features = defaultFeatures
}) => {
  return (
    <section id="features" className="py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground text-lg">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;