import { Crown, Settings, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SubscriptionStatusProps {
  className?: string;
  isSubscribed: boolean;
  planName?: string;
  billingAmount?: number;
  billingCycle?: 'monthly' | 'yearly';
  nextBillingDate?: string;
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'trial';
  onManageSubscription?: () => void;
  onUpgrade?: () => void;
}

const SubscriptionStatus = ({
  className,
  isSubscribed = false,
  planName = 'Sparti Professional',
  billingAmount = 40,
  billingCycle = 'monthly',
  nextBillingDate = '2024-02-15',
  subscriptionStatus = 'active',
  onManageSubscription,
  onUpgrade
}: SubscriptionStatusProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/app/account?tab=subscription');
    }
  };

  const getStatusConfig = () => {
    if (!isSubscribed) {
      return {
        icon: <AlertTriangle className="h-5 w-5" />,
        label: 'No Active Subscription',
        color: 'text-orange-600',
        badgeVariant: 'secondary' as const,
        bgColor: 'bg-orange-50'
      };
    }

    switch (subscriptionStatus) {
      case 'active':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          label: 'Active',
          color: 'text-green-600',
          badgeVariant: 'default' as const,
          bgColor: 'bg-green-50'
        };
      case 'past_due':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          label: 'Payment Due',
          color: 'text-red-600',
          badgeVariant: 'destructive' as const,
          bgColor: 'bg-red-50'
        };
      case 'canceled':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          label: 'Canceled',
          color: 'text-gray-600',
          badgeVariant: 'secondary' as const,
          bgColor: 'bg-gray-50'
        };
      case 'trial':
        return {
          icon: <Crown className="h-5 w-5" />,
          label: 'Trial Active',
          color: 'text-blue-600',
          badgeVariant: 'default' as const,
          bgColor: 'bg-blue-50'
        };
      default:
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          label: 'Active',
          color: 'text-green-600',
          badgeVariant: 'default' as const,
          bgColor: 'bg-green-50'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              statusConfig.bgColor
            )}>
              <div className={statusConfig.color}>
                {statusConfig.icon}
              </div>
            </div>
            <div>
              <CardTitle className="text-lg">Subscription</CardTitle>
              <CardDescription>
                {isSubscribed ? planName : 'Free Tier'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusConfig.badgeVariant} className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isSubscribed ? (
          <>
            {/* Subscription Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">{planName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${billingAmount}/{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Next billing</span>
                <span className="font-medium">
                  {new Date(nextBillingDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lead allowance</span>
                <span className="font-medium">4,000/month</span>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onManageSubscription}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Button>
            </div>

            {/* Status Messages */}
            {subscriptionStatus === 'past_due' && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  Your payment is overdue. Please update your payment method to continue service.
                </p>
              </div>
            )}

            {subscriptionStatus === 'trial' && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-primary">
                  You're on a free trial. Your subscription will begin on {nextBillingDate}.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Free Tier Info */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current plan</span>
                <span className="font-medium">Free Tier</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lead limit</span>
                <span className="font-medium">10/month</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Features</span>
                <span className="font-medium">Basic</span>
              </div>
            </div>

            <Separator />

            {/* Upgrade CTA */}
            <div className="text-center space-y-3">
              <h3 className="font-semibold">Unlock Full Potential</h3>
              <p className="text-sm text-muted-foreground">
                Get 4,000 leads/month and premium features for just $40/month
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                onClick={handleUpgrade}
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Professional
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;