import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchTerm {
  search_term: string;
  cluster: string;
  keywords: string[];
  intent: string;
}

interface Source {
  url: string;
  title: string;
  description: string;
  search_term: string;
  cluster: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerms, country, websiteUrl } = await req.json();

    if (!searchTerms || searchTerms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Search terms are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is not configured');
    }

    // Extract domain from website URL to exclude own site
    let excludeDomain: string | null = null;
    if (websiteUrl) {
      try {
        const url = new URL(websiteUrl);
        excludeDomain = url.hostname.replace('www.', '');
        console.log('Excluding own domain from search:', excludeDomain);
      } catch (e) {
        console.error('Failed to parse website URL:', e);
      }
    }

    const sources: Source[] = [];

    // Process each search term (scrape 5 pages per term for 25 total sources)
    for (const term of searchTerms as SearchTerm[]) {
      try {
        // Build search query with domain exclusion
        const searchQuery = excludeDomain 
          ? `${term.search_term} -site:${excludeDomain}`
          : term.search_term;

        console.log('Searching for:', searchQuery);

        // Use Firecrawl search to get results
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 5, // Get 5 results per search term (5 search terms × 5 = 25 sources)
            lang: country ? country.toLowerCase().substring(0, 2) : 'en',
          }),
        });

        if (!searchResponse.ok) {
          console.error(`Firecrawl search failed for "${term.search_term}":`, searchResponse.status);
          continue;
        }

        const searchData = await searchResponse.json();
        
        if (searchData.data && searchData.data.length > 0) {
          // Filter results to exclude own domain
          const filteredResults = searchData.data.filter((result: any) => {
            if (!excludeDomain) return true;
            try {
              const resultUrl = new URL(result.url);
              const resultDomain = resultUrl.hostname.replace('www.', '');
              return resultDomain !== excludeDomain;
            } catch {
              return true; // Keep result if URL parsing fails
            }
          });

          // Add all filtered results (up to 5 per search term)
          for (const result of filteredResults) {
            sources.push({
              url: result.url,
              title: result.title || 'Untitled',
              description: result.description || '',
              search_term: term.search_term,
              cluster: term.cluster,
            });
          }

          console.log(`Found ${filteredResults.length} sources for "${term.search_term}"`);
        }
      } catch (error) {
        console.error(`Error scraping for "${term.search_term}":`, error);
        // Continue with other search terms even if one fails
      }
    }

    return new Response(
      JSON.stringify({ sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Source scraping error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
