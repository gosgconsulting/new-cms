import { useState, useEffect } from "react";
import { usePageContent } from "@/hooks/usePageContent";
import { useGlobalSchema } from "@/hooks/useGlobalSchema";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";
import { SEOHead } from "@/components/SEOHead";
import HeaderClassic from "@/components/HeaderClassic";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactModal from "@/components/ContactModal";
import { PopupProvider, usePopup } from "@/contexts/PopupContext";

/**
 * SEO Landing Page Content Component
 * 
 * Dynamically renders content from the CMS based on the page schema for slug 'seo'
 * Now uses the duplicated homepage content from the database
 */
const SEOContent = () => {
  const { contactModalOpen, setContactModalOpen, openPopup } = usePopup();
  const { data: pageSchema, isLoading, error } = usePageContent('seo');
  const { data: globalSchema } = useGlobalSchema();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (pageSchema) {
      console.log('[testing] SEO Page schema loaded:', {
        slug: pageSchema.slug,
        componentsType: typeof pageSchema.components,
        isArray: Array.isArray(pageSchema.components),
        componentCount: Array.isArray(pageSchema.components) ? pageSchema.components.length : 'N/A'
      });
    }
  }, [pageSchema]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state - should not happen since we have database content
  if (error || !pageSchema) {
    console.error('[testing] Failed to load SEO page content:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Available</h1>
          <p className="text-gray-600 mb-4">We're having trouble loading this page. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO metadata */}
      {pageSchema?.meta && <SEOHead meta={pageSchema.meta} />}

      {/* Header */}
      <HeaderClassic onContactClick={() => setContactModalOpen(true)} />

      {/* Main content */}
      <main className="flex-grow">
        <DynamicPageRenderer
          schema={pageSchema}
          onContactClick={() => setContactModalOpen(true)}
          onPopupOpen={openPopup}
        />
      </main>

      {/* Footer */}
      <Footer onContactClick={() => setContactModalOpen(true)} />

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Contact Modal */}
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};

/**
 * SEO Landing Page
 * 
 * Wrapped with PopupProvider for global popup state management
 */
const SEO = () => {
  return (
    <PopupProvider>
      <SEOContent />
    </PopupProvider>
  );
};

export default SEO;