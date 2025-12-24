import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { fetchEnhancedContext } from './_shared/context.ts'
import { scrapeReferenceContent } from './_shared/scraping.ts'
import { analyzeContent } from './_shared/analysis.ts'
import { generateArticleContent } from './_shared/generation.ts'
import { generateFeaturedImage } from './_shared/image.ts'
import { saveArticle } from './_shared/storage.ts'

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
    seo_campaign_id?: string;
    outline?: string[];
    sources?: string[];
    internal_links?: string[];
  }>;
  campaign_id?: string;
  seo_campaign_id?: string;
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

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

    console.log('Starting UNIFIED content writing workflow (GPT-4o) for topic:', inputData.topics[0]?.title)
    if (executionId) {
      console.log('Execution ID:', executionId)
    }

    const updateExecutionStatus = async (status: 'processing' | 'completed' | 'failed', result?: any, error?: string, stageResults?: any) => {
      if (!executionId) return
      
      try {
        const updateData: any = {
          status,
          result: result || null,
          error: error || null,
          updated_at: new Date().toISOString()
        }
        
        if (stageResults) {
          updateData.stage_results = stageResults
          updateData.campaign_id = inputData.topics[0].campaign_id || inputData.campaign_id
        }
        
        await supabaseClient
          .from('workflow_executions')
          .update(updateData)
          .eq('id', executionId)
        
        console.log(`Execution ${executionId} status updated to: ${status}`)
      } catch (updateError) {
        console.error('Failed to update execution status:', updateError)
      }
    }

    console.log('Step 0: Fetching brand and campaign context...')
    const enhancedContext = await fetchEnhancedContext(inputData, supabaseClient)
    console.log('Enhanced context fetched:', {
      hasBrandInfo: !!enhancedContext.brandInfo,
      hasCampaignInfo: !!enhancedContext.campaignInfo
    })

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

    console.log('Step 5: Generating article content with GPT-4o and enhanced context...')
    await updateExecutionStatus('processing', { currentStep: 'generating', progress: 60 })
    
    let articleContent = null
    let generationSuccess = false
    let generationError = null
    
    let articleResult = null
    try {
      articleResult = await generateArticleContent(inputData, analysis, enhancedContext, supabaseClient)
      articleContent = articleResult.content
      generationSuccess = true
      console.log('Step 5 successful: Article content generated with GPT-4o')
    } catch (error) {
      console.error('Step 5 failed:', error.message)
      generationError = error.message
      console.log('Step 5 failed - article generation is required, stopping workflow')
      await updateExecutionStatus('failed', null, `Step 5 (Article Generation) failed: ${error.message}`)
      throw new Error(`Step 5 (Article Generation) failed: ${error.message}. Article generation is required for the workflow to complete.`)
    }

    console.log('Step 6: Generating featured image...')
    await updateExecutionStatus('processing', { currentStep: 'generating_image', progress: 80 })
    
    let featuredImageData = null
    let imageGenerationSuccess = false
    let imageGenerationError = null
    
    if (inputData.featuredImage === 'ai_generation') {
      try {
        featuredImageData = await generateFeaturedImage(inputData, articleContent, supabaseClient, authHeader)
        imageGenerationSuccess = !!featuredImageData
        if (imageGenerationSuccess) {
          console.log('Step 6 successful: Featured image generated and uploaded')
        } else {
          console.log('Step 6 failed: No image data returned from generation')
        }
      } catch (error) {
        console.error('Step 6 failed:', error.message)
        imageGenerationError = error.message
        console.log('Image generation failed, continuing without featured image')
      }
    } else {
      console.log('Step 6 skipped: Image generation not requested')
    }

    console.log('Step 7: Saving article to database...')
    await updateExecutionStatus('processing', { currentStep: 'saving', progress: 90 })
    
    let savedArticle = null
    const metaDescription = articleResult?.metaDescription || null
    const metaDescriptionSuccess = !!metaDescription
    
    try {
      savedArticle = await saveArticle(inputData, articleContent, featuredImageData, supabaseClient, metaDescription)
      console.log('Step 7 successful: Article saved to database with meta description and featured image')
    } catch (error) {
      console.error('Step 7 failed:', error.message)
      await updateExecutionStatus('failed', null, `Step 7 (Database Save) failed: ${error.message}`)
      throw new Error(`Step 7 (Database Save) failed: ${error.message}`)
    }

    if (savedArticle) {
      console.log('Step 8: Starting background backlink optimization...')
      
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
            error: 'Meta description generation returned empty',
            impact: 'Article saved without meta description - you can generate it manually later'
          }] : [])
        ]
      }

    await updateExecutionStatus('completed', finalResult, null, articleResult?.stageResults)

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
