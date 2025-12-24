import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { universalPromptTemplate } from '@/utils/promptTemplate';
import { FileText, Cpu, Globe, KeyRound, Search, FileSearch, Image, Sparkles, Layers, Database, Pencil, Users, Tag, Zap } from 'lucide-react';

const workflowPrompts = {
  websiteAnalysis: {
    title: "Website Analysis",
    icon: Globe,
    model: "openai/gpt-4o-mini",
    prompt: `You are a data extraction assistant. Analyze this website and extract key information. 

CRITICAL: You must respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks. Just the raw JSON.

Required JSON structure:
{
  "brand_name": "string",
  "brand_description": "string", 
  "target_audience": "string",
  "key_selling_points": ["string1", "string2", "string3"],
  "target_country": "string",
  "content_language": "string",
  "suggested_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Website URL: {{websiteUrl}}
Website Content:
{{websiteContent}}

Extract the following information:
- Brand name: The company/brand name
- Brand description: Brief description of what the brand does (1-2 sentences)
- Target audience: Who the target customers are (be specific)
- Key selling points: 3-5 main benefits or features (as array of strings)
- Target country: Primary target country (infer from domain, content, or language)
- Content language: Primary content language
- Suggested keywords: 5 relevant SEO keywords that describe the brand, products, or services (as array of strings)

Respond with ONLY the JSON object. No other text.`
  },
  keywordExtraction: {
    title: "Keyword Extraction",
    icon: KeyRound,
    model: "anthropic/claude-3.5-sonnet",
    prompt: `You are an SEO keyword strategist. Based on the business information provided, suggest as many relevant seed keywords as possible for a comprehensive SEO content strategy.

Context:
- Website: {{websiteUrl}}
- Target Country: {{country}}
- Language: {{language}}

Business Information from User:
{{qaContext}}{{instructionsSection}}

Instructions:
- Suggest ALL relevant seed keywords (short phrases, 1-3 words each)
- Aim for 20-50 seed keywords if there are that many relevant opportunities
- Minimum of 10 keywords, but don't limit yourself if more are relevant
- Focus on commercial intent and relevance
- Consider the target audience and business goals
- Cover all aspects of the business and related topics
- Return ONLY a JSON array of keywords, nothing else
- Format: ["keyword 1", "keyword 2", "keyword 3", ...]
- Do not include explanations or additional text`
  },
  longtailVariants: {
    title: "Long-tail Keyword Variants",
    icon: Search,
    model: "anthropic/claude-3.5-sonnet",
    prompt: `You are an expert SEO strategist specializing in long-tail keyword research. 
Your task is to generate long-tail keyword variants that:
- Have lower competition but high intent
- Are specific and actionable
- Include question-based keywords
- Consider user search behavior and intent
- Are relevant to the business context

Return a JSON array where each object has:
- main_keyword: the original keyword
- variants: array of 8-12 long-tail variants

Generate long-tail keyword variants for this website:

Website: {{websiteUrl}}
Language: {{language}}
Keywords: {{keywords}}

{{context}}

For each keyword, generate 8-12 specific long-tail variants that include:
- Question-based queries (how, what, why, when, where)
- Location-specific variants (if relevant)
- Comparison queries (vs, versus, compared to)
- Problem-solution variants
- Specific use cases
- Industry-specific terms

Return ONLY a valid JSON array with this structure:
[
  {
    "main_keyword": "keyword",
    "variants": ["variant 1", "variant 2", ...]
  }
]`
  },
  searchTerms: {
    title: "Search Terms Generation",
    icon: Search,
    model: "openai/gpt-4o-mini",
    prompt: `You are an SEO expert specializing in search term generation and content strategy.
Your task is to generate long-tail search terms that will be used for web scraping to find relevant sources.

IMPORTANT: Generate EXACTLY {{searchTermsCount}} search terms based on topics number divided by 4. Each search term will be used to create 4 different topics covering all 4 user intents (informational, commercial, transactional, navigational).

Return ONLY a JSON array with this structure:
[
  {
    "search_term": "specific long-tail search query",
    "cluster": "cluster name",
    "keywords": ["primary keyword", "secondary keyword"]
  }
]

Guidelines:
- Generate EXACTLY {{searchTermsCount}} search terms (topics number {{topicsNumber}} ÷ 4 = {{searchTermsCount}} search terms)
- Each search term should be broad enough to support 4 different content angles
- Each search term should be specific and actionable for finding quality sources
- All search terms must be for the selected keyword cluster
- Use natural language that people actually search for
- Return valid JSON only, no markdown formatting

Generate {{searchTermsCount}} long-tail search terms{{objective}}

Total topics to create: {{topicsNumber}}
Search terms needed: {{searchTermsCount}} ({{topicsNumber}} topics ÷ 4 = {{searchTermsCount}} search terms)

Generate search terms for this keyword cluster:
Cluster: {{cluster.cluster_name}} ({{cluster.intent}})
Keywords: {{cluster.keywords}}

{{language}}

Each search term should be broad enough to create 4 different topics:
- 1 informational topic (educational, how-to, guides)
- 1 commercial topic (comparisons, reviews, best options)
- 1 transactional topic (buying guides, product features)
- 1 navigational topic (brand-specific, location-specific)

Create diverse, specific search terms that will help find authoritative sources for content creation.`
  },
  sourceAnalysis: {
    title: "Source Content Analysis (Brief Generation)",
    icon: FileSearch,
    model: "openai/gpt-4o-mini",
    prompt: `Analyze the following article and provide a structured analysis:

ARTICLE TITLE: {{title}}
ARTICLE CONTENT:
{{markdown}}

Please provide your analysis in the following JSON format:
{
  "keyTopics": ["topic1", "topic2", "topic3"],
  "keywordsFocus": ["keyword1", "keyword2", "keyword3"],
  "writingStyle": {
    "tone": "professional/casual/formal/etc",
    "voice": "first-person/third-person/etc",
    "characteristics": ["characteristic1", "characteristic2"]
  },
  "citations": ["citation example 1", "citation example 2"],
  "contentBrief": {
    "suggestedOutline": ["Section 1: Title", "Section 2: Title", "Section 3: Title"],
    "recommendedTone": "description of recommended tone",
    "keyMessages": ["message1", "message2", "message3"],
    "targetAudience": "description of target audience",
    "contentAngle": "suggested unique angle for new content"
  }
}

Return ONLY valid JSON, no markdown formatting or explanations.`
  },
  topicGeneration: {
    title: "Topic Generation",
    icon: Sparkles,
    model: "openai/gpt-4o-mini",
    prompt: `You are an expert SEO content strategist creating topic ideas based on search terms.

CRITICAL WORKFLOW REQUIREMENT:
- For EACH search term, you MUST generate EXACTLY 4 topics
- Each of the 4 topics MUST have a DIFFERENT search intent
- The 4 search intents are: "informational", "commercial", "transactional", "navigational"

MANDATORY STRUCTURE:
For {{searchTermsCount}} search terms provided, you MUST return {{totalTopics}} topics total.

For each search term:
- Topic 1: search_intent = "informational"
- Topic 2: search_intent = "commercial"  
- Topic 3: search_intent = "transactional"
- Topic 4: search_intent = "navigational"

CRITICAL INSTRUCTIONS:
1. Generate EXACTLY 4 topics for EACH search term ({{searchTermsCount}} search terms = {{totalTopics}} total topics)
2. Each topic MUST include the "search_term" field (exact match to input search term)
3. Each topic MUST include the "search_intent" field with one of: informational, commercial, transactional, navigational
4. For each search term, use ALL 4 different intents (no duplicates, no missing intents)
5. ALWAYS include "primary_keyword" (main target keyword from the topic)
6. ALWAYS include "secondary_keywords" array (2-3 related keywords)
7. ALWAYS include "target_word_count" (suggested article length, typically 1500-3000)
8. Return ONLY valid JSON array format - no markdown, no comments, no extra text
9. Ensure all string values have properly escaped control characters
10. MUST generate all {{totalTopics}} topics - no exceptions

Return a JSON array with this EXACT structure:
[
  {
    "search_term": "exact search term from input",
    "title": "compelling article title",
    "primary_keyword": "main target keyword phrase",
    "secondary_keywords": ["related keyword 1", "related keyword 2", "related keyword 3"],
    "search_intent": "informational|commercial|transactional|navigational",
    "difficulty": 5,
    "opportunity_score": 8,
    "target_word_count": 2000,
    "content_angle": "unique perspective or approach",
    "outline": ["Introduction", "Main Section 1", "Main Section 2", "Conclusion"]
  }
]

Website: {{websiteUrl}}
Language: {{language}}

Search Terms (generate 4 topics for EACH with 4 different intents):
{{searchTermsList}}

{{sourcesContext}}
{{existingTopicsContext}}

REMEMBER: Return {{totalTopics}} topics total (4 per search term, each with different intent).`
  },
  featuredImage: {
    title: "Featured Image Generation",
    icon: Image,
    model: "google/gemini-2.5-flash-image-preview",
    prompt: `Create a professional, high-quality feature image for a blog article titled "{{title}}".

{{keywordsContext}}

{{contentContext}}

Style: {{imageStyle}}, suitable for web publication. The image should be visually appealing and relevant to the topic. Avoid any text overlays or logos.`
  }
};

export const PromptViewer = () => {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>SEO Copilot AI Models & Prompts</CardTitle>
              <CardDescription>
                All AI models and prompts used throughout the campaign creation workflow
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page displays all the prompts and AI models used at each stage of the SEO content generation workflow. 
            Use this as reference to understand how the AI generates content, analyzes websites, extracts keywords, and creates topics.
          </p>
        </CardContent>
      </Card>

      {/* Multi-Stage Article Generation Workflow */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Article Generation - Multi-Stage Workflow (Active)
          </CardTitle>
          <CardDescription>
            New 8-stage AI workflow that progressively builds context and refines content for superior quality. Each stage uses specialized AI models optimized for specific tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Stage 1: Context Aggregation */}
            <AccordionItem value="stage-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold">Stage 1: Context Aggregation & Validation</div>
                    <div className="text-xs text-muted-foreground">Model: openai/gpt-4o-mini</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Gathers and structures all available information into a comprehensive content strategy before generation begins.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
{`You are an SEO content strategist analyzing all available information to create a comprehensive content strategy.

BRAND INFORMATION:
{{brandInfo}}

CAMPAIGN DETAILS:
{{campaignInfo}}

TOPIC BRIEF:
{{topicBrief}}

SOURCE CITATIONS:
{{sourceCitations}}

BACKLINKS AVAILABLE:
{{backlinks}}

INTERNAL LINKING OPPORTUNITIES:
{{internalLinks}}

Analyze and create structured JSON:
{
  "key_themes": ["theme1", "theme2"],
  "brand_voice_indicators": {...},
  "competitive_angles": [...],
  "content_gaps": [...],
  "keyword_opportunities": {...},
  "internal_linking_strategy": {...}
}`}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 2: Article Blueprint */}
            <AccordionItem value="stage-2">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-green-500" />
                  <div className="text-left">
                    <div className="font-semibold">Stage 2: Article Configuration & Blueprint</div>
                    <div className="text-xs text-muted-foreground">Model: openai/gpt-4o-mini</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Defines article structure with detailed heading hierarchy, keyword placement strategy, and content flow.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
{`You are an SEO content architect creating a detailed article blueprint.

CONTENT STRATEGY:
{{contentStrategy}}

ARTICLE PARAMETERS:
Title: {{articleTitle}}
Primary Keyword: {{primaryKeyword}}
Secondary Keywords: {{secondaryKeywords}}
Target Word Count: {{targetWordCount}}
Language: {{language}}
Tone: {{tone}}
Search Intent: {{searchIntent}}

Create blueprint with:
{
  "outline": [
    {
      "heading": "Section Title",
      "type": "h2",
      "word_count": 400,
      "keywords": ["keyword1"],
      "content_notes": "What to cover"
    }
  ],
  "keyword_distribution": {...},
  "internal_link_placements": [...],
  "faq_questions": [...],
  "content_flow_strategy": "..."
}`}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 3: Brand Voice Profile */}
            <AccordionItem value="stage-3">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <div className="text-left">
                    <div className="font-semibold">Stage 3: Brand & Voice Context Injection</div>
                    <div className="text-xs text-muted-foreground">Model: anthropic/claude-3.5-sonnet</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Establishes brand personality, writing style, and tone guidelines for consistent voice throughout the article.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
{`You are a brand voice specialist creating a detailed voice profile.

ARTICLE BLUEPRINT:
{{articleBlueprint}}

BRAND INFORMATION:
Name: {{brandName}}
Voice: {{brandVoice}}
Description: {{brandDescription}}
Key Selling Points: {{keySellingPoints}}
Target Audience: {{targetAudience}}

Create voice profile:
{
  "language_patterns": {
    "use": ["phrase1", "phrase2"],
    "avoid": ["generic1", "ai-phrase2"]
  },
  "brand_terminology": {...},
  "tone_per_section": {...},
  "brand_mention_strategy": {...},
  "cta_guidelines": {...},
  "authenticity_markers": {...}
}`}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 4: Main Content Generation */}
            <AccordionItem value="stage-4">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Pencil className="h-4 w-4 text-orange-500" />
                  <div className="text-left">
                    <div className="font-semibold">Stage 4: Research-Enhanced Content Generation</div>
                    <div className="text-xs text-muted-foreground">Model: openai/gpt-4o or anthropic/claude-sonnet-4-5</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Generates the core article content using all previous stage outputs as enhanced context. Uses the Universal Prompt Template.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {universalPromptTemplate}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 5: SEO Optimization */}
            <AccordionItem value="stage-5">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-cyan-500" />
                  <div className="text-left">
                    <div className="font-semibold">Stage 5: SEO & Technical Optimization Pass</div>
                    <div className="text-xs text-muted-foreground">Model: openai/gpt-4o-mini</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Enhances SEO elements: keyword density, heading optimization, strategic bolding, and HTML structure validation.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
{`You are an SEO optimization specialist. Enhance this article for search engines.

ARTICLE CONTENT:
{{articleContent}}

PRIMARY KEYWORD: {{primaryKeyword}}
SECONDARY KEYWORDS: {{secondaryKeywords}}
SEARCH INTENT: {{searchIntent}}

Optimize by:
1. Keyword Placement - first 100 words, headings, conclusion
2. Heading Optimization - keywords in H2/H3
3. Strategic Bolding - 3-5 key phrases with <strong>
4. Internal Link Enhancement - descriptive anchors
5. FAQ Schema - proper structure for featured snippets
6. HTML Validation - no H1, proper nesting
7. Semantic Keywords - LSI and related terms

DO NOT change meaning or style.
Return ONLY optimized HTML.`}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 6: Humanization */}
            <AccordionItem value="stage-6">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-pink-500" />
                  <div className="text-left">
                    <div className="font-semibold">Stage 6: Humanization & Quality Pass</div>
                    <div className="text-xs text-muted-foreground">Model: anthropic/claude-3.5-sonnet</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Removes AI writing patterns, adds human touches, varies sentence structure, and ensures natural flow.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
{`You are a content humanization specialist. Refine to remove AI patterns.

ARTICLE CONTENT:
{{articleContent}}

VOICE PROFILE:
{{voiceProfile}}

TONE: {{tone}}

Transform by:
1. Remove AI Patterns:
   - Eliminate ALL em dashes (—)
   - Remove: "In today's world", "It's important to note"
   - Cut excessive adjectives
   - Avoid rigid transitions

2. Add Human Touches:
   - Vary sentence length (5-25 words)
   - Use contractions naturally
   - Add conversational asides
   - Specific examples over generic

3. Flowing Prose:
   - Convert list-like paragraphs
   - Natural connectors
   - 3-5 sentences per paragraph

4. Natural Language:
   - Start sentences with "but" and "and"
   - Add engaging questions
   - Varied paragraph openings

Maintain ALL SEO and HTML formatting.`}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 7: Meta Description */}
            <AccordionItem value="stage-7">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-indigo-500" />
                  <div className="text-left">
                    <div className="font-semibold">Stage 7: Meta Description Generation</div>
                    <div className="text-xs text-muted-foreground">Model: openai/gpt-4o-mini</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Creates an optimized meta description (140-155 characters) with primary keyword, separate from article content.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
{`Generate a compelling meta description for this article.

ARTICLE:
{{finalContent}}

TITLE: {{articleTitle}}
PRIMARY KEYWORD: {{primaryKeyword}}
BRAND: {{brandName}}

Requirements:
- 140-155 characters exactly
- Include primary keyword naturally
- Create urgency or curiosity
- Accurately summarize value
- Include brand name if space permits
- Clear value proposition

Return only the meta description text, nothing else.`}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 8: AI Featured Image Generation */}
            <AccordionItem value="stage-8">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Image className="h-4 w-4 text-purple-500" />
                  <div className="text-left">
                    <div className="font-semibold">Stage 8: AI Featured Image Generation (Conditional)</div>
                    <div className="text-xs text-muted-foreground">Model: google/gemini-2.5-flash-image-preview</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Generates a professional, high-quality featured image that visually represents the article content using Google Gemini 2.5 Flash Image Preview model via Lovable AI Gateway.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ScrollArea className="h-[200px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
{`Prompt Template:
Create a professional, high-quality feature image for a blog article titled "{{articleTitle}}".

The article focuses on: {{keywords}}.

Content context: {{contentPreview}}...

Style: {{imageStyle || 'professional photograph'}}, suitable for web publication. 
The image should be visually appealing and relevant to the topic. 
Avoid any text overlays or logos.

Image Generated Via:
- Model: google/gemini-2.5-flash-image-preview
- Gateway: Lovable AI Gateway
- Output: Base64 PNG image
- Storage: Uploaded to Supabase Storage (article-images bucket)

Alt Text Generated:
"Professional feature image for article about {{keywords || title}}"

Example:
"Create a professional, high-quality feature image for a blog article titled 'Order Froyo Online for Delivery'.
The article focuses on: froyo delivery, online ordering.
Style: professional photograph, suitable for web publication."`}
                      </pre>
                    </ScrollArea>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> This stage only runs when "Featured Image" is set to "AI Generation" in article configuration. The generated image and alt text are saved to the blog_posts table. If set to "None" or "Gallery Selection", this stage is skipped.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Workflow Benefits
            </h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Progressive context building for superior content quality</li>
              <li>• Specialized AI models optimized for each task</li>
              <li>• Consistent brand voice across all articles</li>
              <li>• Enhanced SEO with dedicated optimization pass</li>
              <li>• Natural, human-sounding content through humanization stage</li>
              <li>• Optional AI-generated featured images with professional styling</li>
              <li>• Efficient bulk generation with shared context caching (Stages 1-3)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Article Generation - Legacy Workflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Article Generation - Single Prompt Workflow (Legacy)
                <Badge variant="outline" className="text-xs">Reference Only</Badge>
              </CardTitle>
              <CardDescription>
                Previous single-prompt approach for article generation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg py-2 px-4">
              openai/gpt-4o
            </Badge>
            <span className="text-sm text-muted-foreground">via OpenRouter</span>
          </div>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {universalPromptTemplate}
              </pre>
            </div>
          </ScrollArea>
          <p className="text-sm text-muted-foreground">
            This prompt template is dynamically filled with brand, campaign, topic details, and source citations during article generation.
          </p>
        </CardContent>
      </Card>

      {/* Campaign Setup Workflow Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Setup Workflow Prompts</CardTitle>
          <CardDescription>
            Prompts used during each phase of campaign creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(workflowPrompts).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{config.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Model: {config.model}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{config.model}</Badge>
                      </div>
                      <ScrollArea className="h-[300px] w-full rounded-md border">
                        <div className="p-4">
                          <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                            {config.prompt}
                          </pre>
                        </div>
                      </ScrollArea>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
