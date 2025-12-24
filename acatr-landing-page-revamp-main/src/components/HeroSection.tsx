import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-business.jpg";
import { ContactFormDialog } from "./ContactFormDialog";
import { Component } from "@/types/schema";
import { getHeading, getImageSrc, getButton, getArrayTextItems } from "@/lib/schema-utils";

interface HeroSectionProps {
  data?: Component;
}

const HeroSection = ({ data }: HeroSectionProps = {}) => {
  // Extract data from schema or use defaults
  const title = data ? getHeading(data.items, 1) : "Singapore Business Setup In 24 Hours - ACRA Registered";
  const subtitle = data ? getHeading(data.items, 3) : "ACRA-registered filing agents providing complete Singapore company incorporation, professional accounting services, and 100% compliance guarantee. Start your business today with expert guidance from day one.";
  const imageSrc = data ? getImageSrc(data.items, "image") : heroImage;
  const imageAlt = data ? (data.items.find(item => item.key === "image") as any)?.alt || "Professional business team collaboration" : "Professional business team collaboration";
  const button = data ? getButton(data.items, "button") : { text: "Start Your Business Journey Today", link: "#contact" };
  const features = data ? getArrayTextItems(data.items, "features") : ["Singapore Company Incorporation in 24 Hours", "100% ACRA & IRAS Compliance Guaranteed", "Professional Accounting & GST Filing"];

  // Parse title to extract gradient part if needed
  const titleParts = title.split(" - ");
  const mainTitle = titleParts[0] || title;
  const subtitleTitle = titleParts[1] || "";

  return <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {mainTitle.includes("In 24 Hours") ? (
                  <>
                    {mainTitle.split("In 24 Hours")[0]}
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      {" In 24 Hours"}
                    </span>
                    {subtitleTitle && ` - ${subtitleTitle}`}
                  </>
                ) : (
                  mainTitle
                )}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {subtitle}
              </p>

              {/* Feature List */}
              {features.length > 0 && (
                <div className="space-y-3">
                  {features.map((feature, index) => <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">{feature}</span>
                    </div>)}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {button.link && button.link.startsWith("#") ? (
                <ContactFormDialog>
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity group">
                    {button.text}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </ContactFormDialog>
              ) : (
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity group" asChild>
                  <a href={button.link || "#contact"}>
                    {button.text}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              )}
            </div>

            {/* Trust Indicators */}
            
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img src={imageSrc} alt={imageAlt} className="w-full h-[600px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-medium border">
              <div className="text-sm font-medium text-primary">ACRA Registered</div>
              <div className="text-xs text-muted-foreground">Official Filing Agent</div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-medium border">
              <div className="text-sm font-medium text-accent">99% Success Rate</div>
              <div className="text-xs text-muted-foreground">Zero penalties guaranteed</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
    </section>;
};
export default HeroSection;