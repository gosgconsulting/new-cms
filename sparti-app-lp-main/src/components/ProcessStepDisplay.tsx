import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepStatus {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  errorMessage?: string;
  debugData?: any;
}

interface ProcessStepDisplayProps {
  steps: StepStatus[];
  className?: string;
}

const ProcessStepDisplay = ({ steps, className }: ProcessStepDisplayProps) => {
  const [expandedSteps, setExpandedSteps] = React.useState<Set<number>>(new Set());

  const toggleStep = (stepId: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  // Analyze debug data to determine actual success/failure
  const analyzeStepResult = (step: StepStatus) => {
    if (!step.debugData) {
      return step.status === 'completed' ? 'success' : step.status === 'error' ? 'error' : 'pending';
    }

    // Check for explicit success indicators
    const debugStr = JSON.stringify(step.debugData).toLowerCase();
    
    // Success indicators
    const successPatterns = [
      'tasks cleared successfully',
      'tasks added successfully', 
      'run started',
      'run launched successfully',
      'settings updated successfully',
      'success: true'
    ];

    // Error indicators
    const errorPatterns = [
      'failed to update settings',
      'method not allowed',
      'error',
      'failed',
      'warning'
    ];

    const hasSuccess = successPatterns.some(pattern => debugStr.includes(pattern));
    const hasError = errorPatterns.some(pattern => debugStr.includes(pattern));

    if (step.status === 'error' || step.errorMessage) return 'error';
    if (hasError && !hasSuccess) return 'warning';
    if (step.status === 'completed' || hasSuccess) return 'success';
    if (step.status === 'running') return 'running';
    return 'pending';
  };

  const getStatusIcon = (result: string) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'running':
        return <Clock className="h-5 w-5 text-primary animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (result: string) => {
    switch (result) {
      case 'success':
        return <Badge variant="success" className="text-xs">Success</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      case 'warning':
        return <Badge variant="warning" className="text-xs">Warning</Badge>;
      case 'running':
        return <Badge variant="default" className="text-xs">Running</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
    }
  };

  const getStepCardStyle = (result: string) => {
    switch (result) {
      case 'success':
        return 'border-success/30 bg-success/5';
      case 'error':
        return 'border-destructive/30 bg-destructive/5';
      case 'warning':
        return 'border-warning/30 bg-warning/5';
      case 'running':
        return 'border-primary/30 bg-primary/5';
      default:
        return 'border-muted';
    }
  };

  if (steps.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-lg">Process Status</h3>
        <Badge variant="outline" className="text-xs">
          {steps.filter(s => analyzeStepResult(s) === 'success').length}/{steps.length} Completed
        </Badge>
      </div>

      {steps.map((step) => {
        const result = analyzeStepResult(step);
        const isExpanded = expandedSteps.has(step.id);

        return (
          <Card key={step.id} className={cn("transition-all duration-200", getStepCardStyle(result))}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleStep(step.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result)}
                      <div className="text-left">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result)}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* Error message display */}
                  {step.errorMessage && (
                    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                      <strong>Error:</strong> {step.errorMessage}
                    </div>
                  )}
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {step.debugData && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        <Info className="h-3 w-3" />
                        Debug Information
                      </div>
                      <details className="group">
                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground p-2 bg-muted/30 rounded border">
                          View Raw Debug Data
                        </summary>
                        <pre className="text-xs bg-muted p-3 rounded-b border-t-0 overflow-auto max-h-64 group-open:border">
                          {JSON.stringify(step.debugData, null, 2)}
                        </pre>
                      </details>

                      {/* Parse and display key information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Success indicators */}
                        {step.debugData.emptyResponse?.message && (
                          <div className="p-2 bg-success/10 border border-success/20 rounded">
                            <strong>Tasks Cleared:</strong> {step.debugData.emptyResponse.message}
                          </div>
                        )}
                        
                        {step.debugData.tasksResponse?.tasks?.length > 0 && (
                          <div className="p-2 bg-success/10 border border-success/20 rounded">
                            <strong>Tasks Added:</strong> {step.debugData.tasksResponse.tasks.length} task(s)
                          </div>
                        )}

                        {step.debugData.runResult?.id && (
                          <div className="p-2 bg-success/10 border border-success/20 rounded">
                            <strong>Run ID:</strong> {step.debugData.runResult.id}
                          </div>
                        )}

                        {/* Warning indicators */}
                        {step.debugData.settingsResponse?.warning && (
                          <div className="p-2 bg-warning/10 border border-warning/20 rounded col-span-full">
                            <strong>Settings Warning:</strong> {step.debugData.settingsResponse.warning}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};

export default ProcessStepDisplay;