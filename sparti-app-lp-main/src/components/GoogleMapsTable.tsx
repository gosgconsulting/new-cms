import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExternalLink, Eye, Star, Phone, Mail, ArrowLeft, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  search_query: string;
  search_location: string;
  date_added: string;
  lead_score: number;
  business_status: string;
  lobstr_run_id: string;
  // Enhanced fields
  website_emails?: string[];
  social_media_links?: any;
  website_technologies?: string[];
  ad_pixels?: string[];
  booking_links?: any;
  order_links?: string[];
  menu_link?: string;
  price_level?: string;
  additional_info?: any;
  images?: string[];
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
  run_type: 'google_maps';
  search_results_count?: number;
  duration?: number;
  error_message?: string;
  completed_at?: string;
}

interface GoogleMapsTableProps {
  onBack: () => void;
  selectedRunId?: string;
  onRunSelect?: (runId: string, runType: 'google_maps' | 'google_search') => void;
}

export const GoogleMapsTable: React.FC<GoogleMapsTableProps> = ({ onBack, selectedRunId, onRunSelect }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [runs, setRuns] = useState<RunData[]>([]);
  const [loading, setLoading] = useState(true);
  const [runsLoading, setRunsLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [activeTab, setActiveTab] = useState('run-history');

  useEffect(() => {
    if (user?.id) {
      fetchBusinessLeads();
      fetchRuns();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedRunId && onRunSelect) {
      fetchLeadsForRun(selectedRunId);
    }
  }, [selectedRunId]);

  const fetchRuns = async () => {
    try {
      setRunsLoading(true);
      
      // Query from scraping_runs table for Google Maps campaigns
      const { data: mapsRuns, error } = await supabase
        .from('scraping_runs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRuns: RunData[] = mapsRuns?.map(run => ({
        id: run.id,
        run_id: run.lobstr_run_id,
        created_at: run.created_at,
        status: run.status,
        global_results_count: run.results_count || 0,
        query_data: { query: run.query, location: run.location },
        squid_id: run.lobstr_squid_id || '',
        run_type: 'google_maps' as const,
        search_results_count: run.results_count,
        completed_at: run.completed_at,
        error_message: run.error_message
      })) || [];

      setRuns(formattedRuns);
    } catch (error) {
      console.error('Error fetching runs:', error);
      toast.error('Failed to fetch run data');
    } finally {
      setRunsLoading(false);
    }
  };

  const fetchBusinessLeads = async () => {
    try {
      setLoading(true);
      
      // Query from google_maps_leads table
      const { data, error, count } = await supabase
        .from('google_maps_leads')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform data to match BusinessLead interface
      const transformedLeads: BusinessLead[] = (data || []).map(lead => ({
        id: lead.id,
        name: lead.business_name,
        address: lead.address || '',
        phone: lead.phone || '',
        email: lead.email || '',
        website: lead.website || '',
        rating: Number(lead.rating) || 0,
        reviews_count: lead.reviews_count || 0,
        category: lead.category || '',
        activity: lead.category || '',
        search_query: '',
        search_location: lead.address || '',
        date_added: lead.created_at,
        lead_score: 0,
        business_status: lead.business_status || '',
        lobstr_run_id: lead.run_id,
        // Enhanced fields
        website_emails: lead.website_emails || [],
        social_media_links: lead.social_media_links || {},
        website_technologies: lead.website_technologies || [],
        ad_pixels: lead.ad_pixels || [],
        booking_links: lead.booking_links || {},
        order_links: lead.order_links || [],
        menu_link: lead.menu_link,
        price_level: lead.price_level,
        additional_info: lead.additional_info || {},
        images: lead.images || []
      }));

      setLeads(transformedLeads);
      setTotalLeads(count || 0);
    } catch (error) {
      console.error('Error fetching business leads:', error);
      toast.error('Failed to fetch business leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadsForRun = async (runId: string) => {
    try {
      setLoading(true);
      
      // Query google_maps_leads by run_id
      const { data, error, count } = await supabase
        .from('google_maps_leads')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .eq('run_id', runId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match BusinessLead interface
      const transformedLeads: BusinessLead[] = (data || []).map(lead => ({
        id: lead.id,
        name: lead.business_name,
        address: lead.address || '',
        phone: lead.phone || '',
        email: lead.email || '',
        website: lead.website || '',
        rating: Number(lead.rating) || 0,
        reviews_count: lead.reviews_count || 0,
        category: lead.category || '',
        activity: lead.category || '',
        search_query: '',
        search_location: lead.address || '',
        date_added: lead.created_at,
        lead_score: 0,
        business_status: lead.business_status || '',
        lobstr_run_id: lead.run_id,
        // Enhanced fields
        website_emails: lead.website_emails || [],
        social_media_links: lead.social_media_links || {},
        website_technologies: lead.website_technologies || [],
        ad_pixels: lead.ad_pixels || [],
        booking_links: lead.booking_links || {},
        order_links: lead.order_links || [],
        menu_link: lead.menu_link,
        price_level: lead.price_level,
        additional_info: lead.additional_info || {},
        images: lead.images || []
      }));

      setLeads(transformedLeads);
      setTotalLeads(count || 0);
    } catch (error) {
      console.error('Error fetching leads for run:', error);
      toast.error('Failed to fetch leads for selected run');
    } finally {
      setLoading(false);
    }
  };

  const handleRunClick = (runId: string) => {
    if (onRunSelect) {
      onRunSelect(runId, 'google_maps');
      setActiveTab('run-details');
      fetchLeadsForRun(runId);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return <Badge variant="default">Active</Badge>;
      case 'CLOSED_TEMPORARILY':
        return <Badge variant="secondary">Temp Closed</Badge>;
      case 'CLOSED_PERMANENTLY':
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default">{score}</Badge>;
    if (score >= 60) return <Badge variant="secondary">{score}</Badge>;
    return <Badge variant="outline">{score || 0}</Badge>;
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
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Google Maps Run History ({runs.length})</h3>
          </div>
          
          {runs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No Google Maps runs found.</p>
              <p className="text-sm mt-2">Start a new Google Maps search to see your run history here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run Date</TableHead>
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
                    onClick={() => handleRunClick(run.id)}
                  >
                    <TableCell className="font-medium">
                      {formatDate(run.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {run.query_data?.query || run.query_data?.location || 'Unknown query'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {run.global_results_count || 0}
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

  const renderLeadsTable = () => {
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
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {activeTab === 'run-details' && selectedRunId ? 'Selected Run Results' : 'Google Maps Business Leads'}
            </h2>
            <p className="text-muted-foreground">
              Total leads found: {totalLeads.toLocaleString()}
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
                <TableHead className="min-w-[200px]">Business</TableHead>
                <TableHead className="min-w-[150px]">Contact</TableHead>
                <TableHead className="min-w-[120px]">Social Media</TableHead>
                <TableHead className="min-w-[150px]">Website Tech</TableHead>
                <TableHead className="min-w-[100px]">Ad Pixels</TableHead>
                <TableHead className="min-w-[80px]">Price</TableHead>
                <TableHead className="min-w-[100px]">Rating</TableHead>
                <TableHead className="min-w-[120px]">Booking</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    <div>
                      <p>No business leads found.</p>
                      <p className="text-sm mt-2">Try running a new Google Maps search to find business leads.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-semibold">{lead.name}</div>
                        <Badge variant="outline" className="text-xs">{lead.category}</Badge>
                        <div className="text-xs text-muted-foreground max-w-[180px] truncate">{lead.address}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{lead.email}</span>
                          </div>
                        )}
                        {lead.website_emails && lead.website_emails.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +{lead.website_emails.length} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lead.social_media_links?.facebook && (
                          <a href={lead.social_media_links.facebook} target="_blank" rel="noopener noreferrer" 
                             className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs hover:opacity-80">
                            FB
                          </a>
                        )}
                        {lead.social_media_links?.instagram && (
                          <a href={lead.social_media_links.instagram} target="_blank" rel="noopener noreferrer"
                             className="px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 rounded text-xs hover:opacity-80">
                            IG
                          </a>
                        )}
                        {lead.social_media_links?.twitter && (
                          <a href={lead.social_media_links.twitter} target="_blank" rel="noopener noreferrer"
                             className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-200 rounded text-xs hover:opacity-80">
                            X
                          </a>
                        )}
                        {lead.social_media_links?.linkedin && (
                          <a href={lead.social_media_links.linkedin} target="_blank" rel="noopener noreferrer"
                             className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs hover:opacity-80">
                            IN
                          </a>
                        )}
                        {!lead.social_media_links && <span className="text-xs text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {lead.website_technologies && lead.website_technologies.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[130px]">
                          {lead.website_technologies.slice(0, 2).map((tech, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {lead.website_technologies.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{lead.website_technologies.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {lead.ad_pixels && lead.ad_pixels.length > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          {lead.ad_pixels.length} pixels
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {lead.price_level ? (
                        <span className="text-sm font-medium">{lead.price_level}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {lead.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{lead.rating.toFixed(1)}</span>
                          {lead.reviews_count && (
                            <span className="text-xs text-muted-foreground">({lead.reviews_count})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {lead.booking_links?.reservation && (
                          <a href={lead.booking_links.reservation} target="_blank" rel="noopener noreferrer"
                             className="text-xs text-blue-600 hover:underline block truncate max-w-[100px]">
                            Reservation
                          </a>
                        )}
                        {lead.menu_link && (
                          <a href={lead.menu_link} target="_blank" rel="noopener noreferrer"
                             className="text-xs text-blue-600 hover:underline block truncate max-w-[100px]">
                            Menu
                          </a>
                        )}
                        {lead.order_links && lead.order_links.length > 0 && (
                          <span className="text-xs text-muted-foreground">+{lead.order_links.length} order</span>
                        )}
                        {!lead.booking_links && !lead.menu_link && !lead.order_links?.length && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>{getStatusBadge(lead.business_status)}</TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {lead.website && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(lead.website, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
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
          <h1 className="text-2xl font-bold text-foreground">Google Maps Data</h1>
          <p className="text-muted-foreground">Manage your Google Maps search runs and results</p>
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
          {selectedRunId ? renderLeadsTable() : (
            <Card className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>No run selected.</p>
                <p className="text-sm mt-2">Select a run from the Run History tab to view its details.</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all-results">
          {renderLeadsTable()}
        </TabsContent>
      </Tabs>
    </div>
  );
};