import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";
import { getTenantId } from "../../../utils/tenantConfig";

type ModalContactFormProps = {
  className?: string;
};

const ModalContactForm: React.FC<ModalContactFormProps> = ({ className = "" }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name || !email || !message) {
      setSubmitStatus('error');
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage("");

    try {
      // Get current tenant ID
      const tenantId = getTenantId();
      
      // Submit to backend API
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_id: 'contact-modal',
          form_name: 'Contact Modal Form - GO SG Consulting',
          name: name,
          email: email,
          phone: phone || null,
          company: company || null,
          message: message,
          tenant_id: tenantId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit form' }));
        throw new Error(errorData.error || 'Failed to submit form');
      }

      // Reset form fields
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setMessage("");

      // Redirect to thank-you page using window.location for full URL navigation
      // This ensures correct navigation in standalone theme deployments
      const currentPath = window.location.pathname;
      const basePath = currentPath.replace(/\/thank-you$/, '') || '/';
      const thankYouPath = basePath === '/' ? '/thank-you' : `${basePath}/thank-you`;
      window.location.href = thankYouPath;
      
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200"
      >
        {/* Fields container */}
        <div className="rounded-xl bg-white p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-violet-700">
                Name *
              </label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                className="focus-visible:ring-brandPurple focus-visible:border-brandPurple"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-violet-700">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="focus-visible:ring-brandPurple focus-visible:border-brandPurple"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2 text-violet-700">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+65 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
                className="focus-visible:ring-brandPurple focus-visible:border-brandPurple"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2 text-violet-700">
                Company
              </label>
              <Input
                id="company"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isSubmitting}
                className="focus-visible:ring-brandPurple focus-visible:border-brandPurple"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2 text-violet-700">
              Message *
            </label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Tell us briefly about your goals"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={isSubmitting}
              className="focus-visible:ring-brandPurple focus-visible:border-brandPurple"
            />
          </div>

          {submitStatus === 'error' && errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
              <p className="font-medium">Error sending message</p>
              <p className="text-red-600 mt-1">{errorMessage}</p>
            </div>
          )}

          <div className="mt-4 sm:mt-2 flex justify-center">
            <Button
              type="submit"
              className="rounded-2xl bg-brandPurple text-white hover:bg-brandPurple hover:text-white border border-brandPurple px-6 py-4 sm:py-5 font-semibold transition-colors w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ModalContactForm;