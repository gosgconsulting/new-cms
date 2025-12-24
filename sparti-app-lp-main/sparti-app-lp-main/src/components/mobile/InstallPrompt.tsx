import { FC, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface InstallPromptProps {
  onDismiss?: () => void;
}

const InstallPrompt: FC<InstallPromptProps> = ({ onDismiss }) => {
  const { isInstallable, showInstallPrompt } = usePWA();
  const { isMobile } = useResponsive();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || !isMobile || isDismissed) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await showInstallPrompt();
    setIsInstalling(false);
    
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className={cn(
      "fixed bottom-20 left-4 right-4 z-40",
      "glass border border-primary/20",
      "animate-slide-in-right"
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Install Sparti
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Add to your home screen for quick access to business leads
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                disabled={isInstalling}
                className="h-8 px-3 text-xs"
              >
                {isInstalling ? (
                  <>
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download size={12} className="mr-1" />
                    Install
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 px-3 text-xs"
              >
                Not now
              </Button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-muted"
            aria-label="Dismiss install prompt"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default InstallPrompt;