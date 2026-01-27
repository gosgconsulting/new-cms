import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, ArrowRight, Loader2, MessageCircle, Send } from "lucide-react";
import { getTenantId } from "../../../utils/tenantConfig";

type ModalContactFormProps = {
  className?: string;
  initialEmail?: string;
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

const ModalContactForm: React.FC<ModalContactFormProps> = ({ className = "", initialEmail }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail || "");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  // Update email when initialEmail prop changes
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

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
          form_id: 28,
          form_name: "Contact Modal Form (Steps) - GO SG Consulting",
          name,
          email,
          phone: phone || null,
          company: company || null,
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

  return (
    <div className={`w-full overflow-x-hidden ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={
          "w-full rounded-[28px] border border-neutral-200 bg-white/80 backdrop-blur-sm " +
          "shadow-[0_14px_40px_rgba(0,0,0,0.12)] p-6 sm:p-8 md:p-10 overflow-x-hidden"
        }
      >
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                1. Let's start with your details
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">Name and email are required.</p>
            </div>

            {/* Always 1 column (no 2-col layout) */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-800 mb-2">
                  Full Name *
                </label>
                <Input
                  id="name"
                  placeholder="Type your answer here..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl bg-white border border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-800 mb-2">
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Type your answer here..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl bg-white border border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-800 mb-2">
                  Phone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Type your answer here..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl bg-white border border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-neutral-800 mb-2">
                  Company
                </label>
                <Input
                  id="company"
                  placeholder="Type your answer here..."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl bg-white border border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900"
                />
              </div>
            </div>

            {submitStatus === "error" && errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm w-full break-words overflow-wrap-anywhere">
                <p className="font-medium">Error</p>
                <p className="text-red-600 mt-1 break-words overflow-wrap-anywhere">{errorMessage}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end pt-4 sm:pt-6 gap-4 w-full">
              <Button
                type="button"
                variant="outline"
                disabled
                className="rounded-full px-6 py-5 opacity-60 w-full sm:w-auto sm:mr-auto shrink-0 min-w-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2 shrink-0" /> <span className="truncate">Back</span>
              </Button>
              <Button
                type="button"
                onClick={goNext}
                className="rounded-full text-white px-7 py-5 transition-all shadow-sm w-full sm:w-auto shrink-0 min-w-0 flex-shrink-0"
                style={{
                  background: 'linear-gradient(to right, #FF6B35, #FFA500)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #FF5722, #FF9800)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #FF6B35, #FFA500)';
                }}
              >
                <span className="truncate">Next</span> <ArrowRight className="h-4 w-4 ml-2 shrink-0" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                2. How would you like to contact us?
              </h2>
              <p className="text-sm text-neutral-600">Choose one option, then continue.</p>
            </div>

            {/* Keep selections in 1 column */}
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setMethod("whatsapp")}
                className={
                  "text-left rounded-2xl border p-4 transition-colors " +
                  (method === "whatsapp"
                    ? "border-green-500 bg-green-50"
                    : "border-neutral-200 bg-white hover:bg-neutral-50")
                }
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-500 text-white flex items-center justify-center">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">WhatsApp</div>
                    <div className="text-xs text-neutral-600">Fastest reply</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod("form")}
                className={
                  "text-left rounded-2xl border p-4 transition-colors " +
                  (method === "form"
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 bg-white hover:bg-neutral-50")
                }
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">Contact form</div>
                    <div className="text-xs text-neutral-600">Email follow-up</div>
                  </div>
                </div>
              </button>
            </div>

            {submitStatus === "error" && errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm w-full break-words overflow-wrap-anywhere">
                <p className="font-medium">Error</p>
                <p className="text-red-600 mt-1 break-words overflow-wrap-anywhere">{errorMessage}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end pt-4 sm:pt-6 gap-4 w-full">
              <Button type="button" variant="outline" onClick={goBack} className="rounded-full px-6 py-5 w-full sm:w-auto sm:mr-auto shrink-0 min-w-0">
                <ArrowLeft className="h-4 w-4 mr-2 shrink-0" /> <span className="truncate">Back</span>
              </Button>
              <Button
                type="button"
                onClick={goNext}
                disabled={!canGoNextFromStep2}
                className="rounded-full text-white px-7 py-5 disabled:opacity-50 transition-all shadow-sm w-full sm:w-auto shrink-0 min-w-0 flex-shrink-0"
                style={{
                  background: !canGoNextFromStep2 ? '#ccc' : 'linear-gradient(to right, #FF6B35, #FFA500)',
                }}
                onMouseEnter={(e) => {
                  if (canGoNextFromStep2) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #FF5722, #FF9800)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canGoNextFromStep2) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #FF6B35, #FFA500)';
                  }
                }}
              >
                <span className="truncate">Next</span> <ArrowRight className="h-4 w-4 ml-2 shrink-0" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                3. What can we help you with?
              </h2>
              <p className="text-sm text-neutral-600">
                {method === "whatsapp"
                  ? "We'll redirect you to WhatsApp after saving your enquiry."
                  : "We'll save your enquiry and show a confirmation page."}
              </p>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-neutral-800 mb-2">
                Your message *
              </label>
              <Textarea
                id="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                className="rounded-xl bg-white focus-visible:ring-2 focus-visible:ring-neutral-900/20"
              />
            </div>

            {submitStatus === "error" && errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm w-full break-words overflow-wrap-anywhere">
                <p className="font-medium">Error</p>
                <p className="text-red-600 mt-1 break-words overflow-wrap-anywhere">{errorMessage}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end pt-4 sm:pt-6 gap-4 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="rounded-full px-6 py-5 w-full sm:w-auto sm:mr-auto shrink-0 min-w-0"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2 shrink-0" /> <span className="truncate">Back</span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full text-white px-7 py-5 transition-all shadow-sm w-full sm:w-auto shrink-0 min-w-0 flex-shrink-0"
                style={{
                  background: isSubmitting ? '#ccc' : 'linear-gradient(to right, #FF6B35, #FFA500)',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #FF5722, #FF9800)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #FF6B35, #FFA500)';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" />
                    <span className="truncate">Sending...</span>
                  </>
                ) : (
                  <>
                    <span className="truncate">Send</span> <ArrowRight className="h-4 w-4 ml-2 shrink-0" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ModalContactForm;