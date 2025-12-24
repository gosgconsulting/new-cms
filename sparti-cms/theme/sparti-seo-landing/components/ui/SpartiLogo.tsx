import React from 'react';

interface SpartiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
  tenantSlug?: string;
}

const SpartiLogo: React.FC<SpartiLogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true,
  onClick,
  tenantSlug = 'sparti-seo-landing'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto', 
    lg: 'h-16 w-auto'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const logoSrc = `/theme/${tenantSlug}/assets/logos/sparti-logo-light.png`;

  return (
    <div 
      className={`flex items-center ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${className}`}
      onClick={onClick}
    >
      <img 
        src={logoSrc}
        alt="Sparti Logo"
        className={`${sizeClasses[size]} object-contain transition-transform hover:scale-105`}
        onError={(e) => {
          // Fallback to text logo if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const textLogo = target.nextElementSibling as HTMLElement;
          if (textLogo) {
            textLogo.style.display = 'block';
          }
        }}
      />
      {showText && (
        <span 
          className={`font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ${textSizeClasses[size]} hidden`}
          style={{ display: 'none' }}
        >
          Sparti
        </span>
      )}
    </div>
  );
};

export default SpartiLogo;
