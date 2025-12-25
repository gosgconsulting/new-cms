import React from 'react';

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({
  title = 'Ready to ship a simple site?',
  description = 'Start with this hardcoded theme and iterate as you go.',
  buttonText = 'Launch Now',
  onButtonClick
}) => {
  return (
    <section id="contact" className="py-16 bg-secondary/50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">{description}</p>
        <button
          onClick={onButtonClick}
          className="px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default CTASection;