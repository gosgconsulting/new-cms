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
    const { sources, keywords } = await req.json();

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Sources are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    console.log('Fetching content from', sources.length, 'sources');

    // Process sources in parallel with a limit
    const results = [];
    const batchSize = 3;
    
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (source: any) => {
          try {
            // Fetch content using existing firecrawl-scrape function
            const scrapeResponse = await fetch(`${SUPABASE_URL}/functions/v1/firecrawl-scrape`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: source.url,
                formats: ['markdown'],
                onlyMainContent: true,
                waitFor: 2000,
              }),
            });

            if (!scrapeResponse.ok) {
              console.error(`Failed to scrape ${source.url}:`, scrapeResponse.status);
              return {
                ...source,
                status: 'failed',
                error: `Failed to fetch content (${scrapeResponse.status})`,
                content: null,
                insights: null,
              };
            }

            const scrapeData = await scrapeResponse.json();
            const content = scrapeData.markdown || scrapeData.data?.markdown || '';

            if (!content || content.length < 100) {
              return {
                ...source,
                status: 'failed',
                error: 'Insufficient content extracted',
                content: null,
                insights: null,
              };
            }

            // Analyze content with AI
            const analysisPrompt = `Analyze this source content and extract key insights for SEO content planning:

URL: ${source.url}
Content: ${content.substring(0, 4000)}

Keywords context: ${keywords?.join(', ') || 'N/A'}

Provide a JSON analysis with:
1. main_topics: Array of 3-5 main topics covered
2. key_insights: Array of 3-5 actionable insights for content creation
3. content_angles: Array of 3-5 unique angles or perspectives
4. relevance_score: Number 1-10 indicating relevance to keywords
5. summary: Brief 2-3 sentence summary

Return ONLY valid JSON.`;

            console.log(`Analyzing source ${i + 1}/${sources.length} with OpenRouter (openai/gpt-4o-mini)`);
            
            const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://sparti.ai",
                "X-Title": "Sparti AI - Source Analysis",
              },
              body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                  { 
                    role: "system", 
                    content: "You are an expert SEO content analyst. Extract actionable insights from source content." 
                  },
                  { role: "user", content: analysisPrompt }
                ],
                temperature: 0.3,
                max_tokens: 2000
              }),
            });

            if (!aiResponse.ok) {
              const errorText = await aiResponse.text();
              console.error('OpenRouter API error for source analysis:', {
                url: source.url,
                status: aiResponse.status,
                body: errorText
              });
              return {
                ...source,
                status: 'partial',
                content: content.substring(0, 1000),
                insights: null,
                error: `AI analysis failed (${aiResponse.status})`,
              };
            }

            const aiData = await aiResponse.json();
            let insights = null;
            
            try {
              const aiContent = aiData.choices[0].message.content;
              const jsonMatch = aiContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
              const jsonContent = jsonMatch ? jsonMatch[1] : aiContent;
              insights = JSON.parse(jsonContent.trim());
            } catch (parseError) {
              console.error('Failed to parse AI insights:', parseError);
            }

            return {
              ...source,
              status: 'success',
              content: content.substring(0, 1000),
              insights,
              fetched_at: new Date().toISOString(),
            };

          } catch (error) {
            console.error(`Error processing ${source.url}:`, error);
            return {
              ...source,
              status: 'failed',
              error: error.message,
              content: null,
              insights: null,
            };
          }
        })
      );

      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < sources.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Completed fetching:', results.filter(r => r.status === 'success').length, 'successful');

    return new Response(
      JSON.stringify({ sources: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quick-setup-source-fetching:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
