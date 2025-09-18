
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";

const HomepageTemplate = () => {
  // Template FAQ items
  const templateFaqItems = [
    {
      question: "What is your main service offering?",
      answer: "We provide comprehensive solutions tailored to your business needs. Our expert team delivers results-driven strategies that help you achieve your goals."
    },
    {
      question: "How do you ensure quality results?",
      answer: "Our proven methodology combines industry best practices with innovative approaches. We focus on measurable outcomes and continuous improvement."
    },
    {
      question: "What makes you different from competitors?",
      answer: "Our unique combination of expertise, personalized service, and cutting-edge tools sets us apart. We're committed to your success."
    }
  ];

  // Template client logos
  const templateClients = [
    { name: "Client Logo 1" },
    { name: "Client Logo 2" },
    { name: "Client Logo 3" },
    { name: "Client Logo 4" },
    { name: "Client Logo 5" },
    { name: "Client Logo 6" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-deepBlue to-deepBlue/80 -z-10"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                Your Compelling <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Headline</span> Here
              </h1>
              
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Transform your business with our expert solutions. We help companies achieve their goals through innovative strategies and proven methodologies.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="coral" size="xl" className="group">
                  <Calendar className="mr-2 h-5 w-5" />
                  Get Started Today
                </Button>
                <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Client Logos Section */}
        <section className="py-12 px-4 overflow-hidden bg-white relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 -z-10"></div>
          
          <div className="container mx-auto text-center mb-8">
            <p className="text-gray-600 font-medium">Trusted by leading companies</p>
          </div>
          
          <div className="overflow-hidden w-full">
            <motion.div
              className="flex items-center gap-12 md:gap-16 py-4"
              animate={{ x: [-1000, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {[...templateClients, ...templateClients].map((client, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-6 py-3 bg-gray-100 rounded-lg border border-gray-200"
                >
                  <span className="text-gray-700 font-medium text-sm md:text-base whitespace-nowrap">
                    {client.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
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
                Our <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Services</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Comprehensive solutions designed to drive your business forward
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {["Service 1", "Service 2", "Service 3", "Service 4", "Service 5", "Service 6"].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-brandPurple/10 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{service}</h3>
                      <p className="text-muted-foreground mb-4">
                        Professional {service.toLowerCase()} solutions that deliver measurable results and drive business growth.
                      </p>
                      <Button variant="ghost" className="text-brandPurple hover:bg-brandPurple/10 p-0">
                        Learn more →
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Counter Section */}
        <section className="py-16 px-4 bg-secondary/50">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "500+", label: "Happy Clients" },
                { number: "1000+", label: "Projects Completed" },
                { number: "5+", label: "Years Experience" },
                { number: "24/7", label: "Support Available" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-brandPurple mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
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
                What Our <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Clients Say</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Don't just take our word for it - hear from our satisfied customers
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="flex text-yellow-400 mb-2">
                          {"★".repeat(5)}
                        </div>
                        <p className="text-muted-foreground">
                          "Exceptional service and outstanding results. The team exceeded our expectations and delivered exactly what we needed."
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                        <div>
                          <div className="font-semibold">Client Name {testimonial}</div>
                          <div className="text-sm text-muted-foreground">Company Title</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 px-4 bg-secondary/50">
          <div className="container mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Us</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Key benefits that set us apart from the competition
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
              {[
                "Expert Team & Experience", 
                "Proven Track Record", 
                "Personalized Solutions", 
                "24/7 Customer Support"
              ].map((benefit, index) => (
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
                      <CheckCircle className="text-brandPurple h-6 w-6" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">{benefit}</h3>
                    <p className="text-muted-foreground">
                      Our commitment to excellence ensures you receive the highest quality service and support throughout your journey with us.
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Find answers to common questions about our services
              </p>
            </motion.div>
            
            <div className="space-y-6">
              {templateFaqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-3">{item.question}</h3>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-deepBlue to-deepBlue/80 -z-10"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Ready to Get <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Started</span>?
              </h2>
              
              <p className="text-xl text-white">
                Take the next step towards achieving your goals. Contact us today for a free consultation and discover how we can help your business grow.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="coral" size="xl" className="group">
                  <Calendar className="mr-2 h-5 w-5" />
                  Get a Free Consultation
                </Button>
                <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10">
                  View Our Work
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomepageTemplate;
