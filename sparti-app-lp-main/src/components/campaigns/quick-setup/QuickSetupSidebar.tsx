import { Check, Globe, MessageSquare, Target as TargetIcon, Key, Search, TrendingUp, FileSearch, Users, FileText, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickSetupSidebarProps {
  currentStep: number;
}

const steps = [
  { id: 1, icon: Globe, title: 'Website & Info' },
  { id: 2, icon: MessageSquare, title: 'AI Questions' },
  { id: 3, icon: TargetIcon, title: 'Content Strategy' },
  { id: 4, icon: Key, title: 'Keywords' },
  { id: 5, icon: Search, title: 'Source Discovery' },
  { id: 6, icon: TrendingUp, title: 'Long-tail Variants' },
  { id: 7, icon: FileSearch, title: 'Source Fetching' },
  { id: 8, icon: Users, title: 'Competitors' },
  { id: 9, icon: FileText, title: 'Topic Suggestions' },
  { id: 10, icon: Target, title: 'Intent Analysis' },
  { id: 11, icon: Zap, title: 'Generate Articles' },
];

export const QuickSetupSidebar = ({ currentStep }: QuickSetupSidebarProps) => {
  return (
    <div className="w-64 bg-muted/30 p-6 border-r border-border">
      <h2 className="text-lg font-semibold mb-6 text-foreground">Quick Setup</h2>
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isFuture = currentStep < step.id;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all',
                isActive && 'bg-primary/10 border border-primary/20',
                isCompleted && 'opacity-70',
                isFuture && 'opacity-40'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isActive && 'bg-primary text-primary-foreground ring-2 ring-primary/50',
                  isFuture && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isActive && 'text-foreground',
                    (isCompleted || isFuture) && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
