import React from 'react';
import SpartiLogo from './ui/SpartiLogo';

interface FooterProps {
  tenantName?: string;
  tenantSlug?: string;
}

const Footer: React.FC<FooterProps> = ({ 
  tenantName = 'Sparti', 
  tenantSlug = 'sparti-seo-landing' 
}) => {
  return (
    <footer className="py-12 px-6 border-t border-border/50 bg-card/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <SpartiLogo size="sm" showText tenantSlug={tenantSlug} />
            <span className="text-muted-foreground">© 2024 {tenantName}. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="https://app.sparti.ai/seo-copilot-trial" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="https://app.sparti.ai/seo-copilot-trial" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="https://app.sparti.ai/seo-copilot-trial" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
