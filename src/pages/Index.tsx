
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import CTASection from "@/components/CTASection";
import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientLogos from "@/components/ClientLogos";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FAQAccordion from "@/components/FAQAccordion";
import StatsCounter from "@/components/StatsCounter";

/**
 * WordPress Theme Template: Home/Front Page
 * 
 * Will be converted to front-page.php or home.php
 * Each section below will be converted to template parts that can be
 * customized through WordPress Customizer or ACF fields
 */

// FAQ items - in WordPress these would come from a custom post type or ACF fields
const faqItems = [
  {
    question: "What is a digital agency?",
    answer: "A digital agency is a company that helps businesses establish and grow their online presence with the help of digital tools like websites, social media, SEO, digital ads and content publishing."
  },
  {
    question: "What is a full-service digital agency?",
    answer: "A full-service digital agency is a one-stop shop for all your digital marketing needs. At GO SG, their full service offering includes everything from social media management and website design through to content creation including SEO, paid advertising and influencer (KOL) partnerships."
  },
  {
    question: "Why hire a professional digital marketing agency?",
    answer: "When you hire a professional agency like GO SG, your brand gets access to expertise, tools and strategy. Outsource your digital marketing to a professional agency: It saves time, enhances effectiveness and help you achieve marketing goals in line with business objectives."
  },
  {
    question: "How can a digital agency help?",
    answer: "A digital agency can assist you attract more customers, build-up your brand and business, through content, ads, website and support."
  },
  {
    question: "How to select a digital agency?",
    answer: "Look for an agency with proven results, a clear strategy, and services that match your goals. At GO SG, we offer transparent pricing, customised packages, and a dedicated team focused on your success."
  },
  {
    question: "What does a digital agency do?",
    answer: "A digital agency is a company that plans, develops, and executes marketing campaigns across digital media. At GO SG, our full service handles everything from social media and SEO, to website design, content production and performance reporting."
  }
];

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
        
        {/* WordPress: Client logos section - template-parts/home/client-logos.php */}
        <ClientLogos />
        
        {/* WordPress: Services section - template-parts/home/services.php */}
        <ServicesSection />
        
        {/* WordPress: Stats counter section - template-parts/home/stats.php */}
        <StatsCounter />
        
        {/* WordPress: Testimonials section - template-parts/home/testimonials.php */}
        <TestimonialsCarousel />
        
        {/* WordPress: Why choose us section - template-parts/home/why-choose-us.php */}
        <WhyChooseUsSection />
        
        {/* WordPress: FAQ section - template-parts/home/faq.php
             FAQs would be stored as custom post type or ACF repeater field */}
        <FAQAccordion 
          title="Frequently Asked Questions"
          items={faqItems}
        />
        
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
