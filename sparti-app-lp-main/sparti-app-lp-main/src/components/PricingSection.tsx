import { Check, Star, Zap, TrendingUp, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PricingSectionProps {
  className?: string;
  onSubscribeClick?: () => void;
  currentUsage?: number;
  isSubscribed?: boolean;
}

const PricingSection = ({ 
  className, 
  onSubscribeClick,
  currentUsage = 0,
  isSubscribed = false 
}: PricingSectionProps) => {
  const features = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Keywords Research",
      description: "Discover high-value keywords and track competitor rankings"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Topics Research",
      description: "AI-powered topic discovery based on real search trends"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Article Generation",
      description: "Automatically generate SEO-optimized content that ranks"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Scheduling",
      description: "Automated publishing to WordPress, Shopify & CMS platforms"
    }
  ];

  const benefits = [
    "Daily automated SEO content creation",
    "Keyword research & competitor tracking",
    "Multi-platform CMS publishing",
    "SEO performance analytics",
    "Priority customer support",
    "No setup fees"
  ];

  return (
    <section className={cn("py-16 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
            <Star className="h-4 w-4 mr-2" />
            Professional Plan
          </Badge>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Transform Your SEO Strategy
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automate your content creation and dominate search rankings with AI-powered SEO
          </p>
        </div>

        {/* Main Pricing Card */}
        <Card className="group card-hover-unified card-hover-glow relative border-2 border-primary/20 shadow-xl animate-scale-in">
          {/* Highlight Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/70" />
          
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-primary">$40</span>
              <span className="text-lg text-muted-foreground">/month</span>
            </div>
            <CardTitle className="text-2xl mb-2">Sparti Professional</CardTitle>
            <CardDescription className="text-lg">
              Everything you need to automate SEO content and rank higher
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Usage Display for Subscribers */}
            {isSubscribed && (
              <div className="p-6 bg-muted/50 rounded-lg border animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Monthly Usage</h3>
                  <Badge variant="secondary">
                    {currentUsage} / Unlimited articles
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((currentUsage / 1000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentUsage} articles generated this month
                </p>
              </div>
            )}

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="card-hover-unified flex gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="grid md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center pt-6">
              {isSubscribed ? (
                <div className="space-y-3">
                  <Badge variant="default" className="px-6 py-2 bg-green-500 hover:bg-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Active Subscription
                  </Badge>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" size="lg">
                      Manage Subscription
                    </Button>
                    <Button variant="outline" size="lg">
                      View Usage History
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale"
                    onClick={onSubscribeClick}
                  >
                    Start SEO Automation
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    No setup fees • Cancel anytime • Secure payment
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-12 text-center animate-fade-in">
          <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;