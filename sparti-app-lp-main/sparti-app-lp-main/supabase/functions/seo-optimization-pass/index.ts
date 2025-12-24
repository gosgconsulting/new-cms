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
      articleContent,
      primaryKeyword,
      secondaryKeywords,
      targetWordCount,
      searchIntent
    } = await req.json();

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const prompt = `You are an SEO optimization specialist. Enhance this article for search engines without changing its meaning or structure.

ARTICLE CONTENT:
${articleContent}

PRIMARY KEYWORD: ${primaryKeyword}
SECONDARY KEYWORDS: ${JSON.stringify(secondaryKeywords)}
TARGET WORD COUNT: ${targetWordCount}
SEARCH INTENT: ${searchIntent}

Optimize the article for SEO by:

1. **Keyword Placement Verification:**
   - Ensure primary keyword appears in first 100 words
   - Verify primary keyword in conclusion
   - Check keyword density (1-2% for primary, 0.5-1% for secondary)
   - Add semantic variations naturally

2. **Heading Optimization:**
   - Ensure primary keyword in at least one H2
   - Add keywords to H3s where natural
   - Maintain logical heading hierarchy (H2 > H3, no H1)

3. **Strategic Bolding:**
   - Add <strong> tags to 3-5 key phrases
   - Bold the primary keyword once (in context)
   - Bold important concepts and takeaways
   - Avoid over-bolding (max 1-2 per paragraph)

4. **Internal Link Enhancement:**
   - Verify anchor text is descriptive (not "click here")
   - Ensure links are contextually relevant
   - Check that links don't disrupt reading flow

5. **FAQ Schema Optimization:**
   - Ensure FAQ section uses proper structure
   - Questions should be natural search queries
   - Answers should be concise and direct
   - Format: <h3>Question?</h3><p>Answer</p>

6. **HTML Structure Validation:**
   - No H1 tags (only H2, H3)
   - Proper nesting of elements
   - Clean, semantic HTML
   - No excessive empty paragraphs

7. **Semantic Keyword Integration:**
   - Add LSI keywords naturally
   - Use related terms and synonyms
   - Maintain natural language flow

CRITICAL RULES:
- DO NOT change the article's meaning or core content
- DO NOT alter the writing style or voice
- DO NOT add new sections or remove content
- ONLY enhance SEO elements
- Return ONLY the optimized HTML, no explanations

Return the optimized article HTML.`;

    console.log('[SEO Optimization] Calling OpenRouter API...');

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
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SEO Optimization] OpenRouter error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let optimizedContent = data.choices[0].message.content;
    
    // Clean up if wrapped in code blocks
    const codeBlockMatch = optimizedContent.match(/```html\n([\s\S]*?)\n```/) || 
                          optimizedContent.match(/```([\s\S]*?)```/);
    if (codeBlockMatch) {
      optimizedContent = codeBlockMatch[1].trim();
    }

    console.log('[SEO Optimization] Success');

    return new Response(
      JSON.stringify({
        success: true,
        optimizedContent,
        stage: 'seo_optimization',
        model: 'openai/gpt-4o-mini'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SEO Optimization] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stage: 'seo_optimization'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
