import { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Star,
  MessageSquare,
  Download,
  Eye,
  EyeOff,
  MoreHorizontal,
  Target
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BusinessLead, LeadViewMode, LEAD_VIEW_MODES } from '@/types/leadGeneration';
import BusinessOpportunityIndicators from '@/components/BusinessOpportunityIndicators';
import AdvancedFilters from '@/components/AdvancedFilters';
import ExportManager from '@/components/ExportManager';
import LeadContactManager from '@/components/LeadContactManager';

interface EnhancedBusinessLeadsTableProps {
  leads: BusinessLead[];
  isLoading: boolean;
  className?: string;
}

const EnhancedBusinessLeadsTable = ({ 
  leads, 
  isLoading, 
  className 
}: EnhancedBusinessLeadsTableProps) => {
  const [currentView, setCurrentView] = useState<string>('contact');
  const [filteredLeads, setFilteredLeads] = useState<BusinessLead[]>(leads);
  const [selectedLeadForContact, setSelectedLeadForContact] = useState<BusinessLead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<string>('contact');
  const [sortConfig, setSortConfig] = useState<{ key: keyof BusinessLead; direction: 'asc' | 'desc' }>({ key: 'leadScore', direction: 'desc' });
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    phone: true,
    email: true,
    website: true,
    social_media: true,
    rating: true,
    reviews_count: true,
    business_size: true,
    lead_score: true,
    digital_presence: true,
    business_status: false,
    website_technology: true
  });

  // Update filtered leads when props change
  useEffect(() => {
    setFilteredLeads(leads);
  }, [leads]);

  const currentViewMode = LEAD_VIEW_MODES.find(mode => mode.id === currentView);

  // Update visible columns when view mode changes
  useMemo(() => {
    if (currentViewMode) {
      const newVisibleColumns = { ...visibleColumns };
      // Reset all to false
      Object.keys(newVisibleColumns).forEach(key => {
        newVisibleColumns[key] = false;
      });
      // Set view mode columns to true
      currentViewMode.columns.forEach(column => {
        newVisibleColumns[column] = true;
      });
      setVisibleColumns(newVisibleColumns);
    }
  }, [currentView]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const formatContactInfo = (value: string | undefined) => {
    return value && value !== 'N/A' ? value : 'N/A';
  };

  const getSocialMediaLinks = (lead: BusinessLead) => {
    const socialMedia = lead.social_media || {};
    return {
      website: lead.website || lead.contactInfo?.website || socialMedia.website,
      facebook: socialMedia.facebook,
      instagram: socialMedia.instagram,
      twitter: socialMedia.twitter,
      youtube: socialMedia.youtube
    };
  };

  const renderLeadScore = (score?: number) => {
    if (!score) return 'N/A';
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-sm font-medium">{score}/100</span>
      </div>
    );
  };

  const renderDigitalPresence = (lead: BusinessLead) => {
    const presence = lead.digitalPresence;
    if (!presence) return 'N/A';
    
    const indicators = [
      { key: 'hasWebsite', icon: Globe, label: 'Website' },
      { key: 'hasFacebook', icon: Facebook, label: 'Facebook' },
      { key: 'hasInstagram', icon: Instagram, label: 'Instagram' },
      { key: 'hasGoogleListing', icon: Target, label: 'Google' }
    ];

    return (
      <div className="flex gap-1">
        {indicators.map(({ key, icon: Icon, label }) => (
          <div 
            key={key} 
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              presence[key as keyof typeof presence] 
                ? "bg-green-100 text-green-600" 
                : "bg-gray-100 text-gray-400"
            )}
            title={label}
          >
            <Icon className="w-3 h-3" />
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <div className="p-6">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Business Leads ({leads.length})</h3>
            {currentViewMode && (
              <p className="text-sm text-muted-foreground">{currentViewMode.description}</p>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* View Mode Selector */}
            <Select value={currentView} onValueChange={setCurrentView}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select view mode" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_VIEW_MODES.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id}>
                    {mode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Column Visibility */}
            <Select>
              <SelectTrigger className="w-32">
                <Eye className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Columns" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(visibleColumns).map(([column, visible]) => (
                  <div 
                    key={column}
                    className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-accent"
                    onClick={() => toggleColumnVisibility(column)}
                  >
                    <Checkbox checked={visible} />
                    <span className="text-sm capitalize">{column.replace('_', ' ')}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>

            {/* Export Manager */}
            <ExportManager
              selectedLeads={selectedLeads.map(id => filteredLeads.find(lead => lead.id === id)!).filter(Boolean)}
              allLeads={filteredLeads}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {visibleColumns.name && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Business Name</Badge>
                  </TableHead>
                )}
                {visibleColumns.phone && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Phone</Badge>
                  </TableHead>
                )}
                {visibleColumns.email && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Email</Badge>
                  </TableHead>
                )}
                {visibleColumns.website && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Website URL</Badge>
                  </TableHead>
                )}
                {visibleColumns.social_media && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Social Media</Badge>
                  </TableHead>
                )}
                {visibleColumns.rating && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Rating</Badge>
                  </TableHead>
                )}
                {visibleColumns.reviews_count && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Reviews</Badge>
                  </TableHead>
                )}
                {visibleColumns.business_size && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Business Size</Badge>
                  </TableHead>
                )}
                {visibleColumns.lead_score && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Lead Score</Badge>
                  </TableHead>
                )}
                {visibleColumns.digital_presence && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Digital Presence</Badge>
                  </TableHead>
                )}
                {visibleColumns.business_status && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Business Status</Badge>
                  </TableHead>
                )}
                {visibleColumns.website_technology && (
                  <TableHead>
                    <Badge variant="outline" className="font-medium">Website Technology</Badge>
                  </TableHead>
                )}
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => {
                const socialLinks = getSocialMediaLinks(lead);
                const isSelected = selectedLeads.includes(lead.id);

                return (
                  <TableRow key={lead.id} className={isSelected ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      />
                    </TableCell>

                    {visibleColumns.name && (
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{lead.name}</div>
                          {lead.category && (
                            <div className="text-xs text-muted-foreground">{lead.category}</div>
                          )}
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns.phone && (
                      <TableCell>
                        {formatContactInfo(lead.phone || lead.contactInfo?.phone) !== 'N/A' ? (
                          <a 
                            href={`tel:${lead.phone || lead.contactInfo?.phone}`}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {formatContactInfo(lead.phone || lead.contactInfo?.phone)}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}

                    {visibleColumns.email && (
                      <TableCell>
                        {formatContactInfo(lead.email || lead.contactInfo?.email) !== 'N/A' ? (
                          <a 
                            href={`mailto:${lead.email || lead.contactInfo?.email}`}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            {formatContactInfo(lead.email || lead.contactInfo?.email)}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}

                    {visibleColumns.website && (
                      <TableCell>
                        {socialLinks.website && socialLinks.website !== 'N/A' ? (
                          <a 
                            href={socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            <span className="truncate max-w-[150px]" title={socialLinks.website}>
                              {socialLinks.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}

                    {visibleColumns.social_media && (
                      <TableCell>
                        <div className="flex gap-1">
                          {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                              <Facebook className="h-4 w-4 text-primary hover:text-primary/80" />
                            </a>
                          )}
                          {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                              <Instagram className="h-4 w-4 text-pink-600 hover:text-pink-800" />
                            </a>
                          )}
                          {socialLinks.twitter && (
                            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="h-4 w-4 text-accent hover:text-accent/80" />
                            </a>
                          )}
                          {socialLinks.youtube && (
                            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                              <Youtube className="h-4 w-4 text-red-600 hover:text-red-800" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns.rating && (
                      <TableCell>
                        {lead.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{lead.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}

                    {visibleColumns.reviews_count && (
                      <TableCell>
                        {lead.reviews_count ? (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-sm">{lead.reviews_count}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}

                    {visibleColumns.business_size && (
                      <TableCell>
                        {lead.businessSize ? (
                          <Badge variant="outline" className="capitalize">
                            {lead.businessSize}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}

                    {visibleColumns.lead_score && (
                      <TableCell>
                        {renderLeadScore(lead.leadScore)}
                      </TableCell>
                    )}

                    {visibleColumns.digital_presence && (
                      <TableCell>
                        {renderDigitalPresence(lead)}
                      </TableCell>
                    )}

                    {visibleColumns.business_status && (
                      <TableCell>
                        {lead.business_status ? (
                          <Badge 
                            variant={lead.business_status === 'OPERATIONAL' ? 'default' : 'secondary'}
                          >
                            {lead.business_status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}

                    {visibleColumns.website_technology && (
                      <TableCell>
                        {lead.websiteTechnology && lead.websiteTechnology.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {lead.websiteTechnology.slice(0, 2).map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {lead.websiteTechnology.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{lead.websiteTechnology.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}


                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={() => setSelectedLeadForContact(lead)}
                          title="Manage Contact"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {leads.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            No business leads found. Try adjusting your search criteria.
          </div>
        )}

        {/* Lead Contact Manager Modal */}
        {selectedLeadForContact && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Contact Management</h2>
                  <Button variant="ghost" onClick={() => setSelectedLeadForContact(null)}>
                    ✕
                  </Button>
                </div>
                <LeadContactManager 
                  leadId={selectedLeadForContact?.id || ''}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EnhancedBusinessLeadsTable;