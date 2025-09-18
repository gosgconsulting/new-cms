import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestimonialsColumn } from '@/components/ui/testimonials-columns-1';

const reviews = {
  seo: [
    {
      text: "GO SG transformed our SEO strategy completely. Our organic traffic increased by 300% in just 6 months. Their keyword research and content optimization are unmatched.",
      image: "/api/placeholder/40/40",
      name: "Sarah Chen",
      role: "Marketing Director"
    },
    {
      text: "The SEO results speak for themselves. We're now ranking #1 for our main keywords and seeing consistent organic growth every month.",
      image: "/api/placeholder/40/40",
      name: "Michael Torres",
      role: "Business Owner"
    },
    {
      text: "Their technical SEO audit revealed issues we never knew existed. The improvements led to a 40% increase in search visibility.",
      image: "/api/placeholder/40/40",
      name: "Lisa Park",
      role: "E-commerce Manager"
    }
  ],
  sem: [
    {
      text: "Our Google Ads ROI improved by 250% after GO SG took over our campaigns. Their keyword optimization and ad copy are exceptional.",
      image: "/api/placeholder/40/40",
      name: "David Kim",
      role: "Digital Marketing Manager"
    },
    {
      text: "The PPC campaign management is outstanding. We're getting more qualified leads at a lower cost per acquisition than ever before.",
      image: "/api/placeholder/40/40",
      name: "Jennifer Liu",
      role: "Growth Manager"
    },
    {
      text: "Their data-driven approach to paid search has revolutionized our customer acquisition strategy. Highly recommended!",
      image: "/api/placeholder/40/40",
      name: "Robert Zhang",
      role: "CEO"
    }
  ],
  sma: [
    {
      text: "Our social media engagement increased by 400% and follower growth by 150% within 3 months. The content quality is incredible.",
      image: "/api/placeholder/40/40",
      name: "Emma Rodriguez",
      role: "Brand Manager"
    },
    {
      text: "GO SG created a social media strategy that perfectly aligns with our brand voice. The results exceeded all expectations.",
      image: "/api/placeholder/40/40",
      name: "Alex Johnson",
      role: "Creative Director"
    },
    {
      text: "Their social media advertising campaigns generated a 5x return on ad spend. The targeting precision is remarkable.",
      image: "/api/placeholder/40/40",
      name: "Sophie Wong",
      role: "Marketing Coordinator"
    }
  ],
  website: [
    {
      text: "The new website design increased our conversion rate by 180%. The user experience is seamless and the design is stunning.",
      image: "/api/placeholder/40/40",
      name: "James Wilson",
      role: "Product Manager"
    },
    {
      text: "Our website loading speed improved dramatically and mobile optimization is perfect. Sales increased by 60% after the redesign.",
      image: "/api/placeholder/40/40",
      name: "Maria Garcia",
      role: "Operations Manager"
    },
    {
      text: "The website development process was smooth and professional. The final result exceeded our expectations completely.",
      image: "/api/placeholder/40/40",
      name: "Daniel Lee",
      role: "Startup Founder"
    }
  ]
};

const tabCategories = [
  { value: 'seo', label: 'SEO', fullName: 'Search Engine Optimization' },
  { value: 'sem', label: 'SEM', fullName: 'Search Engine Marketing' },
  { value: 'sma', label: 'SMA', fullName: 'Social Media Advertising' },
  { value: 'website', label: 'Web Design', fullName: 'Website Development' }
];

const UnifiedReviewsSection = () => {
  const [activeTab, setActiveTab] = useState('seo');

  return (
    <section className="py-20 px-4 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-coral/5" />
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 mb-4 bg-coral/20 text-coral text-sm font-medium rounded-full">
            CLIENT SUCCESS STORIES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-headline">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            Discover how we've helped businesses achieve remarkable results across all digital marketing channels.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 md:grid-cols-4 mb-12 h-auto p-1 bg-background/50 backdrop-blur-sm">
              {tabCategories.map((category) => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex flex-col items-center py-4 px-6 data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-coral transition-all duration-300 rounded-lg"
                >
                  <span className="text-sm font-bold">{category.label}</span>
                  <span className="text-xs text-muted-foreground mt-1 hidden sm:block">{category.fullName}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {tabCategories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="flex justify-center gap-8 min-h-[400px] overflow-hidden">
                  <div className="hidden lg:flex gap-8">
                    <TestimonialsColumn 
                      testimonials={reviews[category.value as keyof typeof reviews].slice(0, 1)} 
                      duration={20}
                      className="w-80"
                    />
                    <TestimonialsColumn 
                      testimonials={reviews[category.value as keyof typeof reviews].slice(1, 2)} 
                      duration={25}
                      className="w-80"
                    />
                    <TestimonialsColumn 
                      testimonials={reviews[category.value as keyof typeof reviews].slice(2, 3)} 
                      duration={22}
                      className="w-80"
                    />
                  </div>
                  
                  <div className="flex lg:hidden gap-6">
                    <TestimonialsColumn 
                      testimonials={reviews[category.value as keyof typeof reviews].slice(0, 2)} 
                      duration={20}
                      className="w-80"
                    />
                    <TestimonialsColumn 
                      testimonials={reviews[category.value as keyof typeof reviews].slice(1, 3)} 
                      duration={25}
                      className="w-80 hidden md:block"
                    />
                  </div>
                </div>

                {/* Gradient overlays */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-muted/30 to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none z-10" />
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default UnifiedReviewsSection;