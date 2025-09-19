import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, Users, DollarSign } from "lucide-react";

const ResultsSection = () => {
  const results = [
    {
      icon: <TrendingUp className="h-8 w-8 text-accent" />,
      metric: "400%",
      label: "Average Traffic Increase",
      description: "Within 4-6 months",
    },
    {
      icon: <Target className="h-8 w-8 text-accent" />,
      metric: "#1",
      label: "Rankings Achieved",
      description: "For high-value keywords",
    },
    {
      icon: <Users className="h-8 w-8 text-accent" />,
      metric: "300%",
      label: "Lead Generation Boost",
      description: "Qualified prospects monthly",
    },
    {
      icon: <DollarSign className="h-8 w-8 text-accent" />,
      metric: "250%",
      label: "Revenue Growth",
      description: "From organic search",
    },
  ];

  const caseStudies = [
    {
      company: "[Client Case Study 1]",
      industry: "[Industry Placeholder]",
      challenge: "[Challenge Description - Will Replace]",
      solution: "[Solution Overview - Will Replace]",
      results: "[Specific Results & Metrics - Will Replace]",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=entropy&auto=format",
    },
    {
      company: "[Client Case Study 2]",
      industry: "[Industry Placeholder]",
      challenge: "[Challenge Description - Will Replace]",
      solution: "[Solution Overview - Will Replace]",
      results: "[Specific Results & Metrics - Will Replace]",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=entropy&auto=format",
    },
    {
      company: "[Client Case Study 3]",
      industry: "[Industry Placeholder]",
      challenge: "[Challenge Description - Will Replace]",
      solution: "[Solution Overview - Will Replace]",
      results: "[Specific Results & Metrics - Will Replace]",
      image: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=300&fit=crop&crop=entropy&auto=format",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Results Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Proven SEO Results</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Here's what our clients achieve with our data-driven SEO strategies
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center p-6 h-full hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-xl mb-4">
                    {result.icon}
                  </div>
                  <div className="text-3xl font-bold text-accent mb-2">{result.metric}</div>
                  <h3 className="font-semibold mb-2">{result.label}</h3>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Case Studies Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real case studies showing how we transformed businesses through strategic SEO
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden h-full hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                <div className="aspect-video bg-accent/10 flex items-center justify-center">
                  <img 
                    src={study.image} 
                    alt={study.company}
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                    <span className="text-white font-semibold bg-accent/80 px-4 py-2 rounded-lg">
                      Case Study Preview
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{study.company}</h3>
                  <p className="text-accent text-sm font-medium mb-3">{study.industry}</p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-foreground">Challenge:</strong>
                      <p className="text-muted-foreground mt-1">{study.challenge}</p>
                    </div>
                    <div>
                      <strong className="text-foreground">Solution:</strong>
                      <p className="text-muted-foreground mt-1">{study.solution}</p>
                    </div>
                    <div>
                      <strong className="text-foreground">Results:</strong>
                      <p className="text-muted-foreground mt-1">{study.results}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;