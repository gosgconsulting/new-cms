import { motion } from "framer-motion";
import { Search, FileText, Code, BarChart3, Link2, Users, TrendingUp, Target } from "lucide-react";

const seoServices = [
  {
    icon: Search,
    title: "Keyword Research",
    description: "In-depth analysis to identify high-value keywords that drive qualified traffic to your business."
  },
  {
    icon: FileText,
    title: "On-Page Optimization",
    description: "Optimize your website content, meta tags, and structure for maximum search engine visibility."
  },
  {
    icon: Code,
    title: "Technical SEO",
    description: "Fix technical issues, improve site speed, and ensure your website is crawlable by search engines."
  },
  {
    icon: BarChart3,
    title: "SEO Analytics",
    description: "Track and measure your SEO performance with detailed reporting and actionable insights."
  },
  {
    icon: Link2,
    title: "Link Building",
    description: "Build high-quality backlinks from authoritative websites to boost your domain authority."
  },
  {
    icon: Users,
    title: "Local SEO",
    description: "Optimize your business for local search results and Google My Business visibility."
  },
  {
    icon: TrendingUp,
    title: "Content Strategy",
    description: "Create SEO-optimized content that engages your audience and ranks on search engines."
  },
  {
    icon: Target,
    title: "Competitor Analysis",
    description: "Analyze your competitors' strategies to identify opportunities and stay ahead."
  }
];

interface WhatIsSEOServicesSectionProps {
  onContactClick?: () => void;
}

const WhatIsSEOServicesSection = ({ onContactClick }: WhatIsSEOServicesSectionProps) => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What is <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">SEO</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Search Engine Optimization (SEO) is the practice of optimizing your website to rank higher in search results. 
            Here's how we make it work for your business:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {seoServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-brandPurple/30 hover:-translate-y-1">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-brandPurple/10 to-brandTeal/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-brandPurple" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-lg text-gray-700 mb-6">
            Ready to see how SEO can transform your business?
          </p>
          <div 
            onClick={onContactClick}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brandPurple to-brandTeal rounded-lg text-white font-medium hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            Start Your SEO Partnership
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatIsSEOServicesSection;