
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log("Submitting form with data:", { name, email, message });
      
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          name,
          email,
          message,
          form_type: 'Contact Form'
        });

      if (error) {
        console.error("Error submitting form:", error);
        throw error;
      }

      console.log("Form submitted successfully");
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Get In Touch</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Have questions about our services or want to discuss your marketing needs? 
              Fill out the form, and we'll get back to you shortly.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-coral" />
                <a href="tel:+6580246850" className="text-lg hover:text-coral transition-colors">
                  +65 8024 6850
                </a>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-coral" />
                <a 
                  href="https://calendly.com/gosgconsulting/oliver-shih" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg hover:text-coral transition-colors"
                >
                  Schedule a meeting
                </a>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Office Hours</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>10 AM - 6 PM</span>
                </p>
                <p className="flex justify-between">
                  <span>Saturday - Sunday:</span>
                  <span>Closed</span>
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-6">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-coral hover:bg-coral/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
              
              <div className="mt-6 text-sm text-muted-foreground text-center">
                By submitting this form, you agree to our Privacy Policy and Terms of Service.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
