import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface Service {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  highlight: string;
}

interface ServicesSectionProps {
  title?: string;
  subtitle?: string;
  services?: Service[];
  onContactClick?: () => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  title = 'Complete Singapore Business Solutions with ACRA Guarantee',
  subtitle = 'ACRA-registered filing agents providing 24-hour company incorporation, professional accounting services, and guaranteed compliance for Singapore businesses.',
  services = [
    {
      title: 'Singapore Company Incorporation Services',
      subtitle: 'One-Time Fee: S$1,815 (S$1,115 for Locals)',
      description: 'Professional incorporation services for Singapore Pte. Ltd. companies, providing comprehensive setup and ongoing compliance support for local and international entrepreneurs. Includes professional fees (S$1,500) + government fees (S$315). Local clients pay only S$800 professional fee + S$315 government fee.',
      image: '/theme/landingpage/assets/incorporation-services.jpg',
      features: [
        'Company registration with ACRA',
        'Corporate secretary services included',
        'Company constitution and statutory documents',
        'Initial compliance setup',
        'Complete documentation for local & international clients',
        'Standard incorporation: 1 week timeline'
      ],
      highlight: 'Fast-track option available with complete documentation'
    },
    {
      title: 'Annual Ongoing Services',
      subtitle: 'S$4,300/year (varies by transaction volume)',
      description: 'Comprehensive annual compliance and support services to maintain your Singapore company in good standing. Includes corporate secretary fee (S$800), tax filing services (S$800), basic bookkeeping (S$200), and local director services (S$2,500). Accounting fees are variable based on transaction volume and can increase up to S$6,000/year for high-volume businesses.',
      image: '/theme/landingpage/assets/accounting-dashboard.jpg',
      features: [
        'Corporate Secretary Fee (S$800/year)',
        'Tax Filing Services (S$800/year)',
        'Basic Bookkeeping (S$200/year minimum)',
        'Local Director Services (S$2,500/year)',
        'Annual compliance filing',
        'Regulatory authority submissions'
      ],
      highlight: 'Local director fee waived if client provides their own'
    },
    {
      title: 'Additional Services & Support',
      subtitle: 'Enhanced Business Operations',
      description: 'Comprehensive additional services to support your Singapore business operations beyond basic incorporation and compliance. From registered address services to employment pass assistance, we provide end-to-end support for your business growth and operational needs in Singapore.',
      image: '/theme/landingpage/assets/corporate-secretarial.jpg',
      features: [
        'Registered address and mailroom services',
        'Enhanced bookkeeping (monthly/weekly)',
        'Payroll services',
        'GST registration and filing',
        'Employment pass visa assistance',
        'Banking account opening support'
      ],
      highlight: 'Streamlined process from setup to operations with professional oversight'
    }
  ],
  onContactClick
}) => {
  return (
    <section id="services" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
            {title.includes('ACRA Guarantee') ? (
              <>
                {title.split('ACRA Guarantee')[0]}
                <span className="text-primary">
                  {'ACRA Guarantee'}
                </span>
              </>
            ) : (
              title
            )}
          </h2>
          {subtitle && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Services Grid */}
        <div className="space-y-16">
          {services.map((service, index) => {
            const sectionIds = ['company-incorporation', 'accounting-services', 'corporate-secretarial'];
            return (
              <div 
                key={service.title} 
                id={sectionIds[index]} 
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div>
                    <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                      {service.subtitle}
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4">{service.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Highlight */}
                    {service.highlight && (
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span className="text-accent font-medium">{service.highlight}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-4">
                    <Button 
                      className="bg-gradient-primary hover:opacity-90 transition-opacity group"
                      onClick={onContactClick}
                    >
                      Contact Us
                      <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* Image */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <Card className="overflow-hidden shadow-medium hover:shadow-strong transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={service.image} 
                          alt={service.title} 
                          className="w-full h-[400px] object-cover" 
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/theme/landingpage/assets/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        
                        {/* Service badge */}
                        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg">
                          <div className="text-sm font-medium text-primary">{service.title}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
