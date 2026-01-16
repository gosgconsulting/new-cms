import React from 'react';

interface WhatsIncludedSectionProps {
  items?: any[];
  onContactClick?: () => void;
}

const WhatsIncludedSection: React.FC<WhatsIncludedSectionProps> = ({
  items = [],
}) => {
  const included =
    items.find((i: any) => (i.key === 'included') || (i.title && String(i.title).toLowerCase().includes('included')));
  const process =
    items.find((i: any) => (i.key === 'process') || (i.title && String(i.title).toLowerCase().includes('process')));
  const price =
    items.find((i: any) => (i.key === 'price') || (i.title && String(i.title).toLowerCase().includes('price')));

  const includedItems: string[] = included?.items || [];
  const processSteps: string[] = process?.steps || [];
  const priceText: string = price?.content || '';

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What's Included</h2>
          {priceText ? (
            <p className="mt-3 text-lg">
              <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 px-4 py-1 font-semibold">
                {priceText}
              </span>
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Deliverables</h3>
            <ul className="mt-4 space-y-3">
              {includedItems.length > 0 ? (
                includedItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 inline-block w-2 h-2 rounded-full bg-gray-900"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No items specified.</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900">Process</h3>
            <ol className="mt-4 space-y-3">
              {processSteps.length > 0 ? (
                processSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 inline-block w-2 h-2 rounded-full bg-violet-600"></span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No process steps specified.</li>
              )}
            </ol>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          * Scopes and quantities are defined together after the consultation call.
        </div>
      </div>
    </section>
  );
};

export default WhatsIncludedSection;