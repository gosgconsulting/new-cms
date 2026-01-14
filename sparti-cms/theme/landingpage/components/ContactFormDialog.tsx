import React, { useState } from 'react';
import { getTenantId } from '../../../utils/tenantConfig';

interface ContactFormSidebarProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ContactFormDialog: React.FC<ContactFormSidebarProps> = ({ 
  children, 
  isOpen: controlledOpen, 
  onOpenChange 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const setOpen = (open: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(open);
    }
    onOpenChange?.(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

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
          form_name: 'Contact Modal Form - ACATR Business Services Landing Page',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          message: formData.message,
          tenant_id: tenantId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit form' }));
        throw new Error(errorData.error || 'Failed to submit form');
      }

      const result = await response.json();
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      
      // Show success message briefly, then navigate to thank you page
      setTimeout(() => {
        setOpen(false);
        // Navigate to thank you page - use window.location for full URL navigation
        // This ensures correct navigation in standalone theme deployments
        const currentPath = window.location.pathname;
        const basePath = currentPath.replace(/\/thank-you$/, '') || '/';
        // Ensure path starts with / for absolute navigation
        const thankYouPath = basePath === '/' ? '/thank-you' : `${basePath}/thank-you`;
        // Use window.location.href for full URL navigation (works in all deployment scenarios)
        window.location.href = thankYouPath;
      }, 1500);
      
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerClick = () => {
    setOpen(true);
  };

  if (!isOpen) {
    return (
      <div onClick={handleTriggerClick} style={{ cursor: 'pointer' }}>
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={() => setOpen(false)}
      />
      
      {/* Right Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:max-w-lg transform transition-transform duration-300 ease-in-out">
        <div 
          className="h-full bg-background shadow-strong flex flex-col animate-slide-in-right border-l border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none text-xl cursor-pointer p-1 hover:bg-muted rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-muted-foreground text-sm">
              Get in touch with our ACRA-registered filing agents for professional Singapore business services. We'll respond within 4 hours.
            </p>
          </div>
          
          {/* Form Container - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-8">
            <div className="space-y-2">
              <label htmlFor="name" className="text-base font-medium">Full Name *</label>
              <input
                id="name"
                className="w-full h-12 px-3 text-base border border-input rounded-md bg-background"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-medium">Email Address *</label>
              <input
                id="email"
                type="email"
                className="w-full h-12 px-3 text-base border border-input rounded-md bg-background"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-base font-medium">Phone Number *</label>
              <input
                id="phone"
                className="w-full h-12 px-3 text-base border border-input rounded-md bg-background"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="text-base font-medium">Company Name</label>
              <input
                id="company"
                className="w-full h-12 px-3 text-base border border-input rounded-md bg-background"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter your company name (optional)"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-base font-medium">Message</label>
              <textarea
                id="message"
                className="w-full px-3 py-2 text-base border border-input rounded-md bg-background min-h-[100px] resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your business needs..."
                rows={4}
              />
            </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                  ✅ Message sent successfully! We'll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                  ❌ {errorMessage || 'Failed to send message. Please try again or contact us directly.'}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
