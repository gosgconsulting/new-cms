import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface PricingSectionProps {
  onGetStarted?: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = 'https://app.sparti.ai/seo-copilot-trial';
    }
  };

  const plans = [
    { 
      id: "starter", 
      name: "Starter", 
      monthlyPrice: 20, 
      annualPrice: 192, // 20 × 12 × 0.8 (20% discount)
      brand_limit: 3, 
      tokenLimit: 20,
      features: ["3 brands", "Keywords research", "Topics research", "Article generation", "Scheduling"],
      popular: false
    },
    { 
      id: "pro", 
      name: "Pro", 
      monthlyPrice: 40, 
      annualPrice: 384, // 40 × 12 × 0.8 (20% discount)
      brand_limit: 10, 
      tokenLimit: 40,
      features: ["10 brands", "Keywords research", "Topics research", "Article generation", "Scheduling"],
      popular: true
    },
    { 
      id: "agency", 
      name: "Agency", 
      monthlyPrice: 100, 
      annualPrice: 960, // 100 × 12 × 0.8 (20% discount)
      brand_limit: 0, 
      tokenLimit: 100,
      features: ["Unlimited brands", "Keywords research", "Topics research", "Article generation", "Scheduling", "Priority support"],
      popular: false
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavingsPercentage = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    return Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100);
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-card/20 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Choose Your Plan
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with a 14-day free trial (5 tokens). No credit card required.
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-card/80 glass border border-border/50 rounded-full p-1">
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
                onClick={() => setBillingPeriod('annually')}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingPeriod === 'annually'
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

        {/* 3 Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative border-2 shadow-xl hover:shadow-2xl transition-all duration-500 hover-scale overflow-hidden ${
                plan.popular ? 'border-primary/40 ring-2 ring-primary/20' : 'border-primary/20'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-8 bg-primary flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-foreground">MOST POPULAR</span>
                </div>
              )}
              
              {/* Highlight Border */}
              <div className={`absolute ${plan.popular ? 'top-8' : 'top-0'} left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/70`} />
              
              <CardHeader className={`text-center pb-6 ${plan.popular ? 'pt-12' : ''}`}>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="flex justify-center items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-primary">
                    ${getPrice(plan)}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                
                {billingPeriod === 'annually' && getSavingsPercentage(plan) > 0 && (
                  <Badge variant="secondary" className="mb-4 bg-success/10 text-success border-success/20">
                    Save {getSavingsPercentage(plan)}% annually
                  </Badge>
                )}

                <CardDescription className="text-base">
                  {plan.tokenLimit} tokens / month
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.slice(1).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center pt-4">
                  <Button 
                    size="lg" 
                    className={`w-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover-scale ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                    onClick={handleGetStarted}
                  >
                    Start Free Trial
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    14-day free trial (5 tokens) • Then upgrade
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Secure payment processing</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

