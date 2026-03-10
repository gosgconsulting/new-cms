import React from 'react';
import { SchemaItem } from '../utils/schemaHelpers';

interface FeaturesSectionProps {
  items?: SchemaItem[];
  title?: string;
  subtitle?: string;
}

function stripTags(s: string) {
  return s?.replace(/<[^>]+>/g, '') || '';
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ items = [], title, subtitle }) => {
  const sectionTitle =
    title ||
    (items.find((i) => i.key?.toLowerCase() === 'title' && typeof i.content === 'string')?.content as string) ||
    'Powerful Features';
  const sectionSubtitle =
    subtitle ||
    (items.find((i) => i.key?.toLowerCase() === 'subtitle' && typeof i.content === 'string')?.content as string) ||
    'Everything you need to get started quickly.';

  const featuresArr =
    (items.find((i) => i.key?.toLowerCase() === 'features' && i.type === 'array') as any)?.items || [];

  const features = (Array.isArray(featuresArr) && featuresArr.length > 0
    ? featuresArr
    : [
        { src: '/placeholder.svg', title: 'Fast Setup', description: 'Get up and running with minimal configuration.' },
        { src: '/placeholder.svg', title: 'Responsive', description: 'Looks great on any device with a mobile-first layout.' },
        { src: '/placeholder.svg', title: 'Accessible', description: 'Built with accessibility and best practices in mind.' },
        { src: '/placeholder.svg', title: 'Customizable', description: 'Easily tailor sections and content to your needs.' }
      ]) as Array<{ src?: string; title?: string; description?: string }>;

  return (
    <section className="w-full py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold">{sectionTitle}</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {features.map((f, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden bg-white">
              {f.src && (
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={f.src}
                    alt={f.title || `Feature ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
              <div className="p-4 space-y-1">
                {f.title && <h3 className="text-sm font-semibold">{f.title}</h3>}
                {f.description && (
                  <p className="text-xs text-muted-foreground">{stripTags(f.description)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;