import React from "react";
import type { FooterProps } from "../../types";

const Footer: React.FC<FooterProps> = ({
  tenantName = "Hotel Adina",
  tenantSlug = "hotel",
}) => {
  return (
    <footer className="bg-primary py-12">
      <div className="container mx-auto text-white flex items-center gap-5 sm:justify-between flex-col sm:flex-row">
        <a href={`/theme/${tenantSlug}`}>
          <img
            src={`/theme/${tenantSlug}/assets/logos/logo-white.svg`}
            alt={tenantName}
            className="w-[160px]"
          />
        </a>
        <div className="flex flex-col items-center">
          <p>
            Copyright &copy; {new Date().getFullYear()}, All Right Reserved,
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
