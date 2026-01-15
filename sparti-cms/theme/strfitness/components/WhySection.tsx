import React from 'react';

const WhySection: React.FC = () => {
  const bullets = [
    'Individual assessment to understand your body, history, and goals',
    'Coach supervision in every session for precision and safety',
    'Injury‑aware programming informed by physiotherapy principles',
    'Structured progression and accountability, tracked over time',
    'Personalised plans that outperform generic workouts and classes',
    'Calm, private environment—focused work, no distractions'
  ];

  return (
    <section id="why" className="border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Why 1‑on‑1 at STR</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-sm md:text-base">
          {bullets.map((b, i) => (
            <li key={i} className="p-4 rounded-lg border border-border/60 bg-background">{b}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default WhySection;