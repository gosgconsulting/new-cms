import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Search
} from 'lucide-react';

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

interface QuickStatsProps {
  runs: RunData[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ runs }) => {
  const totalRuns = runs.length;
  const completedRuns = runs.filter(run => run.status === 'completed').length;
  const runningRuns = runs.filter(run => run.status === 'running').length;
  const failedRuns = runs.filter(run => run.status === 'failed').length;
  
  const googleMapsRuns = runs.filter(run => run.run_type === 'google_maps');
  const googleSearchRuns = runs.filter(run => run.run_type === 'google_search');
  
  const totalResults = runs.reduce((sum, run) => {
    if (run.run_type === 'google_search') {
      return sum + (run.search_results_count || 0);
    }
    return sum + (run.global_results_count || 0);
  }, 0);
  
  const totalCost = runs.reduce((sum, run) => sum + (run.estimated_cost || 0), 0);
  
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;
  
  const avgResultsPerRun = totalRuns > 0 ? Math.round(totalResults / totalRuns) : 0;

  const stats = [
    {
      title: 'Total Runs',
      value: totalRuns.toLocaleString(),
      icon: Database,
      description: 'All search runs',
      color: 'text-primary'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      description: `${completedRuns} completed`,
      color: 'text-emerald-500'
    },
    {
      title: 'Total Results',
      value: totalResults.toLocaleString(),
      icon: CheckCircle,
      description: `Avg ${avgResultsPerRun} per run`,
      color: 'text-primary'
    },
    {
      title: 'Active Runs',
      value: runningRuns.toString(),
      icon: Clock,
      description: runningRuns > 0 ? 'Currently running' : 'No active runs',
      color: runningRuns > 0 ? 'text-orange-500' : 'text-muted-foreground'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            {stat.title === 'Total Runs' && (
              <div className="flex gap-1 mt-2">
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {googleMapsRuns.length} Maps
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Search className="h-3 w-3 mr-1" />
                  {googleSearchRuns.length} Search
                </Badge>
              </div>
            )}
            {failedRuns > 0 && stat.title === 'Success Rate' && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 text-destructive" />
                <span className="text-xs text-destructive">{failedRuns} failed</span>
              </div>
            )}
            {totalCost > 0 && stat.title === 'Total Results' && (
              <div className="text-xs text-muted-foreground mt-1">
                Cost: ${Math.round(totalCost)}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};