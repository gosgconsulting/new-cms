import { FC } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import RadarIcon from './RadarIcon';

interface BaseLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'primary' | 'accent' | 'muted';
  type?: 'spinner' | 'radar';
}

const BaseLoadingSpinner: FC<BaseLoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className,
  variant = 'primary',
  type = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  const variantClasses = {
    primary: 'text-primary',
    accent: 'text-accent',
    muted: 'text-muted-foreground'
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {type === 'radar' ? (
        <RadarIcon 
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm'}
          variant={variant}
        />
      ) : (
        <Loader2 className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant]
        )} />
      )}
      {text && (
        <span className={cn(
          "text-sm font-medium",
          variantClasses[variant]
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

export default BaseLoadingSpinner;