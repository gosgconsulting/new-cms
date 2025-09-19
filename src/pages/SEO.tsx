
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceHero from "@/components/ServiceHero";
import ServiceFeatures from "@/components/ServiceFeatures";
import ServiceBenefits from "@/components/ServiceBenefits";
import ServiceCaseStudies from "@/components/ServiceCaseStudies";
import ServiceTestimonials from "@/components/ServiceTestimonials";
import ServiceCTA from "@/components/ServiceCTA";
import WhatsAppButton from "@/components/WhatsAppButton";
import EditableSection from "@/components/dashboard/EditableSection";
import { withAdminEditing } from "@/components/dashboard/withAdminEditing";

interface SEOProps {
  isAdmin?: boolean;
  pageId?: string;
  onEditSection?: (sectionId: string) => void;
}

const SEO = ({ isAdmin = false, pageId = "seo", onEditSection = () => {} }: SEOProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // These would normally come from a CMS or API in a real WordPress environment
  const features = [
    {
      title: "Keyword Research",
      description: "Identify high-value keywords that your target audience is actively searching for."
    },
    {
      title: "On-Page SEO",
      description: "Optimize your website content for search engines while maintaining a great user experience."
    },
    {
      title: "Technical SEO",
      description: "Improve your site's technical aspects to enhance crawlability and indexation."
    },
    {
      title: "Content Strategy",
      description: "Develop engaging, SEO-friendly content that attracts and converts visitors."
    },
    {
      title: "Local SEO",
      description: "Boost your visibility in local search results to capture nearby customers."
    },
    {
      title: "SEO Analytics",
      description: "Track and analyze your SEO performance with detailed reporting and insights."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <EditableSection
          isAdmin={isAdmin}
          sectionId="hero"
          sectionName="Hero Section"
          onEdit={onEditSection}
          pageId={pageId}
        >
          <ServiceHero 
            title="Humanised SEO Services"
            description="Boost your search visibility with strategies designed for both users and search engines."
          />
        </EditableSection>
        
        <EditableSection
          isAdmin={isAdmin}
          sectionId="features"
          sectionName="Service Features"
          onEdit={onEditSection}
          pageId={pageId}
        >
          <ServiceFeatures 
            title="Our SEO Services"
            subtitle="Comprehensive search engine optimization strategies tailored to your business goals."
            features={features}
          />
        </EditableSection>
        
        <EditableSection
          isAdmin={isAdmin}
          sectionId="testimonials"
          sectionName="Testimonials"
          onEdit={onEditSection}
          pageId={pageId}
        >
          <ServiceTestimonials 
            title="Client Success Stories"
            subtitle="See how our SEO strategies have transformed businesses online."
            testimonials={[
              {
                quote: "Our organic traffic increased by 210% within just six months of working with the team.",
                name: "Michael Chen",
                role: "Marketing Director",
                company: "TechSolutions Inc.",
                rating: 5
              },
              {
                quote: "Not only did we start ranking for our target keywords, but our conversion rate improved dramatically.",
                name: "Sarah Johnson",
                role: "E-commerce Manager",
                company: "StyleShop",
                rating: 5
              }
            ]}
          />
        </EditableSection>
        
        <EditableSection
          isAdmin={isAdmin}
          sectionId="cta"
          sectionName="Call to Action"
          onEdit={onEditSection}
          pageId={pageId}
        >
          <ServiceCTA 
            title="Ready to Improve Your Search Rankings?"
            subtitle="Get started with a comprehensive SEO audit and strategy."
            buttonText="Start Your SEO Partnership"
            buttonLink="/contact"
          />
        </EditableSection>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default withAdminEditing(SEO, "seo");
