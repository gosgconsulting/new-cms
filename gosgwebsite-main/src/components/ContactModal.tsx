import React, { useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ModalContactForm from "@/components/ModalContactForm";
import { X, MessageCircle } from "lucide-react";
import AvatarGroup from "@/components/AvatarGroup";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=6580246850";

const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
  // Disable background scrolling when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  const handleChooseWhatsApp = () => {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Transparent overlay adds blur to page and blocks background interactions */}
        <DialogPrimitive.Overlay
          className={cn("fixed inset-0 z-40 bg-transparent backdrop-blur-sm")}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 w-full h-full sm:right-0 sm:top-0 sm:left-auto sm:w-[420px] lg:w-[520px] sm:h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-indigo-800 shadow-2xl p-0 overflow-y-auto"
          )}
        >
          <div className="h-full flex flex-col min-h-screen sm:min-h-0">
            {/* Header with proper mobile padding */}
            <div className="flex items-center justify-between px-4 sm:px-4 py-4 sm:py-3 pt-8 sm:pt-3 safe-area-inset-top">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur px-4 py-2 text-sm text-white/90">
                Contact Us
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-full text-white hover:text-white/90 p-2"
                aria-label="Close"
              >
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            
            {/* Content with proper mobile padding */}
            <div className="flex-1 px-4 sm:px-4 py-4 pb-8 sm:pb-4 safe-area-inset-bottom">
              <ModalContactForm />
              
              {/* Avatars and WhatsApp below the form */}
              <div className="mt-8 sm:mt-6 flex flex-col items-center gap-4 sm:gap-3">
                <AvatarGroup size="md" />
                <Button
                  type="button"
                  onClick={handleChooseWhatsApp}
                  className="rounded-full bg-gradient-to-r from-[#9b87f5] via-[#7E69AB] to-[#0EA5E9] hover:from-[#8c7af2] hover:to-[#0d94dd] text-white px-6 py-4 font-semibold shadow-[0_18px_45px_-10px_rgba(124,58,237,0.55)] transition-all duration-300 w-full sm:w-auto"
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