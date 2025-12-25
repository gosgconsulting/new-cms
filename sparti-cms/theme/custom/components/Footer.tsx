import React from 'react';

interface FooterProps {
  tenantName?: string;
  tenantSlug?: string;
}

const Footer: React.FC<FooterProps> = ({
  tenantName = 'Custom',
  tenantSlug = 'custom'
}) => {
  return (
    <footer className="border-t border-border py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <a href={`/theme/${tenantSlug}`} className="font-bold text-lg">
            {tenantName}
          </a>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
        <p className="text-center text-muted-foreground text-sm mt-6">
          © {new Date().getFullYear()} {tenantName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;