import { FC } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const PlaceCardSkeleton: FC = () => {
  return (
    <Card className="glass border-primary/20 rounded-[20px] overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <CardHeader className="p-0">
        <div className="h-56 bg-gradient-to-br from-muted/20 via-muted/30 to-muted/20 rounded-t-[20px] relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0">
            <div className="absolute -left-full h-full w-8 bg-gradient-to-r from-transparent via-primary/20 to-transparent skew-x-12 animate-pulse" />
          </div>
          
          {/* Floating geometric shapes for modern feel */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-4 w-8 h-1 bg-primary/30 rounded-full animate-pulse" />
            <div className="absolute top-6 left-6 w-1 h-6 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute bottom-4 right-4 w-6 h-1 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            <div className="absolute bottom-8 right-8 w-1 h-4 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
          
          {/* Badge skeletons */}
          <div className="absolute top-3 left-3">
            <div className="h-6 w-20 bg-muted/40 rounded-full backdrop-blur-md" />
          </div>
          <div className="absolute top-3 right-3">
            <div className="h-6 w-16 bg-muted/40 rounded-full backdrop-blur-md" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-[20px] space-y-5">
        {/* Header section */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-5 h-5 bg-muted/40 rounded" />
              <div className="h-6 bg-muted/40 rounded flex-1 max-w-[200px]" />
            </div>
            <div className="h-5 w-16 bg-muted/40 rounded-full" />
          </div>

          {/* Address and distance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/40 rounded" />
              <div className="h-4 bg-muted/40 rounded flex-1 max-w-[250px]" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/40 rounded" />
              <div className="h-3 w-20 bg-muted/40 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/40 rounded" />
              <div className="h-4 w-32 bg-muted/40 rounded" />
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-muted/20 px-3 py-1.5 rounded-full">
              <div className="w-4 h-4 bg-muted/40 rounded" />
              <div className="w-8 h-4 bg-muted/40 rounded" />
            </div>
            <div className="h-4 w-24 bg-muted/40 rounded" />
          </div>
        </div>

        {/* Actions section */}
        <div className="space-y-4">
          <div className="h-4 w-32 bg-muted/40 rounded" />
          
          <div className="flex gap-3">
            <div className="flex-1 h-8 bg-muted/30 rounded border border-muted/20" />
            <div className="flex-1 h-8 bg-muted/30 rounded border border-muted/20" />
          </div>

          <div className="w-full h-8 bg-muted/30 rounded" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceCardSkeleton;