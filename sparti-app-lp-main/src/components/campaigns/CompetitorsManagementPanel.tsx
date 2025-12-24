import { useState } from 'react';
import { Plus, Users, Search, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CompetitorData {
  id: string;
  name: string;
  url: string;
  keywordsFocus: string[];
  industry: string;
  status: 'active' | 'inactive' | 'analyzing';
  dateAdded: string;
  lastAnalyzed?: string;
}

interface CompetitorsManagementPanelProps {
  brandId: string;
  userId: string;
}

export const CompetitorsManagementPanel = ({ brandId, userId }: CompetitorsManagementPanelProps) => {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([
    {
      id: '1',
      name: 'Competitor Example',
      url: 'https://competitor.com',
      keywordsFocus: ['digital marketing', 'SEO services', 'content marketing'],
      industry: 'Marketing',
      status: 'active',
      dateAdded: '2024-01-15',
      lastAnalyzed: '2024-01-20'
    }
  ]);
  
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddCompetitor = () => {
    if (!newName.trim() || !newUrl.trim()) {
      toast.error('Please enter competitor name and URL');
      return;
    }

    const keywordsArray = newKeywords.split(',').map(k => k.trim()).filter(Boolean);
    
    const newCompetitor: CompetitorData = {
      id: Date.now().toString(),
      name: newName.trim(),
      url: newUrl.trim(),
      keywordsFocus: keywordsArray,
      industry: newIndustry.trim() || 'Unknown',
      status: 'analyzing',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setCompetitors(prev => [newCompetitor, ...prev]);
    setNewName('');
    setNewUrl('');
    setNewKeywords('');
    setNewIndustry('');
    setDialogOpen(false);
    
    toast.success('Competitor added successfully');
    
    // Simulate analysis completion
    setTimeout(() => {
      setCompetitors(prev => prev.map(competitor => 
        competitor.id === newCompetitor.id 
          ? { ...competitor, status: 'active' as const, lastAnalyzed: new Date().toISOString().split('T')[0] }
          : competitor
      ));
    }, 3000);
  };

  const handleDeleteCompetitor = (id: string) => {
    setCompetitors(prev => prev.filter(competitor => competitor.id !== id));
    toast.success('Competitor removed successfully');
  };

  const handleAnalyzeCompetitor = (competitor: CompetitorData) => {
    setCompetitors(prev => prev.map(c => 
      c.id === competitor.id ? { ...c, status: 'analyzing' as const } : c
    ));
    
    toast.info(`Starting analysis for ${competitor.name}...`);
    
    // Simulate analysis completion
    setTimeout(() => {
      setCompetitors(prev => prev.map(c => 
        c.id === competitor.id 
          ? { ...c, status: 'active' as const, lastAnalyzed: new Date().toISOString().split('T')[0] }
          : c
      ));
    }, 4000);
  };

  const filteredCompetitors = competitors.filter(competitor =>
    competitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    competitor.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    competitor.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    competitor.keywordsFocus.some(keyword => 
      keyword.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Competitors Analysis</h2>
          <p className="text-muted-foreground">
            Track and analyze your competitors with comprehensive data insights
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Competitor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Competitor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Competitor Name</Label>
                <Input
                  id="name"
                  placeholder="Competitor Company Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  placeholder="https://competitor.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="keywords">Keywords Focus (comma-separated)</Label>
                <Input
                  id="keywords"
                  placeholder="SEO, marketing, digital strategy"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddCompetitor}>Add Competitor</Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search competitors, URLs, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Competitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked Competitors ({filteredCompetitors.length})</CardTitle>
          <CardDescription>
            Monitor your competitors and analyze their strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCompetitors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No competitors found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No competitors match your search criteria.' : 'Add your first competitor to start tracking.'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Competitor
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competitor</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Keywords Focus</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitors.map((competitor) => (
                  <TableRow key={competitor.id}>
                    <TableCell>
                      <div className="font-medium">{competitor.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={competitor.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          <span className="block truncate max-w-[300px]">
                            {competitor.url}
                          </span>
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {competitor.keywordsFocus.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCompetitor(competitor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};