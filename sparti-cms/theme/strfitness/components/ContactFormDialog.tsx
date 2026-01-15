import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ContactFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export const ContactFormDialog: React.FC<ContactFormDialogProps> = ({ isOpen, onOpenChange, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book a 1‑on‑1 Session</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-4">
          <p>
            Thanks for your interest. Replace this dialog content with your booking or contact form.
          </p>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};