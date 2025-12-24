import { Progress } from '@/components/ui/progress';

interface QuickSetupProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const getStepLabels = (totalSteps: number) => {
  if (totalSteps === 3) {
    return [
      { number: 1, label: 'Website Analysis' },
      { number: 2, label: 'Keywords' },
      { number: 3, label: 'Generate Topics' }
    ];
  }
  if (totalSteps === 5) {
    return [
      { number: 1, label: 'Website Analysis' },
      { number: 2, label: 'Target Settings' },
      { number: 3, label: 'Keywords' },
      { number: 4, label: 'Research Topics' },
      { number: 5, label: 'Results' }
    ];
  }
  return [
    { number: 1, label: 'Website Analysis' },
    { number: 2, label: 'Keywords' },
    { number: 3, label: 'Research Topics' },
    { number: 4, label: 'Results' }
  ];
};

export const QuickSetupProgressBar = ({ currentStep, totalSteps = 4 }: QuickSetupProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;
  const stepLabels = getStepLabels(totalSteps);

  return (
    <div className="w-full space-y-3">
      {/* Step Labels */}
      <div className="flex justify-between items-center">
        {stepLabels.map((step) => (
          <div
            key={step.number}
            className={`flex-1 text-center text-sm font-medium transition-colors ${
              step.number === currentStep
                ? 'text-primary'
                : step.number < currentStep
                ? 'text-muted-foreground'
                : 'text-muted-foreground/60'
            }`}
          >
            Step {step.number}: {step.label}
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <Progress value={progress} className="h-1" />
    </div>
  );
};
