import { TestimonialsColumn, testimonials } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsSection = () => {
  return (
    <section className="bg-gradient-to-b from-background to-card/20 py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-l from-accent/10 to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="container z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-primary/20 py-2 px-6 rounded-full bg-primary/5 backdrop-blur-sm">
              <span className="text-primary font-medium">Testimonials</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent text-center">
            What our users say
          </h2>
          <p className="text-center mt-6 opacity-75 text-lg text-muted-foreground max-w-lg">
            Join thousands of businesses growing their organic traffic with AI-powered SEO automation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex justify-center gap-6 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;