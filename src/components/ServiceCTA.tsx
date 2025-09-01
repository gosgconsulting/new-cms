
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ServiceCTAProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

const ServiceCTA = ({ title, subtitle, buttonText, buttonLink }: ServiceCTAProps) => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-bg -z-10"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brandPurple/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-brandPurple/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">{title}</span>
          </h2>
          
          <p className="text-xl text-muted-foreground">
            {subtitle}
          </p>
          
          <div className="pt-4">
            <Button asChild variant="coral" size="xl" className="cta-button">
              <Link to={buttonLink}>
                {buttonText}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceCTA;
