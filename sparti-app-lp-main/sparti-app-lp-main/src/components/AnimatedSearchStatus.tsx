import { FC, useEffect, useState } from 'react';
import RadarIcon from './base/RadarIcon';

interface AnimatedSearchStatusProps {
  className?: string;
}

const searchSteps = [
  "Searching...",
  "Analyzing business data...", 
  "Generating lead profiles...",
  "Almost ready..."
];

const AnimatedSearchStatus: FC<AnimatedSearchStatusProps> = ({ className }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < searchSteps.length - 1) {
          return prev + 1;
        }
        return prev; // Stay at the last step
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className}>
      <div className="text-center space-y-8">
        {/* Enhanced radar icon */}
        <div className="mb-6">
          <RadarIcon size="lg" variant="primary" className="mx-auto" />
        </div>

        {/* Animated text with smooth transitions */}
        <div className="space-y-4">
          <div className="text-3xl md:text-4xl font-orbitron font-bold text-primary transition-all duration-500 transform">
            {searchSteps[currentStep]}
          </div>
          <div className="text-lg text-muted-foreground animate-pulse">
            Processing business leads and contact data
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedSearchStatus;