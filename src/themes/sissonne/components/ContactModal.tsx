import React, { useEffect } from "react";
import { Dialog } from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import ModalContactForm from "./ModalContactForm";
import { X } from "lucide-react";

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

  // custom slide-in-from-right animations (for sidebar drawer)
  useEffect(() => {
    const styleId = "contact-modal-animations";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes slideInFromRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes slideOutToRight {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
      }
      .contact-modal-content[data-state="open"] {
        animation: slideInFromRight 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
      }
      .contact-modal-content[data-state="closed"] {
        animation: slideOutToRight 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
      }
      .contact-modal-content {
        width: 100% !important;
      }
      @media (min-width: 640px) {
        .contact-modal-content {
          width: 30% !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) document.head.removeChild(existingStyle);
    };
  }, []);

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

        {/* Sidebar drawer content */}
        <DialogPrimitive.Content
          className={cn(
            "contact-modal-content",
            "fixed inset-y-0 right-0 z-50 w-full sm:w-[30%] h-full bg-white shadow-2xl p-6 overflow-y-auto"
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
            <span className="text-gray-900 font-semibold text-xl">Book a Trial</span>
            <p className="text-gray-600 text-sm mt-2">
              Fill out the form below and we will get back to you as soon as possible.
            </p>
          </div>

          {/* Multi-step contact form */}
          <div>
            <ModalContactForm />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default ContactModal;
