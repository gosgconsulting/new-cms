import { FC, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const BaseModal: FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  className
}) => {
  const { isMobile } = useResponsive();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative w-full mx-4 animate-bounce-in",
        maxWidthClasses[maxWidth],
        isMobile && "mx-2 max-h-[90vh] overflow-y-auto"
      )}>
        <div className={cn(
          "glass bg-gradient-to-br from-card/95 to-card/85",
          "border-2 border-primary/30 rounded-2xl",
          "shadow-[0_0_50px_rgba(0,212,255,0.3)]",
          "backdrop-blur-md overflow-hidden",
          className
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-orbitron font-bold text-primary truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-primary/10 border border-primary/20 rounded-full h-10 w-10 p-0 flex-shrink-0 ml-4"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className={cn(
            "p-6",
            isMobile && "p-4"
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseModal;