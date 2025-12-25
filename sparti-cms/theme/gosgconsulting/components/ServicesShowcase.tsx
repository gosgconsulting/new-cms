import React from 'react';
import { SchemaItem } from '../utils/schemaHelpers';
import { Button } from './ui/button';

interface ServicesShowcaseProps {
  items?: SchemaItem[];
}

function stripTags(s: string) {
  return s?.replace(/<[^>]+>/g, '') || '';
}

const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({ items = [] }) => {
  // Expect services as array items; fall back to three demo cards
  const servicesArr =
    (items.find((i) => i.key?.toLowerCase() === 'services' && i.type === 'array') as any)?.items || [];

  const cards = (Array.isArray(servicesArr) && servicesArr.length > 0
    ? servicesArr
    : [
        { src: '/placeholder.svg', title: 'Service One', description: 'Short description for service one.', button: 'Learn More', link: '#' },
        { src: '/placeholder.svg', title: 'Service Two', description: 'Short description for service two.', button: 'Learn More', link: '#' },
        { src: '/placeholder.svg', title: 'Service Three', description: 'Short description for service three.', button: 'Learn More', link: '#' }
      ]) as Array<{ src?: string; title?: string; description?: string; button?: string; link?: string }>;

  return (
    <section id="services" className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Our Services</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Explore what we offer
          </p>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {cards.map((c, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden bg-white">
              {c.src && (
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={c.src}
                    alt={c.title || `Service ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                {c.title && <h3 className="text-sm font-semibold">{c.title}</h3>}
                {c.description && (
                  <p className="text-xs text-muted-foreground">{stripTags(c.description)}</p>
                )}
                {c.button && (
                  <Button asChild className="mt-2">
                    <a href={c.link || '#'}>{c.button}</a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;