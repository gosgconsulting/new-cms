
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Phone, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = {
        form_id: 'homepage_contact',
        form_name: 'Homepage Contact Form',
        name,
        email,
        phone: phone || null,
        company: company || null,
        message,
        ip_address: null, // Will be set by server
        user_agent: navigator.userAgent
      };

      console.log("Submitting contact form:", formData);

      // Submit to form submissions API
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Form submission successful:", result);

      // Also send email notification
      try {
        await fetch('/api/send-contact-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            company,
            subject: `New inquiry from ${name}`,
            message,
          }),
        });
        console.log("Contact email sent successfully");
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail the form submission if email fails
      }

      setIsSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "Thank you for your inquiry. We'll get back to you within 24 hours.",
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setName("");
        setEmail("");
        setPhone("");
        setCompany("");
        setMessage("");
        setIsSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message. Please try again or contact us directly.",
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
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2 text-green-600">Message Sent!</h3>
                  <p className="text-muted-foreground mb-4">
                    Thank you for your inquiry. We'll get back to you within 24 hours.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    This form will reset automatically...
                  </div>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold mb-6">Send Us a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Name *
                        </label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2">
                          Phone
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+65 8024 6850"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium mb-2">
                          Company
                        </label>
                        <Input
                          id="company"
                          placeholder="Your company name"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project or how we can help you..."
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-coral hover:bg-coral/90 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
              
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
