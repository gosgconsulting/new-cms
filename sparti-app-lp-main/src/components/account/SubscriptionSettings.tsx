import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Calendar, CheckCircle, ArrowRight, Check, Gift, AlertTriangle } from "lucide-react";
import { getSubscriptionPlans, getCurrentUserProfile, SubscriptionPlan } from "@/services/tokenService";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TokenUsage {
  tokens_used: number;
  tokens_limit: number;
  tokens_remaining: number;
  month_year: string;
}

interface UserProfile {
  subscription_status?: string;
  trial_start?: string;
  trial_end?: string;
  plan_id?: string;
}

export const SubscriptionSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [resetMessage, setResetMessage] = useState<string>('Token usage resets on the 1st of each month');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch plans from database
        const plansData = await getSubscriptionPlans();
        setPlans(plansData);
        
        // Fetch current user profile
        const profileData = await getCurrentUserProfile();
        if (profileData) {
          setUserProfile(profileData);
          
          // Find current plan
          const currentPlanData = plansData.find(plan => plan.id === profileData.plan_id);
          setCurrentPlan(currentPlanData || null);
          
          // Get token usage from profile data instead of separate RPC call
          if (currentPlanData) {
            setTokenUsage({
              tokens_used: profileData.tokens || 0,
              tokens_limit: currentPlanData.token_limit || 0,
              tokens_remaining: (currentPlanData.token_limit || 0) - (profileData.tokens || 0),
              month_year: new Date().toISOString().slice(0, 7)
            });
          }

          // Set appropriate message based on subscription status
          const isFreeTrialPlan = profileData.plan_id === 'free' || profileData.plan_id === 'free_trial';
          const hasActiveTrial = profileData.trial_end && new Date(profileData.trial_end) > new Date();
          
          if ((isFreeTrialPlan || hasActiveTrial) && profileData.trial_end) {
            const trialEndDate = new Date(profileData.trial_end);
            const formattedDate = format(trialEndDate, 'MMM dd, yyyy');
            setResetMessage(`Free trial ends on ${formattedDate}. Tokens do not reset during trial.`);
          } else if (user) {
            // Fetch token reset message for paid plans
            const { data: resetData, error: resetError } = await supabase
              .rpc('get_token_reset_message', { user_id_param: user.id });
            
            if (!resetError && resetData) {
              setResetMessage(resetData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, user]);

  const getPrice = (plan: SubscriptionPlan) => {
    return plan.price;
  };

  const getSavingsPercentage = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 0;
    if (plan.subscription_type === 'yearly') {
      return 20; // 20% savings for yearly plans
    }
    return 0;
  };

  const handleStartTrial = async (planId: string) => {
    try {
      // Import the function
      const { createStripeCheckoutSession } = await import("@/services/tokenService");
      
      // Create checkout session
      const session = await createStripeCheckoutSession(
        planId,
        `${window.location.origin}/app/account?tab=subscription&success=true`,
        `${window.location.origin}/app/account?tab=subscription&cancelled=true`
      );

      if (session?.url) {
        // Redirect to Stripe checkout
        window.location.href = session.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUsagePercentage = () => {
    if (!tokenUsage || tokenUsage.tokens_limit === 0) return 0;
    return (tokenUsage.tokens_used / tokenUsage.tokens_limit) * 100;
  };

  const handleCancelSubscription = async () => {
    if (!user || !currentPlan) return;
    
    setIsCancelling(true);
    try {
      // Call edge function to cancel subscription
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      });

      setShowCancelDialog(false);
      
      // Refresh user profile
      const profileData = await getCurrentUserProfile();
      if (profileData) {
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getUsageStatus = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return { color: "destructive" as const, text: "Critical" };
    if (percentage >= 75) return { color: "warning" as const, text: "High" };
    if (percentage >= 50) return { color: "default" as const, text: "Moderate" };
    return { color: "secondary" as const, text: "Healthy" };
  };

  const getPlanIndex = (planId: string) => {
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);
    return sortedPlans.findIndex(plan => plan.id === planId);
  };

  const getButtonConfig = (planId: string) => {
    if (!currentPlan) {
      return {
        text: "Select Plan",
        disabled: false,
        variant: "default" as const
      };
    }
    
    const currentIndex = getPlanIndex(currentPlan.id);
    const planIndex = getPlanIndex(planId);
    
    if (planId === currentPlan.id) {
      return {
        text: "Current Plan",
        disabled: true,
        variant: "outline" as const
      };
    } else if (planIndex > currentIndex) {
      return {
        text: "Upgrade",
        disabled: false,
        variant: "default" as const
      };
    } else {
      return {
        text: "Downgrade",
        disabled: false,
        variant: "secondary" as const
      };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Free Trial Section - Only show when trial is active */}
      {((userProfile?.plan_id === 'free' || userProfile?.plan_id === 'free_trial') || 
        (userProfile?.trial_end && new Date(userProfile.trial_end) > new Date())) && 
        userProfile.trial_start && userProfile.trial_end && (
        <Card className="border-2 border-success/40 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <Gift className="h-5 w-5" />
              Free Trial Active
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Trial Start Date</div>
                <div className="font-semibold">
                  {format(new Date(userProfile.trial_start), 'MMM dd, yyyy')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Trial End Date</div>
                <div className="font-semibold">
                  {format(new Date(userProfile.trial_end), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Enjoy your 14-day free trial with 5 tokens. Upgrade anytime to unlock more features.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan Section */}
      {currentPlan && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Plan</h2>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {(userProfile?.plan_id === 'free' || userProfile?.plan_id === 'free_trial') ? 'Free Trial' : currentPlan.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {currentPlan.price === 0 ? (
                        `${currentPlan.token_limit} tokens`
                      ) : (
                        `$${currentPlan.price}/month • ${currentPlan.token_limit} tokens`
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Active
                  </Badge>
                </div>

                {/* Trial Dates - Only show for free trial users */}
                {((userProfile?.plan_id === 'free' || userProfile?.plan_id === 'free_trial') || 
                  (userProfile?.trial_end && new Date(userProfile.trial_end) > new Date())) && 
                  userProfile.trial_start && userProfile.trial_end && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                      <div className="text-sm font-medium">
                        {format(new Date(userProfile.trial_start), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">End Date</div>
                      <div className="text-sm font-medium">
                        {format(new Date(userProfile.trial_end), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                )}
                
                {tokenUsage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tokens used this month</span>
                      <span className="font-semibold text-lg">
                        {tokenUsage.tokens_used} / {tokenUsage.tokens_limit}
                      </span>
                    </div>
                    <Progress value={getUsagePercentage()} className="h-2" />
                  </div>
                )}
                
                {/* Cancel Button */}
                {currentPlan.id !== 'free_trial' && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => setShowCancelDialog(true)}
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Section */}
      <div className="space-y-6">
        {/* Billing Period Toggle */}
        <div className="flex justify-center">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-full p-1">
            <div className="flex items-center">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual
                <span className="ml-2 bg-success text-success-foreground text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans
            .filter(plan => 
              plan.active !== false && 
              plan.subscription_type === billingPeriod &&
              plan.id !== 'free_trial' // Hide free trial from selectable plans
            )
            .map((plan, index) => {
            const isPopular = index === 1; // Make middle plan popular
            const buttonConfig = getButtonConfig(plan.id);
            
            return (
              <Card 
                key={plan.id}
                className={`relative border-2 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden ${
                  isPopular ? 'border-primary/40 ring-2 ring-primary/20' : 'border-primary/20'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-8 bg-primary flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary-foreground">MOST POPULAR</span>
                  </div>
                )}
                
                {/* Highlight Border */}
                <div className={`absolute ${isPopular ? 'top-8' : 'top-0'} left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/70`} />
                
                <CardHeader className={`text-center pb-6 ${isPopular ? 'pt-12' : ''}`}>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="flex justify-center items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-primary">
                      ${getPrice(plan)}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      /{plan.subscription_type === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  
                  {plan.subscription_type === 'yearly' && getSavingsPercentage(plan) > 0 && (
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      Save {getSavingsPercentage(plan)}% annually
                    </Badge>
                  )}

                  <CardDescription className="text-base">
                    {plan.token_limit || 0} tokens / month{plan.name === 'Agency' ? ' included' : ''}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm">SEO Copilot</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm">Assets Copilot (coming soon)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm">Leads Copilot (coming soon)</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="text-center pt-4">
                    <Button 
                      size="lg" 
                      variant={buttonConfig.variant}
                      disabled={buttonConfig.disabled}
                      className={`w-full px-8 py-6 text-lg font-semibold transition-all duration-300 ${
                        !buttonConfig.disabled && 'shadow-lg hover:shadow-xl hover:scale-105'
                      } ${
                        isPopular && !buttonConfig.disabled
                          ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' 
                          : ''
                      }`}
                      onClick={() => handleStartTrial(plan.id)}
                    >
                      {buttonConfig.text}
                      {!buttonConfig.disabled && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>Secure payment processing</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* Monthly Reset Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{resetMessage}</span>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access to all features until the end of your current billing period. After that, your account will be downgraded to the free tier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};