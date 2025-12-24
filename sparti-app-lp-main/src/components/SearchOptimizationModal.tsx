import { useState } from 'react';
import { Settings, DollarSign, Phone, Mail, Globe, Target, Image, Clock, Star, Info, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SearchOptimizationModalProps {
  onFiltersChange?: (filters: OptimizationFilters) => void;
  leadQuantity?: number;
}

export interface OptimizationFilters {
  // Data collection toggles (activate to collect additional data)
  includeOpeningHours: boolean;
  includeAdditionalInfo: boolean;
  includeCompanyContacts: boolean;
  includeBusinessLeads: boolean;
  
  // Always enabled (essential for leads)
  includeReviewCount: boolean;
  includeContactDetails: boolean;
}

const SearchOptimizationModal = ({ 
  onFiltersChange,
  leadQuantity = 20
}: SearchOptimizationModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prescrapeOpen, setPrescrapeOpen] = useState(true);
  const [filters, setFilters] = useState<OptimizationFilters>({
    // Data collection toggles (activate to collect additional data)
    includeOpeningHours: false,
    includeAdditionalInfo: false,
    includeCompanyContacts: false,
    includeBusinessLeads: false,
    
    // Always enabled essentials
    includeReviewCount: true,
    includeContactDetails: true
  });

  const updateFilter = (key: keyof OptimizationFilters, value: boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const calculateCost = () => {
    // Based on Apify pricing structure with 2x markup
    // Actor start: $0.007 × 2 = $0.014 (flat fee)
    const actorStartCost = 0.007 * 2;
    
    // Place scraped: $0.004 × 2 = $0.008 per place/lead
    const baseCostPerLead = 0.004 * 2;
    
    // Add-on costs per lead when enabled (all are $0.002 × 2 = $0.004 per lead)
    let addOnCostPerLead = 0;
    if (filters.includeOpeningHours) addOnCostPerLead += 0.002 * 2; // $0.004 per lead
    if (filters.includeAdditionalInfo) addOnCostPerLead += 0.002 * 2; // $0.004 per lead
    if (filters.includeCompanyContacts) addOnCostPerLead += 0.002 * 2; // $0.004 per lead
    if (filters.includeBusinessLeads) addOnCostPerLead += 0.002 * 2; // $0.004 per lead
    
    // Total cost = flat actor start + (per-lead costs × lead quantity)
    const totalCost = actorStartCost + ((baseCostPerLead + addOnCostPerLead) * leadQuantity);
    
    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  };

  const totalCost = calculateCost();

  const prescrapeFeatures = [
    {
      key: 'includeOpeningHours' as keyof OptimizationFilters,
      icon: Clock,
      label: 'Opening Hours',
      description: 'Daily operating hours and schedules',
      costPerLead: 0.004 // 2x markup: $0.002 base per lead → $0.004
    },
    {
      key: 'includeAdditionalInfo' as keyof OptimizationFilters,
      icon: Info,
      label: 'Additional Business Info',
      description: 'About section, services, amenities',
      costPerLead: 0.004 // 2x markup: $0.002 base per lead → $0.004
    },
    {
      key: 'includeCompanyContacts' as keyof OptimizationFilters,
      icon: Users,
      label: 'Company Contacts Enrichment',
      description: 'Enhanced contact information and social profiles',
      costPerLead: 0.004 // 2x markup: $0.002 base per lead → $0.004
    },
    {
      key: 'includeBusinessLeads' as keyof OptimizationFilters,
      icon: Target,
      label: 'Business Leads Enrichment',
      description: 'Advanced lead qualification data',
      costPerLead: 0.004 // 2x markup: $0.002 base per lead → $0.004
    }
  ];


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary border-secondary"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Options</span>
          {totalCost > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              ${totalCost.toFixed(2)} per search
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Search Optimization
            </span>
            <div className="flex gap-2 text-sm">
              <span className="text-primary font-semibold">
                ${totalCost.toFixed(2)} per search
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Quota Explanation */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-primary">
                How Lead Quotas Work
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-primary/80">
              <p className="mb-2">
                <strong>Exact Mapping:</strong> Apify will scrape exactly {leadQuantity} businesses, no more, no less.
              </p>
              <p>
                <strong>Guaranteed Count:</strong> You will receive exactly {leadQuantity} lead results that match your search criteria.
              </p>
            </CardContent>
          </Card>

          {/* Pre-Scrape Data Collection */}
          <Collapsible open={prescrapeOpen} onOpenChange={setPrescrapeOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between bg-green-50 hover:bg-green-100 border-green-200 text-green-800"
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>Data Collection Options (Affects API Costs)</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  prescrapeOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3">
              <Card className="border-green-200">
                <CardContent className="p-4 space-y-4">
                  {/* Always Enabled Features */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-green-800">
                      Always Included (Essential for Leads)
                    </h4>
                    <div className="space-y-2 pl-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4 text-green-600" />
                        Contact Details (phone, email, website)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-green-600" />
                        Review Count (numbers only)
                      </div>
                    </div>
                  </div>

                  {/* Optional Features */}
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="text-sm font-medium text-green-800">
                      Optional Data (Toggle to Activate Additional Features)
                    </h4>
                    {prescrapeFeatures.map((feature) => {
                      const IconComponent = feature.icon;
                      return (
                        <div key={feature.key} className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Checkbox
                              id={feature.key}
                              checked={filters[feature.key] as boolean}
                              onCheckedChange={(checked) => updateFilter(feature.key, !!checked)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-primary" />
                                <label htmlFor={feature.key} className="text-sm font-medium">
                                  {feature.label}
                                </label>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs text-red-600 ml-2">
                            +${(feature.costPerLead * leadQuantity).toFixed(2)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>


          {/* Cost Summary */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Cost per Search:</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-primary font-semibold text-lg">
                    ${totalCost.toFixed(2)}
                  </span>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    50% margin included
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchOptimizationModal;