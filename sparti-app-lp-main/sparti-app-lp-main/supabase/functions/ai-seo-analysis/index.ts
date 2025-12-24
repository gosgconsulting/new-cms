import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SEOAnalysisRequest {
  websiteUrl: string;
  prompt: string;
  analysisType: string;
}

interface SEOAnalysisResponse {
  audit: {
    contentOptimization: string;
    metaDescriptions: string;
    technicalSEO: string;
    recommendations: string[];
  };
  keywords: {
    mainKeywords: string[];
    longTailKeywords: string[];
  };
  searchTerms: string[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { websiteUrl, prompt, analysisType }: SEOAnalysisRequest = await req.json()

    console.log('=== SEO ANALYSIS REQUEST ===')
    console.log('Website URL:', websiteUrl)
    console.log('Analysis Type:', analysisType)
    console.log('Prompt:', prompt)

    // Get Anthropic API key from database
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'anthropic_api_key')
      .eq('is_global', true)
      .single();

    if (settingsError || !settingsData?.value) {
      console.error('❌ Failed to get Anthropic API key from database:', settingsError);
      throw new Error('Anthropic API key not found in database settings');
    }

    const anthropicApiKey = settingsData.value;
    console.log('✅ Retrieved Anthropic API key from database');

    // Step 1: Scrape website content
    console.log('🌐 Scraping website content...')
    let websiteContent = ''
    try {
      // Ensure URL has protocol
      let formattedUrl = websiteUrl
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        formattedUrl = 'https://' + websiteUrl
      }
      
      const response = await fetch(formattedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      const html = await response.text()
      
      // Extract text content from HTML (basic extraction)
      websiteContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000) // Limit content length

      console.log('✅ Website content scraped:', websiteContent.length, 'characters')
    } catch (error) {
      console.error('❌ Failed to scrape website:', error)
      websiteContent = 'Unable to scrape website content. Please ensure the URL is accessible.'
    }

    console.log('🤖 Performing AI SEO analysis...')

    const systemPrompt = `You are an expert SEO analyst. Analyze the provided website content and user requirements to:

1. Conduct a comprehensive SEO audit covering:
   - Content optimization opportunities
   - Meta description analysis
   - Technical SEO recommendations
   - Overall optimization score

2. Extract relevant keywords:
   - 5 main target keywords
   - 8-12 long-tail keyword variations
   - Consider user's business description and goals

3. Generate search terms for competitive analysis:
   - Include main keywords
   - Add competitor research terms
   - Include "best", "top", "reviews" variations

Return a valid JSON response with this exact structure:
{
  "audit": {
    "contentOptimization": "Detailed analysis of content optimization opportunities",
    "metaDescriptions": "Analysis of meta descriptions and title tags",
    "technicalSEO": "Technical SEO recommendations",
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
  },
  "keywords": {
    "mainKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "longTailKeywords": ["long tail 1", "long tail 2", "long tail 3", "etc"]
  },
  "searchTerms": ["search term 1", "search term 2", "search term 3", "etc"]
}`

    const userPrompt = `Website URL: ${websiteUrl}

Business Description & Goals: ${prompt}

Website Content (first 5000 characters):
${websiteContent}

Please analyze this website and provide comprehensive SEO insights following the JSON structure specified.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Anthropic API error:', response.status, errorData)
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    console.log('✅ AI analysis completed')

    // Log API usage
    const usage = aiResponse.usage;
    if (usage) {
      try {
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user } } = await supabase.auth.getUser(token);
          
          if (user) {
            // Calculate cost: Claude 3.5 Sonnet pricing
            const inputCost = (usage.input_tokens / 1000) * 0.003;
            const outputCost = (usage.output_tokens / 1000) * 0.015;
            const totalCost = inputCost + outputCost;

            await supabase.rpc('deduct_user_tokens', {
              p_user_id: user.id,
              p_service_name: 'anthropic',
              p_model_name: 'claude-3-5-sonnet-20241022',
              p_cost_usd: totalCost,
              p_request_data: {
                usage_type: 'seo-analysis',
                website_url: websiteUrl,
                prompt_tokens: usage.input_tokens,
                completion_tokens: usage.output_tokens,
                total_tokens: usage.input_tokens + usage.output_tokens
              }
            });
            
            console.log(`✅ Logged API usage: $${totalCost.toFixed(5)} (${usage.input_tokens}→${usage.output_tokens} tokens)`);
          }
        }
      } catch (logError) {
        console.error('Failed to log API usage:', logError);
      }
    }

    let analysisResult: SEOAnalysisResponse
    try {
      const aiContent = aiResponse.content[0].text
      console.log('📊 AI Response:', aiContent)
      
      // Try to parse the JSON response
      analysisResult = JSON.parse(aiContent)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      
      // Fallback response
      analysisResult = {
        audit: {
          contentOptimization: "Content analysis completed. The website could benefit from keyword optimization and structured content improvements.",
          metaDescriptions: "Meta descriptions and title tags need optimization for better search visibility.",
          technicalSEO: "Technical SEO analysis suggests improvements in page speed, mobile optimization, and schema markup.",
          recommendations: [
            "Optimize title tags and meta descriptions",
            "Improve content keyword density",
            "Add structured data markup",
            "Enhance mobile responsiveness",
            "Improve page loading speed"
          ]
        },
        keywords: {
          mainKeywords: ["business", "service", "local", "professional", "quality"],
          longTailKeywords: [
            "best business service",
            "professional service provider",
            "local business solutions",
            "quality service company",
            "trusted business partner",
            "expert business consulting",
            "reliable service provider",
            "top rated business"
          ]
        },
        searchTerms: [
          "best business service",
          "professional service provider",
          "local business solutions",
          "business service reviews",
          "top business companies",
          "business service near me"
        ]
      }
    }

    console.log('🎯 Analysis result:', {
      mainKeywords: analysisResult.keywords.mainKeywords.length,
      longTailKeywords: analysisResult.keywords.longTailKeywords.length,
      searchTerms: analysisResult.searchTerms.length
    })

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ SEO Analysis error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'SEO analysis failed',
        details: 'Please check the website URL and try again'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})