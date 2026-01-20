import React from "react";

interface HeaderProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  basePath?: string;
  onContactClick?: () => void;
}

const normalizePath = (p: string) => p.replace(/\/+$/, "");

const Header: React.FC<HeaderProps> = ({
  tenantName = "Optimal Consulting",
  tenantSlug = "optimalconsulting",
  logoSrc,
  basePath,
  onContactClick,
}) => {
  const resolvedBasePath = basePath || `/theme/${tenantSlug}`;

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const current = normalizePath(window.location.pathname);
    const home = normalizePath(resolvedBasePath);

    if (current === home) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.location.href = home;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: '#145598' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoClick}
              className="cursor-pointer bg-transparent border-none"
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={tenantName}
                  className="h-8 w-auto"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="h-8 inline-flex items-center font-bold text-xl text-white">optimal</span>`;
                    }
                  }}
                />
              ) : (
                <span className="h-8 inline-flex items-center font-bold text-xl text-white">
                  optimal
                </span>
              )}
            </button>
          </div>

          {/* Simple nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-white">
            <a href={resolvedBasePath} className="hover:text-white/80 transition-colors">
              Home
            </a>
            <a
              href={`${normalizePath(resolvedBasePath)}/blog`}
              className="hover:text-white/80 transition-colors"
            >
              Blog
            </a>
          </nav>

          {/* Contact Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onContactClick} 
              className="contact-us-button px-4 py-2 rounded-md font-semibold text-sm transition-colors backdrop-blur-sm border border-white/20"
              style={{ 
                color: '#145598',
                backgroundColor: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
