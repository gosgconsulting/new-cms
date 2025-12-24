import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useCompetitorAudit } from '@/contexts/CompetitorAuditContext';
import { CompetitorAuditService } from '@/services/competitorAuditService';
import { useCompetitorAuditPersistence } from '@/hooks/useCompetitorAuditPersistence';
import { useToast } from '@/hooks/use-toast';

interface CompetitorAuditStep4ResultsProps {
  onComplete: () => void;
}

const CompetitorAuditStep4Results = ({ onComplete }: CompetitorAuditStep4ResultsProps) => {
  const { sessionData, updateSessionData } = useCompetitorAudit();
  const { saveAuditProgress, saveSerpResults } = useCompetitorAuditPersistence();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (sessionData.search_terms.length > 0 && sessionData.serp_results.length === 0) {
      fetchSerpResults();
    }
  }, []);

  const fetchSerpResults = async () => {
    setLoading(true);
    try {
      const results = await CompetitorAuditService.scrapeSerpResults(sessionData.search_terms, {
        country: sessionData.country,
        language: sessionData.language,
        device_type: sessionData.device_type,
      });
      updateSessionData({ serp_results: results });
    } catch (error) {
      console.error('Error fetching SERP results:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch SERP results',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save audit progress first
      const auditId = await saveAuditProgress(sessionData, 4);
      if (!auditId) throw new Error('Failed to save audit');

      // Save SERP results
      const success = await saveSerpResults(auditId, sessionData.serp_results);
      if (!success) throw new Error('Failed to save SERP results');

      setSaved(true);
      toast({
        title: 'Audit Saved',
        description: 'Your competitor audit has been saved successfully',
      });

      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('Error saving audit:', error);
      toast({
        title: 'Error',
        description: 'Failed to save audit',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (sessionData.audit_id) {
      await CompetitorAuditService.exportAuditToCSV(sessionData.audit_id);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Analyzing competitor rankings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SERP Results</h3>
          <p className="text-sm text-muted-foreground">
            Showing top 10 positions for each search term
          </p>
        </div>
        <div className="flex gap-2">
          {sessionData.audit_id && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || saved}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              'Save Audit'
            )}
          </Button>
        </div>
      </div>

      {sessionData.serp_results.map((serpResult, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              Search Term {idx + 1}
            </Badge>
            <h4 className="font-semibold">{serpResult.search_term}</h4>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Pos</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead>Meta Description</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serpResult.results.map((result, resultIdx) => (
                  <TableRow key={resultIdx}>
                    <TableCell>
                      <Badge variant={result.position <= 3 ? 'default' : 'outline'}>
                        {result.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{result.domain}</TableCell>
                    <TableCell className="max-w-xs truncate">{result.meta_title}</TableCell>
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                      {result.meta_description}
                    </TableCell>
                    <TableCell>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompetitorAuditStep4Results;
