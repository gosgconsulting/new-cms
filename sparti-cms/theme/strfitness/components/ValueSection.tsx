import React from 'react';

const ValueSection: React.FC = () => {
  return (
    <section className="border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Personal Training, Not a Membership</h2>
        <p className="text-muted-foreground max-w-3xl mb-4">
          STR is a premium training space for people who want individual attention and measurable progress. Every programme starts with assessment, then we build a plan for your goals—rehabilitation, performance, or long‑term health.
        </p>
        <p className="text-muted-foreground max-w-3xl">
          No classes. No crowds. Just focused, 1‑on‑1 coaching with a clear structure and expert supervision every session.
        </p>
      </div>
    </section>
  );
};

export default ValueSection;