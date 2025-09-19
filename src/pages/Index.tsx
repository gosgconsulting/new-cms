
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import WhatIsSEOSection from "@/components/WhatIsSEOSection";
import SEOResultsSection from "@/components/SEOResultsSection";
import ComparisonSection from "@/components/ComparisonSection";
import CTASection from "@/components/CTASection";
import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewTestimonials from "@/components/NewTestimonials";

/**
 * WordPress Theme Template: Home/Front Page
 * 
 * Will be converted to front-page.php or home.php
 * Each section below will be converted to template parts that can be
 * customized through WordPress Customizer or ACF fields
 */

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* WordPress: header.php */}
      <Header />
      
      {/* WordPress: Page content sections - each can be a template part */}
      <main className="flex-grow">
        {/* WordPress: Hero section - template-parts/home/hero.php */}
        <HeroSection />
        
        {/* WordPress: What is SEO section - template-parts/home/what-is-seo.php */}
        <WhatIsSEOSection />
        
        {/* WordPress: SEO Results section - template-parts/home/seo-results.php */}
        <SEOResultsSection />
        
        {/* WordPress: Comparison section - template-parts/home/comparison.php */}
        <ComparisonSection />
        
        {/* WordPress: Testimonials section - template-parts/home/testimonials.php */}
        <NewTestimonials />
        
        {/* WordPress: CTA section - template-parts/home/cta.php */}
        <CTASection />
      </main>
      
      {/* WordPress: footer.php */}
      <Footer />
      
      {/* WordPress: This could be included in footer.php or as a separate template part */}
      <WhatsAppButton />
    </div>
  );
};

export default Index;
