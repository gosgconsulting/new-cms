import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
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
        .insert([{
          form_id: 'contact-modal',
          form_name: 'Contact Modal Form',
          name,
          email,
          phone,
          message
        }]);

      if (error) {
        console.error('Supabase error:', error);
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
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Contact Us</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-name" className="block text-sm font-medium text-gray-700 mb-2">
              Your name
            </label>
            <Input
              id="modal-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-2">
              Your email
            </label>
            <Input
              id="modal-email"
              type="email"
              placeholder="hello@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label htmlFor="modal-phone" className="block text-sm font-medium text-gray-700 mb-2">
              Your phone
            </label>
            <Input
              id="modal-phone"
              type="tel"
              placeholder="+65 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label htmlFor="modal-message" className="block text-sm font-medium text-gray-700 mb-2">
              Your message
            </label>
            <textarea
              id="modal-message"
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
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;