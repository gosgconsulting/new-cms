import React from 'react';

const CoachSection: React.FC = () => {
  return (
    <section id="coach" className="border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Coach Credentials</h2>
        <div className="max-w-3xl space-y-3 text-muted-foreground">
          <p><span className="text-foreground font-medium">Head Coach / Physiotherapist</span> — experienced in rehabilitation and performance coaching.</p>
          <p>Qualifications: recognised physiotherapy degree, strength & conditioning certifications.</p>
          <p>Competitive background: exposure to athletic preparation and event performance.</p>
          <p>Coaching philosophy: precise, structured, and patient—designed for long‑term results.</p>
        </div>
      </div>
    </section>
  );
};

export default CoachSection;