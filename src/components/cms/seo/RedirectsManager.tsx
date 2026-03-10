import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock
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
import { Textarea } from "@/components/ui/textarea";
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

interface Redirect {
  id: number;
  old_url: string;
  new_url: string;
  redirect_type: number;
  status: 'active' | 'inactive';
  hits: number;
  last_hit: string | null;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const RedirectsManager: React.FC = () => {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [formData, setFormData] = useState({
    old_url: '',
    new_url: '',
    redirect_type: 301,
    status: 'active' as 'active' | 'inactive',
    notes: ''
  });

  useEffect(() => {
    loadRedirects();
  }, [statusFilter]);

  const loadRedirects = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        queryParams.append(key, filters[key]);
      });

      const response = await fetch(`/api/redirects?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch redirects');
      
      const data = await response.json();
      setRedirects(data);
    } catch (error) {
      console.error('[testing] Error loading redirects:', error);
      toast({
        title: "Error",
        description: "Failed to load redirects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingRedirect ? `/api/redirects/${editingRedirect.id}` : '/api/redirects';
      const method = editingRedirect ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Failed to ${editingRedirect ? 'update' : 'create'} redirect`);

      toast({
        title: "Success",
        description: `Redirect ${editingRedirect ? 'updated' : 'created'} successfully.`,
      });

      setIsDialogOpen(false);
      setEditingRedirect(null);
      resetForm();
      loadRedirects();
    } catch (error) {
      console.error('[testing] Error saving redirect:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingRedirect ? 'update' : 'create'} redirect. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (redirect: Redirect) => {
    setEditingRedirect(redirect);
    setFormData({
      old_url: redirect.old_url,
      new_url: redirect.new_url,
      redirect_type: redirect.redirect_type,
      status: redirect.status,
      notes: redirect.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (redirectId: number) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return;

    try {
      const response = await fetch(`/api/redirects/${redirectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete redirect');

      toast({
        title: "Success",
        description: "Redirect deleted successfully.",
      });

      loadRedirects();
    } catch (error) {
      console.error('[testing] Error deleting redirect:', error);
      toast({
        title: "Error",
        description: "Failed to delete redirect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      old_url: '',
      new_url: '',
      redirect_type: 301,
      status: 'active',
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status === 'active' ? (
          <>
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </>
        ) : (
          <>
            <Clock className="mr-1 h-3 w-3" />
            Inactive
          </>
        )}
      </Badge>
    );
  };

  const getRedirectTypeBadge = (type: number) => {
    const variants: Record<number, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      301: { variant: "default", label: "301 Permanent" },
      302: { variant: "secondary", label: "302 Temporary" },
      307: { variant: "outline", label: "307 Temporary" },
      308: { variant: "outline", label: "308 Permanent" }
    };
    
    const config = variants[type] || { variant: "secondary", label: `${type}` };
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const filteredRedirects = redirects.filter(redirect =>
    redirect.old_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    redirect.new_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    redirect.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              <ArrowRight className="mr-2 h-6 w-6 text-brandPurple" />
              URL Redirects Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage 301/302 redirects to maintain SEO value when URLs change
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-brandPurple hover:bg-brandPurple/90"
                  onClick={() => {
                    setEditingRedirect(null);
                    resetForm();
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Redirect
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRedirect ? 'Edit Redirect' : 'Create New Redirect'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRedirect 
                      ? 'Update the redirect details below.' 
                      : 'Create a new URL redirect to maintain SEO value.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="old_url">From URL (Old URL) *</Label>
                    <Input
                      id="old_url"
                      value={formData.old_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, old_url: e.target.value }))}
                      placeholder="/old-page"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the old URL path (e.g., /old-page or /old-category/page)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="new_url">To URL (New URL) *</Label>
                    <Input
                      id="new_url"
                      value={formData.new_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, new_url: e.target.value }))}
                      placeholder="/new-page"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the new URL path or full URL (e.g., /new-page or https://example.com)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="redirect_type">Redirect Type</Label>
                      <Select 
                        value={formData.redirect_type.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, redirect_type: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="301">301 - Permanent Redirect</SelectItem>
                          <SelectItem value="302">302 - Temporary Redirect</SelectItem>
                          <SelectItem value="307">307 - Temporary Redirect (HTTP/1.1)</SelectItem>
                          <SelectItem value="308">308 - Permanent Redirect (HTTP/1.1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes about this redirect..."
                      rows={3}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-brandPurple hover:bg-brandPurple/90">
                      {editingRedirect ? 'Update Redirect' : 'Create Redirect'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search redirects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Redirects Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From URL</TableHead>
                <TableHead>To URL</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hits</TableHead>
                <TableHead>Last Hit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRedirects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <ArrowRight className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No redirects found</p>
                      <Button variant="outline" className="mt-2" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first redirect
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRedirects.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {redirect.old_url}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-mono text-sm mr-2">{redirect.new_url}</span>
                        {redirect.new_url.startsWith('http') && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRedirectTypeBadge(redirect.redirect_type)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(redirect.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{redirect.hits}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {redirect.last_hit ? formatDate(redirect.last_hit) : 'Never'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(redirect)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(redirect.id)}
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
              <ArrowRight className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Redirects</p>
                <p className="text-2xl font-bold text-blue-900">{redirects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {redirects.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Total Hits</p>
                <p className="text-2xl font-bold text-orange-900">
                  {redirects.reduce((sum, redirect) => sum + redirect.hits, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">301 Redirects</p>
                <p className="text-2xl font-bold text-purple-900">
                  {redirects.filter(r => r.redirect_type === 301).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectsManager;
