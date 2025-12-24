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
      articleBlueprint,
      brandName,
      brandVoice,
      brandDescription,
      keySellingPoints,
      targetAudience,
      industry,
      brandMentionsLevel,
      competitorMentionsLevel,
      ctaStyle
    } = await req.json();

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const prompt = `You are a brand voice specialist creating a detailed voice profile for article content.

ARTICLE BLUEPRINT:
${JSON.stringify(articleBlueprint, null, 2)}

BRAND INFORMATION:
Name: ${brandName}
Voice: ${brandVoice}
Description: ${brandDescription}
Key Selling Points: ${JSON.stringify(keySellingPoints)}
Target Audience: ${targetAudience}
Industry: ${industry}

BRAND MENTIONS LEVEL: ${brandMentionsLevel}
COMPETITOR MENTIONS LEVEL: ${competitorMentionsLevel}
CTA STYLE: ${ctaStyle || 'conversational'}

Create a comprehensive voice profile in JSON format:
{
  "language_patterns": {
    "use": [
      "Specific phrases that align with brand voice",
      "Industry terminology that resonates",
      "Audience-appropriate language"
    ],
    "avoid": [
      "Generic corporate speak",
      "Overused AI phrases",
      "Jargon that alienates audience"
    ]
  },
  "brand_terminology": {
    "preferred_terms": ["term1", "term2"],
    "brand_specific_phrases": ["phrase1", "phrase2"],
    "industry_context": "How to position brand in industry"
  },
  "tone_per_section": {
    "introduction": "Tone description and approach",
    "main_sections": "Tone for body content",
    "conclusion": "Tone for closing and CTA"
  },
  "brand_mention_strategy": {
    "frequency": "${brandMentionsLevel}",
    "integration_approach": "Natural mention strategy",
    "examples": [
      "How to mention brand in introduction",
      "How to reference brand in body",
      "How to close with brand"
    ]
  },
  "competitor_mention_strategy": {
    "approach": "${competitorMentionsLevel}",
    "positioning": "How to compare without being negative",
    "examples": ["comparison approach 1", "comparison approach 2"]
  },
  "cta_guidelines": {
    "style": "${ctaStyle}",
    "placement": "Where and how to place CTAs",
    "examples": [
      "Primary CTA example",
      "Secondary CTA example"
    ]
  },
  "sentence_structure_preferences": {
    "length_variation": "Mix short punchy and longer explanatory",
    "paragraph_style": "3-5 sentences with natural flow",
    "transition_approach": "Natural connectors, avoid rigid transitions"
  },
  "authenticity_markers": {
    "use_contractions": true,
    "conversational_asides": "When and how to use",
    "specific_examples": "Prefer specific over generic",
    "data_references": "How to cite sources naturally"
  }
}

Return ONLY the JSON object, no additional text.`;

    console.log('[Brand Voice Profile] Calling OpenRouter API...');

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
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Brand Voice Profile] OpenRouter error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('[Brand Voice Profile] Raw response:', content);

    let voiceProfile;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      voiceProfile = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('[Brand Voice Profile] JSON parse error:', parseError);
      voiceProfile = {
        language_patterns: { use: [], avoid: [] },
        brand_terminology: {},
        tone_per_section: {},
        brand_mention_strategy: {},
        competitor_mention_strategy: {},
        cta_guidelines: {},
        sentence_structure_preferences: {},
        authenticity_markers: {},
        raw_response: content
      };
    }

    console.log('[Brand Voice Profile] Success');

    return new Response(
      JSON.stringify({
        success: true,
        voiceProfile,
        stage: 'brand_voice_profile',
        model: 'anthropic/claude-3.5-sonnet'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Brand Voice Profile] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stage: 'brand_voice_profile'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
