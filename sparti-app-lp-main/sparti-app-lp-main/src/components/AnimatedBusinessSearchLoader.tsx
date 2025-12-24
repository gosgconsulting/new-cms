import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import RadarIcon from './base/RadarIcon';

interface SearchStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

interface AnimatedBusinessSearchLoaderProps {
  steps: SearchStep[];
  progress: number;
  isLoading: boolean;
  className?: string;
}

const AnimatedBusinessSearchLoader: React.FC<AnimatedBusinessSearchLoaderProps> = ({
  steps,
  progress,
  isLoading,
  className
}) => {
  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Main Loading Display */}
      <div className="text-center space-y-8 mb-12">
        {/* Enhanced radar loading indicator */}
        <div>
          <RadarIcon size="xl" variant="primary" className="mx-auto" />
        </div>

        {/* Main Loading Text */}
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-primary">
            Finding business leads...
          </h2>
          <p className="text-xl text-muted-foreground animate-pulse">
            Scanning business directories and collecting contact information
          </p>
          
          {/* Progress Bar with Percentage */}
          <div className="space-y-3 pt-4">
            <Progress value={progress} className="h-3 bg-secondary" />
            <div className="text-center">
              <span className="text-lg font-mono text-primary font-semibold">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBusinessSearchLoader;