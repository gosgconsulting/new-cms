// Article generation and prompt functions
import { cleanMetaDescriptionFromContent, extractHeadings, combineArticleChunks } from './helpers.ts'

export async function generateArticleContent(
  inputData: any, 
  analysis: string | null, 
  enhancedContext: any,
  supabase: any
) {
  try {
    const topic = inputData.topics[0]
    
    const baseContext = {
      title: topic.title,
      description: topic.description,
      keywords: topic.keywords?.join(', ') || '',
      intent: topic.intent || '',
      outline: topic.outline,
      sources: topic.sources,
      sourceCitations: topic.source_citations || null,
      backlinks: topic.matched_backlinks || null,
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
      brandInfo: enhancedContext.brandInfo,
      campaignInfo: enhancedContext.campaignInfo,
      contentSettings: inputData.contentSettings || {}
    }

    console.log('🔄 Starting Optimized Multi-Stage Article Generation Workflow')
    
    let useMultiStage = true
    let contentStrategy = null
    let articleBlueprint = null
    let voiceProfile = null

    // Try to fetch cached context
    try {
      const { data: cachedData } = await supabase
        .from('workflow_executions')
        .select('stage_results')
        .eq('campaign_id', topic.campaign_id)
        .eq('status', 'completed')
        .not('stage_results', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (cachedData?.stage_results?.stage1_strategy) {
        console.log('✅ Using cached context from previous generation')
        contentStrategy = cachedData.stage_results.stage1_strategy
        articleBlueprint = cachedData.stage_results.stage2_blueprint
        voiceProfile = cachedData.stage_results.stage3_voice
      }
    } catch (cacheError) {
      console.log('ℹ️ No cached context found, will generate fresh')
    }

    // Run Stages 1-3 if no cache
    if (!contentStrategy) {
      console.log('📊 Stage 1/7: Context Aggregation & Validation')
      
      try {
        const { data: stage1Data, error: stage1Error } = await supabase.functions.invoke('context-aggregation', {
          body: {
            brandInfo: enhancedContext.brandInfo,
            campaignInfo: enhancedContext.campaignInfo,
            topicBrief: {
              title: topic.title,
              description: topic.description,
              keywords: topic.keywords,
              intent: topic.intent
            },
            sourceCitations: topic.source_citations,
            backlinks: topic.matched_backlinks,
            internalLinks: topic.internal_links
          }
        })

        if (stage1Error) {
          console.warn('⚠️ Stage 1 failed, falling back to single-stage workflow:', stage1Error.message)
          useMultiStage = false
        } else {
          contentStrategy = stage1Data.strategy
          console.log('✅ Stage 1 complete: Content strategy created')
        }
      } catch (e) {
        console.warn('⚠️ Stage 1 error, falling back to single-stage workflow:', e.message)
        useMultiStage = false
      }
    }

    if (useMultiStage && !articleBlueprint) {
      console.log('📐 Stage 2/7: Article Configuration & Blueprint')
      
      try {
        const { data: stage2Data, error: stage2Error } = await supabase.functions.invoke('article-blueprint', {
          body: {
            contentStrategy,
            articleTitle: topic.title,
            primaryKeyword: topic.keywords[0] || '',
            secondaryKeywords: topic.keywords.slice(1),
            targetWordCount: inputData.wordCount,
            language: inputData.language,
            tone: inputData.tone,
            searchIntent: topic.intent || 'informational',
            internalBacklinksConfig: topic.internal_links,
            includeFAQ: inputData.includeFAQ
          }
        })

        if (stage2Error) {
          console.warn('⚠️ Stage 2 failed, falling back to single-stage workflow:', stage2Error.message)
          useMultiStage = false
        } else {
          articleBlueprint = stage2Data.blueprint
          console.log('✅ Stage 2 complete: Article blueprint created')
        }
      } catch (e) {
        console.warn('⚠️ Stage 2 error, falling back to single-stage workflow:', e.message)
        useMultiStage = false
      }
    }

    if (useMultiStage && !voiceProfile) {
      console.log('✨ Stage 3/7: Brand & Voice Context Injection')
      
      try {
        const { data: stage3Data, error: stage3Error } = await supabase.functions.invoke('brand-voice-profile', {
          body: {
            articleBlueprint,
            brandName: inputData.brandName,
            brandVoice: enhancedContext.brandInfo?.brand_voice || inputData.tone,
            brandDescription: enhancedContext.brandInfo?.description || '',
            keySellingPoints: enhancedContext.brandInfo?.key_selling_points || '',
            targetAudience: enhancedContext.brandInfo?.target_audience || '',
            industry: enhancedContext.brandInfo?.industry || '',
            brandMentionsLevel: inputData.contentSettings?.brand_mentions || 'regular',
            competitorMentionsLevel: inputData.contentSettings?.competitor_mentions || 'minimal',
            ctaStyle: inputData.contentSettings?.cta_style || 'conversational'
          }
        })

        if (stage3Error) {
          console.warn('⚠️ Stage 3 failed, falling back to single-stage workflow:', stage3Error.message)
          useMultiStage = false
        } else {
          voiceProfile = stage3Data.voiceProfile
          console.log('✅ Stage 3 complete: Brand voice profile created')
        }
      } catch (e) {
        console.warn('⚠️ Stage 3 error, falling back to single-stage workflow:', e.message)
        useMultiStage = false
      }
    }

    // Stage 4: Content Generation
    console.log(useMultiStage ? '✍️ Stage 4/7: Research-Enhanced Content Generation' : '✍️ Generating content with single-stage workflow')
    
    const targetWords = inputData.wordCount || 800 // Use exact target word count (max 1000)
    const totalChunks = targetWords <= 1000 ? 1 : 2 // Use 1 chunk for short articles, 2 for longer
    const chunkSize = Math.ceil(targetWords / totalChunks)
    
    console.log(`Generating ${targetWords}-word article in ${totalChunks} chunk(s)`)
    
    const articleChunks = []

    for (let i = 0; i < totalChunks; i++) {
      const isFirstChunk = i === 0
      const isLastChunk = i === totalChunks - 1
      const chunkNumber = i + 1
      
      console.log(`  → Generating chunk ${chunkNumber}/${totalChunks}...`)
      
      const enhancedBaseContext = useMultiStage ? {
        ...baseContext,
        contentStrategy,
        articleBlueprint,
        voiceProfile
      } : baseContext
      
      const chunkPrompt = generateEnhancedChunkPrompt(
        enhancedBaseContext, 
        chunkNumber, 
        totalChunks, 
        isFirstChunk, 
        isLastChunk, 
        articleChunks, 
        chunkSize,
        targetWords
      )
      
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
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'system',
              content: useMultiStage 
                ? `You are an expert SEO content writer. Use the content strategy, article blueprint, and brand voice profile provided to create part ${chunkNumber} of a comprehensive, high-quality article.`
                : `You are an expert SEO content writer creating part ${chunkNumber} of a comprehensive article. Write naturally, engagingly, and optimize for search intent while maintaining brand voice.`
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
        console.error('GPT-4o API error:', data.error)
        throw new Error(data.error || 'OpenRouter AI call failed')
      }

      // Log API usage
      try {
        const usage = data.usage || {}
        const promptTokens = usage.prompt_tokens || 0
        const completionTokens = usage.completion_tokens || 0
        const totalTokens = usage.total_tokens || (promptTokens + completionTokens)
        
        // GPT-4o pricing via OpenRouter: $2.50 per 1M input, $10.00 per 1M output
        const costUsd = (promptTokens * 2.50 / 1000000) + (completionTokens * 10.00 / 1000000)
        
        await supabase.rpc('log_api_token_usage', {
          p_service_name: 'openrouter',
          p_model_name: 'openai/gpt-4o',
          p_prompt_tokens: promptTokens,
          p_completion_tokens: completionTokens,
          p_total_tokens: totalTokens,
          p_cost_usd: costUsd,
          p_request_data: {
            chunk: chunkNumber,
            total_chunks: totalChunks,
            processed_by: 'content-writing-unified'
          }
        })
      } catch (logError) {
        console.error('Failed to log API usage:', logError)
      }

      let chunkContent = data?.choices?.[0]?.message?.content || ''
      chunkContent = cleanMetaDescriptionFromContent(chunkContent, `chunk ${chunkNumber}`)
      
      if (chunkContent.trim()) {
        articleChunks.push(chunkContent)
        console.log(`  ✓ Chunk ${chunkNumber} generated (${chunkContent.length} chars)`)
      } else {
        throw new Error(`Chunk ${chunkNumber} returned empty content`)
      }
    }

    let finalArticle = combineArticleChunks(articleChunks, baseContext)
    console.log(useMultiStage ? '✅ Stage 4 complete: Article content generated' : '✅ Article content generated')
    
    if (!finalArticle || finalArticle.trim().length < 100) {
      throw new Error(`Final article is too short (${finalArticle?.length || 0} characters)`)
    }

    // Stage 5: SEO Optimization (Optional)
    if (useMultiStage) {
      console.log('🔍 Stage 5/7: SEO & Technical Optimization')
      const { data: stage5Data, error: stage5Error } = await supabase.functions.invoke('seo-optimization-pass', {
        body: {
          articleContent: finalArticle,
          primaryKeyword: topic.keywords[0] || '',
          secondaryKeywords: topic.keywords.slice(1),
          targetWordCount: inputData.wordCount,
          searchIntent: topic.intent || 'informational'
        }
      })

      if (stage5Error) {
        console.warn('⚠️ Stage 5 failed, using unoptimized content:', stage5Error.message)
      } else {
        finalArticle = stage5Data.optimizedContent
        console.log('✅ Stage 5 complete: SEO optimization applied')
      }
    }

    // Stage 6: Humanization (Optional)
    if (useMultiStage) {
      console.log('👤 Stage 6/7: Humanization & Quality Pass')
      const { data: stage6Data, error: stage6Error } = await supabase.functions.invoke('humanization-pass', {
        body: {
          articleContent: finalArticle,
          voiceProfile,
          tone: inputData.tone
        }
      })

      if (stage6Error) {
        console.warn('⚠️ Stage 6 failed, using non-humanized content:', stage6Error.message)
      } else {
        finalArticle = stage6Data.humanizedContent
        console.log('✅ Stage 6 complete: Content humanized')
      }
    }

    // Stage 7: Generate Meta Description
    console.log('📝 Stage 7/7: Generating Meta Description')
    let metaDescription = null
    
    try {
      const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
      if (!openrouterApiKey) {
        throw new Error('OPENROUTER_API_KEY not configured')
      }

      const metaPrompt = `Based on this article title and content, generate a compelling SEO meta description (max 155 characters).

Title: ${topic.title}
Primary Keyword: ${topic.keywords[0] || ''}

Article Preview: ${finalArticle.substring(0, 1000)}...

Requirements:
- Maximum 155 characters
- Include primary keyword naturally
- Action-oriented and engaging
- No quotes or special characters
- Focus on user benefit and search intent

Return ONLY the meta description text, nothing else.`

      const metaResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://sparti.ai',
          'X-Title': 'Sparti AI Assistant',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an SEO expert specializing in meta descriptions. Generate concise, engaging meta descriptions under 155 characters.'
            },
            {
              role: 'user',
              content: metaPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        })
      })

      const metaData = await metaResponse.json()
      if (metaResponse.ok && metaData?.choices?.[0]?.message?.content) {
        metaDescription = metaData.choices[0].message.content.trim().replace(/^["']|["']$/g, '')
        if (metaDescription.length > 155) {
          metaDescription = metaDescription.substring(0, 152) + '...'
        }
        console.log('✅ Stage 7 complete: Meta description generated')
        
        // Log API usage
        try {
          const usage = metaData.usage || {}
          const promptTokens = usage.prompt_tokens || 0
          const completionTokens = usage.completion_tokens || 0
          const totalTokens = usage.total_tokens || (promptTokens + completionTokens)
          
          // GPT-4o-mini pricing via OpenRouter: $0.15 per 1M input, $0.60 per 1M output
          const costUsd = (promptTokens * 0.15 / 1000000) + (completionTokens * 0.60 / 1000000)
          
          await supabase.rpc('log_api_token_usage', {
            p_service_name: 'openrouter',
            p_model_name: 'openai/gpt-4o-mini',
            p_prompt_tokens: promptTokens,
            p_completion_tokens: completionTokens,
            p_total_tokens: totalTokens,
            p_cost_usd: costUsd,
            p_request_data: {
              task: 'meta_description',
              processed_by: 'content-writing-unified'
            }
          })
        } catch (logError) {
          console.error('Failed to log API usage:', logError)
        }
      } else {
        console.warn('⚠️ Meta description generation failed, using fallback')
      }
    } catch (error) {
      console.warn('⚠️ Meta description generation error:', error.message)
    }

    // Fallback meta description if generation fails
    if (!metaDescription) {
      metaDescription = `${topic.description?.substring(0, 155) || topic.title.substring(0, 155)}`
      if (metaDescription.length > 155) {
        metaDescription = metaDescription.substring(0, 152) + '...'
      }
    }

    console.log(useMultiStage ? '🎉 Multi-Stage Workflow Complete!' : '✅ Single-Stage Workflow Complete!')
    console.log(`   Final article length: ${finalArticle.length} characters`)
    console.log(`   Meta description: ${metaDescription}`)
    console.log(`   Workflow type: ${useMultiStage ? 'Multi-Stage (7 stages)' : 'Single-Stage (legacy)'}`)
    
    return {
      content: finalArticle,
      metaDescription,
      stageResults: useMultiStage ? {
        stage1_strategy: contentStrategy,
        stage2_blueprint: articleBlueprint,
        stage3_voice: voiceProfile,
        workflow_type: 'multi-stage'
      } : {
        workflow_type: 'single-stage'
      }
    }
  } catch (error) {
    console.error('Article generation error:', error.message)
    throw new Error(`Article generation failed: ${error.message}`)
  }
}

function generateEnhancedChunkPrompt(
  context: any, 
  chunkNumber: number, 
  totalChunks: number, 
  isFirstChunk: boolean, 
  isLastChunk: boolean, 
  previousChunks: string[], 
  chunkSize: number,
  targetWords: number
): string {
  const { 
    title, description, keywords, intent, brandName, tone, language, 
    analysis, customPrompt, brandInfo, campaignInfo, contentSettings,
    outline, sources, sourceCitations, backlinks, internalLinks
  } = context
  
  const outlineArray = Array.isArray(outline) && outline.length > 0 ? outline : []
  
  const sectionsPerChunk = Math.ceil(outlineArray.length / totalChunks)
  const startIdx = (chunkNumber - 1) * sectionsPerChunk
  const endIdx = Math.min(startIdx + sectionsPerChunk, outlineArray.length)
  const chunkOutline = outlineArray.slice(startIdx, endIdx)
  
  const previousHeadings = previousChunks.flatMap(extractHeadings)
  
  const promptValues: Record<string, any> = {
    ARTICLE_TITLE: title,
    TOPIC_DESCRIPTION: description || '',
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
    KEY_SELLING_POINTS: brandInfo?.key_selling_points || '',
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
    SOURCE_CITATIONS: sourceCitations || '',
    BACKLINKS: Array.isArray(backlinks) ? backlinks.map((bl: any) => bl.url || bl).join('\n') : '',
    INTERNAL_LINK_OPPORTUNITIES: Array.isArray(internalLinks) ? internalLinks.join(', ') : '',
    SUGGESTED_OUTLINE: outlineArray.map((item, idx) => `${idx + 1}. ${item}`).join('\n')
  }
  
  let prompt = formatPromptWithVariables(universalPromptTemplate, promptValues)
  
  prompt += `\n\n---\n\n# CHUNK ${chunkNumber} OF ${totalChunks} INSTRUCTIONS\n\n`
  prompt += `CRITICAL: Target ${chunkSize} words for this chunk (±25 words acceptable).\n`
  prompt += `REMEMBER: Total article must be ${targetWords} words maximum. Keep it concise.\n\n`
  
  if (isFirstChunk) {
    prompt += `## Start the article:\n- Write an engaging opening that hooks readers\n`
    if (chunkOutline.length > 0) {
      prompt += `- Cover these sections: ${chunkOutline.join(', ')}\n`
    }
    prompt += `- Use <h2> tags for section headings (NOT labels like "Introduction")\n- Start with content immediately - NO section labels\n`
  } else if (isLastChunk) {
    prompt += `## Conclude the article:\n`
    if (chunkOutline.length > 0) {
      prompt += `- Cover these sections: ${chunkOutline.join(', ')}\n`
    }
    prompt += `- Summarize key takeaways naturally\n- Provide actionable next steps\n- Include a compelling call-to-action with a descriptive <h2> heading (e.g., "Start Your Journey Today", "Take Action Now")\n- CRITICAL: Do NOT use generic labels like "Call to Action:", "Conclusion:", or "Summary:" - use specific, engaging titles\n- Use <h2> tags for section headings with specific, descriptive titles\n`
  } else {
    prompt += `## Continue the article:\n`
    if (chunkOutline.length > 0) {
      prompt += `- Cover these sections: ${chunkOutline.join(', ')}\n`
    }
    prompt += `- Provide detailed, valuable information\n- Use <h2> and <h3> tags for section headings\n- NO generic labels - use specific, descriptive headings\n`
  }
  
  if (previousHeadings.length > 0) {
    prompt += `\n⚠️ CRITICAL - DO NOT REPEAT THESE HEADINGS (already covered in previous chunks):\n`
    previousHeadings.forEach(h => {
      prompt += `- "${h}"\n`
    })
    prompt += `\nYou MUST create NEW sections with DIFFERENT headings that follow the outline naturally.\n`
  }
  
  if (previousChunks.length > 0) {
    const lastChunk = previousChunks[previousChunks.length - 1]
    const lastParagraph = lastChunk.split('</p>').slice(-3).join('</p>') + '</p>'
    prompt += `\n## Previous Content (for natural continuation):\n${lastParagraph}\n\nContinue naturally from where the previous section ended.\n`
  }
  
  if (customPrompt) {
    prompt += `\n## Custom Instructions:\n${customPrompt}\n`
  }
  
  if (analysis) {
    prompt += `\n## Content Research:\n${analysis}\n`
  }
  
  prompt += `\n## Final Requirements:\n- Target ${chunkSize} words (±25 words acceptable, keep concise)\n- HTML format only (no markdown)\n- Natural, engaging writing style in PARAGRAPH format\n`
  if (chunkOutline.length > 0) {
    prompt += `- Follow the assigned outline sections: ${chunkOutline.join(', ')}\n`
  }
  prompt += `- Do NOT repeat any headings from previous chunks\n- CRITICAL: Do NOT use bullet points (<ul>, <li>) for main content\n- Write all main content using paragraphs (<p> tags) only\n- CRITICAL: CLEAN HTML ONLY - No section labels like "Introduction:", "Main Content:", "Conclusion:", "Call to Action:"\n- CRITICAL: Do NOT include any "META_DESCRIPTION:" text or meta descriptions in the article content\n- Use <h2> tags for ALL section titles with specific, engaging titles (e.g., <h2>Start Your Journey Today</h2> NOT <h2>Call to Action: Start Your Journey Today</h2>)\n- Start content immediately after each heading - NO labels, colons, or prefixes before the actual heading text\n- Meta descriptions are generated separately - focus only on the article body content\n`
  
  return prompt
}

function formatPromptWithVariables(template: string, values: Record<string, any>): string {
  let formatted = template
  
  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    formatted = formatted.replace(regex, value || `[${key} not set]`)
  })
  
  formatted = formatted.replace(/{{#IF (\w+)}}([\s\S]*?){{\/IF}}/g, (match, varName, content) => {
    return values[varName] && values[varName] !== 'false' ? content : ''
  })
  
  formatted = formatted.replace(/{{#IF (\w+) == '([^']+)'}}([\s\S]*?){{\/IF}}/g, (match, varName, value, content) => {
    return values[varName] === value ? content : ''
  })
  
  return formatted
}

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

### Internal Linking Strategy
**Level:** {{INTERNAL_LINKS_LEVEL}}

**Available Internal Link Opportunities:**
{{INTERNAL_LINK_OPPORTUNITIES}}

## Article Structure Requirements

**Suggested Content Outline:**
{{SUGGESTED_OUTLINE}}

## Technical Requirements

### Formatting
- **Format:** HTML only (use <h2>, <h3>, <p>, <strong>, <em>, <table>, <tr>, <td>, <th>)
- **CRITICAL: NO H1 TAGS** - The article title is handled separately, start content with <h2> headings
- **CRITICAL: NO SECTION LABELS** - Never use generic labels like "Introduction:", "Main Content:", "Conclusion:", "Call to Action:"
- **CRITICAL: USE DESCRIPTIVE H2 TITLES** - Every section must have a specific, engaging <h2> title (e.g., "Start Your Journey Today" NOT "Call to Action: Start Your Journey Today")
- **Paragraphs:** ALWAYS use paragraphs as the PRIMARY content format (3-5 sentences per paragraph)
- **CRITICAL - NO BULLET POINTS:** Do NOT use <ul> or <li> tags for main content sections
- **Main Content Rule:** Write all main content in paragraph form using <p> tags
- **Clean HTML:** No meta tags, no labels, no prefixes - just clean content with h2 headings and paragraphs`
