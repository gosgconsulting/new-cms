import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted:", { name, email, phone, company, message });
      setIsSubmitting(false);
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setMessage("");
    }, 1000);
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

          <div className="mt-4 sm:mt-2 flex justify-center">
            <Button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-6 py-4 sm:py-5 font-semibold shadow-lg w-full sm:w-auto"
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
