import { TrendingUp, Calendar, Download, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UsageDisplayProps {
  className?: string;
  currentUsage: number;
  maxLeads: number;
  billingPeriodEnd?: string;
  isSubscribed?: boolean;
  monthlyStats?: {
    searchesThisMonth: number;
    avgLeadsPerSearch: number;
    topCategory: string;
  };
}

const UsageDisplay = ({ 
  className,
  currentUsage = 0,
  maxLeads = 4000,
  billingPeriodEnd = "2024-02-15",
  isSubscribed = false,
  monthlyStats = {
    searchesThisMonth: 12,
    avgLeadsPerSearch: 45,
    topCategory: "Restaurants"
  }
}: UsageDisplayProps) => {
  const usagePercentage = Math.min((currentUsage / maxLeads) * 100, 100);
  const remainingLeads = Math.max(maxLeads - currentUsage, 0);
  const daysUntilReset = Math.ceil((new Date(billingPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getUsageStatus = () => {
    if (usagePercentage >= 90) return { color: 'text-red-600', label: 'Critical', variant: 'destructive' as const };
    if (usagePercentage >= 70) return { color: 'text-orange-600', label: 'High', variant: 'secondary' as const };
    if (usagePercentage >= 50) return { color: 'text-primary', label: 'Moderate', variant: 'default' as const };
    return { color: 'text-green-600', label: 'Healthy', variant: 'default' as const };
  };

  const status = getUsageStatus();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Usage Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Lead Usage</CardTitle>
              <CardDescription>
                {isSubscribed ? 'Professional Plan' : 'Free Tier'} • Resets in {daysUntilReset} days
              </CardDescription>
            </div>
            <Badge variant={status.variant} className={status.color}>
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Usage Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{currentUsage.toLocaleString()}</span>
              <span className="text-muted-foreground">of {maxLeads.toLocaleString()} leads</span>
            </div>
            
            <Progress 
              value={usagePercentage} 
              className="h-3 animate-scale-in"
            />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{remainingLeads.toLocaleString()} remaining</span>
              <span>{usagePercentage.toFixed(1)}% used</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">{monthlyStats.searchesThisMonth}</div>
              <div className="text-xs text-muted-foreground">Searches</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{monthlyStats.avgLeadsPerSearch}</div>
              <div className="text-xs text-muted-foreground">Avg/Search</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold truncate">{monthlyStats.topCategory}</div>
              <div className="text-xs text-muted-foreground">Top Category</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="card-hover-unified">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">This Month</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Generated</span>
                <span className="font-medium">{currentUsage.toLocaleString()} leads</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Searches</span>
                <span className="font-medium">{monthlyStats.searchesThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Efficiency</span>
                <span className="font-medium">{monthlyStats.avgLeadsPerSearch}/search</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-unified">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Billing Cycle</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Resets on</span>
                <span className="font-medium">{new Date(billingPeriodEnd).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Days left</span>
                <span className="font-medium">{daysUntilReset} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">{isSubscribed ? 'Professional' : 'Free'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Start Free
        </Button>
      </div>
    </div>
  );
};

export default UsageDisplay;