import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import seoIcon from '@/assets/seo-icon.jpg';
import semIcon from '@/assets/sem-icon.jpg';
import smaIcon from '@/assets/sma-icon.jpg';
import websiteIcon from '@/assets/website-icon.jpg';

const services = [
  {
    title: 'SEO',
    subtitle: 'Search Engine Optimization',
    description: 'Boost your organic visibility and rank higher in search results to attract more qualified traffic.',
    image: seoIcon,
    link: '/services/seo',
    gradient: 'from-go-sg-teal to-go-sg-deep-blue',
  },
  {
    title: 'SEM',
    subtitle: 'Search Engine Marketing',
    description: 'Drive targeted traffic with strategic paid search campaigns that deliver measurable results.',
    image: semIcon,
    link: '/services/paid-ads',
    gradient: 'from-go-sg-purple to-go-sg-coral',
  },
  {
    title: 'SMA',
    subtitle: 'Social Media Advertising',
    description: 'Reach and engage your audience across all major social media platforms with compelling ads.',
    image: smaIcon,
    link: '/services/social-media',
    gradient: 'from-go-sg-coral to-go-sg-gold',
  },
  {
    title: 'Website Design',
    subtitle: 'Web Development',
    description: 'Create stunning, responsive websites that convert visitors into customers and drive growth.',
    image: websiteIcon,
    link: '/services/website-design',
    gradient: 'from-go-sg-teal to-go-sg-purple',
  },
];

const ModernServicesSection = () => {
  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-coral/5" />
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 mb-4 bg-accent/20 text-accent text-sm font-medium rounded-full">
            OUR DIGITAL MARKETING SERVICES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-headline">
            One Agency, All Channels
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            Get data-driven and strategic digital marketing solutions that deliver measurable results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card rounded-2xl p-8 border border-border hover:border-accent/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 relative overflow-hidden">
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
                
                {/* Service icon */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={service.image} 
                      alt={`${service.title} icon`}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </div>
                </div>

                {/* Service content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-accent transition-colors duration-300">
                    {service.title}
                  </h3>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                    {service.subtitle}
                  </h4>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="text-accent hover:text-accent hover:bg-accent/10 pl-0 group-hover:translate-x-2 transition-transform duration-300"
                  >
                    <Link to={service.link} className="flex items-center">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Decorative element */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button asChild size="lg" className="cta-gradient text-white px-8 py-3 rounded-full">
            <Link to="/contact">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernServicesSection;