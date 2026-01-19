import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../src/components/ui/card';
import { cn } from '../../../src/lib/utils';

interface ExpandableCardProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  defaultExpanded = true,
  children,
  className,
  headerClassName,
  contentClassName,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader
        className={cn(
          "cursor-pointer hover:bg-gray-50/50 transition-colors pb-4",
          headerClassName
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span>{title}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className={cn("pt-0", contentClassName)}>
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default ExpandableCard;
