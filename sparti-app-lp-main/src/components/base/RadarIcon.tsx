import { FC } from 'react';
import { cn } from '@/lib/utils';

interface RadarIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'accent' | 'muted';
  className?: string;
}

const RadarIcon: FC<RadarIconProps> = ({ 
  size = 'md', 
  variant = 'primary',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16', 
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const variantClasses = {
    primary: 'border-primary/30 [&_.radar-line]:bg-primary [&_.center-line]:bg-primary',
    accent: 'border-accent/30 [&_.radar-line]:bg-accent [&_.center-line]:bg-accent',
    muted: 'border-muted-foreground/30 [&_.radar-line]:bg-muted-foreground [&_.center-line]:bg-muted-foreground'
  };

  return (
    <div className={cn(
      "relative rounded-full",
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {/* Outer rings */}
      <div className="absolute inset-0 rounded-full border-2 animate-radar-pulse"></div>
      <div className="absolute inset-[10%] rounded-full border-2 opacity-60 animate-radar-pulse-delayed"></div>
      <div className="absolute inset-[20%] rounded-full border-2 opacity-40 animate-radar-pulse-delayed-2"></div>
      <div className="absolute inset-[30%] rounded-full border-2 opacity-20"></div>
      
      {/* Center vertical line */}
      <div className="absolute top-1/2 left-1/2 w-0.5 h-[30%] center-line transform -translate-x-1/2 -translate-y-full"></div>
      
      {/* Rotating radar sweep line */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-0.5 h-1/2 radar-line bg-gradient-to-t from-current to-transparent transform -translate-x-1/2 -translate-y-full origin-bottom animate-radar-sweep"></div>
      </div>
    </div>
  );
};

export default RadarIcon;