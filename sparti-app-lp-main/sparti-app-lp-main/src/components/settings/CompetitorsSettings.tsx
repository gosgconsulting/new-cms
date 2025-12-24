import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Competitor {
  id: string;
  brand_id: string;
  name: string;
  url: string;
  created_at: string;
}

interface CompetitorsSettingsProps {
  brandId: string;
  userId: string;
}

export const CompetitorsSettings = ({ brandId, userId }: CompetitorsSettingsProps) => {
  const queryClient = useQueryClient();
  const [competitorName, setCompetitorName] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');

  // Fetch competitors
  const { data: competitors = [], isLoading } = useQuery({
    queryKey: ['competitors', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitors')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Competitor[];
    },
  });

  // Add competitor mutation
  const addCompetitorMutation = useMutation({
    mutationFn: async (newCompetitor: { name: string; url: string }) => {
      const { error } = await supabase
        .from('competitors')
        .insert({
          brand_id: brandId,
          user_id: userId,
          name: newCompetitor.name,
          url: newCompetitor.url,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Competitor added successfully');
      setCompetitorName('');
      setCompetitorUrl('');
      queryClient.invalidateQueries({ queryKey: ['competitors', brandId] });
    },
    onError: (error) => {
      console.error('Failed to add competitor:', error);
      toast.error('Failed to add competitor');
    },
  });

  // Delete competitor mutation
  const deleteCompetitorMutation = useMutation({
    mutationFn: async (competitorId: string) => {
      const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', competitorId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Competitor removed successfully');
      queryClient.invalidateQueries({ queryKey: ['competitors', brandId] });
    },
    onError: (error) => {
      console.error('Failed to delete competitor:', error);
      toast.error('Failed to remove competitor');
    },
  });

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!competitorName.trim() || !competitorUrl.trim()) {
      toast.error('Please fill in both name and URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(competitorUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    addCompetitorMutation.mutate({
      name: competitorName.trim(),
      url: competitorUrl.trim(),
    });
  };

  const handleDeleteCompetitor = (competitorId: string) => {
    if (confirm('Are you sure you want to remove this competitor?')) {
      deleteCompetitorMutation.mutate(competitorId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitors</CardTitle>
        <CardDescription>
          Add competitor websites to track and analyze their content strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Competitor Form */}
        <form onSubmit={handleAddCompetitor} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="competitor-name">Competitor Name</Label>
              <Input
                id="competitor-name"
                placeholder="e.g., Example Company"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-url">Website URL</Label>
              <Input
                id="competitor-url"
                placeholder="https://example.com"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={addCompetitorMutation.isPending}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>
        </form>

        {/* Competitors List */}
        <div>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading competitors...
            </div>
          ) : competitors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No competitors added yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((competitor) => (
                  <TableRow key={competitor.id}>
                    <TableCell className="font-medium">{competitor.name}</TableCell>
                    <TableCell>
                      <a
                        href={competitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        {competitor.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCompetitor(competitor.id)}
                        disabled={deleteCompetitorMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
