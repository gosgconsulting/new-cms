import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface LobstrRun {
  id: string;
  run_id?: string; // The actual Lobstr API run ID
  created_at: string;
  status: string;
  abort_limit: number;
  global_results_count: number;
  abort_requested: boolean;
  squid_id: string;
  estimated_cost?: number;
  query_data?: any;
  abort_reason?: string;
  completed_at?: string;
  error_message?: string;
}

interface BusinessLead {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviews_count: number;
  category: string;
  activity: string;
  date_added: string;
  lobstr_run_id: string;
}

interface ContactDashboardProps {
  campaignId?: string;
  className?: string;
  initialActiveTab?: string;
  onTabChange?: (tab: string) => void;
  onRunAdded?: (runId: string, query: string, location: string) => void;
}

export interface ContactDashboardRef {
  addPendingRun: (runId: string, query: string, location: string) => void;
}

export const ContactDashboard = React.forwardRef<ContactDashboardRef, ContactDashboardProps>(({ 
  campaignId, 
  className,
  initialActiveTab = 'runs',
  onTabChange,
  onRunAdded
}, ref) => {
  const { user } = useAuth();
  const [runs, setRuns] = useState<LobstrRun[]>([]);
  const [allLeads, setAllLeads] = useState<BusinessLead[]>([]);
  const [selectedRunLeads, setSelectedRunLeads] = useState<BusinessLead[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  // Set up real-time subscriptions for runs and leads
  useEffect(() => {
    if (user?.id) {
      fetchData();
      
      // Subscribe to real-time updates for runs
      const runsChannel = supabase
        .channel('lobstr-runs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lobstr_runs',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Run update received:', payload);
            if (payload.eventType === 'INSERT') {
              const newRun = payload.new as LobstrRun;
              // Check if run already exists to avoid duplicates
              setRuns(prev => {
                const exists = prev.some(run => 
                  (newRun.run_id && run.run_id === newRun.run_id) ||
                  (!newRun.run_id && run.id === newRun.id)
                );
                if (!exists) {
                  return [newRun, ...prev];
                }
                return prev;
              });
            } else if (payload.eventType === 'UPDATE') {
              setRuns(prev => prev.map(run => 
                run.id === payload.new.id ? { ...run, ...payload.new } : run
              ));
            }
          }
        )
        .subscribe();

      // Subscribe to real-time updates for leads
      const leadsChannel = supabase
        .channel('business-leads-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'business_leads',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New lead received:', payload);
            setAllLeads(prev => [payload.new as BusinessLead, ...prev]);
            
            // Update selected run leads if this lead belongs to the selected run
            if (selectedRunId && payload.new.lobstr_run_id === selectedRunId) {
              setSelectedRunLeads(prev => [payload.new as BusinessLead, ...prev]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(runsChannel);
        supabase.removeChannel(leadsChannel);
      };
    }
  }, [user?.id, selectedRunId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch runs - ensure proper separation by run_id
      const { data: runsData, error: runsError } = await supabase
        .from('lobstr_runs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (runsError) throw runsError;
      
      // Filter out duplicate runs based on run_id and ensure each run is unique
      const uniqueRuns = runsData?.filter((run, index, self) => 
        index === self.findIndex(r => 
          // Use run_id if available, otherwise use database id
          (run.run_id && r.run_id === run.run_id) || 
          (!run.run_id && !r.run_id && r.id === run.id)
        )
      ) || [];
      
      setRuns(uniqueRuns);

      // Fetch all leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('business_leads')
        .select('*')
        .eq('user_id', user?.id)
        .order('date_added', { ascending: false });

      if (leadsError) throw leadsError;
      setAllLeads(leadsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab changes and notify parent
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Add a new run immediately when search starts
  const addPendingRun = (runId: string, query: string, location: string) => {
    const newRun: LobstrRun = {
      id: runId,
      created_at: new Date().toISOString(),
      status: 'pending',
      abort_limit: 0,
      global_results_count: 0,
      abort_requested: false,
      squid_id: '',
      query_data: { query, location }
    };
    
    // Only add if this run doesn't already exist
    setRuns(prev => {
      const exists = prev.some(run => run.id === runId);
      if (!exists) {
        return [newRun, ...prev];
      }
      return prev;
    });
    setActiveTab('runs');
    onTabChange?.('runs');
  };

  // Expose methods to parent components
  React.useImperativeHandle(ref, () => ({
    addPendingRun
  }), []);

  const handleRunClick = async (runId: string) => {
    try {
      setSelectedRunId(runId);
      const { data, error } = await supabase
        .from('business_leads')
        .select('*')
        .eq('lobstr_run_id', runId)
        .order('date_added', { ascending: false });

      if (error) throw error;
      setSelectedRunLeads(data || []);
      setActiveTab('run-results');
    } catch (error) {
      console.error('Error fetching run leads:', error);
      toast.error('Failed to fetch run results');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string, abortRequested: boolean) => {
    if (abortRequested) {
      return <Badge variant="destructive">Aborted</Badge>;
    }
    switch (status) {
      case 'completed':
        return <Badge variant="default">Done</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Leads Management</h3>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-results">All Results</TabsTrigger>
            <TabsTrigger value="runs">Runs</TabsTrigger>
            <TabsTrigger value="run-results" disabled={!selectedRunId}>
              {selectedRunId ? 'Run Results' : 'Select Run'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="runs" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Run ID</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Credits Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow key={run.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell 
                        className="font-mono text-sm"
                        onClick={() => handleRunClick(run.id)}
                      >
                        {run.run_id ? run.run_id.substring(0, 12) + '...' : run.id.substring(0, 8) + '...'}
                      </TableCell>
                      <TableCell onClick={() => handleRunClick(run.id)}>
                        {run.global_results_count || 0}
                      </TableCell>
                      <TableCell onClick={() => handleRunClick(run.id)}>
                        {formatDate(run.created_at)}
                      </TableCell>
                      <TableCell onClick={() => handleRunClick(run.id)}>
                        <Badge variant="destructive">
                          {Math.round(run.estimated_cost || 0)}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => handleRunClick(run.id)}>
                        {getStatusBadge(run.status, run.abort_requested)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRunClick(run.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {runs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No search runs found. Start a search to see results here.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="all-results" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" 
                             className="text-primary hover:underline">
                            {lead.name}
                          </a>
                        ) : (
                          lead.name
                        )}
                      </TableCell>
                      <TableCell>{lead.address}</TableCell>
                      <TableCell>
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                            {lead.phone}
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                            {lead.email}
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.rating && (
                          <div className="flex items-center gap-1">
                            <span>{lead.rating}</span>
                            <span className="text-muted-foreground">({lead.reviews_count})</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{lead.category || lead.activity}</TableCell>
                      <TableCell>{formatDate(lead.date_added)}</TableCell>
                    </TableRow>
                  ))}
                  {allLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No leads found. Start a search to generate leads.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="run-results" className="mt-4">
            {selectedRunLeads.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRunLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.website ? (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" 
                               className="text-primary hover:underline">
                              {lead.name}
                            </a>
                          ) : (
                            lead.name
                          )}
                        </TableCell>
                        <TableCell>{lead.address}</TableCell>
                        <TableCell>
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                              {lead.phone}
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                              {lead.email}
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.rating && (
                            <div className="flex items-center gap-1">
                              <span>{lead.rating}</span>
                              <span className="text-muted-foreground">({lead.reviews_count})</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{lead.category || lead.activity}</TableCell>
                        <TableCell>{formatDate(lead.date_added)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
});

ContactDashboard.displayName = 'ContactDashboard';

export default ContactDashboard;