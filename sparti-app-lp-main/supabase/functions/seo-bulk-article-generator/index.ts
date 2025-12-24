// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log('🔧 Starting SEO bulk article generation function...');
    console.log('🔐 Authentication token received:', req.headers.get('Authorization') ? 'Yes' : 'No');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log('✅ User authenticated:', user.id);

    const requestData = await req.json();
    console.log('📝 SEO Bulk Article Generation request:', JSON.stringify(requestData, null, 2));

    const { action } = requestData;

    if (action === 'check_progress') {
      const { brandId } = requestData;
      console.log('📊 Progress check requested for brandId:', brandId);
      
      return new Response(JSON.stringify({
        success: true,
        progress: 0,
        step: 'ready',
        message: 'Ready to start workflow'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'start_workflow') {
      console.log('🚀 Step 1: Saving form data and generating search keywords...');
      
      const {
        brandId,
        websiteUrl,
        businessDescription,
        numberOfArticles,
        articleLength,
        articleType,
        language,
        targetCountry,
        extractedKeywords = [],
        lobstrRunId
      } = requestData;

      const generatedKeywords = await generateSearchKeywords(
        businessDescription,
        targetCountry,
        language
      );
      
      const formattedSearchLocation = formatSearchLocation(targetCountry);
      
      console.log('🎯 Generated keywords:', JSON.stringify(generatedKeywords, null, 2));
      console.log('📍 Formatted search location:', formattedSearchLocation);
      
      const formData = {
        userId: user.id,
        brandId,
        websiteUrl,
        businessDescription,
        numberOfArticles,
        articleLength,
        articleType,
        language,
        targetCountry,
        extractedKeywords,
        generatedSearchKeywords: generatedKeywords,
        formattedSearchLocation,
        lobstrRunId
      };
      
      console.log('📋 Form data saved:', JSON.stringify(formData, null, 2));
      
      // Step 2: Create campaign immediately
      const campaign = await createCampaign(supabase, formData);
      
      console.log('✅ Steps 1-2 completed: Form data saved and campaign created');

      return new Response(JSON.stringify({
        success: true,
        step: 2,
        message: 'Form data saved, search keywords generated, and campaign created',
        data: { ...formData, campaignId: campaign.id },
        progress: 20
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'run_workflow') {
      const {
        campaignId,
        brandId,
        websiteUrl,
        businessDescription,
        numberOfArticles,
        articleLength,
        articleType,
        language,
        targetCountry,
        extractedKeywords = [],
        generatedSearchKeywords = [],
        formattedSearchLocation,
        writingStyle,
        lobstrRunId
      } = requestData;
      
      console.log('🔧 Starting complete SEO keyword research workflow...');
      
      const formData = {
        userId: user.id,
        brandId,
        websiteUrl,
        businessDescription,
        numberOfArticles,
        articleLength,
        articleType,
        language,
        targetCountry,
        extractedKeywords,
        generatedSearchKeywords,
        formattedSearchLocation,
        writingStyle
      };
      
      try {
        // Step 3: Extract website content
        console.log('📄 Step 3: Extracting website content...');
        const websiteContent = await extractWebsiteContent(websiteUrl);

        // Step 4: Collect Google Search results (prefer the active run if provided)
        console.log('🔎 Step 4: Collecting search results to drive analysis...');
        let recentResults = [] as any[];
        if (lobstrRunId) {
          const { data: runResults, error: runErr } = await supabase
            .from('google_search_results')
            .select('*')
            .eq('user_id', user.id)
            .or(`lobstr_run_id.eq.${lobstrRunId},search_session_id.eq.${lobstrRunId}`)
            .order('position', { ascending: true });
          if (!runErr && runResults) recentResults = runResults;
        }
        if (recentResults.length === 0) {
          recentResults = await getRecentGoogleSearchResultsForUser(user.id, supabase, 200);
        }
        const topArticles = selectTopArticlesFromResults(recentResults, 5, websiteUrl);
        console.log(`📑 Selected ${topArticles.length} top articles for content analysis`);

        // Step 5: Scrape article contents and capture citations
        console.log('📥 Step 5: Scraping selected article contents...');
        const scrapedArticles = [] as Array<{ url: string; domain: string; content: string; title?: string }>;
        for (const article of topArticles) {
          try {
            const content = await scrapeArticleContent(article.url);
            scrapedArticles.push({ url: article.url, domain: article.domain, content, title: article.title });
          } catch (err) {
            console.warn('Failed to scrape article:', article.url, err);
          }
        }

        // Step 6: Call Claude to analyze style, propose topics and keywords
        console.log('🤖 Step 6: Calling Claude to analyze style and propose topics...');
        const anthropicApiKey = await getAnthropicApiKey(supabase);
        const minWords = mapArticleLengthToMinWords(articleLength);
        const claudeAnalysis = await analyzeWithClaude({
          anthropicApiKey,
          websiteUrl,
          businessDescription,
          targetCountry,
          language,
          numberOfArticles,
          minWords,
          writingStyle: writingStyle || '',
          baseKeywords: generatedSearchKeywords.length ? generatedSearchKeywords : extractedKeywords,
          scrapedArticles
        });

        const competitorData = {
          topCompetitors: claudeAnalysis?.competitors || [],
          contentGaps: claudeAnalysis?.contentGaps || [],
          keywordDifficulty: claudeAnalysis?.keywordDifficulty || 'Medium',
          marketOpportunities: claudeAnalysis?.marketOpportunities || []
        };

        const keywordAnalysis = {
          expandedKeywords: claudeAnalysis?.recommendedKeywords || [],
          difficulty: 'Mixed',
          volume: 0,
          trends: [] as string[]
        };

        const contentStrategy = {
          articleOutlines: claudeAnalysis?.topics?.map((t: any) => ({
            title: t.title,
            primaryKeyword: t.primaryKeyword,
            secondaryKeywords: t.secondaryKeywords,
            outline: t.outline || [],
            targetWordCount: minWords
          })) || [],
          contentPillars: claudeAnalysis?.contentPillars || [],
          targetAudience: claudeAnalysis?.targetAudience || 'General audience',
          contentGaps: claudeAnalysis?.contentGaps || []
        };
        
        // Step 7: Update campaign with all research data
        console.log('💾 Step 7: Updating campaign with research data...');
        const result = await updateCampaignWithResearch(
          supabase,
          campaignId,
          keywordAnalysis,
          contentStrategy,
          { ...competitorData, citations: claudeAnalysis?.citations || [] },
          websiteContent,
          formData
        );
        
        console.log('🎉 SEO keyword research workflow completed successfully!');
        
        return new Response(JSON.stringify({
          success: true,
          message: 'SEO keyword research completed successfully',
          campaignId: result.campaignId,
          keywords: keywordAnalysis.expandedKeywords.slice(0, 10),
          articleTitles: contentStrategy.articleOutlines.map((outline: any) => outline.title),
          knowledgeBase: {
            keywordCount: keywordAnalysis.expandedKeywords.length,
            contentPillars: contentStrategy.contentPillars,
            targetAudience: contentStrategy.targetAudience
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('❌ Error in SEO workflow:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message || 'SEO workflow failed'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (action === 'generate_articles') {
      const { campaignId, selectedTitles } = requestData;
      
      try {
        console.log('📝 Generating articles for campaign:', campaignId);
        console.log('Selected titles:', selectedTitles);
        
        const result = await generateArticlesFromCampaign(supabase, campaignId, selectedTitles, user.id);
        
        return new Response(JSON.stringify({
          success: true,
          message: `Successfully generated ${result.articlesGenerated} articles`,
          articlesGenerated: result.articlesGenerated
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('❌ Error generating articles:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message || 'Article generation failed'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Auto-generate articles right after workflow if requested
    if (action === 'run_workflow_and_generate') {
      const runReq = { ...requestData, action: 'run_workflow' };
      const runResp = await serve({} as any)(new Request('http://local', { method: 'POST', headers: req.headers, body: JSON.stringify(runReq) }));
      const runJson = await runResp.json();
      if (!runJson?.success) {
        return new Response(JSON.stringify(runJson), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
      }
      const selectedTitles = runJson.articleTitles || [];
      if (!selectedTitles.length) {
        return new Response(JSON.stringify(runJson), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const genReq = { action: 'generate_articles', campaignId: runJson.campaignId, selectedTitles };
      const genResp = await serve({} as any)(new Request('http://local', { method: 'POST', headers: req.headers, body: JSON.stringify(genReq) }));
      const genJson = await genResp.json();
      return new Response(JSON.stringify({ ...runJson, ...genJson }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Generate search keywords based on business description
async function generateSearchKeywords(
  businessDescription: string,
  targetCountry: string,
  language: string
) {
  console.log('📥 Input data:', {
    businessDescription,
    targetCountry,
    language
  });

  // Fallback keyword generation based on business description
  const words = businessDescription.toLowerCase().split(' ');
  const keywordBase = words.slice(0, 2).join(' ');
  
  const generatedKeywords = [
    `${keywordBase} services`,
    `professional ${keywordBase}`,
    `${keywordBase} solutions`,
    `best ${keywordBase}`,
    `${keywordBase} ${targetCountry || 'online'}`
  ];

  return generatedKeywords;
}

// Format country name to search location code
function formatSearchLocation(targetCountry: string): string {
  const countryMap: { [key: string]: string } = {
    'United States': 'US',
    'Singapore': 'SG',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Japan': 'JP',
    'South Korea': 'KR'
  };
  
  return countryMap[targetCountry] || 'US';
}

// Extract content from website (mock implementation)
async function extractWebsiteContent(websiteUrl: string) {
  console.log('🌐 Extracting content from:', websiteUrl);
  
  try {
    const response = await fetch(websiteUrl);
    const html = await response.text();
    
    // Basic text extraction (remove HTML tags)
    const textContent = html.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000); // Limit to first 2000 chars
    
    return textContent || `Website content extracted from ${websiteUrl}. The site appears to be focused on business services and solutions.`;
  } catch (error) {
    console.error('Error extracting website content:', error);
    return `Unable to extract content from ${websiteUrl}. Manual analysis may be required.`;
  }
}

// Simulate competitor research
async function simulateCompetitorResearch(keywords: string[], targetCountry: string) {
  console.log('🔍 Simulating competitor research for keywords:', keywords);
  
  return {
    topCompetitors: [
      'Competitor A - Strong SEO presence',
      'Competitor B - Active content marketing', 
      'Competitor C - Social media focused'
    ],
    contentGaps: [
      'How-to guides',
      'Industry analysis',
      'Case studies'
    ],
    keywordDifficulty: 'Medium',
    marketOpportunities: [
      'Long-tail keywords',
      'Local search optimization',
      'Voice search optimization'
    ]
  };
}

// Analyze and expand keywords
async function analyzeAndExpandKeywords(baseKeywords: string[], competitorData: any) {
  console.log('🎯 Analyzing keywords:', baseKeywords);
  
  const expandedKeywords: string[] = [];
  
  baseKeywords.forEach(keyword => {
    expandedKeywords.push(keyword);
    expandedKeywords.push(`${keyword} guide`);
    expandedKeywords.push(`${keyword} tips`);
    expandedKeywords.push(`how to ${keyword}`);
    expandedKeywords.push(`${keyword} best practices`);
  });
  
  return {
    expandedKeywords: [...new Set(expandedKeywords)].slice(0, 20),
    difficulty: 'Medium',
    volume: 15000,
    trends: ['Growing', 'Seasonal']
  };
}

// Generate content strategy and article titles
async function generateContentStrategy(
  keywords: string[],
  websiteContent: string,
  competitorData: any,
  numberOfArticles: number,
  articleType: string,
  language: string
) {
  console.log('📝 Generating content strategy...');
  
  // Generate article outlines with titles
  const articleOutlines = [];
  for (let i = 0; i < numberOfArticles && i < keywords.length; i++) {
    const keyword = keywords[i];
    articleOutlines.push({
      title: `Ultimate Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
      primaryKeyword: keyword,
      secondaryKeywords: keywords.slice(i + 1, i + 4),
      outline: [
        'Introduction',
        `What is ${keyword}?`,
        `Benefits of ${keyword}`,
        `How to implement ${keyword}`,
        'Conclusion'
      ],
      targetWordCount: articleType === 'long' ? 2000 : 1000
    });
  }
  
  return {
    articleOutlines,
    contentPillars: ['Education', 'How-to', 'Benefits'],
    targetAudience: 'Business professionals',
    contentGaps: ['Technical implementation', 'Case studies']
  };
}

// Create initial campaign
async function createCampaign(supabase: any, formData: any) {
  try {
    console.log('🚀 Step 2: Creating SEO campaign...');
    
  const { data: campaign, error: campaignError } = await supabase
      .from('seo_campaigns')
      .insert({
        name: `SEO Campaign - ${new Date().toLocaleDateString()}`,
        user_id: formData.userId,
        brand_id: formData.brandId,
        website_url: formData.websiteUrl,
        business_description: formData.businessDescription,
        number_of_articles: formData.numberOfArticles,
        article_length: formData.articleLength,
        article_type: formData.articleType,
        language: formData.language,
        target_country: formData.targetCountry,
        extracted_keywords: formData.extractedKeywords || [],
        status: 'in_progress',
        current_step: 'form_data_saved',
        progress: 10
      })
      .select()
      .single();
    
    if (campaignError) throw campaignError;
    
    console.log('✅ Campaign created successfully:', campaign.id);
    return campaign;
  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    throw error;
  }
}

// Update campaign with research data
async function updateCampaignWithResearch(
  supabase: any,
  campaignId: string,
  keywordAnalysis: any,
  contentStrategy: any,
  competitorData: any,
  websiteContent: string,
  formData: any
) {
  try {
    console.log('💾 Updating campaign with research data...');
    
    const knowledgeBase = {
      websiteContent,
      extractedKeywords: formData.extractedKeywords,
      competitorAnalysis: competitorData,
      keywordAnalysis: keywordAnalysis,
      contentStrategy: contentStrategy,
      searchKeywords: formData.generatedSearchKeywords,
      businessContext: {
        description: formData.businessDescription,
        websiteUrl: formData.websiteUrl,
        targetCountry: formData.targetCountry,
        language: formData.language
      },
      researchCompleted: new Date().toISOString()
    };

    const { data: updated, error: campaignError } = await supabase
      .from('seo_campaigns')
      .update({
        organic_keywords: keywordAnalysis.expandedKeywords,
        style_analysis: {
          competitorData,
          knowledge_base: knowledgeBase,
          article_outlines: contentStrategy.articleOutlines,
          suggested_titles: contentStrategy.articleOutlines.map((o: any) => o.title),
          contentPillars: contentStrategy.contentPillars,
          targetAudience: contentStrategy.targetAudience
        },
        progress: 60,
        current_step: 'keyword_research'
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (campaignError) throw campaignError;

    console.log('✅ SEO campaign updated with research data successfully');
    return { campaignId: updated.id };
  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    throw error;
  }
}

// Generate articles from campaign
async function generateArticlesFromCampaign(
  supabase: any,
  campaignId: string,
  selectedTitles: string[],
  userId: string
) {
  try {
    console.log('📝 Generating articles for campaign:', campaignId);
    
    // Get SEO campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('seo_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (campaignError) throw campaignError;
    
    const knowledgeBase = campaign.style_analysis?.knowledge_base;
    const articleOutlines = campaign.style_analysis?.article_outlines || [];
    const brandId = campaign.brand_id || null;
    
    let articlesGenerated = 0;
    
    for (const title of selectedTitles) {
      try {
        console.log(`📝 Generating article ${articlesGenerated + 1} of ${selectedTitles.length}: ${title}`);
        
        // Find the corresponding outline
        const outline = articleOutlines.find((o: any) => o.title === title);
        
        if (!outline) {
          console.warn(`⚠️ No outline found for title: ${title}`);
          continue;
        }
        
        // Transform outline to content-writing-workflow format
        const topicData = {
          id: outline.id || crypto.randomUUID(),
          title: title,
          description: outline.description || `Article about ${outline.primaryKeyword}`,
          keywords: [outline.primaryKeyword, ...(outline.secondaryKeywords || [])],
          intent: outline.intent || 'informational',
          campaign_id: campaignId,
          outline: outline.outline || outline.sections || [],
          sources: outline.sources || [],
          internal_links: []
        };
        
        // Get brand details for better context
        let brandName = '';
        if (brandId) {
          const { data: brandData } = await supabase
            .from('brands')
            .select('name')
            .eq('id', brandId)
            .single();
          brandName = brandData?.name || '';
        }
        
        // Call content-writing-unified for AI-powered article generation
        console.log(`🤖 Invoking content-writing-unified for: ${title}`);
        const { data: workflowResult, error: workflowError } = await supabase.functions.invoke(
          'content-writing-unified',
          {
            body: {
              topics: [topicData],
              campaign_id: campaignId,
              language: campaign.language || 'English',
              wordCount: outline.targetWordCount || mapArticleLengthToMinWords(campaign.article_length || 'Medium (700-1000 words)'),
              tone: campaign.tone || 'Professional',
              includeIntro: true,
              includeConclusion: true,
              includeFAQ: true,
              featuredImage: 'none',
              model: 'claude-sonnet-4-20250514',
              brandId: brandId,
              brandName: brandName,
              userId: userId,
              contentSettings: {
                use_brand_info: true,
                brand_mentions: 'natural',
                competitor_mentions: 'none',
                internal_links: 'automatic'
              },
              sources: []
            }
          }
        );
        
        if (workflowError) {
          console.error(`❌ Workflow invoke error for article "${title}":`, workflowError);
          continue;
        }
        
        // Check if the workflow itself succeeded
        if (!workflowResult || !workflowResult.success) {
          console.error(`❌ Workflow failed for article "${title}":`, workflowResult?.error || 'Unknown error');
          if (workflowResult?.workflow_warnings) {
            console.warn('Workflow warnings:', workflowResult.workflow_warnings);
          }
          continue;
        }
        
        console.log(`✅ Article generated successfully: ${title}`, {
          article_id: workflowResult.article?.id,
          workflow_results: workflowResult.workflow_results
        });
        
        articlesGenerated++;
        
      } catch (articleError) {
        console.error(`❌ Error generating article "${title}":`, articleError);
        // Continue with next article even if one fails
        continue;
      }
    }
    
    // Update campaign progress/status accordingly
    if (articlesGenerated > 0) {
      await supabase
        .from('seo_campaigns')
        .update({ status: 'completed', progress: 100, current_step: 'completed' })
        .eq('id', campaignId);
    } else {
      await supabase
        .from('seo_campaigns')
        .update({ status: 'in_progress', current_step: 'keyword_research' })
        .eq('id', campaignId);
    }
    
    return { articlesGenerated };
    
  } catch (error) {
    console.error('❌ Error generating articles:', error);
    throw error;
  }
}

// Note: generateSingleArticle function removed - now using content-writing-unified for AI-powered generation

// Fetch Anthropic API key from settings table (global key)
async function getAnthropicApiKey(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'anthropic_api_key')
    .eq('is_global', true)
    .single();
  if (error || !data?.value) {
    throw new Error('Anthropic API key not configured');
  }
  return data.value as string;
}

// Map article length label to minimum words
function mapArticleLengthToMinWords(articleLength: string): number {
  const map: Record<string, number> = {
    'Short (300-500 words)': 300,
    'Medium (700-1000 words)': 700,
    'Long (1200-1500 words)': 1200,
    'Very Long (2000+ words)': 2000
  };
  return map[articleLength] || 1000;
}

// Get recent google search results saved for this user
async function getRecentGoogleSearchResultsForUser(userId: string, supabase: any, limit: number = 200) {
  const { data, error } = await supabase
    .from('google_search_results')
    .select('*')
    .eq('user_id', userId)
    .order('scraped_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent search results:', error);
    return [] as any[];
  }
  return data || [];
}

// Pick top articles by Google position, unique domains, exclude own site
function selectTopArticlesFromResults(results: any[], maxArticles: number, websiteUrl?: string): Array<{ url: string; domain: string; title?: string }> {
  const selected: Array<{ url: string; domain: string; title?: string; position?: number }> = [];
  const seenDomains = new Set<string>();
  const ownDomain = extractDomainFromUrl(websiteUrl || '');
  const sorted = [...results].sort((a, b) => (a.position || 999) - (b.position || 999));
  for (const r of sorted) {
    const domain = r.domain || extractDomainFromUrl(r.url || '');
    if (!domain) continue;
    if (ownDomain && domain.includes(ownDomain)) continue; // exclude own site
    if (seenDomains.has(domain)) continue;
    if (!r.is_organic && r.is_organic !== undefined) continue;
    if (!r.url) continue;
    selected.push({ url: r.url, domain, title: r.title, position: r.position });
    seenDomains.add(domain);
    if (selected.length >= maxArticles) break;
  }
  return selected;
}

// Scrape article HTML and extract text content
async function scrapeArticleContent(url: string): Promise<string> {
  const formatted = url.startsWith('http') ? url : `https://${url}`;
  const res = await fetch(formatted, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
    }
  });
  const html = await res.text();
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 7000);
  return text;
}

// Use Claude to analyze scraped articles and propose topics/keywords with citations
async function analyzeWithClaude(params: {
  anthropicApiKey: string;
  websiteUrl: string;
  businessDescription: string;
  targetCountry: string;
  language: string;
  numberOfArticles: number;
  minWords: number;
  writingStyle: string;
  baseKeywords: string[];
  scrapedArticles: Array<{ url: string; domain: string; content: string; title?: string }>;
}): Promise<any> {
  const { anthropicApiKey, websiteUrl, businessDescription, targetCountry, language, numberOfArticles, minWords, writingStyle, baseKeywords, scrapedArticles } = params;

  const systemPrompt = `You are an expert SEO strategist and content editor. Analyze provided competitor article excerpts and produce a content plan tailored for the specified market.

STRICTLY return valid JSON with keys: topics, recommendedKeywords, competitors, contentPillars, contentGaps, keywordDifficulty, marketOpportunities, targetAudience, citations.

Rules:
- Propose exactly ${numberOfArticles} topics.
- Each topic must include: title, primaryKeyword, secondaryKeywords (3 items), outline (5-8 H2s), minWordCount (>= ${minWords}).
- Focus language: ${language}. Market: ${targetCountry}. Site: ${websiteUrl}.
- Style: ${writingStyle || 'clear, authoritative, human'}.
- Avoid competitor brand names in titles. Prefer evergreen, non-navigational queries.
- Provide citations array with {source, quote} extracted from the competitor excerpts to support statements.
- Recommend backlink sources per topic when relevant.`;

  const articlesSnippet = scrapedArticles.map((a, i) => ({
    idx: i + 1,
    url: a.url,
    domain: a.domain,
    title: a.title || '',
    excerpt: a.content.slice(0, 1500)
  }));

  const userPrompt = JSON.stringify({
    websiteUrl,
    businessDescription,
    targetCountry,
    language,
    baseKeywords,
    writingStyle: writingStyle || undefined,
    competitorArticles: articlesSnippet
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.5,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Anthropic error:', response.status, errText);
    throw new Error('Anthropic API error');
  }
  const ai = await response.json();
  const text = ai?.content?.[0]?.text || '{}';
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Failed to parse Claude JSON. Returning fallback.');
    return {
      topics: baseKeywords.slice(0, numberOfArticles).map((k: string, idx: number) => ({
        title: `Comprehensive Guide to ${k}`,
        primaryKeyword: k,
        secondaryKeywords: baseKeywords.filter(b => b !== k).slice(0, 3),
        outline: ['Introduction', `What is ${k}?`, `Benefits of ${k}`, `How to use ${k}`, 'Conclusion'],
        minWordCount: minWords
      })),
      recommendedKeywords: baseKeywords.slice(0, numberOfArticles * 3),
      competitors: Array.from(new Set(scrapedArticles.map(a => a.domain))).slice(0, 5),
      contentPillars: ['How-to', 'Comparison', 'Best Practices'],
      contentGaps: ['Case studies', 'Local insights'],
      keywordDifficulty: 'Medium',
      marketOpportunities: ['Long-tail queries'],
      targetAudience: 'Decision-makers',
      citations: scrapedArticles.slice(0, 5).map(a => ({ source: a.url, quote: 'Referenced insight from competitor article.' }))
    };
  }
}

// Extract domain helper
function extractDomainFromUrl(url: string): string {
  if (!url) return '';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}