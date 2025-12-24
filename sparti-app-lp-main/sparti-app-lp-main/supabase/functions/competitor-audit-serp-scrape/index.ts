import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { search_terms, country = 'US', language = 'en', device_type = 'desktop' } = await req.json();

    if (!search_terms || !Array.isArray(search_terms) || search_terms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Search terms array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (!apifyApiKey) {
      throw new Error('APIFY_API_KEY not configured');
    }

    // Use Apify Google Search scraper
    const actorUrl = 'https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items';

    const input = {
      queries: search_terms,
      maxPagesPerQuery: 1, // Only first page
      device: device_type.toLowerCase(),
      languageCode: language,
      countryCode: country,
      includeUnfilteredResults: false,
    };

    const response = await fetch(actorUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify API error:', errorText);
      throw new Error(`Apify API error: ${response.status}`);
    }

    const items = await response.json();

    // Group by search term and filter to top 10 positions
    const groupedResults: Record<string, any[]> = {};

    items.forEach((item: any) => {
      const searchTerm = item.query || item.searchQuery || '';
      if (!searchTerm) return;

      if (!groupedResults[searchTerm]) {
        groupedResults[searchTerm] = [];
      }

      // Only include top 10 positions
      const position = item.rank || item.position || groupedResults[searchTerm].length + 1;
      if (position <= 10) {
        // Extract domain from URL
        let domain = '';
        try {
          const url = new URL(item.url || item.link || '');
          domain = url.hostname.replace('www.', '');
        } catch {
          domain = item.url || item.link || '';
        }

        groupedResults[searchTerm].push({
          position,
          domain,
          url: item.url || item.link || '',
          meta_title: item.title || item.pageTitle || '',
          meta_description: item.snippet || item.description || '',
        });
      }
    });

    // Convert to array format and ensure top 10 only
    const results = Object.entries(groupedResults).map(([search_term, items]) => ({
      search_term,
      results: items
        .sort((a, b) => a.position - b.position)
        .slice(0, 10),
    }));

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping SERP results:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
