import React from 'react';

interface ThankYouPageProps {
  tenantName?: string;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ tenantName = 'STR Fitness' }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold mb-3">Thank You</h1>
        <p className="text-muted-foreground">
          We’ve received your request. {tenantName} will get back to you shortly to confirm your 1‑on‑1 session.
        </p>
      </div>
    </div>
  );
};