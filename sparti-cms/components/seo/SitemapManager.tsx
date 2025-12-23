import React, { useState, useEffect } from 'react';
import { 
  Map, 
  RefreshCw, 
  Download, 
  Eye, 
  Plus, 
  Edit, 
  Trash2,
  ExternalLink,
  Calendar,
  TrendingUp,
  Globe,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

interface SitemapEntry {
  id: number;
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod: string;
  sitemap_type: 'main' | 'images' | 'videos' | 'news';
  is_active: boolean;
  title?: string;
  description?: string;
  object_id?: number;
  object_type?: string;
  created_at: string;
  updated_at: string;
}

const SitemapManager: React.FC = () => {
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SitemapEntry | null>(null);
  const [generatedSitemap, setGeneratedSitemap] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    changefreq: 'weekly' as SitemapEntry['changefreq'],
    priority: 0.5,
    sitemap_type: 'main' as SitemapEntry['sitemap_type'],
    title: '',
    description: ''
  });

  useEffect(() => {
    loadSitemapEntries();
  }, [typeFilter]);

  const loadSitemapEntries = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (typeFilter !== 'all') queryParams.append('type', typeFilter);

      const response = await fetch(`/api/sitemap-entries?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch sitemap entries');
      
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('[testing] Error loading sitemap entries:', error);
      toast({
        title: "Error",
        description: "Failed to load sitemap entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSitemap = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/sitemap/generate', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to generate sitemap');
      
      const sitemapXML = await response.text();
      setGeneratedSitemap(sitemapXML);
      
      toast({
        title: "Success",
        description: "Sitemap generated successfully.",
      });
      
      // Reload entries to get updated lastmod times
      loadSitemapEntries();
    } catch (error) {
      console.error('[testing] Error generating sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingEntry ? `/api/sitemap-entries/${editingEntry.id}` : '/api/sitemap-entries';
      const method = editingEntry ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Failed to ${editingEntry ? 'update' : 'create'} sitemap entry`);

      toast({
        title: "Success",
        description: `Sitemap entry ${editingEntry ? 'updated' : 'created'} successfully.`,
      });

      setIsDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      loadSitemapEntries();
    } catch (error) {
      console.error('[testing] Error saving sitemap entry:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingEntry ? 'update' : 'create'} sitemap entry. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: SitemapEntry) => {
    setEditingEntry(entry);
    setFormData({
      url: entry.url,
      changefreq: entry.changefreq,
      priority: entry.priority,
      sitemap_type: entry.sitemap_type,
      title: entry.title || '',
      description: entry.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this sitemap entry?')) return;

    try {
      const response = await fetch(`/api/sitemap-entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete sitemap entry');

      toast({
        title: "Success",
        description: "Sitemap entry deleted successfully.",
      });

      loadSitemapEntries();
    } catch (error) {
      console.error('[testing] Error deleting sitemap entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete sitemap entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      url: '',
      changefreq: 'weekly',
      priority: 0.5,
      sitemap_type: 'main',
      title: '',
      description: ''
    });
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
      main: { variant: "default", color: "blue" },
      images: { variant: "secondary", color: "green" },
      videos: { variant: "outline", color: "purple" },
      news: { variant: "destructive", color: "red" }
    };
    
    const config = variants[type] || { variant: "secondary", color: "gray" };
    
    return (
      <Badge variant={config.variant}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getChangefreqBadge = (changefreq: string) => {
    const colors: Record<string, string> = {
      always: "red",
      hourly: "orange", 
      daily: "yellow",
      weekly: "green",
      monthly: "blue",
      yearly: "purple",
      never: "gray"
    };
    
    return (
      <Badge variant="outline" className={`border-${colors[changefreq]}-300 text-${colors[changefreq]}-700`}>
        {changefreq}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: number) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let label = "Low";
    
    if (priority >= 0.8) {
      variant = "default";
      label = "High";
    } else if (priority >= 0.5) {
      variant = "outline";
      label = "Medium";
    }
    
    return (
      <Badge variant={variant}>
        {priority.toFixed(1)} - {label}
      </Badge>
    );
  };

  const filteredEntries = entries.filter(entry =>
    entry.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center">
              <Map className="mr-2 h-6 w-6 text-brandPurple" />
              Sitemap Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your XML sitemap entries for better search engine indexing
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? 'Hide' : 'Show'} XML
            </Button>
            <Button variant="outline" onClick={generateSitemap} disabled={generating}>
              <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate'}
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-brandPurple hover:bg-brandPurple/90"
                  onClick={() => {
                    setEditingEntry(null);
                    resetForm();
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? 'Edit Sitemap Entry' : 'Add New Sitemap Entry'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEntry 
                      ? 'Update the sitemap entry details below.' 
                      : 'Add a new URL to your sitemap for search engine indexing.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="url">URL Path *</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="/page-url"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the URL path (e.g., /about, /services/seo)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="changefreq">Change Frequency</Label>
                      <Select 
                        value={formData.changefreq} 
                        onValueChange={(value: SitemapEntry['changefreq']) => setFormData(prev => ({ ...prev, changefreq: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="always">Always</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority (0.0 - 1.0)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sitemap_type">Sitemap Type</Label>
                    <Select 
                      value={formData.sitemap_type} 
                      onValueChange={(value: SitemapEntry['sitemap_type']) => setFormData(prev => ({ ...prev, sitemap_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Sitemap</SelectItem>
                        <SelectItem value="images">Images Sitemap</SelectItem>
                        <SelectItem value="videos">Videos Sitemap</SelectItem>
                        <SelectItem value="news">News Sitemap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Page Title (Optional)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Page title for reference"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the page"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-brandPurple hover:bg-brandPurple/90">
                      {editingEntry ? 'Update Entry' : 'Add Entry'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* XML Preview Panel */}
        {showPreview && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Generated Sitemap XML</h3>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-3 w-3" />
                View Live
              </Button>
            </div>
            <pre className="bg-white p-3 rounded border text-xs font-mono overflow-x-auto max-h-64">
              {generatedSitemap || 'Generate sitemap to see XML preview'}
            </pre>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sitemap entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="main">Main</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="videos">Videos</SelectItem>
              <SelectItem value="news">News</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sitemap Entries Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Change Freq</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Map className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No sitemap entries found</p>
                      <Button variant="outline" className="mt-2" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add your first entry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <div className="font-mono text-sm font-medium">
                          {entry.url}
                        </div>
                        {entry.title && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {entry.title}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(entry.sitemap_type)}
                    </TableCell>
                    <TableCell>
                      {getChangefreqBadge(entry.changefreq)}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(entry.priority)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(entry.lastmod)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Map className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Entries</p>
                <p className="text-2xl font-bold text-blue-900">{entries.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {entries.filter(e => e.is_active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">High Priority</p>
                <p className="text-2xl font-bold text-purple-900">
                  {entries.filter(e => e.priority >= 0.8).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Main Sitemap</p>
                <p className="text-2xl font-bold text-orange-900">
                  {entries.filter(e => e.sitemap_type === 'main').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapManager;