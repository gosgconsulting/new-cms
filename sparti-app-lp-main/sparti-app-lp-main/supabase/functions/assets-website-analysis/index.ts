import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl, objectiveInput, brandId, userId } = await req.json();
    console.log('Starting assets website analysis for:', websiteUrl);

    if (!websiteUrl) {
      throw new Error('Website URL is required');
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Step 1: Scrape website content using Firecrawl API directly
    console.log('Fetching website content via Firecrawl...');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY') || 'fc-200bce4322aa42ffa3eabae53b6d80bd';
    
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url: websiteUrl,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        waitFor: 2000,
        timeout: 30000
      })
    });
    
    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error('Firecrawl API error:', firecrawlResponse.status, errorText);
      throw new Error(`Failed to scrape website: ${firecrawlResponse.status}`);
    }
    
    const firecrawlData = await firecrawlResponse.json();
    const markdown = firecrawlData.data?.markdown || '';
    const html = firecrawlData.data?.html || '';
    
    if (!markdown || markdown.length < 100) {
      throw new Error('Insufficient content extracted from website');
    }
    
    const websiteContent = markdown.substring(0, 10000);
    console.log('Successfully fetched content, length:', websiteContent.length);

    // Step 2: Analyze with AI to extract brand information
    console.log('Analyzing brand information with AI...');
    const analysisPrompt = `You are a brand and visual design analyst. Analyze this website and extract comprehensive brand information for creating visual marketing assets.

CRITICAL: Respond with ONLY a valid JSON object. No explanatory text, markdown, or code blocks. Just raw JSON.

Required JSON structure:
{
  "brand_name": "string",
  "brand_description": "string",
  "target_audience": "string",
  "suggested_audiences": ["audience1", "audience2", "audience3", "audience4", "audience5"],
  "key_selling_points": ["string1", "string2", "string3"],
  "colors": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "accent": ["#hexcolor1", "#hexcolor2"]
  },
  "typography": {
    "heading_font": "Font name",
    "body_font": "Font name",
    "characteristics": "Brief description"
  },
  "brand_style": {
    "overall_aesthetic": "Modern/Classic/Minimalist/Bold/etc",
    "visual_tone": "Professional/Playful/Elegant/etc"
  }
}

Website URL: ${websiteUrl}
Website Content:
${websiteContent}

Extract:
- Brand name: Company/brand name
- Brand description: What they do (1-2 sentences)
- Target audience: Who are their customers (general description)
- Suggested audiences: Generate 5-7 specific audience segments based on the brand's products/services. Be creative and specific (e.g., "Health-conscious individuals", "Frozen dessert lovers", "Fitness enthusiasts", "Busy professionals seeking quick meals"). Base these on the actual brand's offering.
- Key selling points: 3-5 main benefits/features
- Colors: Extract actual brand colors from the website. If you can't detect them, suggest appropriate colors based on the brand identity
- Typography: Identify or suggest appropriate fonts for headings and body text
- Brand style: Overall aesthetic and visual tone

Respond with ONLY the JSON object.`;

    const aiResponse = await fetch(`${supabaseUrl}/functions/v1/openrouter-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          { role: "user", content: analysisPrompt }
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI analysis error:", aiResponse.status, errorText);
      throw new Error('Failed to analyze brand information');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    let brandAnalysis;
    try {
      // Try multiple approaches to extract JSON
      const jsonMatch = aiContent?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        brandAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        brandAnalysis = JSON.parse(aiContent);
      }
      console.log('Brand analysis extracted successfully');
    } catch (parseError) {
      console.error('Failed to parse brand analysis:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Step 3: Generate asset objective
    console.log('Generating asset objective...');
    const objectivePrompt = `Based on this campaign objective: "${objectiveInput || 'Create engaging social media ads'}"

Brand: ${brandAnalysis.brand_name}
Description: ${brandAnalysis.brand_description}
Target Audience: ${brandAnalysis.target_audience}

Generate a detailed asset campaign objective. Respond with ONLY valid JSON:

{
  "campaign_goal": "Clear, specific goal statement",
  "target_platforms": ["Platform1", "Platform2", "Platform3"],
  "content_focus": "What content should emphasize",
  "call_to_action": "Primary CTA for assets"
}`;

    const objectiveResponse = await fetch(`${supabaseUrl}/functions/v1/openrouter-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "user", content: objectivePrompt }
        ],
        stream: false,
      }),
    });

    let assetObjective;
    if (objectiveResponse.ok) {
      const objectiveData = await objectiveResponse.json();
      const objectiveContent = objectiveData.choices?.[0]?.message?.content;
      
      try {
        const jsonMatch = objectiveContent?.match(/\{[\s\S]*\}/);
        assetObjective = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(objectiveContent);
      } catch {
        // Fallback objective
        assetObjective = {
          campaign_goal: objectiveInput || 'Create engaging social media ads',
          target_platforms: ['Facebook', 'Instagram', 'LinkedIn'],
          content_focus: 'Brand awareness and engagement',
          call_to_action: 'Learn More'
        };
      }
    } else {
      assetObjective = {
        campaign_goal: objectiveInput || 'Create engaging social media ads',
        target_platforms: ['Facebook', 'Instagram', 'LinkedIn'],
        content_focus: 'Brand awareness and engagement',
        call_to_action: 'Learn More'
      };
    }

    // Step 4: Save to database
    if (brandId && userId) {
      console.log('Saving analysis to database...');
      const { error: saveError } = await supabase
        .from('brand_analysis')
        .upsert({
          brand_id: brandId,
          user_id: userId,
          brand_name: brandAnalysis.brand_name,
          brand_description: brandAnalysis.brand_description,
          target_audience: brandAnalysis.target_audience,
          key_selling_points: brandAnalysis.key_selling_points || [],
          sitemap_url: websiteUrl,
          total_sitemap_links: 0,
          backlinks: [],
          keywords: [],
          competitors: []
        }, {
          onConflict: 'brand_id'
        });

      if (saveError) {
        console.error('Error saving to database:', saveError);
      }
    }

    console.log('Website analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        brandAnalysis,
        assetObjective
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in assets-website-analysis:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze website'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});