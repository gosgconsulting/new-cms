import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ContactSection = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          name,
          email,
          message: `Phone: ${phone}\n\nMessage: ${message}`,
          form_type: 'Contact Page'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Thank you!",
        description: "We'll be in touch soon to discuss your SEO needs.",
      });
      
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Split Layout Contact Section */}
      <div className="relative min-h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-red-900">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[400px]">
            {/* Left Side - Large Text */}
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-white">Dominate</span> <br />
                <span className="text-white">search results</span> <br />
                <span className="text-white">with our SEO</span> <br />
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">expertise.</span>
              </h2>
            </div>
            
            {/* Right Side - Contact Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Us Today</h3>
                  <p className="text-gray-600">Welcome to GO SG — Start your journey</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your name
                    </label>
                    <Input
                      id="contact-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Your email
                    </label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="hello@yourcompany.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Your phone
                    </label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="+65 1234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
                      Your message
                    </label>
                    <textarea
                      id="contact-message"
                      placeholder="Tell us about your project..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    {isSubmitting ? "Sending..." : "Start Your SEO Journey"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;