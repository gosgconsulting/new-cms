import { FC, ReactNode, ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface BaseTouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'neon';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  icon?: ReactNode;
  className?: string;
}

const BaseTouchButton: FC<BaseTouchButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  isLoading = false,
  icon,
  className,
  ...props
}) => {
  const { isMobile } = useResponsive();

  // Ensure minimum touch target size on mobile
  const touchOptimizedClasses = isMobile 
    ? "min-h-touch min-w-touch"
    : "";

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isLoading || props.disabled}
      className={cn(
        touchOptimizedClasses,
        "transition-all duration-200",
        "active:scale-95", // Touch feedback
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {isMobile ? 'Loading...' : children}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {icon}
          {children}
        </div>
      )}
    </Button>
  );
};

export default BaseTouchButton;