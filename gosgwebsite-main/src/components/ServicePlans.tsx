
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Feature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  description: string;
  features: Feature[];
  popular?: boolean;
  cta: string;
  link: string;
}

interface ServicePlansProps {
  title: string;
  subtitle: string;
  plans: Plan[];
}

const ServicePlans = ({ title, subtitle, plans }: ServicePlansProps) => {
  return (
    <section className="py-24 px-4 bg-muted/30">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-card rounded-xl p-8 border ${
                plan.popular 
                  ? "border-coral shadow-lg shadow-coral/10 relative" 
                  : "border-border shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-coral text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">
                  {plan.price}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-brandTeal flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
              
              <Button
                asChild
                variant={plan.popular ? "coral" : "branded"}
                className="w-full"
              >
                <Link to={plan.link}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicePlans;
