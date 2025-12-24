import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LobstrService, ScrapedLead, ProgressCallback } from '@/services/lobstrService';
import { Search, Users, Loader2, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedBusinessSearchLoader from './AnimatedBusinessSearchLoader';
import RealBusinessLeadsTable from './RealBusinessLeadsTable';
import ProcessStepDisplay from './ProcessStepDisplay';

import { SearchableSelect } from '@/components/ui/searchable-select';
import { supabase } from '@/integrations/supabase/client';
import { COUNTRIES_WITH_POPULAR_FIRST } from '@/data/countries-languages';


interface LobstrIntegrationProps {
  onLeadsGenerated?: (leads: any[]) => void;
  className?: string;
  onSearchStarted?: (runId: string, query: string, location: string) => void;
}

interface StepStatus {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  errorMessage?: string;
  debugData?: any;
}

const LobstrIntegration = ({ onLeadsGenerated, className, onSearchStarted }: LobstrIntegrationProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<StepStatus[]>([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScrapedLead[]>([]);
  const [realTimeLeads, setRealTimeLeads] = useState<any[]>([]);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  
  // Form states
  const [activity, setActivity] = useState('');
  const [country, setCountry] = useState('Thailand');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [collectBusinessDetails, setCollectBusinessDetails] = useState(true);
  const [fetchBusinessImages, setFetchBusinessImages] = useState(false);
  const [useParameterTasks, setUseParameterTasks] = useState(true);
  
  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [estimatedResults, setEstimatedResults] = useState<number | null>(null);

  // Activity/Business category options
  const activityOptions = [
    { value: 'restaurants', label: 'Restaurants' },
    { value: 'hotels', label: 'Hotels' },
    { value: 'gyms', label: 'Gyms & Fitness' },
    { value: 'cafes', label: 'Cafes & Coffee' },
    { value: 'beauty salons', label: 'Beauty Salons' },
    { value: 'retail stores', label: 'Retail Stores' },
    { value: 'auto repair', label: 'Auto Repair' },
    { value: 'medical clinics', label: 'Medical Clinics' },
    { value: 'dental clinics', label: 'Dental Clinics' },
    { value: 'real estate', label: 'Real Estate' },
  ];

  // Abort limit options for dropdown
  const abortLimitOptions = [
    { value: 50, label: "50 Results" },
    { value: 100, label: "100 Results" },
    { value: 200, label: "200 Results" },
    { value: 400, label: "400 Results" },
    { value: 600, label: "600 Results" },
    { value: 800, label: "800 Results" },
    { value: 1000, label: "1000 Results" },
  ];

  // Use the comprehensive country list
  const countryOptions = COUNTRIES_WITH_POPULAR_FIRST;

  // Update estimated results when search parameters change
  React.useEffect(() => {
    if (activity.trim() && city.trim()) {
      // Mock estimation logic - in real app this would call an API
      const baseEstimate = 50;
      const activityMultiplier = activity.length > 0 ? 1.2 : 1.0;
      const locationMultiplier = country === 'Thailand' ? 1.2 : 1.0;
      const estimated = Math.floor(baseEstimate * activityMultiplier * locationMultiplier);
      setEstimatedResults(Math.min(estimated, maxResults));
    } else {
      setEstimatedResults(null);
    }
  }, [activity, city, country, maxResults]);

  const initializeSteps = (query: string, location: string) => {
    return [
      { 
        id: 1, 
        title: 'Prepare Squid (Empty & Update)', 
        description: `Using existing squid for "${query}" in ${location}`, 
        status: 'pending' as const,
        debugData: null
      },
      { 
        id: 2, 
        title: 'Add Search Tasks', 
        description: 'Adding search tasks to prepared squid', 
        status: 'pending' as const,
        debugData: null
      },
      { 
        id: 3, 
        title: 'Launch Scraping Run', 
        description: 'Starting Google Maps data extraction', 
        status: 'pending' as const,
        debugData: null
      },
      { 
        id: 4, 
        title: 'Collect Results', 
        description: 'Monitoring progress and collecting results', 
        status: 'pending' as const,
        debugData: null
      }
    ];
  };

  // Fetch real-time leads from database
  const fetchRealTimeLeads = async (runId?: string) => {
    if (!runId && !currentRunId) return;
    
    try {
      // Temporarily disable real-time lead fetching to fix type errors
      const leads: any[] = [];
      console.log('Fetching leads for run:', runId || currentRunId);
      
      if (leads && leads.length > 0) {
        console.log(`📊 Fetched ${leads.length} real-time leads from database`);
        setRealTimeLeads(leads);
      }
    } catch (error) {
      console.error('Error fetching real-time leads:', error);
    }
  };

  const updateStepStatus: ProgressCallback = (stepId, title, description, status, errorMessage, debugData) => {
    // Map 'active' status to 'running' for our interface
    const mappedStatus = status === 'active' ? 'running' : status;
    
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, title, description, status: mappedStatus, errorMessage, debugData }
          : step
      )
    );
    
    // Update progress: 4 steps = 25% each
    const baseProgress = (stepId - 1) * 25;
    const stepProgress = mappedStatus === 'completed' ? 25 : mappedStatus === 'running' ? 12.5 : 0;
    setProgress(baseProgress + stepProgress);

    // If we're in step 4 (collecting results), start fetching real-time leads
    if (stepId === 4 && mappedStatus === 'running') {
      console.log('🔄 Step 4 running - starting real-time lead monitoring');
      fetchRealTimeLeads();
      
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        fetchRealTimeLeads();
      }, 3000); // Poll every 3 seconds
      
      // Store interval ID to clear it later
      (window as any).leadPollingInterval = interval;
    }
    
    // Clear polling when step 4 completes
    if (stepId === 4 && (mappedStatus === 'completed' || mappedStatus === 'error')) {
      if ((window as any).leadPollingInterval) {
        clearInterval((window as any).leadPollingInterval);
        delete (window as any).leadPollingInterval;
        console.log('⏹️ Stopped real-time lead monitoring');
      }
      
      // Final fetch when completed
      if (mappedStatus === 'completed') {
        fetchRealTimeLeads();
      }
    }
  };

  const handleSearch = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to search for business leads",
        variant: "destructive",
      });
      return;
    }

    if (!activity.trim() || !city.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select activity and enter city to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResults([]);
    setRealTimeLeads([]); // Clear previous real-time leads
    setCurrentRunId(null);
    
    const query = activity;
    // Construct proper location with country priority
    const locationParts = [];
    if (city.trim()) locationParts.push(city.trim());
    if (region.trim()) locationParts.push(region.trim());
    if (country.trim()) locationParts.push(country.trim());
    const location = locationParts.join(', ');
    
    console.log('🎯 Search parameters:', { 
      query: query.trim(), 
      location, 
      maxResults,
      breakdown: { city: city.trim(), region: region.trim(), country: country.trim() }
    });
    
    setSteps(initializeSteps(query, location));

    try {
      console.log('🎯 Starting NEW Lobstr search:', { query, location, maxResults });
      
      const result = await LobstrService.scrapeBusinessLeads({
        query,
        location,
        maxResults,
        userId: user?.id,
        useParameterTasks
      }, updateStepStatus);
      
      // Notify about search start for dashboard redirection
      if (result.runId) {
        onSearchStarted?.(result.runId, query, location);
        
        // Also trigger the global dashboard function if available
        if (typeof window !== 'undefined' && (window as any).handleNewSearchStarted) {
          (window as any).handleNewSearchStarted(result.runId, query, location);
        }
      }
      
      setProgress(100);
      setResults(result.leads);
      setCurrentRunId(result.runId);
      
      // Final fetch of real-time leads
      await fetchRealTimeLeads(result.runId);

      // Pass results to parent component
      onLeadsGenerated?.(result.leads);

      // Display success message with new format if available
      if (result.searchSummary?.message) {
        toast({
          title: "Business Leads Found!",
          description: result.searchSummary.message,
          duration: 8000,
        });
      } else {
        // Fallback to old format
        toast({
          title: "Business Leads Found!",
          description: `Successfully found ${realTimeLeads.length || result.leads.length} business leads in ${city}`,
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('❌ Business search failed:', error);
      
      // Update the current running step to show error
      setSteps(prevSteps => 
        prevSteps.map(step => 
          step.status === 'running' 
            ? { ...step, status: 'error' as const, errorMessage: error instanceof Error ? error.message : 'Unknown error occurred' }
            : step
        )
      );

      // Show specific error messages based on error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      let userFriendlyMessage = errorMessage;
      
      if (errorMessage.includes('Failed to save run record')) {
        userFriendlyMessage = 'Database error occurred. Please try again.';
      } else if (errorMessage.includes('API key')) {
        userFriendlyMessage = 'API authentication failed. Please check configuration.';
      } else if (errorMessage.includes('rate limit')) {
        userFriendlyMessage = 'Too many requests. Please wait before trying again.';
      }
      
      toast({
        title: "Search Failed", 
        description: userFriendlyMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      
      // Clear any active polling intervals
      if ((window as any).leadPollingInterval) {
        clearInterval((window as any).leadPollingInterval);
        delete (window as any).leadPollingInterval;
      }
    }
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto space-y-6", className)}>
      {/* Search Interface */}
      <Card className="glass shadow-glow-primary border-primary/20 overflow-hidden">
        <CardContent className="p-6">
          {/* Primary Search Bar - Compact Layout */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {/* Activity Dropdown - 25% */}
              <div className="col-span-1">
                <SearchableSelect
                  options={activityOptions.map(option => ({
                    value: option.value,
                    label: option.label
                  }))}
                  value={activity}
                  onValueChange={setActivity}
                  placeholder="Activity"
                  searchPlaceholder="Search activities..."
                  disabled={isLoading}
                  allowCustomEntry={true}
                  className="h-16 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground transition-all duration-300 text-base"
                />
              </div>

              {/* Country Dropdown - 25% */}
              <div className="col-span-1">
                <SearchableSelect
                  options={countryOptions}
                  value={country}
                  onValueChange={setCountry}
                  placeholder="Country"
                  searchPlaceholder="Search countries..."
                  disabled={isLoading}
                  allowCustomEntry={true}
                  className="h-16 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground transition-all duration-300 text-base"
                />
              </div>

              {/* Region/State Field - 25% */}
              <div className="col-span-1">
                <Input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={isLoading}
                  placeholder="Region/State"
                  className="h-16 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground transition-all duration-300 text-base px-4"
                />
              </div>

              {/* City/Location Field - 25% */}
              <div className="col-span-1">
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoading}
                  placeholder="City/Location"
                  className="h-16 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground transition-all duration-300 text-base px-4"
                />
              </div>
            </div>

            {/* Search Button and Target Leads - Compact Spacing */}
            <div className="flex gap-4 pt-2">
              <Button 
                onClick={handleSearch}
                disabled={isLoading || !activity.trim() || !city.trim()}
                className="flex-[0.7] h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 text-base"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-6 w-6 mr-3" />
                    Search
                  </>
                )}
              </Button>
              
               {/* Abort Limit Dropdown */}
               <div className="flex-[0.3]">
                 <SearchableSelect
                   options={abortLimitOptions.map(option => ({
                     value: option.value.toString(),
                     label: option.label
                   }))}
                   value={maxResults.toString()}
                   onValueChange={(value) => setMaxResults(Number(value))}
                    placeholder="Max Results"
                    searchPlaceholder="Search results limit..."
                   disabled={isLoading}
                   className="h-16 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground transition-all duration-300 text-base"
                 />
               </div>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) - Compact Separation */}
          <div className="pt-4 border-t border-border/30 mt-4">
            <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-14 justify-between bg-muted/30 hover:bg-muted/50 border-border/60 rounded-xl transition-all duration-300 text-base font-medium",
                    showAdvancedFilters && "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-primary" />
                    <span className="text-foreground">
                      {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                    </span>
                    {/* Badge for active filters */}
                    {(useParameterTasks || collectBusinessDetails || fetchBusinessImages) && (
                      <Badge variant="secondary" className="ml-2 h-6 px-2 text-xs bg-primary/20 text-primary">
                        {[useParameterTasks, collectBusinessDetails, fetchBusinessImages].filter(Boolean).length}
                      </Badge>
                    )}
                  </div>
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 animate-accordion-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-muted/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Parameter Tasks</label>
                    <p className="text-xs text-muted-foreground">More accurate, enforces limits</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={useParameterTasks}
                    onChange={(e) => setUseParameterTasks(e.target.checked)}
                    disabled={isLoading}
                    className="w-5 h-5 text-primary bg-background/60 border-border/60 rounded focus:ring-primary/60 transition-all duration-300"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Business Details</label>
                    <p className="text-xs text-muted-foreground">Include phone, website, hours</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={collectBusinessDetails}
                    onChange={(e) => setCollectBusinessDetails(e.target.checked)}
                    disabled={isLoading}
                    className="w-5 h-5 text-primary bg-background/60 border-border/60 rounded focus:ring-primary/60 transition-all duration-300"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Business Images</label>
                    <p className="text-xs text-muted-foreground">Download photos (slower)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={fetchBusinessImages}
                    onChange={(e) => setFetchBusinessImages(e.target.checked)}
                    disabled={isLoading}
                    className="w-5 h-5 text-primary bg-background/60 border-border/60 rounded focus:ring-primary/60 transition-all duration-300"
                  />
                </div>
              </div>
            </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Validation Message */}
          {(!activity.trim() || !city.trim()) && (
            <p className="text-sm text-muted-foreground text-center mt-4 bg-muted/10 rounded-xl p-3">
              Select activity and enter city to search for business leads
            </p>
          )}
        </CardContent>
      </Card>


      {/* Process Step Display - Shows status with visual indicators */}
      <ProcessStepDisplay steps={steps} className="mb-6" />


      {/* Results Summary */}
      {results.length > 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">
                  Successfully found {results.length} business leads
                </p>
                <p className="text-sm text-green-700">
                  Leads have been added to your results
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                NEW Lobstr.io
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default LobstrIntegration;