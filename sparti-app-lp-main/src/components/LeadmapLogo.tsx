import { cn } from '@/lib/utils';

interface SpartiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
}

const SpartiLogo = ({ 
  className, 
  size = 'md', 
  showText = true,
  onClick 
}: SpartiLogoProps) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto', 
    lg: 'h-16 w-auto'
  };

  const logoSrc = '/lovable-uploads/sparti-logo-light.png';

  return (
    <div 
      className={cn(
        "flex items-center", 
        onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : "",
        className
      )}
      onClick={onClick}
    >
      <img 
        src={logoSrc}
        alt="Sparti Logo"
        className={cn(
          sizeClasses[size],
          "object-contain transition-transform hover:scale-105"
        )}
      />
    </div>
  );
};

export default SpartiLogo;