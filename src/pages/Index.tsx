
import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import WhatIsSEOSection from "@/components/WhatIsSEOSection";
import SEOResultsSection from "@/components/SEOResultsSection";
import ComparisonSection from "@/components/ComparisonSection";
import WhatIsSEOServicesSection from "@/components/WhatIsSEOServicesSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewTestimonials from "@/components/NewTestimonials";
import ContactModal from "@/components/ContactModal";

/**
 * WordPress Theme Template: Home/Front Page
 * 
 * Will be converted to front-page.php or home.php
 * Each section below will be converted to template parts that can be
 * customized through WordPress Customizer or ACF fields
 */

const Index = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* WordPress: header.php */}
      <Header onContactClick={() => setContactModalOpen(true)} />
      
      {/* WordPress: Page content sections - each can be a template part */}
      <main className="flex-grow">
        {/* WordPress: Hero section - template-parts/home/hero.php */}
        <HeroSection />
        
        {/* WordPress: SEO Results section - template-parts/home/seo-results.php */}
        <SEOResultsSection />
        
        {/* WordPress: Comparison section - template-parts/home/comparison.php */}
        <ComparisonSection onContactClick={() => setContactModalOpen(true)} />
        
        {/* WordPress: What is SEO Services section - template-parts/home/seo-services.php */}
        <WhatIsSEOServicesSection onContactClick={() => setContactModalOpen(true)} />
        
        {/* WordPress: What is SEO section - template-parts/home/what-is-seo.php */}
        <WhatIsSEOSection />
        
        {/* WordPress: Testimonials section - template-parts/home/testimonials.php */}
        <NewTestimonials />
      </main>
      
      {/* WordPress: footer.php */}
      <Footer onContactClick={() => setContactModalOpen(true)} />
      
      {/* WordPress: This could be included in footer.php or as a separate template part */}
      <WhatsAppButton />
      
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};

export default Index;
