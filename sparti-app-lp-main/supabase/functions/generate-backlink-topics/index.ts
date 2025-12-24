import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  brandId: string;
  brandName: string;
  keywords: string[];
  internalLinks: Array<{ id: string; url: string; title?: string }>;
  location: string;
  language: string;
  numberOfTopics: number;
  generationId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    const { brandId, brandName, keywords, internalLinks, location, language, numberOfTopics, generationId } = body;

    console.log('Generating backlink topics:', { brandId, brandName, numberOfTopics, keywords: keywords.length, links: internalLinks.length });

    // Get model from content settings
    const { data: settings } = await supabase
      .from('content_settings')
      .select('model')
      .eq('brand_id', brandId)
      .maybeSingle();

    const selectedModel = settings?.model || 'anthropic/claude-3.5-sonnet';
    console.log('Using model:', selectedModel);

    // Get OpenRouter API key
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

    const systemPrompt = `You are an expert SEO content strategist specializing in backlink strategy. Current date: ${currentMonth} ${currentYear}. Always use the current year (${currentYear}) when suggesting topics with dates. Never suggest outdated years.`;
    
    // Create a mapping of internal links with their IDs
    const internalLinksWithIds = internalLinks.map((link, i) => {
      return `Link ${i + 1} (ID: ${link.id}):\n  URL: ${link.url}${link.title ? `\n  Title: ${link.title}` : ''}`;
    }).join('\n\n');
    
    const userPrompt = `Generate ${numberOfTopics} SEO-optimized blog post topics for ${brandName}.

CRITICAL DATE CONTEXT: We are currently in ${currentMonth} ${currentYear}. ALL topic suggestions MUST use the current year (${currentYear}) or be timeless. NEVER suggest topics with outdated years like "${currentYear - 1}" or earlier.

Target Keywords: ${keywords.join(', ')}

Internal Links Available (use the ID for suggestedInternalLinkId):
${internalLinksWithIds}

Location: ${location}
Language: ${language}

Create engaging topics that:
1. Naturally incorporate the target keywords
2. Would benefit from internal links to the provided URLs
3. Match search intent for the target audience
4. Are optimized for ${location}
5. Use current year (${currentYear}) in titles when mentioning years

IMPORTANT: For "suggestedInternalLinkId", you MUST use one of the Link IDs provided above (e.g., "${internalLinks[0]?.id}").

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Compelling blog post title",
    "description": "Brief description of the post",
    "keywords": ["keyword1", "keyword2"],
    "keywordFocus": "main keyword",
    "suggestedInternalLinkId": "use-one-of-the-link-ids-above",
    "searchIntent": "informational/commercial/transactional"
  }
]`;

    console.log('Calling OpenRouter API...');
    
    // Make direct call to OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparti.ai',
        'X-Title': 'Sparti AI Assistant',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();
    
    console.log('AI Response received:', generatedText.substring(0, 200) + '...');
    
    let topics: any[];
    
    try {
      // Try to parse JSON directly
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      topics = JSON.parse(jsonMatch ? jsonMatch[0] : generatedText);
      
      if (!Array.isArray(topics)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', generatedText);
      
      if (generationId) {
        await supabase
          .from('backlink_topic_generation')
          .update({ 
            status: 'failed', 
            error_message: 'Failed to parse AI response. Please try again.' 
          })
          .eq('id', generationId);
      }
      throw new Error('Failed to parse AI response');
    }

    console.log(`Successfully parsed ${topics.length} topics`);

    // Save topics to database if generationId is provided
    if (generationId) {
      const topicsToInsert = topics.map(topic => ({
        generation_id: generationId,
        title: topic.title,
        description: topic.description || '',
        keywords: topic.keywords || [],
        keyword_focus: topic.keywordFocus,
        suggested_internal_link_id: topic.suggestedInternalLinkId,
        search_intent: topic.searchIntent
      }));

      console.log('Inserting topics into database...');
      const { error: insertError } = await supabase
        .from('backlink_suggested_topics')
        .insert(topicsToInsert);

      if (insertError) {
        console.error('Error inserting topics:', insertError);
        await supabase
          .from('backlink_topic_generation')
          .update({ 
            status: 'failed', 
            error_message: insertError.message 
          })
          .eq('id', generationId);
        throw insertError;
      }

      // Update generation status to completed
      await supabase
        .from('backlink_topic_generation')
        .update({ status: 'completed' })
        .eq('id', generationId);
      
      console.log('Topics saved successfully');
    }

    return new Response(
      JSON.stringify({ topics, generationId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in generate-backlink-topics:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
