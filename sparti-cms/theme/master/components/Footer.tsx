import React from 'react';

interface FooterProps {
  tenantName?: string;
  tenantSlug?: string;
  legalLinks?: { label: string; href: string }[];
}

const Footer: React.FC<FooterProps> = ({
  tenantName = 'Master Template',
  legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
}) => {
  return (
    <footer className="bg-(--brand-background-alt) border-t border-black/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-4">
          {/* Legal links */}
          <nav aria-label="Legal links" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {legalLinks.map((link, idx) => (
                <a
                  key={`${link.label}-${idx}`}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-full max-w-4xl border-t border-black/10" />

          {/* Copyright */}
          <div className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} {tenantName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
