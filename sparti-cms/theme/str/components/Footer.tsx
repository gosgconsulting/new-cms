"use client";

import React from 'react';

interface FooterProps {
  tenantName?: string;
  tenantSlug?: string;
}

const Footer: React.FC<FooterProps> = ({ tenantName = 'STR', tenantSlug = 'str' }) => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-semibold text-lg">{tenantName}</div>
          <div className="mt-3 flex items-center gap-3 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-foreground">IG</a>
            <a href="#" aria-label="Facebook" className="hover:text-foreground">FB</a>
            <a href="#" aria-label="WhatsApp" className="hover:text-foreground">WA</a>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-3">Menu</div>
          <div className="space-y-2 text-muted-foreground">
            <a href="#" onClick={(e) => { e.preventDefault(); const el = document.getElementById('programmes'); el && el.scrollIntoView({ behavior: 'smooth' }); }}>Our Programmes</a>
            <a href="#" onClick={(e) => { e.preventDefault(); const el = document.getElementById('gallery'); el && el.scrollIntoView({ behavior: 'smooth' }); }}>Gallery</a>
            <a href="#" onClick={(e) => { e.preventDefault(); const el = document.getElementById('team'); el && el.scrollIntoView({ behavior: 'smooth' }); }}>Our Team</a>
            <a href="#" onClick={(e) => { e.preventDefault(); const el = document.getElementById('faq'); el && el.scrollIntoView({ behavior: 'smooth' }); }}>FAQ</a>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-3">Customer Support</div>
          <div className="space-y-2 text-muted-foreground">
            <a href={`/theme/${tenantSlug}/privacy-policy`} className="hover:text-foreground">Privacy Policy</a>
            <a href={`/theme/${tenantSlug}/terms-conditions`} className="hover:text-foreground">Terms & Conditions</a>
            <a href="#" className="hover:text-foreground">Cookie Policy</a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} {tenantName}. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href={`/theme/${tenantSlug}/privacy-policy`} className="hover:text-foreground">Privacy</a>
            <a href={`/theme/${tenantSlug}/terms-conditions`} className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;