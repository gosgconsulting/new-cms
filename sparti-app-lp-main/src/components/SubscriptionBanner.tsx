import { Crown, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionBannerProps {
  className?: string;
  onUpgradeClick?: () => void;
  onDismiss?: () => void;
  variant?: 'limit-reached' | 'trial' | 'upgrade-prompt';
  currentUsage?: number;
  maxLeads?: number;
}

const SubscriptionBanner = ({ 
  className,
  onUpgradeClick,
  onDismiss,
  variant = 'upgrade-prompt',
  currentUsage = 0,
  maxLeads = 4000
}: SubscriptionBannerProps) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      navigate('/app/account?tab=subscription');
    }
  };

  const getBannerContent = () => {
    switch (variant) {
      case 'limit-reached':
        return {
          title: 'Lead Limit Reached',
          description: 'You\'ve reached your monthly limit. Upgrade to continue generating leads.',
          bgColor: 'bg-orange-500/10 border-orange-500/20',
          textColor: 'text-orange-600',
          badgeColor: 'bg-orange-500',
          buttonText: 'Upgrade Now'
        };
      case 'trial':
        return {
          title: 'Limited Access',
          description: 'You\'re using the free tier. Subscribe to unlock unlimited lead generation.',
          bgColor: 'bg-primary/10 border-primary/20',
          textColor: 'text-primary',
          badgeColor: 'bg-primary',
          buttonText: 'Start Free Trial'
        };
      default:
        return {
          title: 'Unlock Premium Features',
          description: 'Get access to 4,000+ leads per month with advanced filtering and contact data.',
          bgColor: 'bg-primary/10 border-primary/20',
          textColor: 'text-primary',
          badgeColor: 'bg-primary',
          buttonText: 'Subscribe for $40/month'
        };
    }
  };

  const content = getBannerContent();

  return (
    <Card className={cn(
      "relative overflow-hidden animate-fade-in",
      content.bgColor,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              content.badgeColor
            )}>
              <Crown className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={cn("font-semibold text-lg", content.textColor)}>
                  {content.title}
                </h3>
                {variant === 'limit-reached' && (
                  <Badge variant="destructive" className="text-xs">
                    {currentUsage}/{maxLeads}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {content.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={handleUpgrade}
              className={cn(
                "hover-scale shadow-lg",
                content.badgeColor,
                "hover:opacity-90"
              )}
            >
              {content.buttonText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionBanner;