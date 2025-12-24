import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Globe, Calendar, Target, Link as LinkIcon, Search, Plus, ExternalLink, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Brand } from '@/types/campaigns';
import { useQuery } from '@tanstack/react-query';

interface WebsiteData {
  domain: string;
  // New comprehensive domain overview
  domainOverview?: {
    domain: string;
    domain_rank: number;
    organic_traffic: number;
    organic_keywords: number;
    organic_cost: number;
    paid_traffic: number;
    paid_keywords: number;
    paid_cost: number;
    total_traffic: number;
    total_keywords: number;
    total_cost: number;
    date: string;
    // Historical data for charts
    historical_data?: Array<{
      date: string;
      organic_traffic: number;
      paid_traffic: number;
      total_traffic: number;
    }>;
  };
  // Legacy format for backward compatibility
  organicTraffic: Array<{
    month: string;
    traffic: number;
    change: number;
  }>;
  savedKeywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    difficulty: number;
    change: number;
  }>;
  topKeywordChanges: Array<{
    keyword: string;
    currentPosition: number;
    previousPosition: number;
    change: number;
    volume: number;
  }>;
  keywordSuggestions: Array<{
    keyword: string;
    volume: number;
    difficulty: number;
    cpc: number;
    competition: string;
  }>;
  backlinks: Array<{
    domain: string;
    url: string;
    anchorText: string;
    domainRating: number;
    traffic: number;
    type: string;
  }>;
}

interface TrackedKeyword {
  id: string;
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  competition_level: string;
  position: number | null;
  created_at: string;
}

interface ConnectedWebsite {
  id: string;
  domain: string;
  website_url: string;
  name?: string;
  brand_id: string;
  last_analyzed_at?: string;
  is_active: boolean;
}

interface ReportsDashboardProps {
  selectedBrand?: Brand | null;
}

export const ReportsDashboard = ({ selectedBrand }: ReportsDashboardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [website, setWebsite] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [connectedWebsites, setConnectedWebsites] = useState<ConnectedWebsite[]>([]);
  const [activeWebsite, setActiveWebsite] = useState<ConnectedWebsite | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Load connected websites for the selected brand
  useEffect(() => {
    if (selectedBrand?.id && user?.id) {
      loadConnectedWebsites();
    } else {
      setLoadingWebsites(false);
    }
  }, [selectedBrand, user]);

  // Fetch tracked keywords for the selected brand
  const { data: trackedKeywords = [] } = useQuery<TrackedKeyword[]>({
    queryKey: ['tracked-keywords', selectedBrand?.id, user?.id],
    queryFn: async () => {
      if (!selectedBrand?.id || !user?.id) return [];
      
      const { data, error } = await supabase
        .from('seo_tracked_keywords')
        .select('*')
        .eq('brand_id', selectedBrand.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedBrand?.id && !!user?.id
  });

  const loadConnectedWebsites = async () => {
    if (!selectedBrand?.id || !user?.id) return;

    try {
      setLoadingWebsites(true);
      const { data, error } = await supabase
        .from('connected_websites')
        .select('*')
        .eq('brand_id', selectedBrand.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConnectedWebsites(data || []);
      
      // Auto-select the first website if available
      if (data && data.length > 0) {
        const firstWebsite = data[0];
        setActiveWebsite(firstWebsite);
        setWebsite(firstWebsite.website_url);
        setIsConnected(true);
        
        // Load the latest analysis if available
        if (firstWebsite.last_analyzed_at) {
          await loadWebsiteAnalysis(firstWebsite.id);
        }
      }
    } catch (error) {
      console.error('Error loading connected websites:', error);
    } finally {
      setLoadingWebsites(false);
    }
  };

  const loadWebsiteAnalysis = async (websiteId: string) => {
    try {
      const { data, error } = await supabase
        .from('seo_analysis_history')
        .select('*')
        .eq('website_id', websiteId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return;

      // Reconstruct website data from stored analysis
      const analysisData = {
        domain: activeWebsite?.domain || '',
        organicTraffic: data.organic_traffic_data || [],
        savedKeywords: data.ranking_keywords_data || [],
        topKeywordChanges: data.keyword_changes_data || [],
        keywordSuggestions: data.keyword_suggestions_data || [],
        backlinks: data.backlinks_data || []
      };

      setWebsiteData(analysisData);
    } catch (error) {
      console.error('Error loading website analysis:', error);
    }
  };

  const handleConnectWebsite = async () => {
    if (!website) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBrand?.id || !user?.id) {
      toast({
        title: "Error", 
        description: "Please select a brand first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const cleanDomain = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Check if website is already connected for this brand
      const { data: existingWebsite } = await supabase
        .from('connected_websites')
        .select('*')
        .eq('brand_id', selectedBrand.id)
        .eq('domain', cleanDomain)
        .single();

      if (existingWebsite) {
        toast({
          title: "Website Already Connected",
          description: "This website is already connected to this brand",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Call DataForSEO API
      const response = await supabase.functions.invoke('dataforseo-analyze', {
        method: 'POST',
        body: JSON.stringify({ 
          website: cleanDomain,
          brand_id: selectedBrand.id
        }),
      });

      if (response.error) {
        throw new Error(response.error?.message || 'Failed to connect website');
      }

      const data = response.data;

      // Save website connection to database
      const { data: savedWebsite, error: saveError } = await supabase
        .from('connected_websites')
        .insert({
          brand_id: selectedBrand.id,
          user_id: user.id,
          domain: cleanDomain,
          website_url: website,
          name: cleanDomain,
          last_analyzed_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Save analysis data
      const { error: analysisError } = await supabase
        .from('seo_analysis_history')
        .insert({
          website_id: savedWebsite.id,
          user_id: user.id,
          analysis_date: new Date().toISOString().split('T')[0],
          organic_traffic_data: data.organicTraffic,
          ranking_keywords_data: data.savedKeywords,
          keyword_changes_data: data.topKeywordChanges,
          keyword_suggestions_data: data.keywordSuggestions,
          backlinks_data: data.backlinks,
          raw_api_response: data
        });

      if (analysisError) throw analysisError;

      setWebsiteData(data);
      setActiveWebsite(savedWebsite);
      setIsConnected(true);
      setIsEditing(false);
      
      // Refresh connected websites list
      await loadConnectedWebsites();
      
      toast({
        title: "Success",
        description: isEditing ? "Website updated and analyzed successfully" : "Website connected and analyzed successfully",
      });

    } catch (error) {
      console.error('Error connecting website:', error);
      toast({
        title: "Error",
        description: isEditing ? "Failed to update website. Please check the URL and try again." : "Failed to connect website. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWebsite = () => {
    if (activeWebsite) {
      setWebsite(activeWebsite.website_url);
      setIsEditing(true);
      setIsConnected(false);
    }
  };

  const handleWebsiteChange = (value: string) => {
    // If the value doesn't start with http:// or https://, add https://
    if (value && !value.match(/^https?:\/\//)) {
      setWebsite(`https://${value}`);
    } else {
      setWebsite(value);
    }
  };

  const handleSwitchWebsite = (connectedWebsite: ConnectedWebsite) => {
    setActiveWebsite(connectedWebsite);
    setWebsite(connectedWebsite.website_url);
    setIsConnected(true);
    
    // Load analysis for this website
    loadWebsiteAnalysis(connectedWebsite.id);
  };

  const handleDeleteWebsite = async () => {
    if (!activeWebsite) return;

    try {
      setIsLoading(true);
      
      // Delete from database
      const { error } = await supabase
        .from('connected_websites')
        .delete()
        .eq('id', activeWebsite.id);

      if (error) throw error;

      // Reset state
      setActiveWebsite(null);
      setWebsite('');
      setIsConnected(false);
      setWebsiteData(null);
      setConnectedWebsites([]);

      toast({
        title: "Success",
        description: "Website removed successfully",
      });

    } catch (error) {
      console.error('Error deleting website:', error);
      toast({
        title: "Error",
        description: "Failed to remove website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for demonstration
  const mockData: WebsiteData = {
    domain: website.replace(/^https?:\/\//, ''),
    organicTraffic: [
      { month: 'Jan', traffic: 12500, change: 5.2 },
      { month: 'Feb', traffic: 13200, change: 5.6 },
      { month: 'Mar', traffic: 14100, change: 6.8 },
      { month: 'Apr', traffic: 13800, change: -2.1 },
      { month: 'May', traffic: 15200, change: 10.1 },
      { month: 'Jun', traffic: 16800, change: 10.5 },
      { month: 'Jul', traffic: 17500, change: 4.2 },
      { month: 'Aug', traffic: 18200, change: 4.0 },
      { month: 'Sep', traffic: 19100, change: 4.9 },
      { month: 'Oct', traffic: 20500, change: 7.3 },
      { month: 'Nov', traffic: 21200, change: 3.4 },
      { month: 'Dec', traffic: 22800, change: 7.5 }
    ],
    savedKeywords: [
      { keyword: 'lead generation software', position: 3, volume: 5400, difficulty: 65, change: 2 },
      { keyword: 'business automation', position: 7, volume: 8900, difficulty: 58, change: -1 },
      { keyword: 'seo tools', position: 12, volume: 12500, difficulty: 72, change: 5 },
      { keyword: 'marketing automation', position: 5, volume: 7800, difficulty: 68, change: 0 },
    ],
    topKeywordChanges: [
      { keyword: 'lead generation', currentPosition: 8, previousPosition: 15, change: 7, volume: 9500 },
      { keyword: 'business leads', currentPosition: 12, previousPosition: 18, change: 6, volume: 4200 },
      { keyword: 'seo automation', currentPosition: 6, previousPosition: 11, change: 5, volume: 3100 },
      { keyword: 'marketing tools', currentPosition: 9, previousPosition: 13, change: 4, volume: 6800 },
    ],
    keywordSuggestions: [
      { keyword: 'ai lead generation', volume: 3200, difficulty: 45, cpc: 4.50, competition: 'Medium' },
      { keyword: 'automated lead scoring', volume: 1800, difficulty: 52, cpc: 6.20, competition: 'High' },
      { keyword: 'lead nurturing software', volume: 2400, difficulty: 48, cpc: 5.80, competition: 'Medium' },
      { keyword: 'b2b lead generation', volume: 8900, difficulty: 68, cpc: 7.40, competition: 'High' },
    ],
    backlinks: [
      { domain: 'techcrunch.com', url: '/startup-tools', anchorText: 'best lead generation', domainRating: 92, traffic: 2500000, type: 'Editorial' },
      { domain: 'forbes.com', url: '/marketing-automation', anchorText: 'automation platform', domainRating: 94, traffic: 3200000, type: 'Editorial' },
      { domain: 'entrepreneur.com', url: '/business-growth', anchorText: 'growth tools', domainRating: 85, traffic: 1800000, type: 'Guest Post' },
    ]
  };

  if (!selectedBrand) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Select a Brand</CardTitle>
            <CardDescription>
              Please select a brand from the overview to view its SEO reports
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loadingWebsites) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loading...</CardTitle>
            <CardDescription>Loading connected websites for {selectedBrand.name}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Show existing website (if any) when editing */}
        {connectedWebsites.length > 0 && !isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Connected Website for {selectedBrand.name}</CardTitle>
              <CardDescription>
                Click to view SEO reports for this website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSwitchWebsite(connectedWebsites[0])}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{connectedWebsites[0].name}</h4>
                      <p className="text-sm text-muted-foreground">{connectedWebsites[0].domain}</p>
                      {connectedWebsites[0].last_analyzed_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last analyzed: {new Date(connectedWebsites[0].last_analyzed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* Connect/Edit Website - only show if no website exists OR if editing */}
        {(connectedWebsites.length === 0 || isEditing) && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">
                {isEditing ? 'Edit Website' : 'Connect Your Website'}
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update your website URL and re-analyze SEO performance' : `Enter your website URL to start analyzing SEO performance for ${selectedBrand.name}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => handleWebsiteChange(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleConnectWebsite}
                  disabled={isLoading || !website}
                  className="flex-1"
                >
                  {isLoading ? (isEditing ? "Updating..." : "Connecting...") : (isEditing ? "Update Website" : "Connect Website")}
                </Button>
                {isEditing && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setIsConnected(true);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <p>✓ No Google Search Console required</p>
                <p>✓ DataFor SEO provides comprehensive SEO analytics</p>
                <p>✓ Secure API integration</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const displayData = websiteData || mockData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Reports Dashboard</h2>
          <p className="text-muted-foreground">
            Brand: {selectedBrand?.name} • Website: {activeWebsite?.name || displayData.domain}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditWebsite}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Website
          </Button>
          <Button variant="outline" onClick={handleDeleteWebsite} disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Website
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Organic Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Organic Traffic Trend
            </CardTitle>
            <CardDescription>Monthly organic traffic over the past 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={displayData.organicTraffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Traffic']}
                />
                <Line 
                  type="monotone" 
                  dataKey="traffic" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Tracked Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Top Tracked Keywords
            </CardTitle>
            <CardDescription>Your highest volume tracked keywords (position data requires GSC integration)</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Current Position</TableHead>
                    <TableHead>Previous Position</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackedKeywords.length > 0 ? (
                    // Sort tracked keywords by search volume (highest first) and show all
                    trackedKeywords
                      .filter(keyword => keyword.search_volume && keyword.search_volume > 0)
                      .sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0))
                      .map((keyword, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{keyword.keyword}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">N/A</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">N/A</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">No data</Badge>
                          </TableCell>
                          <TableCell>{keyword.search_volume?.toLocaleString() || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No tracked keywords with search volume data found. 
                        <br />
                        Go to Keywords page to add and fetch data for keywords.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};