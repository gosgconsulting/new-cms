import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };
  const services = [{
    name: "Company Incorporation",
    sectionId: "company-incorporation"
  }, {
    name: "Accounting Services",
    sectionId: "accounting-services"
  }, {
    name: "Corporate Secretary",
    sectionId: "corporate-secretarial"
  }];
  const quickLinks = ["About Us", "Services", "FAQ", "Contact"];
  const contactInfo = [{
    icon: Phone,
    label: "Phone",
    value: "Available 9 AM - 6 PM weekdays"
  }, {
    icon: Mail,
    label: "Email",
    value: "Response within 4 hours"
  }, {
    icon: MapPin,
    label: "Address",
    value: "Professional business center location"
  }];
  return <footer className="bg-card border-t">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
          {/* Company Info */}
          <div className="md:col-span-1">
            <img src="/lovable-uploads/1b3dc3e6-68ef-42d7-b09c-4313cd9fbadc.png" alt="ACATR Logo" className="h-12 mb-4" />
            <p className="text-muted-foreground mb-6 leading-relaxed">Empowering businesses with professional, efficient, and scalable support. Your trusted partner for business success from day one.</p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-6">Our Services</h4>
            <div className="space-y-3">
              {services.map((service, index) => <button key={index} onClick={() => scrollToSection(service.sectionId)} className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-left">
                  {service.name}
                </button>)}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <div className="space-y-3">
              <button onClick={() => scrollToSection('services')} className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-left">
                Services
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-left">
                Reviews
              </button>
              <button onClick={() => scrollToSection('faq')} className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-left">
                FAQ
              </button>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 ACATR Business Services. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-primary transition-colors">Terms of Service</Link>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          
        </div>
      </div>
    </footer>;
};
export default Footer;