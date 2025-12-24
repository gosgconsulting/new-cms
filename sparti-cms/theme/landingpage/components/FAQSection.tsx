import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FAQ[];
}

const FAQSection: React.FC<FAQSectionProps> = ({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about our services, processes, and how we can help your business succeed.',
  faqs = [
    {
      question: 'How quickly can you incorporate my Singapore company?',
      answer: 'Our ACRA-registered filing agents can complete your Singapore company incorporation in just 24 hours. We handle all documentation, ACRA submissions, and compliance requirements. For standard incorporation, the process typically takes 1 week, but our fast-track service ensures same-day processing for urgent business needs.'
    },
    {
      question: 'What are the costs involved in Singapore company incorporation?',
      answer: 'Our incorporation package costs S$1,815 for international clients (S$1,500 professional fees + S$315 government fees) and S$1,115 for local clients (S$800 professional fees + S$315 government fees). This includes company registration, corporate secretary services, company constitution, and all statutory documents required by ACRA.'
    },
    {
      question: 'Do you serve international clients who want to set up in Singapore?',
      answer: 'Yes, we specialize in helping international entrepreneurs establish their Singapore presence. We provide complete support including registered office address, local director services (if needed), bank account opening assistance, and employment pass visa support. Our team understands the unique challenges international clients face.'
    },
    {
      question: 'What ongoing services do you provide after incorporation?',
      answer: 'Our annual ongoing services package (S$4,300/year) includes corporate secretary services (S$800), tax filing (S$800), basic bookkeeping (S$200), and local director services (S$2,500). We also handle ACRA annual returns, IRAS compliance, GST registration and filing, and regulatory submissions to keep your company compliant.'
    },
    {
      question: 'How do you ensure 100% compliance with Singapore regulations?',
      answer: 'As ACRA-registered filing agents, we maintain a 99% compliance success rate with zero penalties guarantee. Our qualified chartered accountants and company secretaries monitor all regulatory deadlines, handle mandatory filings, and ensure your business meets ACRA and IRAS requirements. We provide proactive compliance management to prevent any regulatory issues.'
    },
    {
      question: 'Can I add additional services as my business grows?',
      answer: 'Absolutely. We offer flexible, scalable packages that grow with your business. You can add enhanced bookkeeping, payroll services, GST registration, employment pass assistance, or additional compliance services at any time. Our team will recommend the best service mix based on your business evolution and transaction volume.'
    }
  ]
}) => {
  return (
    <section id="faq" className="py-20 faq-section">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
            {title.includes('Questions') ? (
              <>
                {title.split('Questions')[0]}
                <span className="text-primary">
                  {'Questions'}
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

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto mb-16">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="bg-card border border-border rounded-lg shadow-soft accordion-item transition-all duration-200"
              >
                <div className="px-6">
                  <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline hover:text-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                </div>
                <AccordionContent className="px-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
