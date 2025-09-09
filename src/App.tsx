
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContactModalProvider } from "@/contexts/ContactModalContext";
import ContactModal from "@/components/ContactModal";
import { useContactModal } from "@/contexts/ContactModalContext";
import AdminTopBar from "@/components/AdminTopBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import WebsiteDesign from "./pages/WebsiteDesign";
import SEO from "./pages/SEO";
import PaidAds from "./pages/PaidAds";
import SocialMedia from "./pages/SocialMedia";
import Reporting from "./pages/Reporting";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import CustomDashboard from "./pages/CustomDashboard";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import BlogArchive from "./pages/BlogArchive";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import WebsiteDesignServices from "./pages/services/WebsiteDesignServices";
import SEOServices from "./pages/services/SEOServices";
import PaidAdvertisingServices from "./pages/services/PaidAdvertisingServices";
import CloudHostingServices from "./pages/services/CloudHostingServices";
import ServicePresentationPage from "./pages/ServicePresentation";
import WordPressSetup from "./pages/WordPressSetup";

/**
 * WordPress Theme Structure
 * 
 * This React Router setup maps to the following WordPress templates:
 * - "/" (Index) -> front-page.php or home.php
 * - "/services/website-design" -> single-service.php or page-website-design.php
 * - "/services/seo" -> single-service.php or page-seo.php
 * - "/services/paid-ads" -> single-service.php or page-paid-ads.php
 * - "/services/social-media" -> single-service.php or page-social-media.php
 * - "/services/reporting" -> single-service.php or page-reporting.php
 * - "/contact" -> page-contact.php
 * - "/blog" -> archive.php or index.php
 * - "/blog/:slug" -> single.php
 * - "/customizer" -> page-customizer.php
 * - "/admin" -> page-admin.php (admin dashboard)
 * - "/auth" -> authentication page
 * - "/templates/*" -> template preview pages
 * - "/terms/*" -> service detail pages (admin only)
 * - "/present/*" -> service presentation pages (admin only)
 * - "*" (NotFound) -> 404.php
 *
 * The React Router setup will be replaced with WordPress's template hierarchy.
 */

const queryClient = new QueryClient();

const AppContent = () => {
  const { isModalOpen, closeModal } = useContactModal();
  
  return (
    <>
      <AdminTopBar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/services/website-design" element={<WebsiteDesign />} />
        <Route path="/services/seo" element={<SEO />} />
        <Route path="/services/paid-ads" element={<PaidAds />} />
        <Route path="/services/social-media" element={<SocialMedia />} />
        <Route path="/services/reporting" element={<Reporting />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/archive" element={<BlogArchive />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/customizer" element={<CustomDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/terms/website-design" element={<WebsiteDesignServices />} />
        <Route path="/terms/seo" element={<SEOServices />} />
        <Route path="/terms/paid-advertising" element={<PaidAdvertisingServices />} />
        <Route path="/terms/cloud-hosting" element={<CloudHostingServices />} />
        <Route path="/present/:serviceType" element={<ServicePresentationPage />} />
        <Route path="/wordpress-setup" element={<WordPressSetup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
      <WhatsAppButton />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ContactModalProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ContactModalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
