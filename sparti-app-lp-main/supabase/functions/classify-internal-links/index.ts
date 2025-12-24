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
    const { links } = await req.json();

    if (!links || !Array.isArray(links) || links.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No links provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Classifying ${links.length} internal links`);

    // Classify links in batches of 50
    const batchSize = 50;
    const classifications = [];

    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      
      const urlList = batch.map((link: any, idx: number) => 
        `${idx + 1}. ${link.url}${link.title ? ` (${link.title})` : ''}`
      ).join('\n');

      const prompt = `Analyze these URLs and classify each as one of the following types:
- "page": Static pages (about, contact, services, home, etc.)
- "post": Blog posts, articles, news
- "shop": E-commerce category/collection pages
- "product": Individual product pages

Also detect the language code (e.g., "en", "fr", "es", "de") based on URL slugs (like /fr/, /es/, /blog-fr/, etc.) or default to "en".

URLs to classify:
${urlList}

Return ONLY a JSON array with this structure:
[
  {
    "url": "https://example.com/about",
    "link_type": "page",
    "language": "en"
  }
]

Classification guidelines:
- Blog posts typically have /blog/, /article/, /news/ in path or date patterns
- Shop pages have /shop/, /category/, /collection/, /products/ (plural)
- Product pages have /product/, unique SKUs, or item-specific URLs
- Pages are everything else (about, contact, services, etc.)
- Detect language from URL patterns like /fr/, /en/, /es/, /de/, etc.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a URL classification expert. Return only valid JSON arrays.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', errorText);
        
        // Return default classifications for this batch
        const defaultClassifications = batch.map((link: any) => ({
          url: link.url,
          link_type: 'page',
          language: 'en'
        }));
        classifications.push(...defaultClassifications);
        continue;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '[]';
      
      console.log('AI classification response:', content);

      // Parse JSON from response
      let batchClassifications = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          batchClassifications = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse classifications:', parseError);
        // Use default classifications
        batchClassifications = batch.map((link: any) => ({
          url: link.url,
          link_type: 'page',
          language: 'en'
        }));
      }

      classifications.push(...batchClassifications);
    }

    console.log(`Classified ${classifications.length} links`);

    return new Response(
      JSON.stringify({ classifications }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in classify-internal-links:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});