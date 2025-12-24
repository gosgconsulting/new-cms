import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FreeTrialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FreeTrialModal = ({ open, onOpenChange }: FreeTrialModalProps) => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Start Your Free Trial
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Get started with your 14-day free trial and experience the power of automated SEO
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Trial Benefits */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Free Trial Includes:</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                5 Tokens
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Test all premium features with 5 free tokens
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Full access to keywords and topics research
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  AI-powered article generation
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  14-day trial • No credit card required • Cancel anytime
                </span>
              </div>
            </div>
          </div>

          {/* What happens after trial */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold">After your trial:</span> Upgrade to any paid plan to continue with unlimited tokens and unlock full automation features.
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={handleSignUp}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-6 text-lg shadow-lg"
            size="lg"
          >
            Sign Up Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
