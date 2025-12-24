import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentWritingInput {
  topics: Array<{
    id: string;
    title: string;
    description: string;
    keywords: string[];
    intent?: string;
    campaign_id?: string;
    outline?: string[];
    sources?: string[];
    internal_links?: string[];
  }>;
  campaign_id?: string;
  language: string;
  wordCount: number;
  tone: string;
  includeIntro: boolean;
  includeConclusion: boolean;
  includeFAQ: boolean;
  featuredImage: 'none' | 'ai_generation' | 'gallery_selection';
  model?: string;
  brandId: string;
  brandName: string;
  userId: string;
  customPrompt?: string;
  contentSettings?: {
    brand_mentions?: string;
    competitor_mentions?: string;
    internal_links?: string;
    use_brand_info?: boolean;
    image_style?: string;
    [key: string]: any;
  };
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    const requestData = await req.json()
    const inputData: ContentWritingInput = requestData
    const executionId = requestData.executionId

    console.log('Starting content writing workflow for topic:', inputData.topics[0]?.title)
    if (executionId) {
      console.log('Execution ID:', executionId)
    }

    // Helper function to update execution status
    const updateExecutionStatus = async (status: 'processing' | 'completed' | 'failed', result?: any, error?: string) => {
      if (!executionId) return
      
      try {
        await supabaseClient
          .from('workflow_executions')
          .update({
            status,
            result: result || null,
            error: error || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', executionId)
        
        console.log(`Execution ${executionId} status updated to: ${status}`)
      } catch (updateError) {
        console.error('Failed to update execution status:', updateError)
      }
    }

    // **NEW STEP: Fetch Enhanced Context Data**
    console.log('Step 0: Fetching brand and campaign context...')
    const enhancedContext = await fetchEnhancedContext(inputData, supabaseClient)
    console.log('Enhanced context fetched:', {
      hasBrandInfo: !!enhancedContext.brandInfo,
      hasCampaignInfo: !!enhancedContext.campaignInfo
    })

    // Step 3: Edge function scrapes source URL and reference content for article research
    console.log('Step 3: Scraping reference content...')
    await updateExecutionStatus('processing', { currentStep: 'scraping', progress: 20 })
    
    let scrapedContent = null
    let scrapingSuccess = false
    let scrapingError = null
    
    try {
      scrapedContent = await scrapeReferenceContent(inputData.topics[0], supabaseClient, authHeader)
      scrapingSuccess = true
      console.log('Step 3 successful: Content scraped successfully')
    } catch (error) {
      console.error('Step 3 failed:', error.message)
      scrapingError = error.message
      console.log('Step 3 failed but continuing workflow without scraped content')
    }


    // Step 4: Fetch / Analyse source contents and brief
    console.log('Step 4: Analyzing scraped content...')
    await updateExecutionStatus('processing', { currentStep: 'analyzing', progress: 40 })
    
    let analysis = null
    let analysisSuccess = false
    let analysisError = null
    
    try {
      analysis = await analyzeContent(scrapedContent, inputData, supabaseClient)
      analysisSuccess = true
      console.log('Step 4 successful: Content analysis completed')
    } catch (error) {
      console.error('Step 4 failed:', error.message)
      analysisError = error.message
      console.log('Step 4 failed but continuing workflow without content analysis')
    }

    // Step 5: AI generates SEO-optimized article based on topic, research, brand guidelines, and user settings
    console.log('Step 5: Generating article content with enhanced context...')
    await updateExecutionStatus('processing', { currentStep: 'generating', progress: 60 })
    
    let articleContent = null
    let generationSuccess = false
    let generationError = null
    
    let articleResult = null
    try {
      articleResult = await generateArticleContent(inputData, analysis, enhancedContext, supabaseClient)
      articleContent = articleResult.content
      generationSuccess = true
      console.log('Step 5 successful: Article content generated')
    } catch (error) {
      console.error('Step 5 failed:', error.message)
      generationError = error.message
      console.log('Step 5 failed - article generation is required, stopping workflow')
      await updateExecutionStatus('failed', null, `Step 5 (Article Generation) failed: ${error.message}`)
      throw new Error(`Step 5 (Article Generation) failed: ${error.message}. Article generation is required for the workflow to complete.`)
    }

    // Step 6: AI creates featured image based on article title, keywords, and custom image style preferences
    console.log('Step 6: Generating featured image...')
    await updateExecutionStatus('processing', { currentStep: 'generating_image', progress: 80 })
    
    let featuredImageUrl = null
    let imageGenerationSuccess = false
    let imageGenerationError = null
    
    if (inputData.featuredImage === 'ai_generation') {
      try {
        featuredImageUrl = await generateFeaturedImage(inputData, articleContent, supabaseClient, authHeader)
        imageGenerationSuccess = !!featuredImageUrl
        if (imageGenerationSuccess) {
          console.log('Step 6 successful: Featured image generated and uploaded')
        } else {
          console.log('Step 6 failed: No image URL returned from generation')
        }
      } catch (error) {
        console.error('Step 6 failed:', error.message)
        imageGenerationError = error.message
        console.log('Image generation failed, continuing without featured image')
      }
    } else {
      console.log('Step 6 skipped: Image generation not requested')
    }

    // Step 7: Article content, metadata, and featured image are saved to blog_posts table
    console.log('Step 7: Saving article to database...')
    await updateExecutionStatus('processing', { currentStep: 'saving', progress: 90 })
    
    let savedArticle = null
    try {
      savedArticle = await saveArticle(inputData, articleContent, featuredImageUrl, supabaseClient)
      console.log('Step 7 successful: Article saved to database')
    } catch (error) {
      console.error('Step 7 failed:', error.message)
      await updateExecutionStatus('failed', null, `Step 7 (Database Save) failed: ${error.message}`)
      throw new Error(`Step 7 (Database Save) failed: ${error.message}`)
    }

    // Step 7.5: Generate meta description separately
    let metaDescriptionSuccess = false
    let metaDescriptionError = null
    if (savedArticle) {
      console.log('Step 7.5: Generating meta description...')
      try {
        const { error: metaError } = await supabase.functions.invoke('generate-meta-description', {
          body: {
            articleId: savedArticle.id,
            content: articleContent,
            title: inputData.topics[0].title,
            keywords: inputData.topics[0].keywords,
            brandName: inputData.brandName
          }
        })
        
        if (metaError) {
          console.error('Meta description generation failed:', metaError)
          metaDescriptionError = metaError.message
        } else {
          console.log('Step 7.5 successful: Meta description generated')
          metaDescriptionSuccess = true
        }
      } catch (error) {
        console.error('Meta description generation error:', error.message)
        metaDescriptionError = error.message
      }
    }

    // Step 8: Background backlink optimization (async, don't wait)
    if (savedArticle) {
      console.log('Step 8: Starting background backlink optimization...')
      
      // Run backlink optimization in background without waiting
      supabase.functions.invoke('optimize-backlinks', {
        body: {
          articleId: savedArticle.id,
          articleContent: articleContent,
          brandId: inputData.brandId
        }
      })
        .then(({ data, error }) => {
          if (error) {
            console.error('Background backlink optimization failed:', error.message)
          } else if (data && data.success) {
            console.log('Background backlink optimization completed')
          } else {
            console.error('Background backlink optimization failed:', data?.error || 'Unknown error')
          }
        })
        .catch((error) => {
          console.error('Background backlink optimization error:', error.message)
        })
    }

    // Update execution status to completed
    const finalResult = {
      success: true,
      article: savedArticle,
      workflow_results: {
          scraped_content: scrapingSuccess ? 'Success' : 'Failed',
          content_analysis: analysisSuccess ? 'Success' : 'Failed',
          article_generation: generationSuccess ? 'Success' : 'Failed',
          image_generation: inputData.featuredImage === 'ai_generation' 
            ? (imageGenerationSuccess ? 'Success' : 'Failed')
            : 'Skipped',
          database_save: savedArticle ? 'Success' : 'Failed',
          meta_description_generation: metaDescriptionSuccess ? 'Success' : 'Failed',
          backlink_optimization: savedArticle ? 'Processing' : 'Skipped'
        },
        workflow_warnings: [
          ...(scrapingSuccess ? [] : [{
            step: 'Content Scraping',
            message: 'Failed to scrape reference content from source URLs',
            error: scrapingError,
            impact: 'Article generated without reference content - may have reduced quality'
          }]),
          ...(analysisSuccess ? [] : [{
            step: 'Content Analysis',
            message: 'Failed to analyze scraped content',
            error: analysisError,
            impact: 'Article generated without content analysis - may lack structured insights'
          }]),
          ...(generationSuccess ? [] : [{
            step: 'Article Generation',
            message: 'Failed to generate AI-powered article content',
            error: generationError,
            impact: 'Article generated with basic placeholder content instead of AI-generated content'
          }]),
          ...(inputData.featuredImage === 'ai_generation' && !imageGenerationSuccess ? [{
            step: 'Image Generation',
            message: 'Failed to generate featured image',
            error: imageGenerationError,
            impact: 'Article saved without featured image'
          }] : []),
          ...(!metaDescriptionSuccess ? [{
            step: 'Meta Description Generation',
            message: 'Failed to generate meta description',
            error: metaDescriptionError,
            impact: 'Article saved without meta description - you can generate it manually later'
          }] : [])
        ]
      }

    // Update execution status to completed
    await updateExecutionStatus('completed', finalResult)

    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Content writing workflow error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        workflow_results: {
          scraped_content: 'Failed',
          content_analysis: 'Failed',
          article_generation: 'Failed',
          image_generation: 'Failed',
          database_save: 'Failed'
        },
        workflow_warnings: [
          {
            step: 'Workflow Execution',
            message: 'Content writing workflow failed',
            error: error.message,
            impact: 'No article was generated'
          }
        ]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// **NEW FUNCTION: Fetch comprehensive brand and campaign context**
async function fetchEnhancedContext(inputData: ContentWritingInput, supabase: any) {
  const context: any = {
    brandInfo: null,
    campaignInfo: null
  }

  try {
    // Fetch brand information
    const { data: brandData } = await supabase
      .from('brands')
      .select('*')
      .eq('id', inputData.brandId)
      .single()
    
    if (brandData) {
      context.brandInfo = {
        name: brandData.name,
        website: brandData.website,
        description: brandData.description,
        target_audience: brandData.target_audience,
        brand_voice: brandData.brand_voice,
        key_selling_points: brandData.key_selling_points
      }
      console.log('Brand info fetched successfully')
    }

    // Fetch campaign information if topic has campaign_id
    const topic = inputData.topics[0]
    if (topic.campaign_id) {
      const { data: campaignData } = await supabase
        .from('seo_campaigns')
        .select('*')
        .eq('id', topic.campaign_id)
        .single()
      
      if (campaignData) {
        context.campaignInfo = {
          website_url: campaignData.website_url,
          business_description: campaignData.business_description,
          target_country: campaignData.target_country,
          language: campaignData.language,
          organic_keywords: campaignData.organic_keywords || [],
          style_analysis: campaignData.style_analysis,
          competitors: campaignData.style_analysis?.competitorData?.topCompetitors || [],
          content_pillars: campaignData.style_analysis?.contentPillars || []
        }
        console.log('Campaign info fetched successfully')
      }
    }
  } catch (error) {
    console.error('Error fetching enhanced context:', error.message)
    // Continue without enhanced context if fetch fails
  }

  return context
}

async function scrapeReferenceContent(topic: any, supabase: any, authHeader: string) {
  console.log(`Attempting to scrape content for topic: ${topic.title}`)
  
  let sourceUrl = null
  if (topic.source) {
    try {
      const sourceData = JSON.parse(topic.source)
      sourceUrl = sourceData.url
      console.log(`Found source URL in topic.source: ${sourceUrl}`)
    } catch (error) {
      console.log('Failed to parse topic.source JSON:', error.message)
    }
  }
  
  if (sourceUrl) {
    try {
      console.log(`Strategy 1: Scraping original source: ${sourceUrl}`)
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/firecrawl-scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          url: sourceUrl,
          formats: [{ type: "json", prompt: "Extract the main article content, title, author, publication date, and key topics. Return structured data with fields: title, content, author, date, topics, summary." }],
          onlyMainContent: true
        })
      })

      const data = await response.json()
      const error = !response.ok ? { message: data.error || 'Request failed' } : null

      if (!error && data?.data) {
        console.log('Strategy 1 successful: Original source scraped')
        return JSON.stringify(data.data)
      }
    } catch (error) {
      console.log('Strategy 1 error:', error.message)
    }
  }

  console.log('No suitable content found from scraping')
  throw new Error('All scraping strategies failed')
}

async function analyzeContent(scrapedContent: string | null, inputData: ContentWritingInput, supabase: any) {
  try {
    let contentForAnalysis = 'No reference content available.'
    if (scrapedContent) {
      try {
        const structuredData = JSON.parse(scrapedContent)
        contentForAnalysis = `Title: ${structuredData.title || 'N/A'}\nAuthor: ${structuredData.author || 'N/A'}\nDate: ${structuredData.date || 'N/A'}\nSummary: ${structuredData.summary || 'N/A'}\nTopics: ${structuredData.topics ? structuredData.topics.join(', ') : 'N/A'}\nContent: ${structuredData.content || 'N/A'}`
      } catch (e) {
        contentForAnalysis = `Content:\n${scrapedContent}`
      }
    }

    const analysisPrompt = `
Analyze the following content and provide a structured analysis for article writing:

Topic: ${inputData.topics[0].title}
Target Word Count: ${inputData.wordCount}
Tone: ${inputData.tone}
Language: ${inputData.language}

${contentForAnalysis}

Provide analysis in JSON format with:
- key_points: Array of main points to cover
- structure_suggestion: Recommended article structure
- seo_keywords: Additional SEO keywords to include
- content_gaps: Areas that need more research
- insights: Key insights from the reference content
`

    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured')
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparti.ai',
        'X-Title': 'Sparti AI Assistant',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    const data = await response.json()
    if (!response.ok || data.error) {
      throw new Error(data.error || 'OpenRouter AI call failed')
    }

    return data?.choices?.[0]?.message?.content || null
  } catch (error) {
    console.error('Content analysis error:', error.message)
    throw new Error(`Content analysis failed: ${error.message}`)
  }
}

// **UPDATED: Generate article content with enhanced context**
async function generateArticleContent(
  inputData: ContentWritingInput, 
  analysis: string | null, 
  enhancedContext: any,
  supabase: any
) {
  try {
    const targetWords = inputData.wordCount + 450;
    const totalChunks = targetWords <= 2000 ? 2 : 3;
    const chunkSize = Math.ceil(targetWords / totalChunks) + 50;
    
    console.log(`Generating ${targetWords}-word article in ${totalChunks} chunks`)
    
    const articleChunks = []
    const topic = inputData.topics[0]
    
    // Build comprehensive context object
    const baseContext = {
      title: topic.title,
      description: topic.description,
      keywords: topic.keywords?.join(', ') || '',
      intent: topic.intent || '',
      outline: topic.outline,
      sources: topic.sources,
      internalLinks: topic.internal_links,
      brandName: inputData.brandName,
      tone: inputData.tone,
      language: inputData.language,
      analysis: analysis || '',
      customPrompt: inputData.customPrompt || '',
      includeIntro: inputData.includeIntro,
      includeConclusion: inputData.includeConclusion,
      includeFAQ: inputData.includeFAQ,
      campaignId: topic.campaign_id || inputData.campaign_id,
      // Enhanced brand context
      brandInfo: enhancedContext.brandInfo,
      // Enhanced campaign context
      campaignInfo: enhancedContext.campaignInfo,
      // Content settings
      contentSettings: inputData.contentSettings || {}
    }

    console.log('Article generation context:', {
      hasBrandInfo: !!baseContext.brandInfo,
      hasCampaignInfo: !!baseContext.campaignInfo,
      hasContentSettings: !!baseContext.contentSettings,
      intent: baseContext.intent
    })

    // Generate each chunk with enhanced context
    for (let i = 0; i < totalChunks; i++) {
      const isFirstChunk = i === 0
      const isLastChunk = i === totalChunks - 1
      const chunkNumber = i + 1
      
      console.log(`Generating chunk ${chunkNumber}/${totalChunks}...`)
      
      const chunkPrompt = generateEnhancedChunkPrompt(
        baseContext, 
        chunkNumber, 
        totalChunks, 
        isFirstChunk, 
        isLastChunk, 
        articleChunks, 
        chunkSize
      );
      
      const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
      if (!openrouterApiKey) {
        throw new Error('OPENROUTER_API_KEY not configured')
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://sparti.ai',
          'X-Title': 'Sparti AI Assistant',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: `You are an expert SEO content writer creating part ${chunkNumber} of a comprehensive article. Write naturally, engagingly, and optimize for search intent while maintaining brand voice.`
            },
            {
              role: 'user',
              content: chunkPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 6000
        })
      })

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error || 'OpenRouter AI call failed')
      }

      let chunkContent = data?.choices?.[0]?.message?.content || ''
      
      // CRITICAL: Clean meta description immediately after generation
      chunkContent = cleanMetaDescriptionFromContent(chunkContent, `chunk ${chunkNumber}`)
      
      if (chunkContent.trim()) {
        articleChunks.push(chunkContent)
        console.log(`Chunk ${chunkNumber} generated successfully (${chunkContent.length} characters)`)
      } else {
        throw new Error(`Chunk ${chunkNumber} returned empty content`)
      }
    }

    const finalArticle = combineArticleChunks(articleChunks, baseContext)
    console.log(`Article generation complete: ${articleChunks.length} chunks combined`)
    
    if (!finalArticle || finalArticle.trim().length < 100) {
      throw new Error(`Final article is too short (${finalArticle?.length || 0} characters)`)
    }
    
    return {
      content: finalArticle,
      metaDescription: null
    }
  } catch (error) {
    console.error('Article generation error:', error.message)
    throw new Error(`Article generation failed: ${error.message}`)
  }
}

// **NEW FUNCTION: Enhanced prompt generation using universal template**
function generateEnhancedChunkPrompt(
  context: any, 
  chunkNumber: number, 
  totalChunks: number, 
  isFirstChunk: boolean, 
  isLastChunk: boolean, 
  previousChunks: string[], 
  chunkSize: number
): string {
  const { 
    title, description, keywords, intent, brandName, tone, language, 
    analysis, customPrompt, brandInfo, campaignInfo, contentSettings,
    outline, sources, internalLinks
  } = context
  
  // Format outline - ensure it exists
  const outlineArray = Array.isArray(outline) && outline.length > 0 
    ? outline 
    : ['Introduction', 'Main Content', 'Conclusion']
  
  console.log(`📋 Using outline for chunk ${chunkNumber}:`, outlineArray.join(', '))
  
  // Determine which outline sections this chunk should cover
  const sectionsPerChunk = Math.ceil(outlineArray.length / totalChunks)
  const startIdx = (chunkNumber - 1) * sectionsPerChunk
  const endIdx = Math.min(startIdx + sectionsPerChunk, outlineArray.length)
  const chunkOutline = outlineArray.slice(startIdx, endIdx)
  
  // Track covered headings from previous chunks to prevent duplication
  const previousHeadings = previousChunks.flatMap(extractHeadings)
  
  console.log(`📌 Chunk ${chunkNumber} should cover sections:`, chunkOutline.join(', '))
  if (previousHeadings.length > 0) {
    console.log(`⚠️ Already covered headings:`, previousHeadings.join(', '))
  }
  
  // Build prompt variables object for universal template
  const promptValues: Record<string, any> = {
    ARTICLE_TITLE: title,
    PRIMARY_KEYWORDS: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    SEARCH_INTENT: intent || 'informational',
    WORD_COUNT: chunkSize.toString(),
    TARGET_LANGUAGE: language,
    TONE: tone,
    BRAND_NAME: brandName,
    BRAND_WEBSITE: brandInfo?.website || '',
    INDUSTRY: brandInfo?.industry || '',
    BRAND_DESCRIPTION: brandInfo?.description || '',
    TARGET_AUDIENCE: brandInfo?.target_audience || '',
    BRAND_VOICE: brandInfo?.brand_voice || tone,
    CAMPAIGN_ID: context.campaignId || '',
    CAMPAIGN_WEBSITE: campaignInfo?.website_url || '',
    BUSINESS_DESCRIPTION: campaignInfo?.business_description || '',
    TARGET_MARKET: campaignInfo?.target_country || '',
    ORGANIC_KEYWORDS: Array.isArray(campaignInfo?.organic_keywords) 
      ? campaignInfo.organic_keywords.slice(0, 10).join(', ') 
      : '',
    COMPETITORS: Array.isArray(campaignInfo?.competitors) 
      ? campaignInfo.competitors.slice(0, 3).join(', ') 
      : '',
    CONTENT_PILLARS: Array.isArray(campaignInfo?.content_pillars) 
      ? campaignInfo.content_pillars.join(', ') 
      : '',
    BRAND_MENTIONS_LEVEL: contentSettings?.brand_mentions || 'regular',
    COMPETITOR_MENTIONS_LEVEL: contentSettings?.competitor_mentions || 'minimal',
    INTERNAL_LINKS_LEVEL: contentSettings?.internal_links || 'few',
    FEATURED_IMAGE_SETTING: contentSettings?.featured_image || 'ai_generation',
    INCLUDE_INTRO: context.includeIntro ? 'true' : 'false',
    INCLUDE_CONCLUSION: context.includeConclusion ? 'true' : 'false',
    INCLUDE_FAQ: context.includeFAQ ? 'true' : 'false',
    TOPIC_SOURCES: Array.isArray(sources) ? sources.join(', ') : '',
    INTERNAL_LINK_OPPORTUNITIES: Array.isArray(internalLinks) ? internalLinks.join(', ') : '',
    SUGGESTED_OUTLINE: outlineArray.map((item, idx) => `${idx + 1}. ${item}`).join('\n')
  }
  
  // Use universal prompt template
  let prompt = formatPromptWithVariables(universalPromptTemplate, promptValues)
  
  // Add chunk-specific instructions
  prompt += `\n\n---\n\n# CHUNK ${chunkNumber} OF ${totalChunks} INSTRUCTIONS\n\n`
  prompt += `CRITICAL: Write EXACTLY ${chunkSize} words for this chunk.\n\n`
  
  if (isFirstChunk) {
    prompt += `## This is the INTRODUCTION chunk:\n`
    prompt += `- Write an engaging opening that hooks readers\n`
    prompt += `- Cover these outline sections: ${chunkOutline.join(', ')}\n`
    prompt += `- Use <h2> headings for each major section\n`
  } else if (isLastChunk) {
    prompt += `## This is the CONCLUSION chunk:\n`
    prompt += `- Cover these outline sections: ${chunkOutline.join(', ')}\n`
    prompt += `- Summarize key takeaways\n`
    prompt += `- Provide actionable next steps\n`
    prompt += `- Include a compelling call-to-action\n`
  } else {
    prompt += `## This is a MIDDLE CONTENT chunk:\n`
    prompt += `- Cover these outline sections: ${chunkOutline.join(', ')}\n`
    prompt += `- Provide detailed, valuable information\n`
    prompt += `- Use <h2> and <h3> headings appropriately\n`
  }
  
  // CRITICAL: Prevent heading duplication
  if (previousHeadings.length > 0) {
    prompt += `\n⚠️ CRITICAL - DO NOT REPEAT THESE HEADINGS (already covered in previous chunks):\n`
    previousHeadings.forEach(h => {
      prompt += `- "${h}"\n`
    })
    prompt += `\nYou MUST create NEW sections with DIFFERENT headings that follow the outline naturally.\n`
  }
  
  // Add context from previous chunk for continuity
  if (previousChunks.length > 0) {
    const lastChunk = previousChunks[previousChunks.length - 1]
    const lastParagraph = lastChunk.split('</p>').slice(-3).join('</p>') + '</p>'
    prompt += `\n## Previous Content (for natural continuation):\n${lastParagraph}\n\n`
    prompt += `Continue naturally from where the previous section ended.\n`
  }
  
  if (customPrompt) {
    prompt += `\n## Custom Instructions:\n${customPrompt}\n`
  }
  
  if (analysis) {
    prompt += `\n## Content Research:\n${analysis}\n`
  }
  
  prompt += `\n## Final Requirements:\n`
  prompt += `- EXACTLY ${chunkSize} words (count before finishing)\n`
  prompt += `- HTML format only (no markdown)\n`
  prompt += `- Natural, engaging writing style in PARAGRAPH format\n`
  prompt += `- Follow the assigned outline sections: ${chunkOutline.join(', ')}\n`
  prompt += `- Do NOT repeat any headings from previous chunks\n`
  prompt += `- CRITICAL: Do NOT use bullet points (<ul>, <li>) for main content\n`
  prompt += `- Write all main content using paragraphs (<p> tags) only\n`
  prompt += `- CRITICAL: Do NOT include any "META_DESCRIPTION:" text or meta descriptions in the article content\n`
  prompt += `- Meta descriptions are generated separately - focus only on the article body content\n`
  
  return prompt
}

// Helper function to format prompt with variables (simplified version)
function formatPromptWithVariables(template: string, values: Record<string, any>): string {
  let formatted = template
  
  // Replace simple variables
  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    formatted = formatted.replace(regex, value || `[${key} not set]`)
  })
  
  // Handle simple conditionals
  formatted = formatted.replace(/{{#IF (\w+)}}([\s\S]*?){{\/IF}}/g, (match, varName, content) => {
    return values[varName] && values[varName] !== 'false' ? content : ''
  })
  
  // Handle equality conditionals
  formatted = formatted.replace(/{{#IF (\w+) == '([^']+)'}}([\s\S]*?){{\/IF}}/g, (match, varName, value, content) => {
    return values[varName] === value ? content : ''
  })
  
  return formatted
}

// Universal prompt template (complete version from src/utils/promptTemplate.ts)
const universalPromptTemplate = `# SEO-Optimized Content Creation Brief

## Article Overview
**Title:** {{ARTICLE_TITLE}}
**Primary Keywords:** {{PRIMARY_KEYWORDS}}
**Search Intent:** {{SEARCH_INTENT}}
**Target Word Count:** {{WORD_COUNT}} words
**Language:** {{TARGET_LANGUAGE}}
**Tone:** {{TONE}}

## Brand Context
**Company:** {{BRAND_NAME}}
**Website:** {{BRAND_WEBSITE}}
**Industry:** {{INDUSTRY}}
**Brand Description:** {{BRAND_DESCRIPTION}}
**Target Audience:** {{TARGET_AUDIENCE}}
**Brand Voice:** {{BRAND_VOICE}}

## Campaign Context
**Campaign ID:** {{CAMPAIGN_ID}}
**Business Website:** {{CAMPAIGN_WEBSITE}}
**Business Description:** {{BUSINESS_DESCRIPTION}}
**Target Market:** {{TARGET_MARKET}}
**Related Keywords:** {{ORGANIC_KEYWORDS}}
**Content Pillars:** {{CONTENT_PILLARS}}
**Main Competitors:** {{COMPETITORS}}

## Content Strategy Guidelines

### Brand Integration
**Level:** {{BRAND_MENTIONS_LEVEL}}
- **None:** Do not mention the brand at all
- **Minimal:** Mention {{BRAND_NAME}} 1-2 times naturally in context
- **Regular:** Integrate {{BRAND_NAME}} 3-4 times throughout, establishing authority
- **Frequent:** Position {{BRAND_NAME}} as industry leader with 5+ strategic mentions

### Competitor References
**Level:** {{COMPETITOR_MENTIONS_LEVEL}}
- **None:** Do not mention competitors
- **Minimal:** Brief, factual competitor references only when necessary for context
- **Regular:** Balanced comparisons highlighting {{BRAND_NAME}}'s unique value proposition

### Internal Linking Strategy
**Level:** {{INTERNAL_LINKS_LEVEL}}
- **None:** No internal link suggestions
- **Few:** 1-2 highly relevant internal linking opportunities
- **Regular:** 3-4 strategic internal links to related content
- **Many:** 5+ internal links distributed naturally throughout the article

**Available Internal Link Opportunities:**
{{INTERNAL_LINK_OPPORTUNITIES}}

## Article Structure Requirements

### Main Content Sections
- Use H2 headings for major sections
- Use H3 headings for subsections
- Structure content logically based on search intent
- Include practical examples and actionable insights
- Maintain natural keyword integration throughout
- Address reader questions comprehensively

**Suggested Content Outline:**
{{SUGGESTED_OUTLINE}}

## Writing Style Guidelines

### Voice & Tone
- **Primary Tone:** {{TONE}}
- **Brand Voice:** {{BRAND_VOICE}}
- Write naturally and conversationally
- Avoid overly promotional language
- Use industry-appropriate terminology without excessive jargon
- Address the reader directly when appropriate

### Humanization Techniques
- Use real-world examples relevant to {{TARGET_MARKET}}
- Include relatable scenarios that resonate with {{TARGET_AUDIENCE}}
- Frame statistics in practical context
- **Do not use em dashes (—)** - Use commas, periods, or parentheses instead
- Avoid rigid formatting and obvious AI patterns
- Write with personality while maintaining professionalism

### Link Integration Best Practices
- Embed links naturally within sentence flow
- Replace keywords or concepts with hyperlinks directly
- **Good Example:** "Government policy tools like [ABSD](url) often coincide with cycle peaks."
- **Bad Example:** "You can read more in my [ABSD Guide](url)."
- Links should feel integral to the sentence meaning, not external add-ons

## SEO Optimization

### Keyword Strategy
- **Primary Keywords:** {{PRIMARY_KEYWORDS}}
- **Related Keywords:** {{ORGANIC_KEYWORDS}}
- Integrate keywords organically throughout the content
- Use semantic variations and related terms
- Avoid keyword stuffing or forced placement
- Optimize headings with target keywords naturally

### Search Intent Alignment
**Intent Type:** {{SEARCH_INTENT}}
- **Informational:** Provide comprehensive, educational content
- **Navigational:** Guide users to specific resources or solutions
- **Transactional:** Help users make informed decisions with clear CTAs
- **Commercial:** Compare options and highlight {{BRAND_NAME}}'s value


## Content Sources & Research
**Reference Sources:**
{{TOPIC_SOURCES}}

Use these sources to:
- Verify facts and statistics
- Understand competitive positioning
- Identify content gaps and opportunities
- Ensure accuracy and credibility

## Technical Requirements

### Formatting
- **Format:** HTML only (use <h2>, <h3>, <p>, <strong>, <em>, <table>, <tr>, <td>, <th>)
- **CRITICAL: NO H1 TAGS** - The article title is handled separately, start content with <h2> headings
- **No Markdown:** Do not use markdown syntax
- **Structure:** Clear hierarchy with proper heading tags
- **Paragraphs:** ALWAYS use paragraphs as the PRIMARY content format (3-5 sentences per paragraph)
- **CRITICAL - NO BULLET POINTS:** Do NOT use <ul> or <li> tags for main content sections
- **Lists Exception:** ONLY use bullet points (<ul>, <li>) for:
  - FAQ sections
  - Explicitly labeled "lists" or "features" sections
  - Table of contents
- **Tables:** Use tables (<table>, <tr>, <td>, <th>) for data comparison and structured information
- **Main Content Rule:** Write all main content in paragraph form using <p> tags
- **CRITICAL: NO SECTION LABELS** - Never use generic labels like "Introduction:", "Main Content:", "Conclusion:", "Call to Action:"
- **CRITICAL: USE DESCRIPTIVE H2 TITLES** - Every section must have a specific, engaging <h2> title (e.g., <h2>Start Your Journey Today</h2> NOT <h2>Call to Action: Start Your Journey Today</h2>)
- Start content immediately after each heading - NO labels, colons, or prefixes before the actual heading text

### Content Structure Examples
**CORRECT - Paragraph Format:**
<p>Several established chains have made their mark in Singapore's frozen yogurt market. These businesses provide consistent quality and convenient locations across the island. Leading chains typically offer standardized quality control measures, regular flavor rotations, and loyalty programs for frequent customers.</p>

**INCORRECT - Bullet Point Format:**
<p>Several established chains offer:</p>
<ul>
<li>Standardized quality control measures</li>
<li>Regular flavor rotations</li>
<li>Loyalty programs for frequent customers</li>
</ul>

### Quality Standards
- Write naturally and engagingly in paragraph form
- Provide unique insights and value
- Ensure factual accuracy
- Maintain consistent voice throughout
- Proofread for grammar and clarity
- Convert all list-like content into flowing paragraphs
- CRITICAL: Do NOT include meta descriptions in the article content
- Meta descriptions are generated separately after article completion

## Final Checklist
- [ ] Article matches {{WORD_COUNT}} word target (±10%)
- [ ] All primary keywords integrated naturally
- [ ] Search intent ({{SEARCH_INTENT}}) fully addressed
- [ ] Brand voice ({{BRAND_VOICE}}) maintained throughout
- [ ] Internal links embedded naturally per {{INTERNAL_LINKS_LEVEL}} setting
- [ ] Brand mentions aligned with {{BRAND_MENTIONS_LEVEL}} guideline
- [ ] Competitor mentions follow {{COMPETITOR_MENTIONS_LEVEL}} guideline
- [ ] Content provides unique value for {{TARGET_AUDIENCE}}
- [ ] Call-to-action clear and compelling with specific, engaging heading (NOT labeled as "Call to Action:")
- [ ] HTML formatting correct and clean
- [ ] NO bullet points used in main content sections
- [ ] All content written in paragraph format using <p> tags
- [ ] Content reads naturally without AI indicators
- [ ] NO section labels or prefixes like "Introduction:", "Conclusion:", "Call to Action:"
- [ ] All <h2> headings are specific and engaging (e.g., "Start Your Journey Today")
- [ ] NO meta descriptions included in article body (generated separately)`

// Helper function to extract headings from HTML
function extractHeadings(html: string): string[] {
  const headingMatches = html.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/gi) || []
  return headingMatches.map(h => 
    h.replace(/<[^>]+>/g, '').trim().toLowerCase()
  )
}

// Helper functions for content guidelines
function getBrandMentionsGuidance(level: string): string {
  const guides = {
    'none': 'Do not mention the brand at all',
    'minimal': 'Mention the brand 1-2 times naturally',
    'regular': 'Mention the brand 3-4 times throughout the article',
    'frequent': 'Mention the brand 5+ times, positioning as industry leader'
  }
  return guides[level] || guides['regular']
}

function getCompetitorMentionsGuidance(level: string): string {
  const guides = {
    'none': 'Do not mention competitors',
    'minimal': 'Brief, factual competitor references if necessary',
    'regular': 'Compare with competitors where relevant'
  }
  return guides[level] || guides['minimal']
}

function getInternalLinksGuidance(level: string): string {
  const guides = {
    'none': 'Do not suggest internal links',
    'few': 'Include 1-2 relevant internal link opportunities',
    'regular': 'Include 3-4 strategic internal link opportunities',
    'many': 'Include 5+ internal link opportunities throughout'
  }
  return guides[level] || guides['few']
}

function combineArticleChunks(chunks: string[], context: any): string {
  if (chunks.length === 0) return ''

  // FIRST: Remove duplicate sections across chunks
  const deduplicatedChunks = removeDuplicateSections(chunks)
  
  const cleanedChunks = deduplicatedChunks.map((chunk, index) => {
    let cleaned = chunk.trim()
    // Remove ALL H1 tags from all chunks (title is handled separately)
    cleaned = cleaned.replace(/<h1[^>]*>.*?<\/h1>/gi, '')
    // Normalize whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
    return cleaned
  })

  let combined = cleanedChunks.join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/<h([1-6])[^>]*>\s*<\/h[1-6]>/gi, '')
    .trim()
  
  // CRITICAL: Remove any meta description text that AI may have added despite instructions
  // This prevents duplicate meta descriptions (one in the field, one in content)
  combined = cleanMetaDescriptionFromContent(combined, 'combined chunks')
  
  // Post-combination validation
  const finalHeadings = extractHeadings(combined)
  const duplicates = findDuplicateHeadings(finalHeadings)
  
  if (duplicates.length > 0) {
    console.warn('⚠️ WARNING: Duplicate headings detected in final article:', duplicates)
  } else {
    console.log('✅ No duplicate headings found in final article')
  }
  
  return combined
}

// Helper function to remove meta description text from article content
// This is called at multiple stages to ensure NO meta description text makes it to the final article
function cleanMetaDescriptionFromContent(content: string, location: string = 'unknown'): string {
  const originalLength = content.length
  let cleaned = content
  
  // AGGRESSIVE PATTERNS - Use greedy matching to catch everything
  
  // Pattern 1: Remove entire paragraphs containing META_DESCRIPTION (greedy)
  cleaned = cleaned.replace(/<p[^>]*>\s*META[_\s-]*DESCRIPTION:.+?<\/p>/gis, '')
  
  // Pattern 2: Remove META_DESCRIPTION at start of line with everything after it (greedy)
  cleaned = cleaned.replace(/^META[_\s-]*DESCRIPTION:.+$/gim, '')
  
  // Pattern 3: Remove META_DESCRIPTION mid-content with everything until next paragraph
  cleaned = cleaned.replace(/\n\s*META[_\s-]*DESCRIPTION:.+?(?=\n\n|$)/gis, '')
  
  // Pattern 4: Remove META_DESCRIPTION at very end of content (catches end-of-content additions)
  cleaned = cleaned.replace(/\n\s*META[_\s-]*DESCRIPTION:.+$/is, '')
  
  // Pattern 5: Remove bold/emphasized meta description markers
  cleaned = cleaned.replace(/\*\*META[_\s-]*DESCRIPTION:\*\*.+?(?=\n|$)/gi, '')
  
  // Pattern 6: Remove meta description in headings (sometimes AI adds it in h2/h3)
  cleaned = cleaned.replace(/<h[1-6][^>]*>\s*META[_\s-]*DESCRIPTION:.+?<\/h[1-6]>/gis, '')
  
  // Pattern 7: Nuclear option - remove any line containing "META" and "DESCRIPTION" together
  cleaned = cleaned.replace(/^.*META.*DESCRIPTION.*$/gim, '')
  
  // Clean up resulting whitespace issues
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')  // Max 2 newlines
  cleaned = cleaned.replace(/^\s+|\s+$/g, '')    // Trim start/end
  cleaned = cleaned.replace(/\s+$/gm, '')        // Remove trailing spaces on each line
  
  // Log if we removed anything
  const removedLength = originalLength - cleaned.length
  if (removedLength > 0) {
    console.warn(`⚠️  Removed ${removedLength} characters of META_DESCRIPTION text from ${location}`)
  }
  
  return cleaned
}

// Helper function to remove duplicate sections across chunks
function removeDuplicateSections(chunks: string[]): string[] {
  const seenHeadings = new Set<string>()
  const cleanedChunks = []
  
  for (let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i]
    const headings = extractHeadings(chunk)
    
    // For chunks after the first, check for duplicates
    if (i > 0) {
      // Split chunk by headings while preserving the headings
      const parts = chunk.split(/(<h[2-3][^>]*>.*?<\/h[2-3]>)/gi)
      const filteredParts = []
      let skipNext = false
      
      for (let j = 0; j < parts.length; j++) {
        const part = parts[j]
        
        if (skipNext) {
          skipNext = false
          continue
        }
        
        const headingMatch = part.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/i)
        
        if (headingMatch) {
          const headingText = headingMatch[1].trim().toLowerCase()
          
          if (seenHeadings.has(headingText)) {
            console.warn(`⚠️ Duplicate section detected and removed: "${headingText}"`)
            // Skip this heading and its following content
            skipNext = true
            continue
          }
          
          seenHeadings.add(headingText)
        }
        
        filteredParts.push(part)
      }
      
      chunk = filteredParts.join('')
    } else {
      // First chunk - just track headings
      headings.forEach(h => seenHeadings.add(h))
    }
    
    cleanedChunks.push(chunk)
  }
  
  return cleanedChunks
}

// Helper function to find duplicate headings
function findDuplicateHeadings(headings: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  
  headings.forEach(h => {
    if (seen.has(h)) {
      duplicates.add(h)
    }
    seen.add(h)
  })
  
  return Array.from(duplicates)
}

async function generateFeaturedImage(inputData: ContentWritingInput, articleContent: string | null, supabase: any, authHeader: string) {
  try {
    const title = inputData.topics[0].title
    const keywords = inputData.topics[0].keywords?.slice(0, 3).join(', ') || ''

    const imageResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-featured-image`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        keywords: keywords,
        user_id: inputData.userId,
        brand_id: inputData.brandId
      })
    })

    if (!imageResponse.ok) {
      throw new Error(`Featured image generation failed: ${imageResponse.status}`)
    }

    const imageData = await imageResponse.json()
    
    if (imageData && imageData.success === false) {
      throw new Error(imageData.error || 'Image generation failed')
    }

    const imageUrl = imageData?.imageUrl
    if (imageUrl) {
      const base64Data = imageUrl.split(',')[1]
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
      
      const timestamp = Date.now()
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
      const fileName = `${sanitizedTitle}_${timestamp}.png`
      const filePath = `images/brands/${inputData.brandId}/articles/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageBuffer, {
          contentType: 'image/png',
          upsert: false
        })

      if (uploadError) {
        throw new Error('Failed to upload image to storage')
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    }

    return null
  } catch (error) {
    console.log('Image generation error:', error.message)
    return null
  }
}

async function saveArticle(inputData: ContentWritingInput, articleContent: string | null, featuredImageUrl: string | null, supabase: any) {
  try {
    // Extract IDs
    const campaignId = inputData.campaign_id || inputData.topics[0].campaign_id
    const topicId = inputData.topics[0].id
    
    console.log('Saving article with data:', {
      title: inputData.topics[0].title,
      campaign_id: campaignId,
      selected_topic_id: topicId,
      brand_id: inputData.brandId,
      has_featured_image: !!featuredImageUrl
    })
    
    // FINAL SAFETY CHECK: Clean meta description one last time before database save
    const finalCleanedContent = cleanMetaDescriptionFromContent(articleContent || '', 'final save to database')
    
    // Meta description will be generated in a separate step
    // Build article data - only include campaign_id if present, exclude topic_id
    // to avoid foreign key constraint (topics come from selected_topics, not seo_topic_ideas)
    const articleData: any = {
      title: inputData.topics[0].title,
      content: finalCleanedContent,
      excerpt: inputData.topics[0].description,
      meta_description: null,
      meta_title: inputData.topics[0].title,
      meta_keywords: inputData.topics[0].keywords?.join(', ') || null,
      featured_image: featuredImageUrl,
      status: 'draft',
      brand_id: inputData.brandId,
      user_id: inputData.userId,
      keywords: inputData.topics[0].keywords,
      wordpress_settings: {
        custom_instructions: inputData.customPrompt,
        model_used: inputData.model,
        word_count: inputData.wordCount,
        language: inputData.language,
        tone: inputData.tone,
        selected_topic_id: topicId,
        original_topic_title: inputData.topics[0].title,
        original_topic_description: inputData.topics[0].description,
        search_intent: inputData.topics[0].intent,
        content_settings: inputData.contentSettings
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Only add campaign_id if it exists
    if (campaignId) {
      articleData.campaign_id = campaignId
    }

    console.log('Inserting article into blog_posts...')
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([articleData])
      .select()
      .single()

    if (error) {
      console.error('Failed to insert article:', error)
      throw error
    }

    console.log('Article saved successfully:', { article_id: data.id, campaign_id: campaignId })

    // Mark the topic as completed after successful article generation
    if (data && topicId) {
      console.log('Updating topic status to completed:', { topic_id: topicId, article_id: data.id })
      const { error: topicError } = await supabase
        .from('selected_topics')
        .update({ 
          status: 'completed',
          article_id: data.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', topicId)
      
      if (topicError) {
        console.error('Failed to update topic status:', topicError)
        // Don't throw - article was saved successfully
      } else {
        console.log('Topic marked as completed successfully')
      }
    }

    return data
  } catch (error) {
    console.log('Save article error:', error.message)
    throw error
  }
}
