import React from 'react';
import { Button } from './ui/button';

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({
  title = 'Results You Can Count On',
  description = 'Our clients consistently experience accelerated growth, improved compliance, and valuable time savings thanks to our all-encompassing support. By providing end-to-end solutions from incorporation to regulatory management, we enable businesses to operate seamlessly and confidently.',
  buttonText = 'Start Your Business Journey Today',
  buttonLink = '#contact',
  onButtonClick
}) => {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink && buttonLink.startsWith('#')) {
      const element = document.getElementById(buttonLink.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (buttonLink) {
      window.open(buttonLink, '_blank');
    }
  };

  const contactMethods = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Call Us Today',
      description: 'Speak directly with our experts',
      action: 'Call Now',
      highlight: 'Immediate Support'
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Consultation',
      description: 'Get detailed information via email',
      action: 'Send Email',
      highlight: 'Detailed Response'
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Schedule Meeting',
      description: 'Book a personalized consultation',
      action: 'Book Now',
      highlight: 'Free Consultation'
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Live Chat',
      description: 'Quick answers to your questions',
      action: 'Start Chat',
      highlight: 'Instant Connection'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Primary CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-primary">
            {title}
          </h2>
          {description && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              {description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-4 group"
              onClick={handleButtonClick}
            >
              {buttonText}
              <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {contactMethods.map((method, index) => (
            <div key={index} className="text-center p-6 rounded-lg border bg-card hover:shadow-medium transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-4">
                {method.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{method.description}</p>
              <div className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
                {method.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
