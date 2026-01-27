import React, { useEffect } from "react";
import { Dialog } from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import ModalContactForm from "./ModalContactForm";
import { X } from "lucide-react";
import AvatarGroup from "./AvatarGroup";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail?: string | null;
}

const ContactModal = ({ open, onOpenChange, initialEmail }: ContactModalProps) => {
  // Disable background scrolling when modal is open and prevent page shift
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const originalPaddingRight = document.body.style.paddingRight;
      const originalOverflow = document.body.style.overflow;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

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

        {/* Full screen modal content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 w-full h-full",
            "bg-white overflow-y-auto overflow-x-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "duration-200"
          )}
        >
          {/* Container with max-width for content */}
          <div className="container mx-auto max-w-4xl h-full flex flex-col px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10">
            {/* Close button */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 sm:right-6 md:right-8 top-4 sm:top-6 md:top-8 rounded-sm opacity-70 hover:opacity-100 p-2 text-neutral-700 hover:text-neutral-900 z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Title */}
            <div className="text-center mb-6 sm:mb-8 pr-8 sm:pr-12">
              <span className="text-gray-900 font-semibold text-xl sm:text-2xl">Contact us</span>
              <p className="text-gray-600 text-sm sm:text-base mt-2 sm:mt-3">
                Tell us about your goals — we'll tailor the scope after a quick consultation.
              </p>
            </div>

            {/* Multi-step contact form (includes WhatsApp option) */}
            <div className="mb-6 sm:mb-8 overflow-x-hidden flex-1">
              <ModalContactForm initialEmail={initialEmail || undefined} />
            </div>

            {/* Optional trust/avatars below form, subtle */}
            <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4">
              <AvatarGroup size="md" />
              <p className="text-xs sm:text-sm text-neutral-500">We reply within 24 hours.</p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default ContactModal;