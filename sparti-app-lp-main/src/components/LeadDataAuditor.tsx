import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Database, Users, Calendar, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LeadData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  activity: string;
  user_id: string;
  date_added: string;
  created_at: string;
  lobstr_run_id: string;
  search_query: string;
  search_location: string;
}

interface RunData {
  id: string;
  query: string;
  location: string;
  user_id: string;
  status: string;
  max_results: number;
  abort_limit: number;
  results_count: number;
  global_results_count: number;
  created_at: string;
}

export const LeadDataAuditor: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [runs, setRuns] = useState<RunData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalUsers: 0,
    leadsToday: 0,
    myLeads: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch leads data
      const { data: leadsData, error: leadsError } = await supabase
        .from('business_leads')
        .select('id, name, address, phone, email, activity, user_id, date_added, created_at, lobstr_run_id, search_query, search_location')
        .order('date_added', { ascending: false })
        .limit(50);

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        toast.error('Failed to fetch leads data');
      } else {
        setLeads(leadsData || []);
      }

      // Fetch runs data
      const { data: runsData, error: runsError } = await supabase
        .from('lobstr_runs')
        .select('id, query, location, user_id, status, max_results, abort_limit, results_count, global_results_count, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (runsError) {
        console.error('Error fetching runs:', runsError);
        toast.error('Failed to fetch runs data');
      } else {
        setRuns(runsData || []);
      }

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const totalLeads = leadsData?.length || 0;
      const totalUsers = new Set(leadsData?.map(lead => lead.user_id)).size;
      const leadsToday = leadsData?.filter(lead => 
        lead.date_added?.startsWith(today)
      ).length || 0;
      const myLeads = leadsData?.filter(lead => lead.user_id === user?.id).length || 0;

      setStats({
        totalLeads,
        totalUsers,
        leadsToday,
        myLeads
      });

    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Database className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p>Loading data audit...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>All Business Leads Data ({leads.length})</span>
          <Button onClick={fetchData} size="sm">
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
            <p className="text-muted-foreground">
              No business leads data available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">Activity</th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">Location</th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">Phone</th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">User ID</th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">Date Added</th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">Search Query</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr key={lead.id} className={`${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'} hover:bg-muted/30 ${lead.user_id === user?.id ? 'bg-primary/10' : ''}`}>
                      <td className="border-b px-4 py-3 text-sm">{lead.name}</td>
                      <td className="border-b px-4 py-3 text-sm">
                        <Badge variant="outline" className="text-xs">{lead.activity || 'N/A'}</Badge>
                      </td>
                      <td className="border-b px-4 py-3 text-sm">{lead.address?.slice(0, 30)}...</td>
                      <td className="border-b px-4 py-3 text-sm">{lead.phone || 'N/A'}</td>
                      <td className="border-b px-4 py-3 text-sm">
                        <span className={lead.user_id === user?.id ? 'font-bold text-primary' : 'text-muted-foreground'}>
                          {lead.user_id?.slice(-8)}
                        </span>
                      </td>
                      <td className="border-b px-4 py-3 text-sm">
                        {new Date(lead.date_added).toLocaleString()}
                      </td>
                      <td className="border-b px-4 py-3 text-sm">{lead.search_query || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};