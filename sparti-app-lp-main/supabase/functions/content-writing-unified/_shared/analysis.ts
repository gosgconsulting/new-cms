// Content analysis functions

export async function analyzeContent(scrapedContent: string | null, inputData: any, supabase: any) {
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

    const analysisPrompt = `Analyze the following content and provide a structured analysis for article writing:

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
