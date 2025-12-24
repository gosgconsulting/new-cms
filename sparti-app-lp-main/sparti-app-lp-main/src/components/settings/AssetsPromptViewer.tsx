import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Globe, Sparkles, Image, Layers, FileText } from 'lucide-react';

export const assetsWorkflowPrompts = {
  websiteAnalysis: {
    title: "Website Analysis & Brand Extraction",
    icon: Globe,
    model: "openai/gpt-4o",
    firecrawl: true,
    prompt: `You are a brand analysis expert specializing in visual identity extraction. Analyze this website thoroughly and extract comprehensive brand information for asset creation.

CRITICAL: You must respond with ONLY a valid JSON object. No explanatory text, markdown, or code blocks. Just raw JSON.

Website URL: {{websiteUrl}}
Website Content:
{{websiteContent}}

Extract the following brand information:

REQUIRED JSON structure:
{
  "brand_name": "string",
  "brand_description": "string (1-2 sentences)",
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": ["#hexcode1", "#hexcode2"],
    "background": "#hexcode",
    "text": "#hexcode"
  },
  "typography": {
    "heading_font": "font family name",
    "body_font": "font family name",
    "characteristics": "brief description of typography style"
  },
  "logo_url": "full URL to logo image or null if not found",
  "favicon_url": "full URL to favicon or null",
  "brand_style": {
    "overall_aesthetic": "modern/classic/minimal/bold/etc",
    "visual_tone": "professional/playful/luxury/casual/etc",
    "design_patterns": ["pattern1", "pattern2"]
  },
  "target_audience": "specific description of target audience",
  "key_products_services": ["product/service 1", "product/service 2", "product/service 3"],
  "unique_selling_points": ["USP 1", "USP 2", "USP 3"]
}

Analysis Instructions:
1. Brand Colors: Extract exact hex codes from CSS, headers, buttons, and key elements
2. Typography: Identify font families used for headings and body text
3. Logo: Find the main logo image URL (check header, footer, meta tags)
4. Favicon: Extract favicon URL from link tags or default location
5. Visual Style: Analyze overall design aesthetic and tone
6. Business Context: Understand what they sell/offer and who they target

Respond with ONLY the JSON object. No other text.`
  },
  
  assetObjective: {
    title: "Asset Objective Definition",
    icon: FileText,
    model: "openai/gpt-4o",
    prompt: `You are a marketing strategist. Based on the brand analysis and user input, define the asset creation objective.

Brand Information:
{{brandInfo}}

User Objective Input: {{userObjective}}

Create a structured objective document in JSON format:
{
  "campaign_goal": "primary goal (awareness/conversion/engagement/etc)",
  "target_platforms": ["Meta Ads", "Instagram", "Facebook", "etc"],
  "content_focus": "what the assets should emphasize",
  "tone_direction": "how the assets should feel",
  "call_to_action": "primary CTA for the assets",
  "restrictions": ["any constraints or guidelines"]
}

Return ONLY valid JSON.`
  },

  marketingHooks: {
    title: "Marketing Hooks Generation",
    icon: Sparkles,
    model: "openai/gpt-4o",
    prompt: `You are a creative marketing copywriter specializing in attention-grabbing hooks for social media and ads.

Brand Information:
{{brandInfo}}

Asset Objective:
{{assetObjective}}

Generate 12-15 compelling marketing hooks that can be used for ad creatives. Each hook should:
- Be attention-grabbing and scroll-stopping
- Align with the brand voice and objective
- Be concise (5-10 words ideal)
- Work well with visual assets
- Drive the intended action

Return ONLY a JSON array with this structure:
[
  {
    "hook_text": "Your compelling hook here",
    "hook_type": "question|statement|stat|benefit|urgency",
    "emotional_appeal": "curiosity|fear|desire|trust|etc",
    "best_for": "awareness|consideration|conversion",
    "rationale": "brief explanation why this hook works"
  }
]

Generate diverse hooks covering different angles, emotional appeals, and campaign stages. Focus on variety and impact.

Return ONLY valid JSON array. No markdown or explanations.`
  },

  adSizes: {
    title: "Meta Ad Format Specifications",
    icon: Layers,
    model: null, // Static data, no AI needed
    formats: [
      {
        name: "Square",
        aspect_ratio: "1:1",
        dimensions: "1080x1080",
        platforms: ["Instagram Feed", "Facebook Feed"],
        best_for: "General posts, product showcases"
      },
      {
        name: "Portrait",
        aspect_ratio: "4:5",
        dimensions: "1080x1350",
        platforms: ["Instagram Feed", "Facebook Feed"],
        best_for: "Mobile-optimized feed posts"
      },
      {
        name: "Story",
        aspect_ratio: "9:16",
        dimensions: "1080x1920",
        platforms: ["Instagram Stories", "Facebook Stories", "Reels"],
        best_for: "Full-screen immersive content"
      },
      {
        name: "Landscape",
        aspect_ratio: "16:9",
        dimensions: "1200x675",
        platforms: ["Facebook Feed", "Facebook Ads"],
        best_for: "Desktop feed, video ads"
      },
      {
        name: "Carousel Square",
        aspect_ratio: "1:1",
        dimensions: "1080x1080",
        platforms: ["Instagram Carousel", "Facebook Carousel"],
        best_for: "Multiple product showcases"
      }
    ]
  },

  imageGeneration: {
    title: "Asset Image Generation",
    icon: Image,
    model: "google/gemini-2.5-flash-image-preview",
    prompt: `Create a high-quality, professional marketing asset image for Meta ads.

Brand Information:
{{brandInfo}}

Marketing Hook: {{selectedHook}}

Asset Objective: {{assetObjective}}

Design Requirements:
- Aspect Ratio: {{aspectRatio}}
- Platform: {{platform}}
- Style: {{brandStyle}}

Color Palette to Use:
- Primary: {{primaryColor}}
- Secondary: {{secondaryColor}}
- Accent: {{accentColors}}

Visual Requirements:
- Match the brand's visual aesthetic ({{overallAesthetic}})
- Tone: {{visualTone}}
- Incorporate the marketing hook message
- Leave space for text overlay if needed
- High contrast and visual appeal
- Mobile-optimized readability

DO NOT include:
- Any text or typography in the image
- Logos or brand names (will be added later)
- Contact information

Create a clean, professional image that:
1. Visually represents the marketing hook
2. Uses the brand color palette
3. Matches the brand's aesthetic style
4. Works well for the target platform
5. Is attention-grabbing and scroll-stopping

Style: Professional marketing asset, high quality, {{brandStyle}}, optimized for {{platform}}.`
  }
};

export const AssetsPromptViewer = () => {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Assets Copilot AI Workflow & Prompts</CardTitle>
              <CardDescription>
                AI models and prompts used throughout the asset creation workflow
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page displays all prompts and AI models used in the 4-step asset generation workflow. 
            The workflow uses OpenRouter (GPT-4o), Firecrawl for web scraping, and Gemini for image generation.
          </p>
        </CardContent>
      </Card>

      {/* Asset Creation Workflow */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Asset Creation - 4-Step Workflow
          </CardTitle>
          <CardDescription>
            Comprehensive workflow from website analysis to final asset generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Step 1: Website Analysis */}
            <AccordionItem value="step-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Step 1: Website Analysis & Brand Extraction</div>
                    <div className="text-xs text-muted-foreground">
                      Model: openai/gpt-4o • Firecrawl Scraping • Website Analysis
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
                      Analyzes the website to extract comprehensive brand information including colors, typography, 
                      logo, visual style, and business context. Uses Firecrawl to scrape website content, then 
                      GPT-4o to extract structured brand data.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Extracted Data</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Brand name and description</li>
                      <li>Color palette (primary, secondary, accent, background, text)</li>
                      <li>Typography (heading and body fonts)</li>
                      <li>Logo and favicon URLs</li>
                      <li>Visual style and aesthetic (modern/classic/minimal/bold)</li>
                      <li>Target audience and products/services</li>
                      <li>Unique selling points</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">AI Model</h4>
                    <Badge variant="secondary">openai/gpt-4o</Badge>
                    <span className="text-xs text-muted-foreground ml-2">+ Firecrawl API</span>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Prompt Template</h4>
                    <ScrollArea className="h-[300px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {assetsWorkflowPrompts.websiteAnalysis.prompt}
                      </pre>
                    </ScrollArea>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Asset Objective Prompt</h4>
                    <ScrollArea className="h-[200px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {assetsWorkflowPrompts.assetObjective.prompt}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 2: Marketing Hooks */}
            <AccordionItem value="step-2">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Step 2: Marketing Hooks Generation</div>
                    <div className="text-xs text-muted-foreground">
                      Model: openai/gpt-4o • Creative Copywriting • 12-15 Hooks
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-auto">Creative</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      Generates 12-15 compelling marketing hooks based on the brand analysis and asset objective. 
                      Each hook is designed to be attention-grabbing and suitable for social media ads.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Hook Characteristics</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>5-10 words ideal length</li>
                      <li>Attention-grabbing and scroll-stopping</li>
                      <li>Aligned with brand voice</li>
                      <li>Multiple types: questions, statements, stats, benefits, urgency</li>
                      <li>Various emotional appeals: curiosity, desire, trust, etc.</li>
                      <li>Optimized for different campaign stages</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">AI Model</h4>
                    <Badge variant="secondary">openai/gpt-4o</Badge>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Prompt Template</h4>
                    <ScrollArea className="h-[300px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {assetsWorkflowPrompts.marketingHooks.prompt}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3: Ad Sizes */}
            <AccordionItem value="step-3">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-green-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Step 3: Choose Ad Sizes & Formats</div>
                    <div className="text-xs text-muted-foreground">
                      Meta Ads Format Specifications • No AI Model Required
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
                      User selects which ad formats to generate based on Meta's recommended specifications. 
                      No AI involved - these are standard format definitions.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Available Formats</h4>
                    {assetsWorkflowPrompts.adSizes.formats.map((format, idx) => (
                      <div key={idx} className="bg-muted/30 p-3 rounded-lg space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{format.name}</span>
                          <Badge variant="outline" className="text-xs">{format.aspect_ratio}</Badge>
                          <span className="text-xs text-muted-foreground">{format.dimensions}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Platforms:</span> {format.platforms.join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Best for:</span> {format.best_for}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 4: Image Generation */}
            <AccordionItem value="step-4">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Image className="h-4 w-4 text-orange-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Step 4: Generate Assets</div>
                    <div className="text-xs text-muted-foreground">
                      Model: google/gemini-2.5-flash-image-preview • Image Generation • 2-10 Assets
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
                      Generates professional marketing asset images using Gemini's image generation model. 
                      Each asset is created based on selected marketing hooks, brand colors, and chosen formats.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Generation Parameters</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Language selection for market localization</li>
                      <li>Number of assets (2-10 per generation)</li>
                      <li>Selected marketing hooks</li>
                      <li>Brand colors and typography applied</li>
                      <li>Format-specific aspect ratios</li>
                      <li>Platform-optimized designs</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">AI Model</h4>
                    <Badge variant="secondary">google/gemini-2.5-flash-image-preview</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Also known as "Nano banana" - specialized for creating high-quality marketing images
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Prompt Template</h4>
                    <ScrollArea className="h-[300px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {assetsWorkflowPrompts.imageGeneration.prompt}
                      </pre>
                    </ScrollArea>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Note:</span> Images are generated without text overlays or logos. 
                      These can be added in post-processing or using design tools.
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
                Used for website analysis, brand extraction, marketing hook generation, and objective definition
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Web Scraping</h4>
              <Badge variant="secondary" className="block w-fit">Firecrawl API</Badge>
              <p className="text-xs text-muted-foreground">
                Extracts website content, images, and metadata for brand analysis
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Image Generation</h4>
              <Badge variant="secondary" className="block w-fit">Gemini 2.5 Flash Image</Badge>
              <p className="text-xs text-muted-foreground">
                Creates professional marketing assets based on brand guidelines and hooks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
