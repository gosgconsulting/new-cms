import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!firecrawlApiKey || !openrouterApiKey) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching content from:', url);

    // Fetch content using Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('Firecrawl error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    const markdown = scrapeData.data?.markdown || '';
    const title = scrapeData.data?.metadata?.title || '';
    const description = scrapeData.data?.metadata?.description || '';

    if (!markdown) {
      return new Response(
        JSON.stringify({ error: 'No content found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing content with AI...');

    // Analyze content with OpenRouter
    const analysisPrompt = `Analyze the following article and provide a structured analysis:

ARTICLE TITLE: ${title}
ARTICLE CONTENT:
${markdown.substring(0, 8000)} ${markdown.length > 8000 ? '...[content truncated]' : ''}

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

Return ONLY valid JSON, no markdown formatting or explanations.`;

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparti-app.com',
        'X-Title': 'Sparti App',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content analyst. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI analysis error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices?.[0]?.message?.content || '{}';
    
    // Clean up JSON response (remove markdown code blocks if present)
    let cleanedAnalysis = analysisText.trim();
    if (cleanedAnalysis.startsWith('```json')) {
      cleanedAnalysis = cleanedAnalysis.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    } else if (cleanedAnalysis.startsWith('```')) {
      cleanedAnalysis = cleanedAnalysis.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    
    const analysis = JSON.parse(cleanedAnalysis);

    return new Response(
      JSON.stringify({
        title,
        description,
        content: markdown,
        analysis,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing source content:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
