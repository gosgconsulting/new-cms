
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Benefit {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface ServiceBenefitsProps {
  title: string;
  subtitle: string;
  benefits: Benefit[];
  ctaLink?: string;
  ctaText?: string;
}

const ServiceBenefits = ({ title, subtitle, benefits, ctaLink = "/contact", ctaText = "Learn More" }: ServiceBenefitsProps) => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">{title}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-brandPurple/10 flex items-center justify-center">
                  {benefit.icon || <CheckCircle className="text-brandPurple h-6 w-6" />}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {ctaText && ctaLink && (
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Button asChild variant="coral" size="lg">
              <Link to={ctaLink}>{ctaText}</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ServiceBenefits;
