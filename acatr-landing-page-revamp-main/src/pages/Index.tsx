import { usePageData } from "@/hooks/usePageData";
import { getComponentData, getComponentByType, isPageReady } from "@/lib/schema-utils";
import { ComponentMapper } from "@/lib/component-mapper";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  // Fetch page data from API (defaults to home page)
  // You can also pass pageId or custom apiUrl
  const { data: pageData, isLoading, error } = usePageData({ slug: "home" });

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading page content...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state (but still render static content)
  if (error) {
    console.error("Error loading page data:", error);
  }

  // Check if we have valid page data with components
  const useDynamicContent = pageData && isPageReady(pageData);

  // Extract components from schema if available
  const heroComponent = useDynamicContent 
    ? getComponentByType(pageData.layout, "HeroSection") || getComponentByType(pageData.layout, "MinimalHeroSection")
    : undefined;
  
  const problemSolutionComponent = useDynamicContent
    ? getComponentByType(pageData.layout, "ProblemSolutionSection")
    : undefined;
  
  const servicesComponent = useDynamicContent
    ? getComponentByType(pageData.layout, "ServicesSection")
    : undefined;
  
  const testimonialsComponent = useDynamicContent
    ? getComponentByType(pageData.layout, "TestimonialsSection") || getComponentByType(pageData.layout, "Reviews")
    : undefined;
  
  const faqComponent = useDynamicContent
    ? getComponentByType(pageData.layout, "FAQSection")
    : undefined;
  
  const ctaComponent = useDynamicContent
    ? getComponentByType(pageData.layout, "CTASection") || getComponentByType(pageData.layout, "MinimalNewsletterSection")
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - can be made dynamic in future */}
      <Header />

      {/* Hero Section - uses schema if available, otherwise static */}
      <ComponentMapper 
        component={heroComponent} 
        fallback={<HeroSection />}
      />

      {/* Problem Solution Section */}
      <ComponentMapper 
        component={problemSolutionComponent} 
        fallback={<ProblemSolutionSection />}
      />

      {/* Services Section */}
      <ComponentMapper 
        component={servicesComponent} 
        fallback={<ServicesSection />}
      />

      {/* Testimonials Section */}
      <ComponentMapper 
        component={testimonialsComponent} 
        fallback={<TestimonialsSection />}
      />

      {/* FAQ Section */}
      <ComponentMapper 
        component={faqComponent} 
        fallback={<FAQSection />}
      />

      {/* CTA Section */}
      <ComponentMapper 
        component={ctaComponent} 
        fallback={<CTASection />}
      />

      {/* Footer - can be made dynamic in future */}
      <Footer />
    </div>
  );
};

export default Index;
