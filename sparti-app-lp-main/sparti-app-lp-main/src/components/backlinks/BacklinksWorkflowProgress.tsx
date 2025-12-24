import { Link2, Search, Lightbulb, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BacklinksWorkflowProgressProps {
  currentStep: number;
}

const steps = [
  {
    id: 0,
    title: 'Internal Links',
    icon: Link2,
  },
  {
    id: 1,
    title: 'Keywords',
    icon: Search,
  },
  {
    id: 2,
    title: 'Topics',
    icon: Lightbulb,
  },
  {
    id: 3,
    title: 'Generate',
    icon: FileText,
  },
];

export const BacklinksWorkflowProgress = ({ currentStep }: BacklinksWorkflowProgressProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                    isActive && 'bg-primary border-primary text-primary-foreground',
                    isCompleted && 'bg-primary/20 border-primary text-primary',
                    !isActive && !isCompleted && 'bg-muted border-muted-foreground/20 text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    'text-sm mt-2 font-medium',
                    isActive && 'text-foreground',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-all',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
