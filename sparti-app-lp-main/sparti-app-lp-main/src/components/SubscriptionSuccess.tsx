import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserProfile, getCurrentMonthTokenUsage } from "@/services/tokenService";

interface SubscriptionSuccessProps {
  onClose: () => void;
}

export function SubscriptionSuccess({ onClose }: SubscriptionSuccessProps) {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tokenUsage, setTokenUsage] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [profile, usage] = await Promise.all([
          getCurrentUserProfile(),
          getCurrentMonthTokenUsage()
        ]);
        
        setUserProfile(profile);
        setTokenUsage(usage);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" />
        <Card className="relative z-10 w-full max-w-md mx-4 bg-background border shadow-lg">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading subscription details...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <Card className="relative z-10 w-full max-w-md mx-4 bg-background border shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Subscription Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p>Your subscription has been activated successfully.</p>
            {userProfile && (
              <p className="mt-2 font-semibold">
                Plan: {userProfile.plan_id?.charAt(0).toUpperCase() + userProfile.plan_id?.slice(1)}
              </p>
            )}
          </div>

          {tokenUsage && (
            <div className="bg-secondary/5 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">Your Token Balance</h4>
              <div className="flex justify-between text-sm">
                <span>Tokens Available:</span>
                <span className="font-semibold">{tokenUsage.tokens_remaining}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monthly Limit:</span>
                <span className="font-semibold">{tokenUsage.tokens_limit}</span>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            <p>You can now access all premium features with your new subscription.</p>
            <p className="mt-1">Token usage resets monthly on the 1st.</p>
          </div>

          <Button 
            onClick={onClose}
            className="w-full"
            size="lg"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
