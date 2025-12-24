import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface ContactFormDialogProps {
  children: React.ReactNode;
  buttonText?: string;
}

export const ContactFormDialog = ({ children, buttonText }: ContactFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const message = `New Business Inquiry from ${formData.name}
    
Company: ${formData.company || 'Not specified'}
Email: ${formData.email}
Phone: ${formData.phone}

Message: ${formData.message || 'No additional message'}`;

    const subject = encodeURIComponent("Business Inquiry from " + formData.name);
    const body = encodeURIComponent(message);
    window.open(`mailto:info@acatr.com?subject=${subject}&body=${body}`);

    toast({
      title: "Contact request sent!",
      description: "We'll get back to you via email shortly."
    });

    setOpen(false);
    setFormData({ name: "", email: "", phone: "", company: "", message: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-center text-2xl">Contact Us</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-12 py-4">
          {/* Form Fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">Full Name *</Label>
              <Input
                id="name"
                className="h-12 text-base"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                className="h-12 text-base"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium">Phone Number *</Label>
              <Input
                id="phone"
                className="h-12 text-base"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-base font-medium">Company Name</Label>
              <Input
                id="company"
                className="h-12 text-base"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter your company name (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-base font-medium">Message</Label>
              <Textarea
                id="message"
                className="text-base min-h-[100px] resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your business needs..."
                rows={4}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-opacity text-base">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};