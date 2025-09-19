
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceHero from "@/components/ServiceHero";
import ServiceFeatures from "@/components/ServiceFeatures";
import ServiceBenefits from "@/components/ServiceBenefits";
import ServiceTestimonials from "@/components/ServiceTestimonials";
import ServiceCTA from "@/components/ServiceCTA";
import ClientLogos from "@/components/ClientLogos";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Calendar, Image, Clock, Target, TrendingUp, Users } from "lucide-react";

const features = [
  {
    title: "Instagram & Facebook Posting",
    description: "We schedule and post content on your Instagram and Facebook accounts to maintain consistent brand presence."
  },
  {
    title: "Video Editing",
    description: "Professional video editing services to create engaging content that captures your audience's attention."
  },
  {
    title: "Image Editing",
    description: "High-quality image editing and graphic design to ensure your visual content stands out."
  },
  {
    title: "Content Calendar Management",
    description: "Strategic planning and scheduling of your social media content for optimal engagement."
  },
  {
    title: "Brand Consistency",
    description: "Maintaining your brand voice and visual identity across all social media platforms."
  },
  {
    title: "Performance Analytics",
    description: "Regular reports on social media performance with insights to improve your strategy."
  }
];

const benefits = [
  {
    title: "Consistent Brand Presence",
    description: "Maintain a professional and cohesive brand image across Instagram and Facebook with regular posting.",
    icon: <Image className="text-brandPurple h-6 w-6" />
  },
  {
    title: "Time Efficiency",
    description: "Save valuable time by letting our experts handle your social media scheduling and content creation.",
    icon: <Clock className="text-brandPurple h-6 w-6" />
  },
  {
    title: "Professional Content",
    description: "High-quality video and image editing that makes your content stand out from the competition.",
    icon: <Target className="text-brandPurple h-6 w-6" />
  },
  {
    title: "Increased Engagement",
    description: "Strategic posting schedules and professionally edited content drive higher engagement rates.",
    icon: <TrendingUp className="text-brandPurple h-6 w-6" />
  }
];

const testimonials = [
  {
    quote: "Their social media management transformed our Instagram presence. The video editing quality is exceptional and our engagement has increased by 180%.",
    name: "Jessica Chen",
    role: "Marketing Director",
    company: "Fusion Brands",
    rating: 5
  },
  {
    quote: "The content they create for our Facebook and Instagram is stunning. Every post looks professional and perfectly matches our brand style.",
    name: "Marcus Johnson",
    role: "Brand Manager",
    company: "Urban Lifestyle Co.",
    rating: 5
  },
  {
    quote: "Since they started managing our social media posting schedule, we've seen consistent growth in followers and engagement. Highly recommended!",
    name: "Sophia Williams",
    role: "CEO",
    company: "NextGen Solutions",
    rating: 5
  }
];

const SocialMedia = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ServiceHero 
          title="Social Media Management & Content Creation"
          description="Professional Instagram and Facebook management with expert video and image editing services."
        />
        <ClientLogos />
        <ServiceBenefits 
          title="Why Choose Our Social Media Services?"
          subtitle="Expert content creation and strategic posting for Instagram and Facebook that drives real results."
          benefits={benefits}
          ctaText="See Our Portfolio"
        />
        <ServiceFeatures 
          title="Our Social Media Services"
          subtitle="We handle everything from content creation to posting schedules for your Instagram and Facebook accounts."
          features={features}
        />
        <div className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square rounded-xl overflow-hidden shadow-lg border border-border">
                <div className="w-full h-full bg-gradient-to-r from-brandPurple/10 to-brandTeal/10 flex items-center justify-center">
                  <Calendar className="h-20 w-20 text-brandPurple opacity-70" />
                </div>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden shadow-lg border border-border">
                <div className="w-full h-full bg-gradient-to-r from-brandPurple/10 to-brandTeal/10 flex items-center justify-center">
                  <Image className="h-20 w-20 text-brandPurple opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <ServiceTestimonials 
          title="Client Success Stories"
          subtitle="See how our social media management and content creation has helped businesses grow their online presence."
          testimonials={testimonials}
        />
        <ServiceCTA 
          title="Ready to Elevate Your Social Media Presence?"
          subtitle="Let our expert team handle your Instagram and Facebook posting with professional content creation."
          buttonText="Start Your Social Media Strategy"
          buttonLink="/contact"
        />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default SocialMedia;
