import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
const CTASection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Form submitted:', { name, email, message });
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white/20 border-white/30 text-foreground placeholder:text-foreground/70"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/20 border-white/30 text-foreground placeholder:text-foreground/70"
                  />
                </div>
              </div>
              <div>
                <Textarea
                  placeholder="How can we help you grow your business?"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 text-foreground placeholder:text-foreground/70"
                />
              </div>
              <Button 
                type="submit" 
                variant="coral"
                size="xl"
                className="w-full group relative overflow-hidden"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Get Your Free Marketing Strategy"}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              </Button>
            </form>
          </motion.div>
          
          
        </motion.div>
      </div>
    </section>;
};
export default CTASection;