import React from 'react';

const WhoSection: React.FC = () => {
  const bullets = [
    'Beginners who want proper guidance and a clear plan',
    'Athletes and HYROX competitors sharpening performance',
    'Individuals returning from injury who need intelligent progressions',
    'Busy professionals who value efficient, results‑driven sessions'
  ];

  return (
    <section id="who" className="border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Who It’s For</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground max-w-3xl">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>
    </section>
  );
};

export default WhoSection;