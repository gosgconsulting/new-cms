import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Phone, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ContactFormProps {
  items?: Array<{
    key: string;
    type: string;
    content?: string;
    level?: number;
    link?: string;
    items?: Array<{
      key: string;
      type: string;
      content?: string;
      label?: string;
      placeholder?: string;
      required?: boolean;
      inputType?: string;
      date?: string;
      time?: string;
      link?: string;
    }>;
  }>;
}

/**
 * ContactForm Component
 * 
 * Renders a contact form section with content from the CMS
 */
const ContactForm = ({ items = [] }: ContactFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Find items by key
  const title = items.find(item => item.key === 'title');
  const description = items.find(item => item.key === 'description');
  const contactInfoArray = items.find(item => item.key === 'contactInfo');
  const formFieldsArray = items.find(item => item.key === 'formFields');
  const officeHours = items.find(item => item.key === 'officeHours');
  const submitButton = items.find(item => item.key === 'submitButton');
  
  // Get contact info and form fields from arrays
  const contactInfo = contactInfoArray?.items || [];
  const formFields = formFieldsArray?.items || [];
  const officeHoursItems = officeHours?.items || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = {
        form_id: 'Contact Form', // This matches the form name in the database
        form_name: 'Contact Form',
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
      navigate("/thank-you");
      return;
      
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

  // Find form fields by type
  const nameField = formFields.find(field => field.key === 'name');
  const emailField = formFields.find(field => field.key === 'email');
  const phoneField = formFields.find(field => field.key === 'phone');
  const companyField = formFields.find(field => field.key === 'company');
  const messageField = formFields.find(field => field.key === 'message');

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{title.content}</h2>
            )}
            
            {description && (
              <p className="text-lg text-muted-foreground mb-8">
                {description.content}
              </p>
            )}
            
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center">
                  {info.key === 'phone' && <Phone className="h-5 w-5 mr-3 text-coral" />}
                  {info.key === 'calendar' && <Calendar className="h-5 w-5 mr-3 text-coral" />}
                  
                  {info.link ? (
                    <a href={info.link} className="text-lg hover:text-coral transition-colors" target="_blank" rel="noopener noreferrer">
                      {info.content}
                    </a>
                  ) : (
                    <span className="text-lg">{info.content}</span>
                  )}
                </div>
              ))}
            </div>
            
            {officeHoursItems.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Office Hours</h3>
                <div className="space-y-2">
                  {officeHoursItems.map((hours, index) => (
                    <p key={index} className="flex justify-between">
                      <span>{hours.date}:</span>
                      <span>{hours.time}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
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
                      {nameField && (
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2">
                            {nameField.label}{nameField.required && ' *'}
                          </label>
                          <Input
                            id="name"
                            placeholder={nameField.placeholder}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={nameField.required}
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                      
                      {emailField && (
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-2">
                            {emailField.label}{emailField.required && ' *'}
                          </label>
                          <Input
                            id="email"
                            type={emailField.inputType || 'email'}
                            placeholder={emailField.placeholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required={emailField.required}
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {phoneField && (
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-2">
                            {phoneField.label}{phoneField.required && ' *'}
                          </label>
                          <Input
                            id="phone"
                            type={phoneField.inputType || 'tel'}
                            placeholder={phoneField.placeholder}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required={phoneField.required}
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                      
                      {companyField && (
                        <div>
                          <label htmlFor="company" className="block text-sm font-medium mb-2">
                            {companyField.label}{companyField.required && ' *'}
                          </label>
                          <Input
                            id="company"
                            placeholder={companyField.placeholder}
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            required={companyField.required}
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                    </div>
                    
                    {messageField && (
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                          {messageField.label}{messageField.required && ' *'}
                        </label>
                        <Textarea
                          id="message"
                          placeholder={messageField.placeholder}
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required={messageField.required}
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                    
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
                          {submitButton?.content || 'Send Message'}
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