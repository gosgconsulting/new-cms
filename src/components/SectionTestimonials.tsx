import React from "react";
import { motion } from "framer-motion";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

interface SectionTestimonialsProps {
  category: "sem" | "sma" | "seo" | "technology";
  bgColor?: string;
}

const SectionTestimonials: React.FC<SectionTestimonialsProps> = ({ category, bgColor = "bg-background" }) => {
  // Define testimonials for each category
  const testimonials = {
    sem: [
      {
        text: "Their SEM strategies increased our conversion rate by 35%. The targeted campaigns brought in high-quality leads that actually converted.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Sarah Johnson",
        role: "Marketing Director",
      },
      {
        text: "The PPC campaigns they created were highly targeted and cost-effective. Our ROI improved significantly within just two months.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Michael Chen",
        role: "E-commerce Manager",
      },
      {
        text: "Their keyword research and ad copy optimization transformed our Google Ads performance. We're getting more clicks at a lower cost.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Emma Rodriguez",
        role: "Digital Marketing Specialist",
      },
    ],
    sma: [
      {
        text: "Their social media strategy completely transformed our brand presence. Our engagement rates have tripled across all platforms.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Jessica Lee",
        role: "Brand Manager",
      },
      {
        text: "The targeted social campaigns they created helped us reach exactly the right audience. Our follower growth is now consistent and engaged.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "David Wilson",
        role: "Social Media Director",
      },
      {
        text: "Their content strategy for our social channels has dramatically improved our brand perception and customer engagement.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Aisha Patel",
        role: "Marketing Manager",
      },
    ],
    seo: [
      {
        text: "Their SEO expertise helped us climb from page 5 to page 1 for our key industry terms. The organic traffic increase has been remarkable.",
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Robert Kim",
        role: "SEO Specialist",
      },
      {
        text: "Their technical SEO audit uncovered critical issues we had no idea about. After implementing their recommendations, our site speed and rankings improved dramatically.",
        image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Sophia Martinez",
        role: "Website Manager",
      },
      {
        text: "The content strategy they developed has positioned us as thought leaders in our industry. Our organic search visibility has never been better.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Thomas Brown",
        role: "Content Director",
      },
    ],
    technology: [
      {
        text: "Their marketing technology recommendations streamlined our entire workflow. The automation tools they implemented saved us countless hours.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "James Taylor",
        role: "CTO",
      },
      {
        text: "The analytics dashboard they created gives us unprecedented visibility into our marketing performance. We can now make data-driven decisions quickly.",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Linda Wang",
        role: "Analytics Manager",
      },
      {
        text: "Their technology stack recommendations transformed our marketing capabilities. We're now able to execute campaigns we couldn't have imagined before.",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        name: "Daniel Garcia",
        role: "Digital Transformation Lead",
      },
    ]
  };

  // Get the appropriate testimonials based on category
  const categoryTestimonials = testimonials[category];
  
  // Split testimonials into columns
  const firstColumn = categoryTestimonials.slice(0, 1);
  const secondColumn = categoryTestimonials.slice(1, 2);
  const thirdColumn = categoryTestimonials.slice(2, 3);
  
  // Get category title
  const categoryTitles = {
    sem: "Search Engine Marketing",
    sma: "Social Media Advertising",
    seo: "Search Engine Optimization",
    technology: "our Tech Services"
  };

  return (
    <section className={`${bgColor} py-16 relative`}>
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg">Client Success</div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mt-5 text-center">
            What our clients say about {categoryTitles[category]}
          </h2>
          <p className="text-center mt-5 opacity-75">
            Real results from real businesses
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[500px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default SectionTestimonials;
