import { X, Calendar, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTokenContext } from "@/contexts/TokenContext";

interface TokensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TokensModal({ isOpen, onClose }: TokensModalProps) {
  const navigate = useNavigate();
  const { tokenUsage, userProfile, plans, isLoading } = useTokenContext();

  const handleUpgrade = () => {
    onClose();
    navigate('/app/account?tab=subscription');
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === userProfile?.plan_id) || plans[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-4xl mx-4 bg-background border shadow-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Token Management
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : tokenUsage ? (
            <>
              {/* Free Trial Banner */}
              {tokenUsage?.is_trial && tokenUsage.days_remaining !== null && tokenUsage.days_remaining !== undefined && (
                <Card className="border-2 border-success/40 bg-success/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-lg font-semibold text-success">
                          Free Trial Active
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tokenUsage.days_remaining} {tokenUsage.days_remaining === 1 ? 'day' : 'days'} remaining
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-lg px-4 py-2">
                        {tokenUsage.days_remaining} {tokenUsage.days_remaining === 1 ? 'day' : 'days'} left
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Plan & Token Balance */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Current Plan</h3>
                
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">{getCurrentPlan()?.name || 'Starter'}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            ${getCurrentPlan()?.price || 20}/month • {getCurrentPlan()?.token_limit || 20} tokens
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Active
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tokens used this month</span>
                          <span className="font-semibold text-lg">
                            {tokenUsage?.tokens_used.toFixed(2) || '0.00'} / {tokenUsage?.token_limit || getCurrentPlan().token_limit}
                          </span>
                        </div>
                        <Progress value={tokenUsage?.usage_percentage || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-4">
                <Button 
                  onClick={handleUpgrade}
                  variant="default"
                  size="lg"
                  className="gap-2"
                >
                  Upgrade Plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Info Footer */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-secondary/5 rounded-lg">
                <Calendar className="h-3 w-3" />
                <span>
                  Token balance is updated in real-time as you use AI features
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">Unable to load token information</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}