import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Phone, Mail, MessageCircle, Calendar } from "lucide-react";
import { ContactFormDialog } from "./ContactFormDialog";
import { Component } from "@/types/schema";
import { getHeading, getText, getButton } from "@/lib/schema-utils";

interface CTASectionProps {
  data?: Component;
}

const CTASection = ({ data }: CTASectionProps = {}) => {
  // Extract data from schema or use defaults
  const title = data ? getHeading(data.items, 2) : "Results You Can Count On";
  const description = data ? getText(data.items, "description") : "Our clients consistently experience accelerated growth, improved compliance, and valuable time savings thanks to our all-encompassing support. By providing end-to-end solutions from incorporation to regulatory management, we enable businesses to operate seamlessly and confidently.";
  const button = data ? getButton(data.items, "button") : { text: "Start Your Business Journey Today", link: "#contact" };
  
  const contactMethods = [{
    icon: Phone,
    title: "Call Us Today",
    description: "Speak directly with our experts",
    action: "Call Now",
    highlight: "Immediate Support"
  }, {
    icon: Mail,
    title: "Email Consultation",
    description: "Get detailed information via email",
    action: "Send Email",
    highlight: "Detailed Response"
  }, {
    icon: Calendar,
    title: "Schedule Meeting",
    description: "Book a personalized consultation",
    action: "Book Now",
    highlight: "Free Consultation"
  }, {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Quick answers to your questions",
    action: "Start Chat",
    highlight: "Instant Connection"
  }];
  return <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Primary CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          {description && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              {description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            {button.link && button.link.startsWith("#") ? (
              <ContactFormDialog>
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-4 group">
                  {button.text}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </ContactFormDialog>
            ) : (
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-4 group" asChild>
                <a href={button.link || "#contact"}>
                  {button.text}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            )}
          </div>

          {/* Trust Elements */}
          
        </div>


        {/* Secondary CTA */}
        

        {/* Contact Information */}
        
      </div>
    </section>;
};
export default CTASection;