import { useEffect } from "react";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";
import { SEOHead } from "@/components/SEOHead";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactModal from "@/components/ContactModal";
import StickyChat from "@/components/StickyChat";
import { PopupProvider, usePopup } from "@/contexts/PopupContext";

/**
 * Home/Front Page Content Component
 * 
 * Hardcoded homepage content - now only the Hero section is rendered
 */
const IndexContent = () => {
  const { contactModalOpen, setContactModalOpen, openPopup } = usePopup();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Add event listener for pricing card contact modal
    const handleOpenContactModal = () => {
      setContactModalOpen(true);
    };
    
    window.addEventListener('openContactModal', handleOpenContactModal);
    
    return () => {
      window.removeEventListener('openContactModal', handleOpenContactModal);
    };
  }, [setContactModalOpen]);
  
  // Homepage data with ONLY the main hero section
  const homepageData = {
    slug: 'home',
    meta: {
      title: 'GO SG Consulting - Full-Stack Digital Growth Solution',
      description: 'Helping brands grow their revenue and leads through comprehensive digital marketing services including SEO, SEM, Social Media Ads, Website Design, and Graphic Design.',
      keywords: 'digital marketing, SEO, SEM, social media ads, website design, graphic design, Singapore, full-stack',
    },
    components: [
      // Section 1 — Hero
      {
        key: "MainHeroSection",
        name: "Hero",
        type: "HomeHeroSection",
        items: [
          { key: "headingPrefix", type: "heading", level: 1, content: "Turn traffic into revenue with a" },
          { key: "headingEmphasis", type: "heading", level: 1, content: "Full‑Stack Growth Engine" }
        ]
      },

      // Section 2 — Challenge (animation left, problem layout right)
      {
        key: "ProblemSection",
        name: "Problem",
        type: "ChallengeSection",
        items: [
          { key: "hint", type: "text", content: "You have a great business but struggle online?" },
          { key: "heading", type: "heading", level: 2, content: "Your Business Works… Your Marketing Doesn't" },
          {
            key: "bullets",
            type: "array",
            items: [
              { key: "b1", type: "text", content: "You know your craft — but not SEO, ads, funnels", icon: "x" },
              { key: "b2", type: "text", content: "Leads don't grow month after month", icon: "sparkles" },
              { key: "b3", type: "text", content: "Ad money burns without profit", icon: "barChart3" }
            ]
          }
        ]
      },

      // New: Animated headline section (as in the provided design)
      {
        key: "AnimatedAboutSection",
        name: "Animated About",
        type: "AboutSection2",
        items: []
      },

      // New: Pricing Page section inserted after about section
      {
        key: "PricingPageSection",
        name: "Pricing",
        type: "PricingPage",
        items: []
      },

      // NEW: Gallery4 services section after Pricing
      {
        key: "Gallery4Section",
        name: "Our Services",
        type: "Gallery4Section",
        items: []
      }
    ]
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO metadata */}
      <SEOHead meta={homepageData.meta} />
      
      {/* Main content: only Hero section */}
      <main className="flex-grow">
        <DynamicPageRenderer
          schema={homepageData}
          onContactClick={() => setContactModalOpen(true)}
          onPopupOpen={openPopup}
        />
      </main>
      
      {/* Footer */}
      <Footer onContactClick={() => setContactModalOpen(true)} />
      
      {/* WhatsApp Button */}
      <WhatsAppButton />
      
      {/* Sticky Chat Button */}
      <StickyChat onChatClick={() => setContactModalOpen(true)} />
      
      {/* Contact Modal */}
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};

/**
 * Home/Front Page
 * 
 * Wrapped with PopupProvider for global popup state management
 */
const Index = () => {
  return (
    <PopupProvider>
      <IndexContent />
    </PopupProvider>
  );
};

export default Index;