import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Globe, Search, TrendingUp, FileText } from 'lucide-react';

export const semWorkflowPrompts = {
  landingPageAnalysis: {
    title: "Landing Pages Analysis & Keywords",
    icon: Globe,
    model: "openai/gpt-4o",
    firecrawl: true,
    prompt: `You are an expert Google Ads SEM strategist. Analyze the following landing pages and generate keyword clusters for a paid search campaign.

Website: {{websiteUrl}}
Objectives: {{objectives || 'Drive conversions and sales'}}

Landing Pages Content:
{{pagesSummary}}

Generate 3-5 keyword clusters that are:
1. **Highly transactional/commercial** - Focus on keywords that indicate buying intent (e.g., "buy", "pricing", "quote", "order", "service", "hire", "best", "deals")
2. **Relevant to the landing page content** - Keywords should match what's actually on the pages
3. **Google Ads optimized** - Suitable for paid search campaigns
4. **Specific and actionable** - Avoid generic or overly broad keywords

For each cluster:
- Give it a clear, descriptive name (e.g., "Product Pricing", "Service Packages", "Buy Solutions")
- Include 8-12 high-intent commercial keywords
- Focus on exact match and phrase match opportunities
- Include location/urgency modifiers where relevant

Return ONLY a valid JSON array:
[
  {
    "id": "cluster-1",
    "name": "Cluster Name",
    "keywords": ["keyword 1", "keyword 2", ...]
  }
]`
  },
  
  competitorResearch: {
    title: "Competitor Ad Research",
    icon: Search,
    model: null, // Firecrawl search
    description: "Uses Firecrawl's search API to find competitor ads for each keyword cluster. Searches with the top 3 keywords from each cluster to gather competitor insights including headlines, descriptions, and ad strategies."
  },

  adGeneration: {
    title: "Google Search Ad Generation",
    icon: TrendingUp,
    model: "openai/gpt-4o",
    prompt: `You are an expert Google Ads copywriter. Generate compelling Google Search ad copy for this keyword cluster.

Ad Group Name: {{clusterName}}
Keywords: {{keywords}}
Landing Page: {{landingPageUrl}}

{{competitorContext}}

Generate Google Search ad components:

1. **10 Headlines** (max 30 characters each):
   - Compelling and action-oriented
   - Include main keywords naturally
   - Emphasize unique value propositions
   - Use urgency, benefits, or social proof
   - Examples: "Best [Service] | Save 30%", "Top-Rated [Product] Online", "[Product] - Fast Delivery"

2. **4 Descriptions** (max 90 characters each):
   - Expand on benefits and features
   - Include call-to-action
   - Mention guarantees, offers, or unique selling points
   - Examples: "Shop premium [product] with free shipping. 30-day money-back guarantee. Order now!", "Get expert [service] at competitive rates. 24/7 support. Book your free consultation today."

3. **4 Sitelinks** (from available pages):
Available pages for sitelinks:
{{relevantSitelinks}}

Each sitelink needs:
- Title (max 25 characters) - CTR-optimized and clear
- URL (pick from available pages above, or use landing page)
- 2 Descriptions (max 35 characters each) - Brief benefit/feature

Return ONLY valid JSON:
{
  "headlines": ["headline 1", "headline 2", ...], // exactly 10
  "descriptions": ["desc 1", "desc 2", ...], // exactly 4
  "sitelinks": [
    {
      "title": "Sitelink Title",
      "url": "https://...",
      "descriptions": ["desc 1", "desc 2"]
    }
  ] // exactly 4
}`
  },

  sitemapExtraction: {
    title: "Sitemap Extraction for Sitelinks",
    icon: FileText,
    model: null,
    description: "Fetches the website sitemap to extract relevant pages for sitelinks. Uses Supabase 'sitemap-scanner' function to get up to 20 pages with titles and URLs."
  }
};

export const SEMPromptViewer = () => {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>SEM Copilot AI Workflow & Prompts</CardTitle>
              <CardDescription>
                AI models and prompts used throughout the SEM campaign creation workflow
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page displays all prompts and AI models used in the 4-step SEM campaign generation workflow. 
            The workflow uses OpenRouter (GPT-4o) and Firecrawl for web scraping and competitor research.
          </p>
        </CardContent>
      </Card>

      {/* SEM Campaign Workflow */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            SEM Campaign Creation - 4-Step Workflow
          </CardTitle>
          <CardDescription>
            Comprehensive workflow from landing page analysis to final ad campaign generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Step 1: Landing Pages Analysis */}
            <AccordionItem value="step-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Step 1: Landing Pages Analysis</div>
                    <div className="text-xs text-muted-foreground">
                      Model: openai/gpt-4o • Firecrawl Scraping • Keyword Cluster Generation
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-auto">Analysis</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      Analyzes landing page URLs using Firecrawl to scrape content (first 5000 characters), then uses 
                      GPT-4o to generate 3-5 keyword clusters with high commercial intent. Each cluster contains 8-12 
                      transactional keywords optimized for Google Ads campaigns.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Generated Data</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>3-5 keyword clusters with descriptive names</li>
                      <li>8-12 high-intent commercial keywords per cluster</li>
                      <li>Keywords focused on buying intent (buy, pricing, quote, order, service)</li>
                      <li>Location and urgency modifiers included</li>
                      <li>Exact match and phrase match opportunities</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">AI Model & Tools</h4>
                    <div className="flex gap-2">
                      <Badge variant="secondary">openai/gpt-4o</Badge>
                      <Badge variant="secondary">Firecrawl API</Badge>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Prompt Template</h4>
                    <ScrollArea className="h-[300px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {semWorkflowPrompts.landingPageAnalysis.prompt}
                      </pre>
                    </ScrollArea>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Firecrawl Configuration</h4>
                    <pre className="text-xs font-mono text-muted-foreground">
{`{
  url: landingPageUrl,
  formats: ['markdown'],
  onlyMainContent: true,
  waitFor: 1000,
  timeout: 15000
}`}
                    </pre>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 2: Select Keyword Clusters */}
            <AccordionItem value="step-2">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Step 2: Select Keywords Clusters</div>
                    <div className="text-xs text-muted-foreground">
                      No AI Model • User Selection • Create Ad Groups
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-auto">Selection</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      User reviews and selects keyword clusters to create ad groups. Each selected cluster will become 
                      one ad group with transactional/commercial focused keywords. No AI model is used in this step.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">User Actions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Review generated keyword clusters</li>
                      <li>See cluster names and preview of top 5 keywords</li>
                      <li>Select clusters that align with campaign goals</li>
                      <li>Each cluster becomes one ad group in the campaign</li>
                    </ul>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Tip:</span> Select multiple clusters to create diverse ad groups 
                      targeting different aspects of your products/services.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3: Search on Web */}
            <AccordionItem value="step-3">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-green-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Step 3: Search on Web</div>
                    <div className="text-xs text-muted-foreground">
                      Firecrawl Search • Competitor Research • Sitemap Extraction
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-auto">Research</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      Performs competitor research by searching for each keyword cluster using Firecrawl's search API. 
                      Also extracts sitemap pages for sitelinks. Gathers insights on existing ad strategies and messaging.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Research Components</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Searches top 3 keywords from each cluster</li>
                      <li>Retrieves up to 5 competitor results per cluster</li>
                      <li>Analyzes competitor headlines and descriptions</li>
                      <li>Fetches sitemap for sitelink URLs (up to 20 pages)</li>
                      <li>Location and language targeting applied</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Tools Used</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">Firecrawl Search API</Badge>
                      <Badge variant="secondary">Sitemap Scanner</Badge>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Firecrawl Search Configuration</h4>
                    <pre className="text-xs font-mono text-muted-foreground">
{`{
  query: primaryKeyword,
  limit: 5,
  lang: language.toLowerCase(),
  country: location.toLowerCase()
}`}
                    </pre>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 4: Ad Generation */}
            <AccordionItem value="step-4">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Step 4: Generate Google Search Ads</div>
                    <div className="text-xs text-muted-foreground">
                      Model: openai/gpt-4o • Ad Copywriting • Headlines, Descriptions, Sitelinks
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-auto">Generation</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      Generates complete Google Search ad components using GPT-4o. For each keyword cluster, creates 
                      10 headlines, 4 descriptions, and 4 sitelinks. Uses competitor insights and brand context 
                      to craft compelling, CTR-optimized ad copy.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Generated Components</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li><strong>10 Headlines:</strong> Max 30 characters, action-oriented with keywords</li>
                      <li><strong>4 Descriptions:</strong> Max 90 characters, benefits and CTAs</li>
                      <li><strong>4 Sitelinks:</strong> Titles (25 chars) + 2 descriptions (35 chars each)</li>
                      <li>All components optimized for Google Ads character limits</li>
                      <li>Incorporates competitor insights and brand messaging</li>
                      <li>Includes urgency, benefits, and social proof</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">AI Model</h4>
                    <Badge variant="secondary">openai/gpt-4o</Badge>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Prompt Template</h4>
                    <ScrollArea className="h-[350px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {semWorkflowPrompts.adGeneration.prompt}
                      </pre>
                    </ScrollArea>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Google Ads Limits:</span> Headlines: 30 chars, Descriptions: 90 chars, 
                      Sitelink titles: 25 chars, Sitelink descriptions: 35 chars. All components are automatically 
                      optimized to meet these requirements.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Technical Stack Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Analysis & Generation</h4>
              <Badge variant="secondary" className="block w-fit">openai/gpt-4o</Badge>
              <p className="text-xs text-muted-foreground">
                Used for keyword cluster generation and Google Search ad copywriting with headlines, descriptions, and sitelinks
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Web Scraping</h4>
              <Badge variant="secondary" className="block w-fit">Firecrawl API</Badge>
              <p className="text-xs text-muted-foreground">
                Scrapes landing page content for analysis and performs competitor ad research via search
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Sitemap Extraction</h4>
              <Badge variant="secondary" className="block w-fit">Sitemap Scanner</Badge>
              <p className="text-xs text-muted-foreground">
                Extracts website pages from sitemap for sitelink URL suggestions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Secrets Required */}
      <Card className="border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-amber-600 dark:text-amber-400">Required API Keys</CardTitle>
          <CardDescription>
            The following API keys must be configured in Supabase Edge Function Secrets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold text-sm">FIRECRAWL_API_KEY</p>
                <p className="text-xs text-muted-foreground">For web scraping and competitor search</p>
              </div>
              <Badge variant="outline">Required</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold text-sm">OPENROUTER_API_KEY</p>
                <p className="text-xs text-muted-foreground">For AI-powered keyword and ad generation</p>
              </div>
              <Badge variant="outline">Required</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
