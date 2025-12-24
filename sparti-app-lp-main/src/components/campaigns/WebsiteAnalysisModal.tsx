import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WebsiteAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  analysisData: {
    website_analysis?: {
      brand_name?: string;
      brand_description?: string;
      target_audience?: string;
      key_selling_points?: string[];
      sitemap_url?: string;
      total_sitemap_links?: number;
    };
    backlinks?: Array<{
      url: string;
      title: string;
      keyword: string;
      type: 'internal' | 'external';
      link_type?: string;
      relevance_score?: number;
    }>;
    keywords?: string[];
    sources?: Array<{
      url: string;
      title: string;
      snippet?: string;
    }>;
    competitors?: Array<{
      url: string;
      title: string;
      domain?: string;
    }>;
  } | null;
}

const extractTitleFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    const cleanSegment = decodeURIComponent(lastSegment.replace(/\.(html|php|aspx?)$/i, ''));
    return cleanSegment
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return '';
  }
};

export const WebsiteAnalysisModal = ({ 
  open, 
  onOpenChange, 
  campaignName,
  analysisData 
}: WebsiteAnalysisModalProps) => {
  if (!analysisData) return null;

  const backlinks = analysisData.backlinks || [];
  const keywords = analysisData.keywords || [];
  const sources = analysisData.sources || [];
  const competitors = analysisData.competitors || [];

  // Categorize backlinks by type
  const internalBacklinks = backlinks.filter(b => b.type === 'internal');
  const externalBacklinks = backlinks.filter(b => b.type === 'external');

  // Further categorize internal backlinks
  const pageBacklinks = internalBacklinks.filter(b => b.link_type === 'page');
  const postBacklinks = internalBacklinks.filter(b => b.link_type === 'post');
  const shopBacklinks = internalBacklinks.filter(b => b.link_type === 'shop');
  const productBacklinks = internalBacklinks.filter(b => b.link_type === 'product');

  const BacklinkTable = ({ backlinks, title }: { backlinks: any[]; title?: string }) => {
    if (backlinks.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-12">
          No {title?.toLowerCase() || 'backlinks'} found
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Keyword</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {backlinks.map((link: any, idx: number) => (
            <TableRow key={idx}>
              <TableCell className="font-medium max-w-xs">
                {link.title || extractTitleFromUrl(link.url)}
              </TableCell>
              <TableCell className="max-w-sm">
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline truncate block"
                >
                  {link.url}
                </a>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{link.keyword}</Badge>
              </TableCell>
              <TableCell>
                {link.relevance_score && (
                  <Badge variant={link.relevance_score >= 8 ? 'default' : 'secondary'}>
                    {link.relevance_score}/10
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Analysis Results</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Review the information we gathered from {campaignName}
          </p>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] pr-4">
          <Tabs defaultValue="website" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="website">
                Website
              </TabsTrigger>
              <TabsTrigger value="backlinks">
                Sitemap ({backlinks.length})
              </TabsTrigger>
              <TabsTrigger value="keywords">
                Keywords ({keywords.length})
              </TabsTrigger>
              <TabsTrigger value="sources">
                Sources ({sources.length})
              </TabsTrigger>
              <TabsTrigger value="competitors">
                Competitors ({competitors.length})
              </TabsTrigger>
            </TabsList>

            {/* Website Tab */}
            <TabsContent value="website" className="space-y-4 mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Website Information</h3>
                
                <div className="space-y-4">
                  {analysisData.website_analysis?.brand_name && analysisData.website_analysis.brand_name.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Brand Name</h4>
                      <p className="text-base">{analysisData.website_analysis.brand_name}</p>
                    </div>
                  )}

                  {analysisData.website_analysis?.brand_description && analysisData.website_analysis.brand_description.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                      <p className="text-base">{analysisData.website_analysis.brand_description}</p>
                    </div>
                  )}

                  {analysisData.website_analysis?.target_audience && analysisData.website_analysis.target_audience.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Target Audience</h4>
                      <p className="text-base">{analysisData.website_analysis.target_audience}</p>
                    </div>
                  )}

                  {analysisData.website_analysis?.key_selling_points && analysisData.website_analysis.key_selling_points.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Selling Points</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.website_analysis.key_selling_points.map((point, idx) => (
                          <Badge key={idx} variant="secondary">{point}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisData.website_analysis?.sitemap_url && analysisData.website_analysis.sitemap_url.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Sitemap URL</h4>
                      <a 
                        href={analysisData.website_analysis.sitemap_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {analysisData.website_analysis.sitemap_url}
                      </a>
                      {analysisData.website_analysis.total_sitemap_links && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Total links: {analysisData.website_analysis.total_sitemap_links}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Backlinks Tab */}
            <TabsContent value="backlinks" className="space-y-4 mt-4">
              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All ({backlinks.length})</TabsTrigger>
                  <TabsTrigger value="pages">Pages ({pageBacklinks.length})</TabsTrigger>
                  <TabsTrigger value="posts">Posts ({postBacklinks.length})</TabsTrigger>
                  <TabsTrigger value="shop">Shop ({shopBacklinks.length})</TabsTrigger>
                  <TabsTrigger value="products">Products ({productBacklinks.length})</TabsTrigger>
                  <TabsTrigger value="external">External ({externalBacklinks.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <Card className="p-4">
                    <BacklinkTable backlinks={backlinks} />
                  </Card>
                </TabsContent>

                <TabsContent value="pages" className="mt-4">
                  <Card className="p-4">
                    <BacklinkTable backlinks={pageBacklinks} title="Pages" />
                  </Card>
                </TabsContent>

                <TabsContent value="posts" className="mt-4">
                  <Card className="p-4">
                    <BacklinkTable backlinks={postBacklinks} title="Posts" />
                  </Card>
                </TabsContent>

                <TabsContent value="shop" className="mt-4">
                  <Card className="p-4">
                    <BacklinkTable backlinks={shopBacklinks} title="Shop Pages" />
                  </Card>
                </TabsContent>

                <TabsContent value="products" className="mt-4">
                  <Card className="p-4">
                    <BacklinkTable backlinks={productBacklinks} title="Products" />
                  </Card>
                </TabsContent>

                <TabsContent value="external" className="mt-4">
                  <Card className="p-4">
                    <BacklinkTable backlinks={externalBacklinks} title="External Links" />
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="space-y-4 mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Extracted Keywords</h3>
                {keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No keywords found</p>
                )}
              </Card>
            </TabsContent>

            {/* Sources Tab */}
            <TabsContent value="sources" className="space-y-4 mt-4">
              <Card className="p-4">
                {sources.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Snippet</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sources.map((source, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium max-w-xs">
                            {source.title || 'Untitled'}
                          </TableCell>
                          <TableCell className="max-w-sm">
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate block"
                            >
                              {source.url}
                            </a>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-md">
                            {source.snippet || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    No sources found
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Competitors Tab */}
            <TabsContent value="competitors" className="space-y-4 mt-4">
              <Card className="p-4">
                {competitors.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>URL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitors.map((competitor, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {competitor.domain || new URL(competitor.url).hostname}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {competitor.title || 'Untitled'}
                          </TableCell>
                          <TableCell className="max-w-sm">
                            <a 
                              href={competitor.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate block"
                            >
                              {competitor.url}
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    No competitors found
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
