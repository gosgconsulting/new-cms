import React, { useEffect, useState } from "react";
import type { HeaderProps } from "../../types";

const Header: React.FC<HeaderProps> = ({
  tenantName = "Hotel Adina",
  tenantSlug = "hotel",
  basePath = "/theme/hotel",
  onResetFilters,
}) => {
  const [header, setHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHeader(true);
      } else {
        setHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = ["Home", "Rooms", "Restaurant", "Spa", "Contact"];

  const handleLogoClick = () => {
    window.location.href = basePath;
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <header
      className={`fixed z-50 w-full transition-all duration-300 ${
        header ? "bg-white py-6 shadow-lg" : "bg-transparent py-8"
      }`}
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center lg:justify-between gap-y-6 lg:gap-y-0">
        {/* Logo */}
        <div onClick={handleLogoClick} className="cursor-pointer">
          {header ? (
            <img
              className="w-[160px]"
              src={`/theme/${tenantSlug}/assets/logos/logo-dark.svg`}
              alt={tenantName}
            />
          ) : (
            <img
              className="w-[160px]"
              src={`/theme/${tenantSlug}/assets/logos/logo-white.svg`}
              alt={tenantName}
            />
          )}
        </div>

        {/* Nav */}
        <nav
          className={`${
            header ? "text-primary" : "text-white"
          } flex gap-x-4 lg:gap-x-8 font-tertiary tracking-[3px] text-[15px] items-center uppercase`}
        >
          {navLinks.map((link) => (
            <a
              href={basePath}
              className="transition hover:text-accent"
              key={link}
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
