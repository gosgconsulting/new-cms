import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { ContactFormDialog } from "./ContactFormDialog";
import { Component } from "@/types/schema";
import { getHeading, getArrayObjectItems } from "@/lib/schema-utils";

interface FAQSectionProps {
  data?: Component;
}

const FAQSection = ({ data }: FAQSectionProps = {}) => {
  // Extract data from schema or use defaults
  const title = data ? getHeading(data.items, 2) : "Frequently Asked Questions";
  const subtitle = data ? getHeading(data.items, 3) : "Everything you need to know about our services, processes, and how we can help your business succeed.";
  const faqObjects = data ? getArrayObjectItems(data.items, "faqs") : [];
  
  // Default FAQs if no data
  const defaultFaqs = [{
    question: "What's required to start company incorporation?",
    answer: "We handle the process for you, requiring only essential documents. Our team will guide you step-by-step for a smooth setup."
  }, {
    question: "Can international clients use your services?",
    answer: "Yes, we serve both local and international business owners, including support for setting up bank accounts and registered business addresses."
  }, {
    question: "What accounting services do you offer?",
    answer: "Our accounting services include bookkeeping, tax filing, and financial reporting, ensuring all your financial needs are managed professionally."
  }, {
    question: "How does the corporate secretarial service help my business?",
    answer: "We handle all compliance-related tasks, including tax deadlines and document filings, so you remain compliant and focused on operations."
  }, {
    question: "Can I add additional services later on?",
    answer: "Absolutely. We offer flexible, customized packages that allow you to add services as your business needs evolve."
  }, {
    question: "How do I get in touch for more information?",
    answer: "Reach out via our contact page or give us a call. Our team is ready to answer your questions and provide the support you need."
  }];

  // Map FAQ objects to FAQ format
  const faqs = faqObjects.length > 0
    ? faqObjects.map((obj) => ({
        question: obj.props.question || "",
        answer: obj.props.answer || ""
      }))
    : defaultFaqs;
  return <section id="faq" className="py-20" style={{ backgroundColor: '#F3F6F7' }}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {title.includes("Questions") ? (
              <>
                {title.split("Questions")[0]}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {"Questions"}
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
            {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="bg-card border rounded-lg px-6 shadow-soft hover:shadow-medium transition-shadow">
                <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>

        {/* Contact CTA */}
        

        {/* Quick Contact Info */}
        
      </div>
    </section>;
};
export default FAQSection;