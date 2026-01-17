import React from 'react';

interface HeaderProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  onContactClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  tenantName = 'Master Template', 
  tenantSlug = 'master',
  logoSrc,
  onContactClick
}) => {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button onClick={handleLogoClick} className="cursor-pointer bg-transparent border-none">
              {logoSrc ? (
                <img 
                  src={logoSrc} 
                  alt={tenantName} 
                  className="h-8 w-auto" 
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="h-8 inline-flex items-center font-bold text-xl text-gray-900">${tenantName}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="h-8 inline-flex items-center font-bold text-xl text-gray-900">
                  {tenantName}
                </span>
              )}
            </button>
          </div>

          {/* Contact Button */}
          <div className="flex items-center gap-3">
            <button onClick={onContactClick} className="btn-cta">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
