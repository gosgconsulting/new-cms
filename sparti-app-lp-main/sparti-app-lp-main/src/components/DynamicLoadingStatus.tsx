import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2, Search, Settings, MapPin, Database, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepStatus {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  errorMessage?: string;
  debugData?: any;
}

interface DynamicLoadingStatusProps {
  steps: StepStatus[];
  currentProgress: number;
  className?: string;
}

const stepIcons = {
  1: Search,        // Clean up existing clusters
  2: Settings,      // Validate and map search parameters
  3: MapPin,        // Geocode location and create cluster
  4: Database,      // Generate Google Maps URLs for each business type
  5: Search,        // Add multiple search tasks to cluster
  6: Database,      // Launch lead extraction
  7: Sparkles,      // Monitor and retrieve business leads
  8: CheckCircle    // Display leads and cleanup
};

const DynamicLoadingStatus: React.FC<DynamicLoadingStatusProps> = ({ 
  steps, 
  currentProgress, 
  className 
}) => {
  const getStepIcon = (step: StepStatus) => {
    const IconComponent = stepIcons[step.id as keyof typeof stepIcons] || Search;
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'active':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'pending':
      default:
        return <IconComponent className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepStatus = (step: StepStatus) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-700 dark:text-green-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      case 'active':
        return 'text-primary';
      case 'pending':
      default:
        return 'text-muted-foreground';
    }
  };

  const getStepBorder = (step: StepStatus) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'active':
        return 'border-primary/30 bg-primary/5';
      case 'pending':
      default:
        return 'border-border bg-muted/20';
    }
  };

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(currentProgress)}%</span>
            </div>
            <Progress value={currentProgress} className="w-full" />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-300",
                  getStepBorder(step),
                  step.status === 'active' && "animate-pulse"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("font-medium text-sm", getStepStatus(step))}>
                        Step {step.id}: {step.title}
                      </span>
                      {step.status === 'active' && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      )}
                    </div>
                    <p className={cn("text-xs", getStepStatus(step))}>
                      {step.errorMessage || step.description}
                    </p>
                    {step.status === 'error' && step.errorMessage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    )}
                    
                    {/* Debug Data Section */}
                    {step.debugData && (step.status === 'error' || step.status === 'completed') && (
                      <details className="mt-2">
                        <summary className="text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                          ▼ View Response Data
                        </summary>
                        <div className="mt-2 p-2 bg-muted/50 rounded border text-xs font-mono overflow-x-auto">
                          <pre className="whitespace-pre-wrap break-words">
                            {typeof step.debugData === 'string' 
                              ? step.debugData 
                              : JSON.stringify(step.debugData, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Step Animation */}
          {steps.some(step => step.status === 'active') && (
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-primary/20 rounded-full"></div>
                <div className="absolute inset-1 border-2 border-primary/40 rounded-full animate-ping"></div>
                <div className="absolute inset-2 border-2 border-primary rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicLoadingStatus;