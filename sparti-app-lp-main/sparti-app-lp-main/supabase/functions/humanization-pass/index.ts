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
      voiceProfile,
      tone
    } = await req.json();

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const prompt = `You are a content humanization specialist. Refine this article to remove AI writing patterns and make it sound naturally human.

ARTICLE CONTENT:
${articleContent}

BRAND VOICE PROFILE:
${JSON.stringify(voiceProfile, null, 2)}

TARGET TONE: ${tone}

Transform the article to be more human by applying these refinements:

1. **Remove AI Writing Patterns:**
   - Eliminate ALL em dashes (—) → replace with commas, periods, or parentheses
   - Remove generic phrases:
     * "In today's ever-changing world"
     * "It's important to note that"
     * "In conclusion"
     * "At the end of the day"
     * "Dive deep into"
     * "Unlock the power of"
   - Cut excessive adjectives: "extremely powerful", "highly innovative", "incredibly important"
   - Avoid rigid transitions: "Moreover", "Furthermore", "Additionally", "Subsequently"
   - Remove repeated metaphors and clichés

2. **Add Human Touches:**
   - Vary sentence length dramatically (mix 5-word sentences with 25-word sentences)
   - Use contractions naturally: "you'll", "it's", "don't", "we're"
   - Add conversational asides where appropriate: "(and here's why that matters)" or "think of it this way"
   - Include specific, concrete examples over generic statements
   - Use active voice predominantly (passive voice only when necessary)

3. **Convert List-Like Writing to Flowing Prose:**
   - Transform any paragraph that reads like a bullet list
   - Ensure paragraphs have natural connections between sentences
   - Use varied connectors: "because", "which means", "leading to", "resulting in"
   - Aim for 3-5 sentences per paragraph with logical flow

4. **Enhance Natural Language:**
   - Use "but" and "and" to start sentences occasionally (natural spoken rhythm)
   - Add questions to engage readers: "Why does this matter?" "What does this mean for you?"
   - Include transitions that feel conversational: "Here's the thing", "Now", "That said"
   - Vary paragraph openings (don't start multiple paragraphs the same way)

5. **Maintain Brand Voice:**
   - Apply language patterns from the voice profile
   - Keep brand terminology consistent
   - Ensure tone matches target (professional/casual/technical/friendly)
   - Preserve brand mentions and positioning

6. **Critical Preservation Rules:**
   - Keep ALL SEO optimizations intact (keywords, bold tags, headings)
   - Maintain ALL HTML formatting (<h2>, <h3>, <p>, <strong>, <a>)
   - Do NOT change the article structure or sections
   - Do NOT remove or alter internal links
   - Keep the same information and meaning

QUALITY CHECKLIST:
✓ Zero em dashes
✓ No AI cliché phrases
✓ Varied sentence lengths
✓ Natural contractions used
✓ Flowing paragraphs (not list-like)
✓ Conversational where appropriate
✓ All SEO elements preserved
✓ HTML structure maintained

Return ONLY the humanized article HTML, no explanations or wrapper text.`;

    console.log('[Humanization Pass] Calling OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app.com',
        'X-Title': 'SEO Content Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Humanization Pass] OpenRouter error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let humanizedContent = data.choices[0].message.content;
    
    // Clean up if wrapped in code blocks
    const codeBlockMatch = humanizedContent.match(/```html\n([\s\S]*?)\n```/) || 
                          humanizedContent.match(/```([\s\S]*?)```/);
    if (codeBlockMatch) {
      humanizedContent = codeBlockMatch[1].trim();
    }

    console.log('[Humanization Pass] Success');

    return new Response(
      JSON.stringify({
        success: true,
        humanizedContent,
        stage: 'humanization',
        model: 'anthropic/claude-3.5-sonnet'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Humanization Pass] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stage: 'humanization'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
