
import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Wardah S.",
    role: "Freelance Writer",
    company: "Upwork",
    quote: "A game changer for the writing industry! GO SG is a total game-changer! Their SEO services helped me rank my content higher and get more clients.",
    rating: 5
  },
  {
    id: 2,
    name: "Zafar A.",
    role: "Creator",
    company: "",
    quote: "My Favorite Digital Agency! I have been using GO SG for over several months. The team is easy to work with and helps me come up with great outlines for my YouTube content.",
    rating: 5
  },
  {
    id: 3,
    name: "Emiliano G.",
    role: "Founder & CEO",
    company: "Rivin",
    quote: "Great Services With A Great Team! Overall it is a great company with great products. Especially the ability to generate content that ranks well in search engines.",
    rating: 5
  },
  {
    id: 4,
    name: "Ani D.",
    role: "Business Owner",
    company: "FineFireThings",
    quote: "GO SG is the best digital agency every website owner needs! Their SEO solutions are amazing to have, especially for businesses that take online presence seriously.",
    rating: 5
  },
  {
    id: 5,
    name: "Krystian Z.",
    role: "CEO",
    company: "0101 Marketing",
    quote: "The best digital marketing team I've ever used! Thanks to GO SG, we have saved thousands of dollars a month on our marketing efforts while getting better results.",
    rating: 5
  },
  {
    id: 6,
    name: "Dennis H.",
    role: "Project Manager",
    company: "FedEx Services",
    quote: "Best Web Design On The Market! GO SG delivered a beautiful website that perfectly represents our brand and converts visitors into customers.",
    rating: 5
  },
  {
    id: 7,
    name: "Vibha G.",
    role: "Content Writer",
    company: "Teachmint",
    quote: "Amazing and Best SEO Team! Their humanized content strategy really makes a difference in how our audience engages with our website.",
    rating: 5
  }
];

const TestimonialsCarousel = () => {
  const leftControls = useAnimation();
  const rightControls = useAnimation();

  // Split testimonials into two groups for left and right columns
  const leftTestimonials = testimonials.slice(0, 4);
  const rightTestimonials = testimonials.slice(3, 7);

  useEffect(() => {
    // Left column scrolls up
    leftControls.start({
      y: [-400, 0],
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop"
      }
    });

    // Right column scrolls down
    rightControls.start({
      y: [0, -400],
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop"
      }
    });
  }, [leftControls, rightControls]);

  return (
    <section className="py-20 relative overflow-hidden bg-[hsl(var(--brand-blue))]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--brand-blue))] via-[hsl(var(--brand-blue))]/95 to-[hsl(var(--brand-blue))]/90 -z-10"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl"></div>
      
      <div className="container mx-auto mb-8 px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-primary-foreground">Hear from our customers</h2>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            See what our clients have to say about working with GO SG and the results we've delivered.
          </p>
        </motion.div>
      </div>

      <div 
        className="relative w-full max-w-6xl mx-auto px-4"
        aria-label="Customer testimonials"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
          {/* Left Column - Scrolling Up */}
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex flex-col gap-6"
              animate={leftControls}
              initial={{ y: 0 }}
            >
              {/* First set */}
              {leftTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
              
              {/* Duplicate set for seamless loop */}
              {leftTestimonials.map((testimonial) => (
                <TestimonialCard key={`left-duplicate-${testimonial.id}`} testimonial={testimonial} />
              ))}
            </motion.div>
          </div>

          {/* Right Column - Scrolling Down */}
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex flex-col gap-6"
              animate={rightControls}
              initial={{ y: 0 }}
            >
              {/* First set */}
              {rightTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
              
              {/* Duplicate set for seamless loop */}
              {rightTestimonials.map((testimonial) => (
                <TestimonialCard key={`right-duplicate-${testimonial.id}`} testimonial={testimonial} />
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
    <Card className="bg-surface/10 hover:bg-surface/20 backdrop-blur-md border-primary-foreground/10 w-full min-h-[200px] group transition-all duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 border-2 border-accent/30">
              {testimonial.image ? (
                <AvatarImage src={testimonial.image} alt={testimonial.name} />
              ) : (
                <AvatarFallback className="bg-accent/20 text-accent">
                  {testimonial.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="ml-3">
              <h4 className="font-semibold text-base text-primary-foreground">{testimonial.name}</h4>
              <p className="text-xs text-primary-foreground/60">
                {testimonial.role}
                {testimonial.company && ` at ${testimonial.company}`}
              </p>
            </div>
          </div>
          
          <div className="flex">
            {Array(5).fill(0).map((_, i) => (
              <Star 
                key={i} 
                className="h-4 w-4 text-yellow-400" 
                fill={i < testimonial.rating ? "currentColor" : "none"} 
              />
            ))}
          </div>
        </div>
        
        <div className="relative flex-1 flex flex-col">
          <div className="absolute -top-3 -left-1 text-accent/20 text-5xl font-serif">
            "
          </div>
          <p className="text-base mb-4 relative z-10 pt-2 text-primary-foreground/90 flex-1">{testimonial.quote}</p>
          <div className="mt-auto">
            <div className="flex justify-end">
              <span className="text-2xl text-accent/20 font-serif">
                "
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsCarousel;
