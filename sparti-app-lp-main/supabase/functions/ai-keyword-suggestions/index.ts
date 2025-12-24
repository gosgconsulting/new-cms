import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { seedKeywords, country, brandName, brandId, industry } = await req.json();
    
    if (!seedKeywords || !Array.isArray(seedKeywords) || seedKeywords.length === 0) {
      throw new Error('Seed keywords array is required');
    }

    if (!brandId) {
      throw new Error('Brand ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing tracked keywords for this brand
    console.log('Fetching tracked keywords for brand:', brandId);
    const { data: trackedKeywords, error: fetchError } = await supabase
      .from('seo_tracked_keywords')
      .select('keyword')
      .eq('brand_id', brandId);

    if (fetchError) {
      console.error('Error fetching tracked keywords:', fetchError);
      throw new Error('Failed to fetch tracked keywords');
    }

    const existingKeywords = new Set(trackedKeywords?.map(k => k.keyword.toLowerCase()) || []);
    console.log('Found', existingKeywords.size, 'existing tracked keywords');

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    console.log('Generating keyword suggestions for:', seedKeywords, 'in', country);
    
    const prompt = `You are an SEO expert helping generate keyword ideas for a business.

Brand: ${brandName}
${industry ? `Industry: ${industry}` : ''}
Target Country: ${country}
Seed Keywords: ${seedKeywords.join(', ')}

Generate 20-30 relevant keyword suggestions that would be valuable for SEO research. Include:
1. Long-tail variations of the seed keywords
2. Related keywords in the same industry
3. Location-specific variations for ${country}
4. Commercial and informational intent keywords
5. Competitor and alternative keywords

Return ONLY a JSON array of keyword strings, no other text or formatting:
["keyword1", "keyword2", "keyword3", ...]`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparti.ai',
        'X-Title': 'Sparti AI Assistant',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: 'You are an SEO expert that generates keyword suggestions in JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log('AI Response:', content);

    // Log API usage
    const usage = data.usage;
    if (usage) {
      try {
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user } } = await supabase.auth.getUser(token);
          
          if (user) {
            // Calculate cost: Claude 3.5 Sonnet via OpenRouter
            const inputCost = (usage.prompt_tokens / 1000) * 0.003;
            const outputCost = (usage.completion_tokens / 1000) * 0.015;
            const totalCost = inputCost + outputCost;

            await supabase.rpc('deduct_user_tokens', {
              p_user_id: user.id,
              p_service_name: 'openrouter',
              p_model_name: 'anthropic/claude-3.5-sonnet',
              p_cost_usd: totalCost,
              p_brand_id: brandId,
              p_request_data: {
                usage_type: 'keyword-suggestions',
                brand_name: brandName,
                seed_keywords: seedKeywords,
                prompt_tokens: usage.prompt_tokens,
                completion_tokens: usage.completion_tokens,
                total_tokens: usage.total_tokens
              }
            });
            
            console.log(`✅ Logged API usage: $${totalCost.toFixed(5)} (${usage.prompt_tokens}→${usage.completion_tokens} tokens)`);
          }
        }
      } catch (logError) {
        console.error('Failed to log API usage:', logError);
      }
    }
    
    // Parse the JSON response
    let suggestedKeywords: string[];
    try {
      suggestedKeywords = JSON.parse(content);
      if (!Array.isArray(suggestedKeywords)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: try to extract keywords from the response
      const lines = content.split('\n');
      suggestedKeywords = lines
        .filter((line: string) => line.trim().startsWith('"') || line.includes('"'))
        .map((line: string) => line.replace(/["\[\],]/g, '').trim())
        .filter((keyword: string) => keyword.length > 0);
      
      if (suggestedKeywords.length === 0) {
        throw new Error('Could not parse keyword suggestions from AI response');
      }
    }

    // Filter out already tracked keywords (case insensitive)
    const filteredSuggestions = suggestedKeywords.filter(keyword => 
      !existingKeywords.has(keyword.toLowerCase())
    );

    // Also filter seed keywords if they're already tracked
    const filteredSeedKeywords = seedKeywords.filter(keyword => 
      !existingKeywords.has(keyword.toLowerCase())
    );

    // Combine filtered seed keywords with filtered AI suggestions, remove duplicates
    const allKeywords = [...new Set([...filteredSeedKeywords, ...filteredSuggestions])];

    console.log(`Generated ${suggestedKeywords.length} AI suggestions, filtered ${filteredSuggestions.length} new suggestions, total ${allKeywords.length} keywords`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          seedKeywords: filteredSeedKeywords,
          suggestedKeywords: filteredSuggestions,
          allKeywords: allKeywords.slice(0, 50), // Limit to 50 total keywords
          totalCount: allKeywords.length,
          filteredCount: suggestedKeywords.length - filteredSuggestions.length
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  } catch (error) {
    console.error('Error generating keyword suggestions:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to generate keyword suggestions',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      },
    );
  }
});