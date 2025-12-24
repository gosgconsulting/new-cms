import { createPortal } from 'react-dom';
import { Loader2, LucideIcon } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  progress?: string;
}

export const LoadingOverlay = ({
  isVisible,
  icon: Icon,
  title,
  description,
  progress,
}: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6 px-4">
        <div className="relative">
          <Loader2 className="h-20 w-20 animate-spin text-primary" />
          <Icon className="h-10 w-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          {progress && (
            <p className="text-lg font-medium text-primary mt-4">{progress}</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
