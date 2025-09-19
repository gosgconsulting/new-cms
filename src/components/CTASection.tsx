import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
const CTASection = () => {
  return <section className="relative py-24 px-4 overflow-hidden">
      {/* Background gradient - same as hero section */}
      <div className="absolute inset-0 gradient-bg -z-10"></div>
      
      {/* Abstract shapes - same as hero section */}
      <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-brandPurple/10 blur-3xl"></div>
      <div className="absolute bottom-10 left-[5%] w-40 h-40 rounded-full bg-brandPurple/20 blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        <motion.div className="max-w-4xl mx-auto text-center space-y-8" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }}>
          
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Drive <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Revenue Growth</span> Through Powerful Campaigns
          </h2>
          
          <p className="text-xl text-muted-foreground">
            Work with a marketing agency that helps you double your profits. 
            Increase your brand reach, get new customers and grow market share.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild variant="coral" size="xl" className="group relative overflow-hidden">
              <Link to="/contact" className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Get a Free Consultation
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="border-border text-foreground hover:bg-accent/10">
              
            </Button>
          </div>
          
          
        </motion.div>
      </div>
    </section>;
};
export default CTASection;