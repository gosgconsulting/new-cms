import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ModalTwoStepFormProps = {
  className?: string;
};

const ModalTwoStepForm: React.FC<ModalTwoStepFormProps> = ({ className = "" }) => {
  const { toast } = useToast();

  const [step, setStep] = useState<0 | 1>(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canGoNext = name.trim().length > 0 && email.trim().length > 0;

  const handleNext = () => {
    if (!canGoNext) {
      toast({
        title: "Please complete your details",
        description: "Name and email are required to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep(1);
  };

  const handleBack = () => setStep(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Message is required",
        description: "Please tell us briefly about your goals.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = {
      form_id: "Contact Form",
      form_name: "Contact Form",
      name,
      email,
      phone: phone || null,
      company: company || null,
      message,
      ip_address: null,
      user_agent: navigator.userAgent,
    };

    const submitResp = await fetch("/api/form-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!submitResp.ok) {
      setIsSubmitting(false);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
      return;
    }

    // Fire-and-forget email
    fetch("/api/send-contact-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        company,
        subject: `New inquiry from ${name}`,
        message,
      }),
    }).catch(() => {});

    toast({
      title: "Message sent successfully!",
      description: "Thank you — we’ll get back to you within 24 hours.",
    });

    // Reset
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setMessage("");
    setStep(0);
    setIsSubmitting(false);
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6 p-2">
        {/* Step indicator */}
        <div className="flex items-center justify-between text-sm text-neutral-700">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${step === 0 ? "bg-brandPurple text-white" : "bg-neutral-200 text-neutral-700"} font-semibold`}>
              1
            </span>
            <span className={`${step === 0 ? "font-semibold text-brandPurple" : ""}`}>Your Details</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${step === 1 ? "bg-brandPurple text-white" : "bg-neutral-200 text-neutral-700"} font-semibold`}>
              2
            </span>
            <span className={`${step === 1 ? "font-semibold text-brandPurple" : ""}`}>Your Message</span>
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-5" role="region" aria-label="Your Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleNext}
                className="rounded-2xl bg-brandPurple hover:bg-brandPurple/90 text-white px-6 py-5 font-semibold"
              >
                <span className="flex items-center gap-2">
                  <span>Next</span>
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5" role="region" aria-label="Your Message">
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2 text-violet-700">
                Message *
              </label>
              <Textarea
                id="message"
                rows={5}
                placeholder="Tell us briefly about your goals"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting}
                className="focus-visible:ring-brandPurple focus-visible:border-brandPurple"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                onClick={handleBack}
                variant="ghost"
                className="rounded-2xl px-6 py-5"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </span>
              </Button>

              <Button
                type="submit"
                variant="branded"
                className="rounded-2xl text-white px-6 py-5 font-semibold shadow-lg"
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

            <div className="mt-2 text-center text-xs text-violet-900/80">
              By submitting, you agree to our Privacy Policy and Terms of Service.
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ModalTwoStepForm;