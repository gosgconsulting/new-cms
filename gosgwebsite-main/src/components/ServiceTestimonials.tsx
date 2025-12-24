import { useEffect, useState, useRef } from "react";
import { motion, useAnimation, useDragControls, PanInfo } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  image?: string;
  rating?: number;
}

interface ServiceTestimonialsProps {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

const ServiceTestimonials = ({ title, subtitle, testimonials }: ServiceTestimonialsProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [currentPosition, setCurrentPosition] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);

  // Calculate scroll width when component mounts
  useEffect(() => {
    if (containerRef.current) {
      setScrollWidth(containerRef.current.scrollWidth - containerRef.current.clientWidth);
    }
  }, []);

  // Handle animation based on isPaused state and scrollWidth
  useEffect(() => {
    if (!isPaused && scrollWidth > 0) {
      controls.start({
        x: -scrollWidth,
        transition: {
          duration: 15, // Faster scrolling
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        }
      });
    } else {
      // Stop the animation completely
      controls.stop();
    }
  }, [isPaused, controls, scrollWidth]);

  const handleDragStart = () => {
    setIsPaused(true);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const newPosition = currentPosition + info.offset.x;
    setCurrentPosition(newPosition);
    controls.start({
      x: newPosition,
      transition: { duration: 0.5, ease: "easeInOut" }
    });
  };

  return (
    <section className="py-20 px-4 bg-[hsl(var(--brand-blue))] relative overflow-hidden">
      {/* Background elements - maintaining blue theme */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--brand-blue))] via-[hsl(var(--brand-blue))]/95 to-[hsl(var(--brand-blue))]/90 -z-10"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl"></div>
      
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-1 w-10 bg-accent rounded-full"></div>
            <h3 className="text-center text-xl font-medium text-primary-foreground/80">Not convinced yet?</h3>
            <div className="h-1 w-10 bg-accent rounded-full"></div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">{title}</span>
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        
        <div 
          className="overflow-hidden w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-label="Service testimonials carousel"
        >
          <div ref={containerRef} className="relative cursor-grab">
            <motion.div 
              className="flex gap-6 py-6 px-4 min-w-max"
              animate={controls}
              initial={{ x: 0 }}
              drag="x"
              dragControls={dragControls}
              dragConstraints={{ left: -2000, right: 100 }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: "grabbing" }}
            >
              {/* First set of testimonials */}
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
              
              {/* Duplicate set for seamless loop */}
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={`duplicate-${index}`} testimonial={testimonial} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <Card className="bg-surface/10 hover:bg-surface/20 backdrop-blur-md border-primary-foreground/10 w-80 lg:w-96 group transition-all duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Avatar className="h-14 w-14 border-2 border-accent/30">
              {testimonial.image ? (
                <AvatarImage src={testimonial.image} alt={testimonial.name} />
              ) : (
                <AvatarFallback className="bg-accent/20 text-accent text-lg">
                  {testimonial.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="ml-4">
              <h4 className="font-semibold text-lg text-primary-foreground">{testimonial.name}</h4>
              <p className="text-sm text-primary-foreground/60">{testimonial.role}, {testimonial.company}</p>
            </div>
          </div>
          
          <div className="flex">
            {Array(5).fill(0).map((_, i) => (
              <Star 
                key={i} 
                className="h-5 w-5 text-yellow-400" 
                fill={i < (testimonial.rating || 5) ? "currentColor" : "none"} 
              />
            ))}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -top-3 -left-1 text-accent/20 text-6xl font-serif">
            "
          </div>
          <p className="text-xl mb-6 relative z-10 pt-4 text-primary-foreground/90">{testimonial.quote}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceTestimonials;
