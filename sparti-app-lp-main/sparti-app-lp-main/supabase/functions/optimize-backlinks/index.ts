import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OptimizeBacklinksInput {
  articleId: string
  articleContent: string
  brandId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Backlink optimization started')

    const inputData: OptimizeBacklinksInput = await req.json()

    if (!inputData.articleId || !inputData.articleContent || !inputData.brandId) {
      throw new Error('Missing required fields: articleId, articleContent, brandId')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Optimizing backlinks for article ${inputData.articleId}...`)

    // Fetch internal links for the brand
    console.log('Fetching internal links...')
    let internalLinks: Array<{url: string, title: string, description?: string}> = []
    
    try {
      const { data: linksData, error: linksError } = await supabaseClient
        .from('seo_internal_links')
        .select('url, title, description')
        .eq('brand_id', inputData.brandId)
        .eq('type', 'Internal')
        .limit(10)

      if (linksError) {
        throw linksError
      }

      internalLinks = linksData || []
      console.log(`Found ${internalLinks.length} internal links`)
    } catch (error) {
      console.error('Failed to fetch internal links:', error.message)
      throw new Error(`Failed to fetch internal links: ${error.message}`)
    }

    if (internalLinks.length === 0) {
      console.log('No internal links found, skipping backlink optimization')
      return new Response(
        JSON.stringify({
          success: true,
          message: `No internal links found for brand ${inputData.brandId}, skipping optimization`,
          chunks_processed: 0,
          total_replacements: 0,
          article_id: inputData.articleId
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Split content into chunks if it's too long (estimate ~500 words per 1000 tokens)
    const estimatedTokens = Math.ceil(inputData.articleContent.length / 3) // Rough estimation
    const maxTokensPerChunk = 8000 // Increased for better results
    const chunks = estimatedTokens > maxTokensPerChunk ? 
      splitContentIntoChunks(inputData.articleContent, maxTokensPerChunk) : 
      [inputData.articleContent]
    
    console.log(`Processing ${chunks.length} chunks for backlink optimization`)
    
    let optimizedChunks = []
    let totalReplacements = 0
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`Optimizing chunk ${i + 1}/${chunks.length}...`)
      
      // Create a prompt to analyze the article chunk and identify where to add backlinks
      const backlinkPrompt = `Analyze the following article content and identify 2-3 strategic locations where internal backlinks would add value.

Article Content:
${chunk}

Available Internal Links to Use:
${internalLinks.map(link => `- ${link.title} (${link.url})${link.description ? ` - ${link.description}` : ''}`).join('\n')}

Instructions:
1. Identify 2-3 specific sentences or phrases in the content where internal links would add value
2. For each location, specify the exact text that should be linked
3. Choose the most relevant internal link for each location
4. Provide the replacement with HTML anchor tag

Requirements:
- Return ONLY a JSON array with this exact structure:
[
  {
    "originalText": "exact text from content to be linked",
    "replacementText": "text with <a href=\"URL\" title=\"Title\">Anchor Text</a>",
    "linkUrl": "URL",
    "linkTitle": "Title"
  }
]
- Use HTML anchor tags: <a href="URL" title="Title">Anchor Text</a>
- Choose anchor text that is descriptive and keyword-rich
- Ensure links open in the same tab (don't add target="_blank")
- Don't over-link - quality over quantity (max 3 links per chunk)
- Make sure the links enhance the content, not distract from it
- Return ONLY the JSON array, no explanations or markdown code blocks

Return the JSON array with strategic link replacements.`

      // Call AI to optimize the chunk with backlinks
      const { data, error } = await supabaseClient.functions.invoke('openrouter-chat', {
        body: {
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: 'You are an SEO expert. Return ONLY a JSON array with link replacements. Do not use markdown code blocks, explanations, or any other formatting. Just the raw JSON array.'
            },
            {
              role: 'user',
              content: backlinkPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: maxTokensPerChunk
        }
      })

      if (error) throw error

      if (data && data.success === false) {
        throw new Error(data.error || 'OpenRouter API call failed')
      }

      let linkReplacements = []
      let optimizedChunk = chunk // Start with original content
      
      try {
        const aiResponse = data?.choices?.[0]?.message?.content || ''
        
        if (!aiResponse.trim()) {
          console.warn(`Chunk ${i + 1} generated empty response, skipping backlink optimization`)
        } else {
          // Parse the JSON response
          const cleanedResponse = cleanJsonResponse(aiResponse)
          linkReplacements = JSON.parse(cleanedResponse)
          
          if (Array.isArray(linkReplacements) && linkReplacements.length > 0) {
            console.log(`Applying ${linkReplacements.length} link replacements to chunk ${i + 1}`)
            
            // Apply each replacement
            for (const replacement of linkReplacements) {
              if (replacement.originalText && replacement.replacementText) {
                // Use replace with a limit to avoid replacing multiple instances
                optimizedChunk = optimizedChunk.replace(
                  replacement.originalText, 
                  replacement.replacementText
                )
                totalReplacements++
                console.log(`Applied link replacement: "${replacement.originalText}" -> "${replacement.replacementText}"`)
              }
            }
          } else {
            console.log(`No valid link replacements found for chunk ${i + 1}`)
          }
        }
      } catch (parseError) {
        console.error(`Failed to parse link replacements for chunk ${i + 1}:`, parseError.message)
        console.log(`AI response was: ${data?.choices?.[0]?.message?.content || 'empty'}`)
        // Keep original content if parsing fails
      }
      
      optimizedChunks.push(optimizedChunk)
    }

    // Combine all optimized chunks
    const finalOptimizedContent = optimizedChunks.join('\n\n')
    
    // Update the article in the database with the optimized content
    const { error: updateError } = await supabaseClient
      .from('blog_posts')
      .update({ 
        content: finalOptimizedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', inputData.articleId)

    if (updateError) throw updateError

    console.log(`Backlink optimization completed for article ${inputData.articleId} (${chunks.length} chunks processed, ${totalReplacements} total replacements)`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Backlink optimization completed for article ${inputData.articleId}`,
        chunks_processed: chunks.length,
        total_replacements: totalReplacements,
        article_id: inputData.articleId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Backlink optimization error:', error.message)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Always return 200 for consistent client-side error handling
      },
    )
  }
})

// Helper function to split content into chunks
function splitContentIntoChunks(content: string, maxTokens: number): string[] {
  const words = content.split(' ')
  const wordsPerChunk = Math.floor(words.length / Math.ceil(words.length / (maxTokens * 0.5))) // Rough estimation
  
  const chunks = []
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunk = words.slice(i, i + wordsPerChunk).join(' ')
    chunks.push(chunk)
  }
  
  return chunks
}

// Helper function to clean JSON response from markdown artifacts
function cleanJsonResponse(content: string): string {
  // Remove markdown code blocks
  content = content.replace(/```json\s*/g, '')
  content = content.replace(/```\s*/g, '')
  content = content.replace(/```\w*\s*/g, '')
  
  // Remove any prefixes or explanations before the JSON
  content = content.replace(/^.*?(\[)/s, '$1')
  
  // Clean up any remaining artifacts
  content = content.trim()
  
  return content
}
