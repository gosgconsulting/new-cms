import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      contentStrategy,
      articleTitle,
      primaryKeyword,
      secondaryKeywords,
      targetWordCount,
      language,
      tone,
      searchIntent,
      internalBacklinksConfig,
      includeFAQ
    } = await req.json();

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const prompt = `You are an SEO content architect creating a detailed article blueprint.

CONTENT STRATEGY:
${JSON.stringify(contentStrategy, null, 2)}

ARTICLE PARAMETERS:
Title: ${articleTitle}
Primary Keyword: ${primaryKeyword}
Secondary Keywords: ${JSON.stringify(secondaryKeywords)}
Target Word Count: ${targetWordCount}
Language: ${language}
Tone: ${tone}
Search Intent: ${searchIntent}
Internal Backlinks: ${JSON.stringify(internalBacklinksConfig)}
Include FAQ: ${includeFAQ}

Create a comprehensive article blueprint in JSON format:
{
  "outline": [
    {
      "heading": "Introduction",
      "type": "h2",
      "word_count": 200,
      "keywords": ["primary keyword"],
      "content_notes": "Hook, problem statement, article overview"
    },
    {
      "heading": "Section 1 Title",
      "type": "h2",
      "word_count": 400,
      "keywords": ["keyword1", "keyword2"],
      "content_notes": "What to cover",
      "subsections": [
        {
          "heading": "Subsection Title",
          "type": "h3",
          "word_count": 200,
          "keywords": ["keyword3"],
          "content_notes": "Specific details"
        }
      ]
    }
  ],
  "keyword_distribution": {
    "primary_keyword": {
      "target_count": 8,
      "placement_strategy": "first 100 words, each H2, conclusion"
    },
    "secondary_keywords": {
      "keyword1": {"target_count": 4, "sections": ["section1", "section2"]},
      "keyword2": {"target_count": 3, "sections": ["section3", "conclusion"]}
    }
  },
  "internal_link_placements": [
    {
      "section": "Introduction",
      "anchor_text": "relevant anchor",
      "url": "url",
      "context": "where to place naturally"
    }
  ],
  "faq_questions": [
    "Question 1 aligned with primary keyword?",
    "Question 2 addressing user intent?",
    "Question 3 for featured snippet?"
  ],
  "content_flow_strategy": "Overall narrative arc and transition strategy",
  "total_sections": 8,
  "estimated_reading_time": "7 minutes"
}

Ensure:
- 8-12 main sections (H2)
- Natural keyword distribution
- FAQ questions are search-optimized
- Word count allocation adds up to target
- Internal links placed contextually

Return ONLY the JSON object, no additional text.`;

    console.log('[Article Blueprint] Calling OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app.com',
        'X-Title': 'SEO Content Platform'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Article Blueprint] OpenRouter error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('[Article Blueprint] Raw response:', content);

    let blueprint;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      blueprint = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('[Article Blueprint] JSON parse error:', parseError);
      blueprint = {
        outline: [],
        keyword_distribution: {},
        internal_link_placements: [],
        faq_questions: [],
        content_flow_strategy: '',
        raw_response: content
      };
    }

    console.log('[Article Blueprint] Success');

    return new Response(
      JSON.stringify({
        success: true,
        blueprint,
        stage: 'article_blueprint',
        model: 'openai/gpt-4o-mini'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Article Blueprint] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stage: 'article_blueprint'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
