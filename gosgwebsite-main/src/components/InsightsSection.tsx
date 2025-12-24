
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const insights = [
  {
    title: "Grow Your Organic Traffic with Humanised Content",
    description: "Let our expert writers create authentic, compelling copy that resonates with your audience and passes AI detection tools. Our content works for SEO and algorithms because we mimic human behaviour, mannerisms, tone and structure. It helps brand building and creates trust factor with the readers.",
    link: "/services/seo"
  },
  {
    title: "Get a Website Without Breaking the Bank – Ready in Under a Month",
    description: "Professional. Affordable. Fast. We create beautiful and high-converting websites for your business at a low price. Using our simplified process, your website will get launched within a month's period, so you can seamlessly attract customers and get your business going without wasting time or money.",
    link: "/services/website-design"
  },
  {
    title: "Join Thriving Brands Growing with Us",
    description: "Be our next success story. You can partner with us to scale your business through result-oriented digital marketing. From forming a plan to executing it successfully, we can help you grow your revenues on the web – and class your brand as our next case.",
    link: "/services/dashboard"
  }
];

const caseStudies = [
  {
    client: "Smooy Frozen Yogurt",
    result: "gained 700 monthly organic traffic in 8 months only",
    category: "SEO"
  },
  {
    client: "Nail Queen",
    result: "increased its organic traffic from 400 to 1,100 from jul to dec 2024",
    category: "SEO"
  }
];

const InsightsSection = () => {
  return (
    <section className="py-24 px-4 bg-secondary/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Case Studies */}
          <motion.div 
            className="space-y-12"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <span className="inline-block py-1 px-3 mb-4 bg-coral/20 text-coral text-sm font-medium rounded-full">
                SUCCESS STORIES
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Our Results
              </h2>
            </div>
            
            <div className="space-y-8">
              {caseStudies.map((item, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card border border-border hover:border-coral/30 transition-colors rounded-lg p-6"
                >
                  <span className="inline-block py-1 px-3 mb-3 bg-coral/10 text-coral text-xs font-medium rounded-full">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-semibold mb-3">{item.client}</h3>
                  <p className="text-muted-foreground">{item.result}</p>
                </motion.div>
              ))}
            </div>
            
            <Button asChild className="bg-coral hover:bg-coral/90 text-white">
              <Link to="/contact">Get Started</Link>
            </Button>
          </motion.div>
          
          {/* Solution Insights */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <span className="inline-block py-1 px-3 mb-4 bg-coral/20 text-coral text-sm font-medium rounded-full">
                WHAT WE OFFER
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Our Solutions
              </h2>
            </div>
            
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-8 hover:border-coral/50 hover:shadow-lg hover:shadow-coral/5 transition-all"
              >
                <h3 className="font-semibold text-xl mb-3">{insight.title}</h3>
                <p className="text-muted-foreground mb-6">{insight.description}</p>
                <Button asChild variant="ghost" className="text-coral hover:text-coral hover:bg-coral/10 pl-0">
                  <Link to={insight.link} className="flex items-center">
                    Learn more
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;
