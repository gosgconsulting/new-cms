import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, MapPin, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

interface RunOverviewTabProps {
  onRunClick: (runId: string, runType: 'google_maps' | 'google_search') => void;
  selectedRunId?: string;
}

export const RunOverviewTab: React.FC<RunOverviewTabProps> = ({
  onRunClick,
  selectedRunId
}) => {
  const { user } = useAuth();
  const [runs, setRuns] = useState<RunData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchRuns();
    }
  }, [user?.id]);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      
      // Fetch Google Maps runs (lobstr_runs)
      const { data: mapsRuns, error: mapsError } = await supabase
        .from('lobstr_runs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (mapsError) throw mapsError;

      // Fetch Google Search runs (aggregate by search session or similar grouping)
      const { data: searchResults, error: searchError } = await supabase
        .from('google_search_results')
        .select('lobstr_run_id, search_session_id, search_keyword, scraped_at, user_id')
        .eq('user_id', user?.id)
        .order('scraped_at', { ascending: false });

      if (searchError) throw searchError;

      // Group search results by run/session to avoid duplicates
      const searchRunsMap = new Map();
      searchResults?.forEach(result => {
        // Use lobstr_run_id as primary key, fall back to search_session_id
        const runKey = result.lobstr_run_id || result.search_session_id;
        if (runKey && !searchRunsMap.has(runKey)) {
          searchRunsMap.set(runKey, {
            id: `search_${runKey}`, // Prefix to ensure unique ID
            run_id: result.lobstr_run_id,
            created_at: result.scraped_at,
            status: 'completed',
            global_results_count: 0,
            search_results_count: 0,
            run_type: 'google_search' as const,
            query_data: { query: result.search_keyword },
            squid_id: runKey
          });
        }
        if (runKey) {
          const run = searchRunsMap.get(runKey);
          run.search_results_count++;
        }
      });

      const searchRuns = Array.from(searchRunsMap.values());

      // Combine all runs and remove duplicates by ID
      const allRuns = [
        ...(mapsRuns?.map(run => ({
          ...run,
          run_type: 'google_maps' as const
        })) || []),
        ...searchRuns
      ];

      // Remove duplicates by ID and sort
      const uniqueRunsMap = new Map();
      allRuns.forEach(run => {
        if (!uniqueRunsMap.has(run.id)) {
          uniqueRunsMap.set(run.id, run);
        }
      });

      const combinedRuns: RunData[] = Array.from(uniqueRunsMap.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRuns(combinedRuns);
    } catch (error) {
      console.error('Error fetching runs:', error);
      toast.error('Failed to fetch run data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRunTypeIcon = (runType: 'google_maps' | 'google_search') => {
    return runType === 'google_maps' ? 
      <MapPin className="h-4 w-4 text-primary" /> : 
      <Search className="h-4 w-4 text-secondary" />;
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.round(duration / 60)}m`;
    return `${Math.round(duration / 3600)}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Run History ({runs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No runs found.</p>
            <p className="text-sm mt-2">Start a new search to see your run history here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Query/Location</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow 
                  key={run.id}
                  className={`cursor-pointer hover:bg-muted/50 ${run.id === selectedRunId ? 'bg-muted' : ''}`}
                  onClick={() => onRunClick(run.id, run.run_type)}
                >
                  <TableCell className="font-medium">
                    {formatDate(run.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRunTypeIcon(run.run_type)}
                      <Badge variant="outline" className="capitalize">
                        {run.run_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {run.query_data?.query || run.query_data?.location || 'Unknown query'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {run.global_results_count || run.search_results_count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDuration(run.duration)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(run.status)}
                      <span className="capitalize text-sm">{run.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRunClick(run.id, run.run_type);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};