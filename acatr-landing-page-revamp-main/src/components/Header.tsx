import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ContactFormDialog } from "./ContactFormDialog";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";


const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      // Use different offsets for mobile vs desktop
      const isMobile = window.innerWidth < 768;
      const headerHeight = isMobile ? 180 : 80; // Increased offset for mobile by 60px more
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // If we're on the home page, scroll to top
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Otherwise, Link will handle navigation to home
  };

  const navItems = [
    { label: "Incorporation", sectionId: "company-incorporation" },
    { label: "Accounting", sectionId: "accounting-services" },
    { label: "Corporate Secretary", sectionId: "corporate-secretarial" },
    { label: "Reviews", sectionId: "testimonials" },
    { label: "FAQ", sectionId: "faq" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" onClick={handleLogoClick} className="cursor-pointer">
              <img src="/lovable-uploads/752d249c-df1b-46fb-b5e2-fb20a9bb88d8.png" alt="ACATR" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.sectionId)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <ContactFormDialog>
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                Contact Us
              </Button>
            </ContactFormDialog>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.sectionId)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none text-left"
                >
                  {item.label}
                </button>
              ))}
              <ContactFormDialog>
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity w-full mt-4">
                  Contact Us
                </Button>
              </ContactFormDialog>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;