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
}

const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
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

        {/* Centered modal content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "bg-white shadow-2xl rounded-lg p-6 overflow-y-auto",
            "max-h-[90vh]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "duration-200"
          )}
        >
          {/* Close button */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 p-2 text-neutral-700 hover:text-neutral-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Title */}
          <div className="text-center mb-4 pr-8">
            <span className="text-gray-900 font-semibold text-xl">Contact us</span>
            <p className="text-gray-600 text-sm mt-2">
              Tell us about your goals — we'll tailor the scope after a quick consultation.
            </p>
          </div>

          {/* Multi-step contact form (includes WhatsApp option) */}
          <div>
            <ModalContactForm />
          </div>

          {/* Optional trust/avatars below form, subtle */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <AvatarGroup size="md" />
            <p className="text-xs text-neutral-500">We reply within 24 hours.</p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default ContactModal;