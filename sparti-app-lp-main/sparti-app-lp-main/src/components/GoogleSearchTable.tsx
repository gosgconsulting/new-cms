import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExternalLink, Eye, Star, AlertTriangle, ArrowLeft, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleSearchLobstrService } from '@/services/googleSearchLobstrService';

interface GoogleSearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  displayed_url?: string;
  domain?: string;
  position?: number;
  page_number?: number;
  result_type?: string;
  snippet?: string;
  snippet_segments?: any;
  emphasized_keywords?: string;
  answer?: string;
  question?: string;
  date_published?: string;
  is_organic?: boolean;
  is_paid?: boolean;
  is_question_answer?: boolean;
  is_related_query?: boolean;
  total_results?: string;
  search_keyword: string;
  scraped_at: string;
  user_id: string;
  search_session_id?: string;
  lobstr_run_id?: string;
  processing_status?: string;
  scraped_sequence?: number;
  created_at: string;
  updated_at: string;
}

interface RunData {
  id: string;
  run_id?: string;
  created_at: string;
  status: string;
  global_results_count: number;
  estimated_cost?: number;
  query_data?: any;
  squid_id: string;
  run_type: 'google_search';
  search_results_count?: number;
  duration?: number;
  error_message?: string;
  completed_at?: string;
}

interface GoogleSearchTableProps {
  onBack: () => void;
  selectedRunId?: string;
  onRunSelect?: (runId: string, runType: 'google_maps' | 'google_search') => void;
}

export const GoogleSearchTable: React.FC<GoogleSearchTableProps> = ({ onBack, selectedRunId, onRunSelect }) => {
  const { user } = useAuth();
  const [results, setResults] = useState<GoogleSearchResult[]>([]);
  const [runs, setRuns] = useState<RunData[]>([]);
  const [loading, setLoading] = useState(true);
  const [runsLoading, setRunsLoading] = useState(true);
  const [stuckRun, setStuckRun] = useState<{id: string, run_id: string} | null>(null);
  const [forceCompleteLoading, setForceCompleteLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [activeTab, setActiveTab] = useState('run-history');

  useEffect(() => {
    if (user?.id) {
      fetchGoogleSearchResults();
      fetchRuns();
      checkForStuckRuns();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedRunId && onRunSelect) {
      fetchResultsForRun(selectedRunId);
    }
  }, [selectedRunId]);

  const fetchRuns = async () => {
    try {
      setRunsLoading(true);
      
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
      setRuns(searchRuns);
    } catch (error) {
      console.error('Error fetching runs:', error);
      toast.error('Failed to fetch run data');
    } finally {
      setRunsLoading(false);
    }
  };

  const fetchGoogleSearchResults = async () => {
    try {
      setLoading(true);
      
      const { data, error, count } = await supabase
        .from('google_search_results')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .order('scraped_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setResults(data || []);
      setTotalResults(count || 0);
    } catch (error) {
      console.error('Error fetching Google Search results:', error);
      toast.error('Failed to fetch Google Search results');
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsForRun = async (runId: string) => {
    try {
      setLoading(true);
      
      // Extract the actual ID from the prefixed ID
      const actualRunId = runId.startsWith('search_') ? runId.replace('search_', '') : runId;
      
      const { data, error, count } = await supabase
        .from('google_search_results')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .or(`lobstr_run_id.eq.${actualRunId},search_session_id.eq.${actualRunId}`)
        .order('scraped_at', { ascending: false });

      if (error) throw error;

      setResults(data || []);
      setTotalResults(count || 0);
    } catch (error) {
      console.error('Error fetching results for run:', error);
      toast.error('Failed to fetch results for selected run');
    } finally {
      setLoading(false);
    }
  };

  const handleRunClick = (runId: string) => {
    if (onRunSelect) {
      onRunSelect(runId, 'google_search');
      setActiveTab('run-details');
      fetchResultsForRun(runId);
    }
  };

  const checkForStuckRuns = async () => {
    try {
      const { data: runs, error } = await supabase
        .from('lobstr_runs')
        .select('id, run_id, started_at, status')
        .eq('user_id', user?.id)
        .eq('status', 'running')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (runs && runs.length > 0) {
        const run = runs[0];
        const startedAt = new Date(run.started_at);
        const now = new Date();
        const timeDiff = now.getTime() - startedAt.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);

        if (hoursDiff > 24) {
          setStuckRun({ id: run.id, run_id: run.run_id });
        }
      }
    } catch (error) {
      console.error('Error checking for stuck runs:', error);
    }
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

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.round(duration / 60)}m`;
    return `${Math.round(duration / 3600)}h`;
  };

  const forceCompleteRun = async () => {
    if (!stuckRun) return;
    
    try {
      setForceCompleteLoading(true);
      // Simple update to mark run as completed - replace with actual service call if available
      const { error } = await supabase
        .from('lobstr_runs')
        .update({ status: 'completed' })
        .eq('id', stuckRun.id);
      
      if (error) throw error;
      
      setStuckRun(null);
      fetchGoogleSearchResults();
      checkForStuckRuns();
    } catch (error) {
      console.error('Error forcing run completion:', error);
      toast.error('Failed to complete run');
    } finally {
      setForceCompleteLoading(false);
    }
  };

  const renderRunHistoryTable = () => {
    if (runsLoading) {
      return (
        <Card>
          <div className="p-6">
            <div className="animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Google Search Run History ({runs.length})</h3>
          </div>
          
          {runs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No Google Search runs found.</p>
              <p className="text-sm mt-2">Start a new Google Search to see your run history here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run Date</TableHead>
                  <TableHead>Query/Keyword</TableHead>
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
                    onClick={() => handleRunClick(run.id)}
                  >
                    <TableCell className="font-medium">
                      {formatDate(run.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {run.query_data?.query || 'Unknown query'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {run.search_results_count || 0}
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
                          handleRunClick(run.id);
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
        </div>
      </Card>
    );
  };

  const getPositionBadge = (position?: number) => {
    if (!position) return null;
    
    if (position <= 3) {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">#{position}</Badge>;
    } else if (position <= 10) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">#{position}</Badge>;
    } else {
      return <Badge variant="outline" className="text-muted-foreground">#{position}</Badge>;
    }
  };

  const getResultTypeBadge = (type?: string) => {
    if (!type) return null;
    
    const colors: Record<string, string> = {
      'organic': 'bg-accent/10 text-accent border-accent/20',
      'paid': 'bg-orange-100 text-orange-800 border-orange-200',
      'featured_snippet': 'bg-purple-100 text-purple-800 border-purple-200',
      'local': 'bg-green-100 text-green-800 border-green-200',
      'image': 'bg-pink-100 text-pink-800 border-pink-200',
      'video': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
      >
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const renderResultsTable = () => {
    if (loading) {
      return (
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {stuckRun && (
          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">Stuck Run Detected</h3>
                  <p className="text-sm text-yellow-700">
                    Run {stuckRun.run_id} has been running for over 24 hours. Would you like to force complete it?
                  </p>
                </div>
              </div>
              <Button
                onClick={forceCompleteRun}
                disabled={forceCompleteLoading}
                variant="outline"
                size="sm"
              >
                {forceCompleteLoading ? 'Completing...' : 'Force Complete'}
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeTab === 'run-details' && selectedRunId ? 'Selected Run Results' : 'Google Search Results'}
              </h2>
              <p className="text-muted-foreground">
                Total results found: {totalResults.toLocaleString()}
              </p>
              {activeTab === 'run-details' && selectedRunId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab('all-results')}
                  className="mt-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  View All Results
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead className="w-[350px]">Description</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <div>
                        <p>No search results found.</p>
                        <p className="text-sm mt-2">Try running a new Google Search to see results here.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => (
                    <TableRow key={result.id} className="hover:bg-muted/50">
                      <TableCell>
                        {getPositionBadge(result.position)}
                      </TableCell>
                      <TableCell className="w-[300px] max-w-[300px]">
                        <div className="font-medium text-sm leading-tight break-words">
                          {result.title}
                        </div>
                      </TableCell>
                      <TableCell className="w-[350px] max-w-[350px]">
                        <div className="text-sm text-muted-foreground leading-tight break-words">
                          {result.description || 'No description available'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">
                          <div className="text-green-600 text-xs">
                            {result.displayed_url || result.domain}
                          </div>
                          <div className="text-muted-foreground text-xs truncate">
                            {result.url}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getResultTypeBadge(result.result_type)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {result.search_keyword}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(result.scraped_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(result.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Google Search Data</h1>
          <p className="text-muted-foreground">Manage your Google Search runs and results</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="run-history">Run History</TabsTrigger>
          <TabsTrigger value="run-details" disabled={!selectedRunId}>
            Run Details {selectedRunId && `(Selected)`}
          </TabsTrigger>
          <TabsTrigger value="all-results">All Results</TabsTrigger>
        </TabsList>

        <TabsContent value="run-history">
          {renderRunHistoryTable()}
        </TabsContent>

        <TabsContent value="run-details">
          {selectedRunId ? renderResultsTable() : (
            <Card className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>No run selected.</p>
                <p className="text-sm mt-2">Select a run from the Run History tab to view its details.</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all-results">
          {renderResultsTable()}
        </TabsContent>
      </Tabs>
    </div>
  );
};