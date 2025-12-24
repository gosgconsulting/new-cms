import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink,
  Star,
  Building2,
  MoreHorizontal,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Unified business lead interface
export interface UnifiedBusinessLead {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  category?: string | null;
  activity?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  social_media?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  } | null;
  latitude?: number | null;
  longitude?: number | null;
  place_id?: string | null;
  google_id?: string | null;
  processing_status?: string | null;
  scraped_at?: string | null;
  created_at?: string | null;
  // Additional fields for database leads
  search_location?: string | null;
  lobstr_run_id?: string | null;
}

interface UnifiedBusinessTableProps {
  leads: UnifiedBusinessLead[];
  isLoading?: boolean;
  className?: string;
  title: string;
  subtitle: string;
  creditsUsed?: number;
  showLiveDataBadge?: boolean;
  onExportSelected?: (selectedIds: string[]) => void;
  selectedLeads?: string[];
  onSelectLeads?: (selectedIds: string[]) => void;
  onSelectAll?: (checked: boolean) => void;
  showFilters?: boolean;
  customActions?: React.ReactNode;
}

const UnifiedBusinessTable: React.FC<UnifiedBusinessTableProps> = ({
  leads,
  isLoading = false,
  className,
  title,
  subtitle,
  creditsUsed = 0,
  showLiveDataBadge = false,
  onExportSelected,
  selectedLeads = [],
  onSelectLeads,
  onSelectAll,
  showFilters = false,
  customActions
}) => {
  // Calculate cost: 10k credits = $10, with x2 markup = $0.002 per credit
  const calculateCost = (credits: number) => {
    const costPerCredit = 0.002;
    const totalCost = credits * costPerCredit;
    return Math.round(totalCost);
  };

  // Format contact info, show 'N/A' for empty/null values
  const formatContactInfo = (value?: string | null) => {
    return value && value.trim() !== '' && value !== 'N/A' ? value : null;
  };

  // Get social media links count
  const getSocialMediaCount = (socialMedia?: UnifiedBusinessLead['social_media']) => {
    if (!socialMedia) return 0;
    return Object.values(socialMedia).filter(link => link && link.trim() !== '').length;
  };

  // Get category display
  const getCategoryDisplay = (category?: string | null, activity?: string | null) => {
    if (category && category.trim() !== '') return category;
    if (activity && activity.trim() !== '') return activity;
    return null;
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (onSelectLeads) {
      if (checked) {
        onSelectLeads([...selectedLeads, leadId]);
      } else {
        onSelectLeads(selectedLeads.filter(id => id !== leadId));
      }
    }
  };

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showLiveDataBadge && (
              <>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Live Data
                </Badge>
                {creditsUsed > 0 && (
                  <Badge variant="outline" className="text-xs">
                    ${calculateCost(creditsUsed)}
                  </Badge>
                )}
              </>
            )}
            {onExportSelected && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onExportSelected(selectedLeads)}
                disabled={selectedLeads.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export ({selectedLeads.length})
              </Button>
            )}
            {customActions}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="p-4 border-b border-border bg-muted/20">
          {/* This can be customized per table implementation */}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {(onSelectLeads || onSelectAll) && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Business</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="space-y-2">
                    <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      No business leads found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search criteria or expanding your target location.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead, index) => {
                const isSelected = selectedLeads.includes(lead.id);
                const categoryDisplay = getCategoryDisplay(lead.category, lead.activity);
                const socialCount = getSocialMediaCount(lead.social_media);

                return (
                  <TableRow 
                    key={lead.id}
                    className={cn(
                      "hover:bg-muted/50 transition-all duration-200 animate-fade-in group",
                      isSelected && "bg-muted/50"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Selection Checkbox */}
                    {(onSelectLeads || onSelectAll) && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                        />
                      </TableCell>
                    )}

                    {/* Business Name & Address */}
                    <TableCell className="font-medium">
                      <div className="flex flex-col space-y-2">
                        <div className="font-semibold text-foreground text-base">
                          {lead.name}
                        </div>
                        {lead.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground line-clamp-2">
                              {lead.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Contact Information */}
                    <TableCell>
                      <div className="space-y-2">
                        {/* Phone */}
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {formatContactInfo(lead.phone) ? (
                            <a 
                              href={`tel:${lead.phone}`}
                              className="text-sm text-primary hover:text-primary/80 transition-colors font-mono"
                            >
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </div>
                        
                        {/* Email */}
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {formatContactInfo(lead.email) ? (
                            <a 
                              href={`mailto:${lead.email}`}
                              className="text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Website */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {formatContactInfo(lead.website || lead.social_media?.website) ? (
                          <a 
                            href={
                              (lead.website || lead.social_media?.website)?.startsWith('http') 
                                ? (lead.website || lead.social_media?.website) 
                                : `https://${lead.website || lead.social_media?.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                          >
                            <span className="truncate max-w-[150px]">
                              {(lead.website || lead.social_media?.website)?.replace(/^https?:\/\//, '')}
                            </span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Rating */}
                    <TableCell>
                      {lead.rating ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">
                              {lead.rating.toFixed(1)}
                            </span>
                          </div>
                          {lead.reviews_count && (
                            <span className="text-xs text-muted-foreground">
                              {lead.reviews_count} reviews
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      {categoryDisplay ? (
                        <Badge variant="outline" className="text-xs">
                          {categoryDisplay}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Social Media Count */}
                        {socialCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {socialCount} social
                          </Badge>
                        )}
                        
                        {/* More Actions */}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {leads.length} business lead{leads.length !== 1 ? 's' : ''}
          </span>
          <span>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default UnifiedBusinessTable;