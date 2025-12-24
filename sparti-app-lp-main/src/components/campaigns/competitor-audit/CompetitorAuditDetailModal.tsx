import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
import { CompetitorAuditService } from '@/services/competitorAuditService';
import { useCompetitorAuditPersistence } from '@/hooks/useCompetitorAuditPersistence';

interface CompetitorAuditDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditId: string;
}

const CompetitorAuditDetailModal = ({ open, onOpenChange, auditId }: CompetitorAuditDetailModalProps) => {
  const [audit, setAudit] = useState<any>(null);
  const [serpResults, setSerpResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { loadSerpResults } = useCompetitorAuditPersistence();

  useEffect(() => {
    if (open && auditId) {
      loadData();
    }
  }, [open, auditId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [auditData, serpData] = await Promise.all([
        CompetitorAuditService.getAuditById(auditId),
        loadSerpResults(auditId),
      ]);
      setAudit(auditData);
      setSerpResults(serpData);
    } catch (error) {
      console.error('Error loading audit details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    await CompetitorAuditService.exportAuditToCSV(auditId);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!audit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{audit.name}</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{audit.website_url}</p>
        </DialogHeader>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">SERP Results</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-6 mt-6">
            {serpResults.map((serpResult, idx) => (
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
                      {serpResult.results.map((result: any, resultIdx: number) => (
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
          </TabsContent>

          <TabsContent value="keywords" className="mt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Keywords ({audit.keywords?.length || 0})</h4>
                <div className="flex flex-wrap gap-2">
                  {audit.keywords?.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Search Terms ({audit.search_terms?.length || 0})</h4>
                <div className="space-y-2">
                  {audit.search_terms?.map((term: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <span className="text-sm">{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <div className="space-y-4">
              {audit.website_analysis && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Website Analysis</h4>
                  {audit.website_analysis.brand_description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {audit.website_analysis.brand_description}
                    </p>
                  )}
                  {audit.website_analysis.target_audience && (
                    <div className="text-sm">
                      <span className="font-medium">Target Audience: </span>
                      {audit.website_analysis.target_audience}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Country</p>
                  <p className="font-medium">{audit.country}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Language</p>
                  <p className="font-medium">{audit.language}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Device</p>
                  <p className="font-medium capitalize">{audit.device_type}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
                    {audit.status}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CompetitorAuditDetailModal;
