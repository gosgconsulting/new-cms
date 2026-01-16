"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    q: 'How quickly can you incorporate my Singapore company?',
    a: 'In just 24 hours with our fast-track service, standard timeline is ~1 week.',
  },
  {
    q: 'What are the costs involved in incorporation?',
    a: 'S$1,815 international (S$1,500 professional + S$315 government) and S$1,115 local (S$800 + S$315).',
  },
  {
    q: 'Do you serve international clients?',
    a: 'Yes, complete remote-friendly setup including address, director services, banking support and EP.',
  },
  {
    q: 'What ongoing services are provided?',
    a: 'Corporate secretary, tax filing, bookkeeping and regulatory submissions to keep you compliant.',
  },
  {
    q: 'How do you ensure compliance?',
    a: '99% success rate, proactive management of deadlines and filings with zero penalties guarantee.',
  },
];

const FAQSection: React.FC = () => {
  return (
    <section id="faq" className="bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border border-border rounded-lg bg-card">
              <div className="px-4">
                <AccordionTrigger className="py-4 text-left font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
              </div>
              <AccordionContent className="px-4 pb-4 text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;