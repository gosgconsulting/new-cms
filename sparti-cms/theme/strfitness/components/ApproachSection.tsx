import React from 'react';

const ApproachSection: React.FC = () => {
  const steps = [
    { title: 'Assessment', text: 'Movement screen, training history, and goal setting to build your starting point.' },
    { title: 'Plan', text: 'Evidence‑based programming tailored to your needs, capacity, and timeline.' },
    { title: 'Execution', text: '1‑on‑1 coaching for technique, tempo, and load—every session is supervised.' },
    { title: 'Progression', text: 'Measured improvements across strength, conditioning, and resilience.' },
  ];

  return (
    <section id="approach" className="border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Coaching Approach</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="p-4 rounded-lg border border-border/60 bg-background">
              <h3 className="font-medium mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-4 max-w-3xl">
          Our programming is physiotherapy‑informed and built for sustainability—no shortcuts, no gimmicks, just steady, meaningful progress.
        </p>
      </div>
    </section>
  );
};

export default ApproachSection;