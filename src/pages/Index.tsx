
import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import PainPointSection from "@/components/PainPointSection";
import SEOServicesShowcase from "@/components/SEOServicesShowcase";
import SEOResultsSection from "@/components/SEOResultsSection";
import WhatIsSEOServicesSection from "@/components/WhatIsSEOServicesSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewTestimonials from "@/components/NewTestimonials";
import BlogSection from "@/components/BlogSection";
import ContactModal from "@/components/ContactModal";
import FAQAccordion from "@/components/FAQAccordion";

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
        <HeroSection onContactClick={() => setContactModalOpen(true)} />
        
        {/* WordPress: Pain Point section - template-parts/home/pain-point.php */}
        <PainPointSection />
        
        {/* WordPress: SEO Results section - template-parts/home/seo-results.php */}
        <SEOResultsSection />
        
        {/* WordPress: SEO Services Showcase section - template-parts/home/seo-services-showcase.php */}
        <SEOServicesShowcase onContactClick={() => setContactModalOpen(true)} />
        
        {/* WordPress: What is SEO Services section - template-parts/home/seo-services.php */}
        <WhatIsSEOServicesSection onContactClick={() => setContactModalOpen(true)} />
        
        {/* WordPress: Testimonials section - template-parts/home/testimonials.php */}
        <NewTestimonials />
        
        {/* WordPress: FAQ section - template-parts/home/faq.php */}
        <FAQAccordion 
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about our SEO services"
          items={[
            {
              question: "How do backlinks help my website's SEO?",
              answer: "Backlinks are crucial for building your website's authority and trust. When reputable websites link to yours, search engines view it as a vote of confidence. This increases your Domain Rating (DR) and Domain Authority (DA), which are key metrics that Google uses to determine your site's credibility. Higher authority means better rankings, more visibility, and increased organic traffic to your website."
            },
            {
              question: "Why are blog posts important for SEO?",
              answer: "Blog posts are essential for SEO because they provide fresh, relevant content that search engines love. Regular blogging helps you target long-tail keywords, answer customer questions, and establish your expertise in your industry. Each blog post is a new opportunity to rank for different search terms, attract backlinks, and engage your audience. Quality blog content also increases time-on-site and reduces bounce rates, which are positive ranking signals for search engines."
            },
            {
              question: "How much do your SEO services cost?",
              answer: "Our SEO services start from just 600 SGD per month, making professional SEO accessible for businesses of all sizes. This includes comprehensive keyword research, on-page optimization, quality backlink building, regular blog content creation, and detailed monthly reporting. We offer flexible packages tailored to your specific needs and goals, ensuring you get the best ROI for your investment."
            }
          ]}
        />
        
        {/* WordPress: Blog section - template-parts/home/blog.php */}
        <BlogSection onContactClick={() => setContactModalOpen(true)} />
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
