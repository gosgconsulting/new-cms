import React, { useEffect } from "react";
import { Dialog } from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import ModalContactForm from "./ModalContactForm";
import { X, MessageCircle } from "lucide-react";
import AvatarGroup from "./AvatarGroup";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=6580246850";

const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
  // Disable background scrolling when modal is open and prevent page shift
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const originalPaddingRight = document.body.style.paddingRight;
      const originalOverflow = document.body.style.overflow;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  const handleChooseWhatsApp = () => {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Semi-dark overlay with subtle blur */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]",
            "transition-opacity duration-300 ease-out",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
          )}
        />
        {/* Centered modal content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl bg-white shadow-2xl p-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
          )}
        >
          {/* Close button */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 rounded-full text-neutral-700 hover:text-neutral-900 p-2"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Title */}
          <div className="text-center mb-4">
            <span className="text-gray-900 font-semibold text-xl">Contact us</span>
            <p className="text-gray-600 text-sm mt-2">
              Tell us about your goals — we'll tailor the scope after a quick consultation.
            </p>
          </div>

          {/* WhatsApp CTA */}
          <div className="mb-5">
            <Button
              type="button"
              onClick={handleChooseWhatsApp}
              className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
                  <MessageCircle className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
                </span>
                <span>WhatsApp</span>
              </span>
            </Button>
          </div>

          {/* Divider with "or" */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-full bg-neutral-200" />
            <span className="text-xs text-neutral-500 uppercase tracking-wide">or</span>
            <div className="h-px w-full bg-neutral-200" />
          </div>

          {/* Contact form (brand content) */}
          <div>
            <ModalContactForm />
          </div>

          {/* Optional trust/avatars below form, subtle */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <AvatarGroup size="md" />
            <p className="text-xs text-neutral-500">
              We reply within 24 hours.
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default ContactModal;