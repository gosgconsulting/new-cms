import React from 'react';

interface FooterProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  companyDescription?: string;
  onContactClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ 
  tenantName = 'GO SG Consulting',
  tenantSlug = 'gosgconsulting',
  logoSrc,
  companyDescription = 'Full-stack digital growth solution helping brands grow their revenue and leads through comprehensive digital marketing services.',
  onContactClick 
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-16 px-4">
      <div className="container mx-auto">
        {/* Bottom Bar - Legal Links */}
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
              <a href="/privacy-policy" className="hover:text-brandTeal transition-colors">
                Privacy Policy
              </a>
              <a href="/terms-conditions" className="hover:text-brandTeal transition-colors">
                Terms of Service
              </a>
              <a href={`/theme/${tenantSlug}/blog`} className="hover:text-brandTeal transition-colors">
                Blog
              </a>
            </div>
            
            <p className="text-sm text-gray-400">
              © {currentYear} {tenantName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;