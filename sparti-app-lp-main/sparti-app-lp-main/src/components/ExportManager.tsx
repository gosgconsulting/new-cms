import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Table, Settings, Users, Building } from 'lucide-react';
import { BusinessLead } from '@/types/leadGeneration';
import { toast } from 'sonner';

interface ExportManagerProps {
  selectedLeads: BusinessLead[];
  allLeads: BusinessLead[];
  onExport?: (exportData: ExportConfig) => void;
}

interface ExportConfig {
  leads: BusinessLead[];
  format: 'csv' | 'excel' | 'pdf';
  columns: string[];
  filename: string;
  includeMetadata: boolean;
  campaignName?: string;
  campaignNotes?: string;
}

const ExportManager: React.FC<ExportManagerProps> = ({
  selectedLeads,
  allLeads,
  onExport
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    leads: selectedLeads,
    format: 'csv',
    columns: ['name', 'phone', 'email', 'website', 'address', 'rating'],
    filename: `business-leads-${new Date().toISOString().split('T')[0]}`,
    includeMetadata: true,
    campaignName: '',
    campaignNotes: ''
  });

  const availableColumns = [
    { id: 'name', label: 'Business Name', category: 'basic' },
    { id: 'phone', label: 'Phone Number', category: 'contact' },
    { id: 'email', label: 'Email Address', category: 'contact' },
    { id: 'website', label: 'Website URL', category: 'contact' },
    { id: 'address', label: 'Address', category: 'basic' },
    { id: 'category', label: 'Business Category', category: 'basic' },
    { id: 'rating', label: 'Rating', category: 'performance' },
    { id: 'reviews_count', label: 'Review Count', category: 'performance' },
    { id: 'price_level', label: 'Price Level', category: 'basic' },
    { id: 'business_status', label: 'Business Status', category: 'intel' },
    { id: 'leadScore', label: 'Lead Quality Score', category: 'intel' },
    { id: 'businessSize', label: 'Business Size', category: 'intel' },
    { id: 'social_facebook', label: 'Facebook URL', category: 'social' },
    { id: 'social_instagram', label: 'Instagram URL', category: 'social' },
    { id: 'social_twitter', label: 'Twitter URL', category: 'social' },
    { id: 'opening_hours', label: 'Opening Hours', category: 'basic' }
  ];

  const columnCategories = {
    basic: 'Basic Information',
    contact: 'Contact Information',
    performance: 'Performance Metrics',
    social: 'Social Media',
    intel: 'Business Intelligence'
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV (Excel Compatible)', icon: Table, description: 'Best for spreadsheet analysis' },
    { value: 'excel', label: 'Excel Workbook', icon: FileText, description: 'Rich formatting with multiple sheets' },
    { value: 'pdf', label: 'PDF Report', icon: FileText, description: 'Professional presentation format' }
  ];

  const toggleColumn = (columnId: string) => {
    setExportConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(columnId)
        ? prev.columns.filter(id => id !== columnId)
        : [...prev.columns, columnId]
    }));
  };

  const selectAllInCategory = (category: string) => {
    const categoryColumns = availableColumns
      .filter(col => col.category === category)
      .map(col => col.id);
    
    const otherColumns = exportConfig.columns.filter(id => 
      !availableColumns.find(col => col.id === id && col.category === category)
    );

    setExportConfig(prev => ({
      ...prev,
      columns: [...otherColumns, ...categoryColumns]
    }));
  };

  const generateExportData = (): string => {
    const leads = exportConfig.leads;
    const columns = exportConfig.columns;

    if (exportConfig.format === 'csv') {
      // CSV Header
      const headers = columns.map(colId => {
        const col = availableColumns.find(c => c.id === colId);
        return col?.label || colId;
      }).join(',');

      // CSV Rows
      const rows = leads.map(lead => {
        return columns.map(colId => {
          let value = '';
          
          switch (colId) {
            case 'name': value = lead.name || ''; break;
            case 'phone': value = lead.phone || lead.contactInfo?.phone || ''; break;
            case 'email': value = lead.email || lead.contactInfo?.email || ''; break;
            case 'website': value = lead.website || lead.contactInfo?.website || ''; break;
            case 'address': value = lead.address || ''; break;
            case 'category': value = lead.category || ''; break;
            case 'rating': value = lead.rating?.toString() || ''; break;
            case 'reviews_count': value = lead.reviews_count?.toString() || ''; break;
            case 'price_level': value = lead.price_level?.toString() || ''; break;
            case 'business_status': value = lead.business_status || ''; break;
            case 'leadScore': value = lead.leadScore?.toString() || ''; break;
            case 'businessSize': value = lead.businessSize || ''; break;
            case 'social_facebook': value = lead.social_media?.facebook || ''; break;
            case 'social_instagram': value = lead.social_media?.instagram || ''; break;
            case 'social_twitter': value = lead.social_media?.twitter || ''; break;
            case 'opening_hours': value = lead.opening_hours ? JSON.stringify(lead.opening_hours) : ''; break;
            default: value = '';
          }
          
          // Escape quotes and wrap in quotes if contains comma
          if (value.includes(',') || value.includes('"')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          return value;
        }).join(',');
      });

      return [headers, ...rows].join('\n');
    }

    return '';
  };

  const handleExport = () => {
    const exportData = generateExportData();
    
    if (exportConfig.format === 'csv') {
      // Create and download CSV
      const blob = new Blob([exportData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportConfig.filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${exportConfig.leads.length} leads to CSV`);
    }
    
    // Save campaign if configured
    if (exportConfig.campaignName) {
      const campaignData = {
        name: exportConfig.campaignName,
        notes: exportConfig.campaignNotes,
        leads: exportConfig.leads,
        exportConfig: exportConfig,
        createdAt: new Date().toISOString()
      };
      
      // Store in localStorage for now (could be enhanced with proper backend)
      const campaigns = JSON.parse(localStorage.getItem('sparti-campaigns') || '[]');
      campaigns.push(campaignData);
      localStorage.setItem('sparti-campaigns', JSON.stringify(campaigns));
      
      toast.success(`Campaign "${exportConfig.campaignName}" saved with ${exportConfig.leads.length} leads`);
    }

    onExport?.(exportConfig);
    setIsOpen(false);
  };

  const getSelectedCount = () => {
    return exportConfig.leads.length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={selectedLeads.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export ({selectedLeads.length})
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Business Leads
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Export Configuration */}
          <div className="space-y-4">
            {/* Lead Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Lead Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selected-leads"
                    checked={exportConfig.leads === selectedLeads}
                    onCheckedChange={(checked) => {
                      setExportConfig(prev => ({
                        ...prev,
                        leads: checked ? selectedLeads : allLeads
                      }));
                    }}
                  />
                  <Label htmlFor="selected-leads">
                    Export selected leads only ({selectedLeads.length})
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-leads"
                    checked={exportConfig.leads === allLeads}
                    onCheckedChange={(checked) => {
                      setExportConfig(prev => ({
                        ...prev,
                        leads: checked ? allLeads : selectedLeads
                      }));
                    }}
                  />
                  <Label htmlFor="all-leads">
                    Export all leads ({allLeads.length})
                  </Label>
                </div>

                <div className="text-sm text-muted-foreground pt-2 border-t">
                  Exporting: <span className="font-medium text-primary">{getSelectedCount()} leads</span>
                </div>
              </CardContent>
            </Card>

            {/* Format Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={exportConfig.format} 
                  onValueChange={(value: 'csv' | 'excel' | 'pdf') => 
                    setExportConfig(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* File Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  File Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="filename">Filename</Label>
                  <Input
                    id="filename"
                    value={exportConfig.filename}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, filename: e.target.value }))}
                    placeholder="business-leads-export"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-metadata"
                    checked={exportConfig.includeMetadata}
                    onCheckedChange={(checked) => 
                      setExportConfig(prev => ({ ...prev, includeMetadata: checked as boolean }))
                    }
                  />
                  <Label htmlFor="include-metadata">
                    Include export metadata and summary
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Save as Campaign (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={exportConfig.campaignName}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, campaignName: e.target.value }))}
                    placeholder="Q1 Restaurant Outreach"
                  />
                </div>

                <div>
                  <Label htmlFor="campaign-notes">Campaign Notes</Label>
                  <Textarea
                    id="campaign-notes"
                    value={exportConfig.campaignNotes}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, campaignNotes: e.target.value }))}
                    placeholder="Target audience, campaign goals, next steps..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Column Selection */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Data Columns ({exportConfig.columns.length} selected)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(columnCategories).map(([categoryId, categoryName]) => {
                  const categoryColumns = availableColumns.filter(col => col.category === categoryId);
                  const selectedInCategory = categoryColumns.filter(col => exportConfig.columns.includes(col.id)).length;
                  
                  return (
                    <div key={categoryId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">{categoryName}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => selectAllInCategory(categoryId)}
                          className="h-6 text-xs"
                        >
                          Select All ({selectedInCategory}/{categoryColumns.length})
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 pl-4 border-l-2 border-border/50">
                        {categoryColumns.map((column) => (
                          <div key={column.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={column.id}
                              checked={exportConfig.columns.includes(column.id)}
                              onCheckedChange={() => toggleColumn(column.id)}
                            />
                            <Label htmlFor={column.id} className="text-sm">
                              {column.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Ready to export {getSelectedCount()} leads with {exportConfig.columns.length} columns
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export {exportConfig.format.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportManager;