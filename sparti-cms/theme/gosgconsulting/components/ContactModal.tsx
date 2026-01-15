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
  // Disable background scrolling when sidebar is open and prevent page shift
  useEffect(() => {
    if (open) {
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Store original padding-right value
      const originalPaddingRight = document.body.style.paddingRight;
      const originalOverflow = document.body.style.overflow;
      
      // Apply styles to prevent page shift
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original styles
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Add custom animation styles
  useEffect(() => {
    const styleId = 'contact-modal-animations';
    if (document.getElementById(styleId)) return; // Don't add duplicate styles
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes slideInFromRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
      @keyframes slideOutToRight {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(100%);
        }
      }
      .contact-modal-content[data-state="open"] {
        animation: slideInFromRight 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
      }
      .contact-modal-content[data-state="closed"] {
        animation: slideOutToRight 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  const handleChooseWhatsApp = () => {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Transparent overlay adds blur to page and blocks background interactions */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-40 bg-transparent backdrop-blur-sm",
            "transition-opacity duration-300 ease-out",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "contact-modal-content",
            "fixed inset-0 z-50 w-full h-full sm:right-0 sm:top-0 sm:left-auto sm:w-[420px] lg:w-[520px] sm:h-screen bg-gray-50 shadow-2xl p-0 overflow-y-auto",
            "will-change-transform"
          )}
        >
          <div className="h-full flex flex-col min-h-screen sm:min-h-0">
            {/* Header with proper mobile padding */}
            <div className="flex items-center justify-between px-4 sm:px-4 py-4 sm:py-3 pt-8 sm:pt-3 safe-area-inset-top">
              <span className="text-gray-800 font-semibold text-lg">Contact us</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-full text-black hover:text-black/80 p-2"
                aria-label="Close"
              >
                <X className="h-7 w-7" />
              </Button>
            </div>
            
            {/* Content with proper mobile padding */}
            <div className="flex-1 px-4 sm:px-4 py-4 pb-8 sm:pb-4 safe-area-inset-bottom bg-gray-50">
              <p className="text-gray-600 text-sm mb-4">
                Tell us about your goals — we'll tailor the scope after a quick consultation.
              </p>
              <ModalContactForm />
              
              {/* Avatars and WhatsApp below the form */}
              <div className="mt-8 sm:mt-6 flex flex-col items-center gap-4 sm:gap-3">
                <AvatarGroup size="md" />
                <Button
                  type="button"
                  onClick={handleChooseWhatsApp}
                  className="rounded-full bg-brandPurple text-white hover:bg-brandPurple hover:text-white border border-brandPurple px-6 py-4 font-semibold transition-colors w-full sm:w-auto"
                >
                  <span className="flex items-center gap-3">
                    <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
                      <MessageCircle className="w-4 h-4" />
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
                    </span>
                    <span>WhatsApp</span>
                  </span>
                </Button>
              </div>
              
              {/* Extra bottom padding for mobile */}
              <div className="mt-8 sm:mt-6" />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default ContactModal;