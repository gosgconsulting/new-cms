import React from 'react';

interface FooterProps {
  tenantName?: string;
}

const Footer: React.FC<FooterProps> = ({ tenantName = 'STR Fitness' }) => {
  return (
    <footer className="w-full border-t border-border/60 bg-background">
      <div className="max-w-6xl mx-auto p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} {tenantName}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;