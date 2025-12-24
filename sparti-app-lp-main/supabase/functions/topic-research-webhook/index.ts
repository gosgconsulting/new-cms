import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TopicResearchInput {
  keywords: string[];
  language?: string;
  maxTopics?: number;
  brandId: string;
  userId: string;
}

interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  description?: string;
  keywords?: string[];
}

interface TopicSuggestion {
  title: string;
  description: string;
  keywords: string[];
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  difficulty: 'easy' | 'medium' | 'hard';
  searchVolume?: number;
  competition?: 'low' | 'medium' | 'high';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { keywords, language = 'English', maxTopics = 10, brandId, userId }: TopicResearchInput = await req.json()

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!brandId || !userId) {
      return new Response(
        JSON.stringify({ error: 'brandId and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Starting topic research for keywords: ${keywords.join(', ')}`)

    // Step 1: Search for top-ranking content using Firecrawl Search
    console.log('Step 1: Searching for top-ranking content...')
    const searchResults = await searchTopRankingContent(keywords, supabase)

    // Step 2: Analyze and select up to 10 best sources
    console.log('Step 2: Analyzing and selecting best sources...')
    const selectedSources = await selectBestSources(searchResults, 10)

    // Step 3: Scrape content from selected sources using Firecrawl
    console.log('Step 3: Scraping content from selected sources...')
    const scrapedContent = await scrapeSelectedSources(selectedSources, supabase)

    // Step 4: Analyze scraped content with Claude AI to generate topic suggestions
    console.log('Step 4: Analyzing content and generating topic suggestions...')
    const topicSuggestions = await generateTopicSuggestions(scrapedContent, keywords, language, maxTopics, supabase)

    // Step 5: Save generated topics to suggested_topics table
    console.log('Step 5: Saving topic suggestions to database...')
    const savedTopics = await saveTopicSuggestions(topicSuggestions, brandId, userId, supabase)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${savedTopics.length} topic suggestions`,
        topics: savedTopics,
        sources_analyzed: scrapedContent.length,
        keywords_researched: keywords
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Topic research error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Step 1: Search for top-ranking content using Google Search Scraper
async function searchTopRankingContent(keywords: string[], supabase: any): Promise<any[]> {
  try {
    const searchQuery = keywords.join(' ')
    
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: {
        query: searchQuery,
        num_results: 20 // Get more results to analyze
      }
    })

    if (error || !data?.results) {
      throw new Error(`Firecrawl search failed: ${error?.message || 'No results returned'}`)
    }

    console.log(`Found ${data.results.length} search results`)
    return data.results

  } catch (error) {
    console.error('Search error:', error.message)
    throw error
  }
}

// Step 2: Analyze and select up to 10 best sources
async function selectBestSources(searchResults: any[], maxSources: number): Promise<any[]> {
  try {
    // Filter and rank sources based on relevance and quality
    const rankedSources = searchResults
      .filter(result => {
        // Filter out low-quality or irrelevant sources
        return result.url && 
               result.title && 
               !result.url.includes('youtube.com') && 
               !result.url.includes('facebook.com') &&
               !result.url.includes('twitter.com') &&
               !result.url.includes('linkedin.com') &&
               !result.url.includes('amazon.com') &&
               !result.url.includes('amazon.co.uk') &&
               !result.url.includes('amazon.de') &&
               !result.url.includes('amazon.fr') &&
               !result.url.includes('amazon.ca') &&
               !result.url.includes('ebay.com') &&
               !result.url.includes('etsy.com') &&
               !result.url.includes('shopify.com') &&
               !result.url.includes('walmart.com') &&
               !result.url.includes('target.com') &&
               !result.url.includes('bestbuy.com') &&
               !result.url.includes('homedepot.com') &&
               !result.url.includes('lowes.com') &&
               !result.url.includes('alibaba.com') &&
               !result.url.includes('aliexpress.com') &&
               !result.url.includes('zalando.com') &&
               !result.url.includes('asos.com') &&
               !result.url.includes('zalando.de') &&
               !result.url.includes('otto.de') &&
               !result.url.includes('web.de') &&
               !result.url.includes('gmx.de') &&
               !result.url.includes('hotmail.com') &&
               !result.url.includes('outlook.com') &&
               !result.url.includes('gmail.com') &&
               !result.url.includes('google.com') &&
               !result.url.includes('bing.com') &&
               !result.url.includes('yahoo.com')
      })
      .map(result => ({
        ...result,
        relevanceScore: calculateRelevanceScore(result, searchResults[0]?.query || '')
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxSources)

    console.log(`Selected ${rankedSources.length} best sources`)
    return rankedSources

  } catch (error) {
    console.error('Source selection error:', error.message)
    throw error
  }
}

// Calculate relevance score for source ranking
function calculateRelevanceScore(result: any, query: string): number {
  let score = 0
  
  // Title relevance
  if (result.title) {
    const titleLower = result.title.toLowerCase()
    const queryWords = query.toLowerCase().split(' ')
    score += queryWords.filter(word => titleLower.includes(word)).length * 2
  }

  // URL relevance
  if (result.url) {
    const urlLower = result.url.toLowerCase()
    const queryWords = query.toLowerCase().split(' ')
    score += queryWords.filter(word => urlLower.includes(word)).length
  }

  // Domain authority (basic heuristic)
  if (result.url) {
    const domain = new URL(result.url).hostname
    if (domain.includes('wikipedia.org')) score += 5
    else if (domain.includes('gov')) score += 4
    else if (domain.includes('edu')) score += 4
    else if (domain.includes('medium.com')) score += 3
    else if (domain.includes('forbes.com')) score += 3
    else if (domain.includes('hbr.org')) score += 3
  }

  return score
}

// Step 3: Scrape content from selected sources using Firecrawl
async function scrapeSelectedSources(sources: any[], supabase: any): Promise<ScrapedContent[]> {
  try {
    const scrapedContent: ScrapedContent[] = []
    
    // Scrape content from each selected source
    for (const source of sources) {
      try {
        const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
          body: {
            url: source.url,
            formats: ['markdown', 'html'],
            onlyMainContent: true,
            maxLength: 5000 // Limit content length for analysis
          }
        })

        if (error || !data?.success) {
          console.warn(`Failed to scrape ${source.url}: ${error?.message || 'Unknown error'}`)
          continue
        }

        const content = data.data?.markdown || data.data?.html || ''
        
        scrapedContent.push({
          url: source.url,
          title: source.title || 'Untitled',
          content: content,
          description: source.description,
          keywords: extractKeywords(content)
        })

        console.log(`Successfully scraped: ${source.title}`)

      } catch (scrapeError) {
        console.warn(`Error scraping ${source.url}:`, scrapeError.message)
        continue
      }
    }

    console.log(`Successfully scraped ${scrapedContent.length} sources`)
    return scrapedContent

  } catch (error) {
    console.error('Content scraping error:', error.message)
    throw error
  }
}

// Extract keywords from content
function extractKeywords(content: string): string[] {
  // Simple keyword extraction - can be enhanced with NLP
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'].includes(word))

  // Count word frequency and return top keywords
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

// Step 4: Analyze scraped content with Claude AI to generate topic suggestions
async function generateTopicSuggestions(
  scrapedContent: ScrapedContent[], 
  keywords: string[], 
  language: string, 
  maxTopics: number,
  supabase: any
): Promise<TopicSuggestion[]> {
  try {
    // Prepare content summary for AI analysis
    const contentSummary = scrapedContent.map(content => ({
      title: content.title,
      url: content.url,
      keywords: content.keywords?.slice(0, 5) || [],
      contentPreview: content.content.substring(0, 1000) // First 1000 chars
    }))

    const systemPrompt = `You are an expert content strategist and SEO specialist. Analyze the provided content and generate relevant, high-quality topic suggestions for content creation.

Your task is to:
1. Analyze the scraped content from top-ranking pages
2. Identify content gaps and opportunities
3. Generate unique, valuable topic ideas
4. Ensure topics are relevant to the target keywords
5. Provide detailed descriptions and metadata

Focus on creating topics that:
- Are unique and not already covered extensively
- Have commercial or informational value
- Are achievable to write about
- Target the provided keywords naturally
- Would rank well in search engines`

    const userPrompt = `Based on the following content analysis, generate ${maxTopics} unique topic suggestions for the keywords: ${keywords.join(', ')}.

Content to analyze:
${JSON.stringify(contentSummary, null, 2)}

For each topic, provide:
- title: A compelling, SEO-friendly title (60-70 characters)
- description: Detailed description explaining the topic's value and approach (150-200 words)
- keywords: 3-5 relevant keywords/topics
- intent: The search intent (informational, navigational, commercial, or transactional)
- difficulty: Content creation difficulty (easy, medium, or hard)
- searchVolume: Estimated monthly search volume (1-100 scale)
- competition: Competition level (low, medium, or high)

Return the response as a valid JSON array of objects.`

    const { data, error } = await supabase.functions.invoke('openrouter-chat', {
      body: {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }
    })

    if (error || !data?.choices?.[0]?.message?.content) {
      throw new Error(`AI analysis failed: ${error?.message || 'No content generated'}`)
    }

    // Parse AI response
    const aiResponse = data.choices[0].message.content
    let topicSuggestions: TopicSuggestion[] = []

    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        topicSuggestions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found in AI response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback: create basic topics from keywords
      topicSuggestions = keywords.slice(0, maxTopics).map(keyword => ({
        title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: Complete Guide`,
        description: `A comprehensive guide covering all aspects of ${keyword}, including best practices, tips, and expert insights.`,
        keywords: [keyword, `${keyword} guide`, `${keyword} tips`],
        intent: 'informational' as const,
        difficulty: 'medium' as const,
        searchVolume: 50,
        competition: 'medium' as const
      }))
    }

    // Validate and clean topics
    topicSuggestions = topicSuggestions
      .filter(topic => topic.title && topic.description)
      .slice(0, maxTopics)
      .map(topic => ({
        ...topic,
        title: topic.title.substring(0, 70), // Limit title length
        description: topic.description.substring(0, 500), // Limit description length
        keywords: topic.keywords?.slice(0, 5) || []
      }))

    console.log(`Generated ${topicSuggestions.length} topic suggestions`)
    return topicSuggestions

  } catch (error) {
    console.error('Topic generation error:', error.message)
    throw error
  }
}

// Step 5: Save generated topics to suggested_topics table
async function saveTopicSuggestions(
  topicSuggestions: TopicSuggestion[], 
  brandId: string, 
  userId: string, 
  supabase: any
): Promise<any[]> {
  try {
    const topicsToSave = topicSuggestions.map(topic => ({
      title: topic.title,
      description: topic.description,
      keywords: topic.keywords,
      intent: topic.intent,
      difficulty: topic.difficulty,
      search_volume: topic.searchVolume || 0,
      competition: topic.competition,
      status: 'suggested',
      brand_id: brandId,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('suggested_topics')
      .insert(topicsToSave)
      .select()

    if (error) {
      throw new Error(`Failed to save topics: ${error.message}`)
    }

    console.log(`Successfully saved ${data.length} topics to database`)
    return data

  } catch (error) {
    console.error('Save topics error:', error.message)
    throw error
  }
}