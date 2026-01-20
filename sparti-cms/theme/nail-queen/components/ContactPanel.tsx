"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ContactPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ContactPanel: React.FC<ContactPanelProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState(1);

  // Reset steps when closing
  useEffect(() => {
    if (!open) setStep(1);
  }, [open]);

  // Disable background scrolling while panel is open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  const canGoBack = useMemo(() => step > 1, [step]);
  const canGoNext = useMemo(() => step < 3, [step]);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="
          fixed right-0 top-0 h-screen w-full sm:w-[460px] z-[60]
          border-l border-black/5
          shadow-[inset_10px_0_30px_-20px_rgba(0,0,0,0.35)]
          data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-300
          data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-300
          ease-in-out
          bg-white
        "
      >
        <SheetHeader className="mt-8">
          <SheetTitle className="text-xl font-semibold">Contact us</SheetTitle>
          <SheetDescription className="text-sm text-gray-600">
            Tell us about your goals — we'll tailor the scope after a quick consultation.
          </SheetDescription>
        </SheetHeader>

        {/* Steps content */}
        <div className="mt-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">1. Your details</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Name</label>
                <Input placeholder="Your name" />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Email</label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Phone (optional)</label>
                <Input type="tel" placeholder="+65 1234 5678" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">2. How would you like to contact us?</h3>
              <p className="text-sm text-gray-600">Choose one option, then continue.</p>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between rounded-xl border p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-6 w-6 rounded-md bg-green-500" />
                    <div>
                      <div className="font-medium">WhatsApp</div>
                      <div className="text-xs text-gray-600">Fastest reply</div>
                    </div>
                  </div>
                </button>
                <button className="w-full flex items-center justify-between rounded-xl border p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-6 w-6 rounded-md bg-black" />
                    <div>
                      <div className="font-medium">Contact form</div>
                      <div className="text-xs text-gray-600">Email follow-up</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">3. Tell us about your request</h3>
              <Textarea rows={6} placeholder="Describe what you need help with..." />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={back} disabled={!canGoBack} className="min-w-[96px]">
            Back
          </Button>
          {canGoNext ? (
            <Button onClick={next} className="min-w-[96px]">
              Next
            </Button>
          ) : (
            <SheetClose asChild>
              <Button className="min-w-[96px]">Submit</Button>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ContactPanel;