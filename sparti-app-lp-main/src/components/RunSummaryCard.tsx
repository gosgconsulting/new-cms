import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Search, 
  Clock, 
  Database, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RunData {
  id: string;
  run_id?: string;
  created_at: string;
  status: string;
  global_results_count: number;
  estimated_cost?: number;
  query_data?: any;
  squid_id: string;
  run_type: 'google_maps' | 'google_search';
  search_results_count?: number;
  duration?: number;
  error_message?: string;
  completed_at?: string;
}

interface RunSummaryCardProps {
  run: RunData;
  onClick: () => void;
  isSelected?: boolean;
}

export const RunSummaryCard: React.FC<RunSummaryCardProps> = ({
  run,
  onClick,
  isSelected = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = () => {
    if (run.duration) {
      return `${Math.round(run.duration)}m`;
    }
    if (run.completed_at) {
      const start = new Date(run.created_at);
      const end = new Date(run.completed_at);
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      return `${diff}m`;
    }
    return 'N/A';
  };

  const getStatusIcon = () => {
    switch (run.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (run.status) {
      case 'completed':
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{run.status}</Badge>;
    }
  };

  const getRunTypeIcon = () => {
    return run.run_type === 'google_maps' 
      ? <MapPin className="h-4 w-4 text-primary" />
      : <Search className="h-4 w-4 text-purple-500" />;
  };

  const getResultCount = () => {
    if (run.run_type === 'google_search') {
      return run.search_results_count || 0;
    }
    return run.global_results_count || 0;
  };

  const getQuery = () => {
    if (run.query_data?.query) {
      return run.query_data.query;
    }
    if (run.query_data?.location) {
      return run.query_data.location;
    }
    return 'Unknown query';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    // Handle specific actions like download, view details etc.
    console.log(`Action ${action} for run ${run.id}`);
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getRunTypeIcon()}
            <span className="font-medium text-sm">
              {run.run_type === 'google_maps' ? 'Google Maps' : 'Google Search'}
            </span>
          </div>
          {getStatusIcon()}
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Badge variant="outline" className="text-xs">
            {getResultCount()} results
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Query Info */}
          <div>
            <div className="text-sm font-medium line-clamp-2 mb-1">
              {getQuery()}
            </div>
            {run.query_data?.location && run.query_data.query !== run.query_data.location && (
              <div className="text-xs text-muted-foreground">
                in {run.query_data.location}
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{getDuration()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Results:</span>
              <span className="font-medium">{getResultCount()}</span>
            </div>
          </div>

          {/* Date and Cost */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(run.created_at)}</span>
            {run.estimated_cost && (
              <Badge variant="outline" className="text-xs">
                ${Math.round(run.estimated_cost)}
              </Badge>
            )}
          </div>

          {/* Error Message */}
          {run.error_message && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
              {run.error_message}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={(e) => handleActionClick(e, 'view')}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2"
              onClick={(e) => handleActionClick(e, 'download')}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};