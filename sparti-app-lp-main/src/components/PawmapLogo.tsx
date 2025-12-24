import { FC } from 'react';

const pawLogoLocation = '/lovable-uploads/fdf50f0b-774e-446a-a665-fd0f957b37fa.png';

interface PawmapLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PawmapLogo: FC<PawmapLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img 
        src={pawLogoLocation} 
        alt="Pawmap Cyberpunk Logo" 
        className={`${iconSizes[size]} object-contain`}
        style={{ background: 'transparent' }}
      />
      
      <h1 className={`
        ${sizeClasses[size]} 
        font-montserrat font-black bg-gradient-to-r from-accent via-primary to-lead-orange 
        bg-clip-text text-transparent 
        tracking-wider uppercase
        relative leading-tight
      `}
      style={{
        fontWeight: '900',
        letterSpacing: '0.1em'
      }}
      >
        PAWMAP
      </h1>
    </div>
  );
};

export default PawmapLogo;