import { FC, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  isVerified: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

const VerificationBadge: FC<VerificationBadgeProps> = ({ 
  isVerified, 
  className = '',
  size = 'md'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  const checkSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3'
  };

  return (
    <div 
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Verification Badge */}
      <div 
        className={cn(
          'rounded-full flex items-center justify-center cursor-default',
          'bg-[#4A90E2] border-2 border-white shadow-sm',
          sizeClasses[size]
        )}
      >
        <Check 
          className={cn(
            'text-white stroke-[3]',
            checkSizeClasses[size]
          )} 
        />
      </div>

      {/* Hover Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-background border border-primary/20 rounded-lg shadow-lg p-3 min-w-[280px] glass backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-[#4A90E2]" />
              <span className="font-medium text-sm text-foreground">Verified Pet-Friendly</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              This location is verified through Google My Business as pet-friendly or dog-allowed.
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Source: Google My Business API
            </p>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationBadge;