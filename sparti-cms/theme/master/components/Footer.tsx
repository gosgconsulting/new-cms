import React from 'react';

interface FooterProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  companyDescription?: string;
}

const Footer: React.FC<FooterProps> = ({
  tenantName = 'Master Template',
  tenantSlug = 'master',
  logoSrc,
  companyDescription = 'A reference template theme demonstrating Flowbite design system integration and best practices for creating modern, responsive websites.'
}) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const services = [
    { name: 'Features', sectionId: 'features' },
    { name: 'Services', sectionId: 'services' },
    { name: 'About', sectionId: 'about' }
  ];

  const contactInfo = [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'Phone',
      value: 'Available 9 AM - 6 PM weekdays'
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email',
      value: 'Response within 4 hours'
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Address',
      value: 'Professional business center location'
    }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
          {/* Company Info */}
          <div className="md:col-span-1">
            {logoSrc ? (
              <img 
                src={logoSrc} 
                alt={`${tenantName} Logo`} 
                className="h-12 mb-4" 
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-900 mb-4">{tenantName}</h3>
            )}
            {companyDescription && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {companyDescription}
              </p>
            )}
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-gray-900">Quick Links</h4>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.sectionId}
                  onClick={() => scrollToSection(service.sectionId)}
                  className="block text-sm text-gray-600 hover:text-blue-600 transition-colors text-left"
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-gray-900">Contact</h4>
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-gray-600 mt-0.5">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{info.label}</p>
                    <p className="text-sm text-gray-600">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 my-12" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} {tenantName}. All rights reserved.
          </div>
          <div className="text-sm text-gray-600">
            Powered by Flowbite Design System
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
