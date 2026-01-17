"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Loader2, MessageCircle, Send, X } from "lucide-react";
import { getTenantId } from "../../../utils/tenantConfig";

type ContactFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
};

type ContactMethod = "form" | "whatsapp";

const WHATSAPP_PHONE = "6580246850";

function getThankYouPath(): string {
  const pathname = window.location.pathname || "/";

  // Theme mode: /theme/{slug}/...
  const themeMatch = pathname.match(/^(\/theme\/[\w-]+)/);
  if (themeMatch?.[1]) {
    return `${themeMatch[1]}/thank-you`;
  }

  // Standalone mode
  return "/thank-you";
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ 
  isOpen, 
  onClose, 
  className = "" 
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2
  const [method, setMethod] = useState<ContactMethod | null>(null);

  // Step 3
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canGoNextFromStep1 = useMemo(() => {
    return name.trim().length > 0 && email.trim().length > 0;
  }, [name, email]);

  const canGoNextFromStep2 = method !== null;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setName("");
      setEmail("");
      setPhone("");
      setMethod(null);
      setMessage("");
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  }, [isOpen]);

  // Prefill the message when entering step 3
  useEffect(() => {
    if (step === 3 && message.trim().length === 0) {
      const safeName = name.trim() || "";
      const prefill = safeName ? `Hello, I am ${safeName}.\n\n` : "Hello,\n\n";
      setMessage(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const goNext = () => {
    if (step === 1) {
      if (!canGoNextFromStep1) {
        setSubmitStatus("error");
        setErrorMessage("Please fill in your name and email.");
        return;
      }
      setSubmitStatus("idle");
      setErrorMessage("");
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!canGoNextFromStep2) {
        setSubmitStatus("error");
        setErrorMessage("Please choose WhatsApp or Contact form.");
        return;
      }
      setSubmitStatus("idle");
      setErrorMessage("");
      setStep(3);
      return;
    }
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canGoNextFromStep1) {
      setSubmitStatus("error");
      setErrorMessage("Please fill in your name and email.");
      setStep(1);
      return;
    }

    if (!method) {
      setSubmitStatus("error");
      setErrorMessage("Please choose WhatsApp or Contact form.");
      setStep(2);
      return;
    }

    if (message.trim().length === 0) {
      setSubmitStatus("error");
      setErrorMessage("Please enter your message.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const tenantId = getTenantId();
      const finalMessage = `${message.trim()}\n\nPreferred contact method: ${method === "whatsapp" ? "WhatsApp" : "Contact form"}`;

      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: "contact-modal-steps",
          form_name: "Contact Modal Form (Steps) - Master Template",
          name,
          email,
          phone: phone || null,
          message: finalMessage,
          tenant_id: tenantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to submit form" }));
        throw new Error(errorData.error || "Failed to submit form");
      }

      const thankYouPath = getThankYouPath();

      if (method === "whatsapp") {
        // Redirect to thank-you first (for tracking), then thank-you page redirects to WhatsApp.
        const params = new URLSearchParams({
          via: "whatsapp",
          message,
          phone: WHATSAPP_PHONE,
        });
        window.location.href = `${thankYouPath}?${params.toString()}`;
      } else {
        // Normal thank-you flow
        window.location.href = thankYouPath;
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit form. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Contact Us
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="w-full">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                  1. Let's start with your details
                </h2>
                <p className="text-sm text-gray-600">Name and email are required.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Type your answer here..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Type your answer here..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-800 mb-2">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Type your answer here..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {submitStatus === "error" && errorMessage && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
                  <p className="font-medium">Error</p>
                  <p className="text-red-600 mt-1">{errorMessage}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled
                  className="rounded-full px-6 py-3 bg-gray-200 text-gray-600 opacity-60 cursor-not-allowed flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="btn-cta rounded-full px-7 py-3 flex items-center"
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                  2. How would you like to contact us?
                </h2>
                <p className="text-sm text-gray-600">Choose one option, then continue.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("whatsapp")}
                  className={
                    "text-left rounded-2xl border p-4 transition-colors " +
                    (method === "whatsapp"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:bg-gray-50")
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-500 text-white flex items-center justify-center">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">WhatsApp</div>
                      <div className="text-xs text-gray-600">Fastest reply</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("form")}
                  className={
                    "text-left rounded-2xl border p-4 transition-colors " +
                    (method === "form"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50")
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Send className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Contact form</div>
                      <div className="text-xs text-gray-600">Email follow-up</div>
                    </div>
                  </div>
                </button>
              </div>

              {submitStatus === "error" && errorMessage && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
                  <p className="font-medium">Error</p>
                  <p className="text-red-600 mt-1">{errorMessage}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNextFromStep2}
                  className="btn-cta rounded-full px-7 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                  3. What can we help you with?
                </h2>
                <p className="text-sm text-gray-600">
                  {method === "whatsapp"
                    ? "We'll redirect you to WhatsApp after saving your enquiry."
                    : "We'll save your enquiry and show a confirmation page."}
                </p>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-800 mb-2">
                  Your message *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  required
                />
              </div>

              {submitStatus === "error" && errorMessage && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
                  <p className="font-medium">Error</p>
                  <p className="text-red-600 mt-1">{errorMessage}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-cta rounded-full px-7 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;
