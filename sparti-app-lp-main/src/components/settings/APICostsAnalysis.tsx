import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, DollarSign, AlertTriangle } from "lucide-react";
import { APICallLogs } from "./APICallLogs";

export const APICostsAnalysis = () => {
  // API Costs Data clustered by feature
  const featureClusters = [
    {
      feature: "Website Analysis",
      description: "Analyze and scrape website content",
      priceRange: "$0.001 - $0.003",
      variables: "Website size, page count",
      stages: ["Stage 1"]
    },
    {
      feature: "Sitemap Scrapping",
      description: "Extract and process website sitemaps",
      priceRange: "$0.001 - $0.005",
      variables: "Sitemap size, number of URLs",
      stages: ["Stage 1"]
    },
    {
      feature: "Sources Search on Web Scrapping",
      description: "Scrape content from external sources",
      priceRange: "$0.001 - $0.003 per source",
      variables: "Number of sources, content length",
      stages: ["Stage 1"]
    },
    {
      feature: "Generate Keywords Cluster",
      description: "Create semantic keyword clusters",
      priceRange: "$0.04 - $0.08",
      variables: "Number of keywords (12-50)",
      stages: ["Stage 1"]
    },
    {
      feature: "Keywords Research",
      description: "Research and analyze target keywords",
      priceRange: "$0.04 - $0.06",
      variables: "Number of keywords (12-28)",
      stages: ["Stage 1"]
    },
    {
      feature: "Topics Research",
      description: "Research content topics and themes",
      priceRange: "$0.05 - $0.10",
      variables: "Number of topics (10-30)",
      stages: ["Stage 2"]
    },
    {
      feature: "Generate Articles",
      description: "AI-powered article generation",
      priceRange: "$0.15 - $0.60",
      variables: "Article length (800-5000 words)",
      stages: ["Stage 4-8"]
    },
    {
      feature: "Generate Image",
      description: "AI-generated featured images",
      priceRange: "$0.01 - $0.05",
      variables: "Image resolution, style complexity",
      stages: ["Assets Copilot"]
    }
  ];

  // Article generation cost calculator
  const calculateArticleCost = (numArticles: number) => {
    // Average costs per article
    const websiteAnalysis = 0.002; // Firecrawl
    const keywordResearch = 0.05; // Claude for keywords
    const contentAnalysis = 0.08; // Claude for sources (3-5 sources per article)
    const blueprint = 0.03; // Claude for outline
    const brandVoice = 0.02; // Amortized across articles
    const writing = 0.15; // GPT-4o-mini for 2000 words
    const enhancement = 0.06; // GPT-4 for final polish
    const seoAnalysis = 0.04; // Claude for SEO check

    const perArticleCost = 
      websiteAnalysis + 
      keywordResearch + 
      contentAnalysis + 
      blueprint + 
      writing + 
      enhancement + 
      seoAnalysis;

    const brandVoiceCost = numArticles === 1 ? brandVoice : brandVoice / numArticles;
    
    return {
      perArticle: perArticleCost + brandVoiceCost,
      total: (perArticleCost * numArticles) + brandVoice,
      breakdown: {
        websiteAnalysis: websiteAnalysis * numArticles,
        keywordResearch: keywordResearch * numArticles,
        contentAnalysis: contentAnalysis * numArticles,
        blueprint: blueprint * numArticles,
        brandVoice: brandVoice,
        writing: writing * numArticles,
        enhancement: enhancement * numArticles,
        seoAnalysis: seoAnalysis * numArticles
      }
    };
  };

  const singleArticle = calculateArticleCost(1);
  const bulkArticles = calculateArticleCost(20);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            API Costs Overview
          </CardTitle>
          <CardDescription>
            Comprehensive breakdown of all API calls and costs in the SEO workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Costs shown are estimates based on typical usage patterns. Actual costs may vary based on content length, complexity, and API provider pricing updates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Feature Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Costs</CardTitle>
          <CardDescription>
            Cost breakdown by feature cluster in the SEO workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Workflow Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureClusters.map((cluster, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{cluster.feature}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cluster.description}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-primary">
                      {cluster.priceRange}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cluster.variables}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cluster.stages.map((stage, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {stage}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* API Call Logs */}
      <APICallLogs />

      {/* Cost Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Article Generation Cost Calculator
          </CardTitle>
          <CardDescription>
            Estimated costs for generating articles at different scales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Single Article */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Single Article Generation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="text-2xl font-bold text-primary">
                  ${singleArticle.perArticle.toFixed(3)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Website Analysis</div>
                <div className="text-lg font-semibold">
                  ${singleArticle.breakdown.websiteAnalysis.toFixed(3)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Keyword Research</div>
                <div className="text-lg font-semibold">
                  ${singleArticle.breakdown.keywordResearch.toFixed(3)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Content Analysis</div>
                <div className="text-lg font-semibold">
                  ${singleArticle.breakdown.contentAnalysis.toFixed(3)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Blueprint Creation</div>
                <div className="text-lg font-semibold">
                  ${singleArticle.breakdown.blueprint.toFixed(3)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Brand Voice</div>
                <div className="text-lg font-semibold">
                  ${singleArticle.breakdown.brandVoice.toFixed(3)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Article Writing</div>
                <div className="text-lg font-semibold">
                  ${singleArticle.breakdown.writing.toFixed(3)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Enhancement</div>
                <div className="text-lg font-semibold">
                  ${singleArticle.breakdown.enhancement.toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Articles */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">Bulk Generation (20 Articles)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="text-2xl font-bold text-primary">
                  ${bulkArticles.total.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Cost per Article</div>
                <div className="text-2xl font-bold text-success">
                  ${bulkArticles.perArticle.toFixed(3)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Savings per Article</div>
                <div className="text-lg font-semibold text-success">
                  ${(singleArticle.perArticle - bulkArticles.perArticle).toFixed(3)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Savings</div>
                <div className="text-lg font-semibold text-success">
                  ${((singleArticle.perArticle * 20) - bulkArticles.total).toFixed(2)}
                </div>
              </div>
            </div>
            <Alert>
              <AlertDescription>
                <strong>Bulk Efficiency:</strong> The brand voice analysis cost is amortized across all articles, reducing the per-article cost by ~{((1 - bulkArticles.perArticle / singleArticle.perArticle) * 100).toFixed(1)}% when generating 20 articles.
              </AlertDescription>
            </Alert>
          </div>

          {/* Variable Factors */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">Cost Variables</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="outline">Article Length</Badge>
                <span className="text-muted-foreground">
                  800 words (~$0.30) vs 2000 words (~$0.40) vs 5000 words (~$0.60)
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="outline">Source Analysis</Badge>
                <span className="text-muted-foreground">
                  3 sources (~$0.06) vs 5 sources (~$0.10) vs 10 sources (~$0.15)
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="outline">Keywords</Badge>
                <span className="text-muted-foreground">
                  12 keywords (~$0.04) vs 28 keywords (~$0.06) vs 50 keywords (~$0.08)
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="outline">Enhancement Level</Badge>
                <span className="text-muted-foreground">
                  Basic (~$0.04) vs Standard (~$0.06) vs Deep (~$0.10)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Generate articles in bulk to amortize fixed costs like brand voice analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use shorter article lengths for blog posts and longer lengths for comprehensive guides</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Limit source analysis to 3-5 high-quality sources instead of 10+ sources</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Focus on 12-20 targeted keywords rather than 50+ broad keywords</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Cache and reuse website analysis for multiple articles about the same brand</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
