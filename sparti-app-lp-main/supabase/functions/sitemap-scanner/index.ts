import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface SitemapResponse {
  success: boolean;
  links: string[];
  totalLinks: number;
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get Firecrawl API key
    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl API key not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { sitemapUrl } = await req.json();

    if (!sitemapUrl) {
      return new Response(
        JSON.stringify({ error: "Sitemap URL is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if input is a direct sitemap URL or needs detection
    const inputUrl = sitemapUrl.trim();
    let finalSitemapUrl: string;
    let parsedUrl: URL;

    console.log('Input URL:', inputUrl);
    console.log('Ends with .xml:', inputUrl.endsWith('.xml'));
    console.log('Includes sitemap:', inputUrl.includes('sitemap'));

    if (inputUrl.endsWith('.xml') || inputUrl.includes('sitemap')) {
      // User provided what looks like a sitemap URL
      console.log('Using direct sitemap URL');
      finalSitemapUrl = inputUrl;
      
      // Validate URL format
      try {
        parsedUrl = new URL(finalSitemapUrl);
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid URL format" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    } else {
      // Try to auto-detect sitemap
      console.log('Auto-detecting sitemap for domain:', inputUrl);
      try {
        finalSitemapUrl = await detectSitemapUrl(inputUrl, firecrawlApiKey!);
        console.log('Auto-detected sitemap URL:', finalSitemapUrl);
        parsedUrl = new URL(finalSitemapUrl);
      } catch (detectionError) {
        console.error('Auto-detection failed:', detectionError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Could not automatically detect sitemap. Common locations checked: /sitemap.xml, /sitemap_index.xml, /sitemap-index.xml. Please provide the exact sitemap URL.',
            links: [],
            totalLinks: 0
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Fetch the sitemap using Firecrawl API
    let sitemapContent: string;
    
    try {
      sitemapContent = await fetchSitemapWithFirecrawl(finalSitemapUrl, firecrawlApiKey);
    } catch (firecrawlError) {
      console.error('Firecrawl failed, trying direct fetch:', firecrawlError);
      
      // Fallback to direct fetch
      const directResponse = await fetch(finalSitemapUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SitemapScanner/1.0)',
          'Accept': 'application/xml, text/xml, */*',
        },
      });
      
      if (!directResponse.ok) {
        throw new Error(`Both Firecrawl and direct fetch failed. Firecrawl: ${(firecrawlError as Error).message}, Direct: ${directResponse.status}`);
      }
      
      sitemapContent = await directResponse.text();
    }
    
    console.log('Sitemap content length:', sitemapContent.length);
    console.log('Sitemap content preview:', sitemapContent.substring(0, 500));
    
    const links = await extractLinksFromSitemap(sitemapContent, parsedUrl.origin, firecrawlApiKey);

    const response: SitemapResponse = {
      success: true,
      links,
      totalLinks: links.length
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('Sitemap scanner error:', error);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Failed to process sitemap';
    let statusCode = 500;
    
    const err = error as Error;
    if (err.message?.includes('Firecrawl API error')) {
      errorMessage = 'Unable to access sitemap due to website restrictions. Please try a different sitemap URL or contact support.';
      statusCode = 403;
    } else if (err.message?.includes('Failed to fetch')) {
      errorMessage = 'Unable to reach the sitemap URL. Please check if the URL is correct and accessible.';
      statusCode = 404;
    } else if (err.message?.includes('Invalid XML format')) {
      errorMessage = 'The sitemap format is not supported. Please ensure the URL points to a valid XML sitemap.';
      statusCode = 400;
    } else if (err.message?.includes('No content returned')) {
      errorMessage = 'The sitemap appears to be empty or inaccessible. Please verify the URL and try again.';
      statusCode = 404;
    } else if (err.message?.includes('Both Firecrawl and direct fetch failed')) {
      errorMessage = 'Unable to access this sitemap due to website security restrictions. Please try a different sitemap or contact the website owner.';
      statusCode = 403;
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        links: [],
        totalLinks: 0
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function detectSitemapUrl(inputUrl: string, firecrawlApiKey: string): Promise<string> {
  // Normalize URL
  let baseUrl = inputUrl.trim();
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = 'https://' + baseUrl;
  }
  
  // Parse to get clean base URL
  const urlObj = new URL(baseUrl);
  const origin = urlObj.origin;
  
  // Common sitemap locations to try
  const sitemapPaths = [
    '/sitemap_index.xml',
    '/sitemap.xml',
    '/sitemap-index.xml',
    '/sitemap1.xml',
  ];
  
  // First, try to check robots.txt for sitemap declaration
  try {
    const robotsUrl = `${origin}/robots.txt`;
    console.log(`Checking robots.txt at: ${robotsUrl}`);
    const robotsResponse = await fetch(robotsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapScanner/1.0)',
      },
    });
    if (robotsResponse.ok) {
      const robotsContent = await robotsResponse.text();
      const sitemapMatch = robotsContent.match(/Sitemap:\s*(https?:\/\/[^\s]+)/i);
      if (sitemapMatch && sitemapMatch[1]) {
        console.log(`Found sitemap in robots.txt: ${sitemapMatch[1]}`);
        return sitemapMatch[1];
      }
    }
  } catch (error) {
    console.log('Could not fetch robots.txt, trying common paths');
  }
  
  // Try common sitemap paths
  for (const path of sitemapPaths) {
    const sitemapUrl = `${origin}${path}`;
    console.log(`Trying sitemap URL: ${sitemapUrl}`);
    
    try {
      const response = await fetch(sitemapUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SitemapScanner/1.0)',
        },
      });
      
      if (response.ok) {
        console.log(`Found sitemap at: ${sitemapUrl}`);
        return sitemapUrl;
      }
    } catch (error) {
      console.log(`No sitemap at ${sitemapUrl}`);
    }
  }
  
  throw new Error('Could not automatically detect sitemap. Please provide the exact sitemap URL.');
}

async function fetchSitemapWithFirecrawl(url: string, apiKey: string): Promise<string> {
  try {
    console.log(`Fetching sitemap with Firecrawl: ${url}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['rawHtml', 'markdown'],
        onlyMainContent: false,
        waitFor: 3000, // Wait 3 seconds for dynamic content
        includeTags: ['sitemap', 'url', 'loc'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firecrawl API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Firecrawl response structure:', Object.keys(data));
    
    // Try to get raw HTML first
    let content = data.data?.rawHtml || '';
    
    // If raw HTML is empty or doesn't contain XML, try markdown
    if (!content || (!content.includes('<sitemap') && !content.includes('<url'))) {
      console.log('Raw HTML not suitable, trying markdown...');
      const markdown = data.data?.markdown || '';
      
      // Extract URLs from markdown if available
      if (markdown) {
        const urlMatches = markdown.match(/https?:\/\/[^\s\)]+/g);
        if (urlMatches && urlMatches.length > 0) {
          console.log(`Found ${urlMatches.length} URLs in markdown`);
          // Convert markdown URLs to XML format for parsing
          const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlMatches.map((url: string) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;
          content = xmlContent;
        }
      }
    }
    
    if (!content) {
      throw new Error('No content returned from Firecrawl');
    }
    
    console.log('Final content length:', content.length);
    return content;
  } catch (error) {
    console.error('Firecrawl API error:', error);
    throw new Error(`Failed to fetch sitemap with Firecrawl: ${(error as Error).message}`);
  }
}

async function extractLinksFromSitemap(content: string, baseUrl: string, firecrawlApiKey?: string): Promise<string[]> {
  const links: string[] = [];
  
  try {
    console.log('Raw content preview:', content.substring(0, 1000));
    console.log('Content type detection:', {
      hasXmlDeclaration: content.includes('<?xml'),
      hasSitemapTag: content.includes('<sitemap'),
      hasUrlTag: content.includes('<url'),
      hasHtmlTag: content.includes('<html'),
      hasDoctype: content.includes('<!DOCTYPE')
    });

    // Check if content is HTML instead of XML
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      console.log('Content appears to be HTML, extracting XML from it...');
      // Try to extract XML content from HTML
      const xmlMatch = content.match(/<sitemapindex[^>]*>[\s\S]*?<\/sitemapindex>|<urlset[^>]*>[\s\S]*?<\/urlset>/i);
      if (xmlMatch) {
        content = xmlMatch[0];
        console.log('Extracted XML content:', content.substring(0, 500));
      } else {
        throw new Error('No valid sitemap XML found in HTML content');
      }
    }

    // Parse XML content using regex (Deno-compatible approach)
    // Extract URL locations from <loc> tags
    const urlLocRegex = /<loc>\s*(.*?)\s*<\/loc>/gi;
    const matches = [...content.matchAll(urlLocRegex)];
    
    if (matches.length === 0) {
      console.error('No URL locations found in sitemap');
      throw new Error('Invalid XML format - no URLs found');
    }

    console.log(`Found ${matches.length} URL elements in sitemap`);
    
    const extractedLinks: SitemapLink[] = [];
    
    // Process regular sitemap entries
    for (const match of matches) {
      const url = match[1]?.trim();
      if (url && isValidUrl(url)) {
        extractedLinks.push(url);
      }
    }

    // Also check for nested sitemaps
    const sitemapLocRegex = /<sitemap>\s*<loc>\s*(.*?)\s*<\/loc>/gi;
    const sitemapMatches = [...content.matchAll(sitemapLocRegex)];
    
    // Process sitemap index (nested sitemaps)
    if (sitemapMatches.length > 0) {
      console.log('Processing sitemap index with nested sitemaps...');
      
      // Limit to first 10 nested sitemaps to prevent timeout
      const maxNestedSitemaps = Math.min(sitemapMatches.length, 10);
      console.log(`Processing ${maxNestedSitemaps} nested sitemaps (limited to prevent timeout)`);
      
      for (let i = 0; i < maxNestedSitemaps; i++) {
        const nestedSitemapUrl = sitemapMatches[i][1]?.trim();
        if (nestedSitemapUrl) {
          console.log(`Fetching nested sitemap ${i + 1}/${maxNestedSitemaps}: ${nestedSitemapUrl}`);
          
          try {
            if (!firecrawlApiKey) {
              console.error('Firecrawl API key not available for nested sitemap');
              continue;
            }
            
            // Fetch nested sitemap using Firecrawl
            const nestedContent = await fetchSitemapWithFirecrawl(nestedSitemapUrl, firecrawlApiKey);
            const nestedLinks = await extractLinksFromSitemap(nestedContent, baseUrl, firecrawlApiKey);
            extractedLinks.push(...nestedLinks);
            console.log(`Found ${nestedLinks.length} links in nested sitemap ${i + 1}`);
          } catch (nestedError) {
            console.error(`Error fetching nested sitemap ${i + 1}:`, nestedError);
            // Continue with other sitemaps
          }
        }
      }
    }

    // If no links found, return empty array
    if (extractedLinks.length === 0) {
      console.log('No URLs found in sitemap');
      return [];
    }

    // Remove duplicates and filter
    const uniqueLinks = [...new Set(extractedLinks)]
      .filter(url => {
        try {
          const urlObj = new URL(url);
          const baseUrlObj = new URL(baseUrl);
          return urlObj.origin === baseUrlObj.origin; // Only internal links
        } catch {
          return false;
        }
      })
      .sort();

    console.log(`Total unique internal links found: ${uniqueLinks.length}`);
    return uniqueLinks;

  } catch (error) {
    console.error('Error parsing sitemap:', error);
    throw new Error('Failed to parse sitemap XML');
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}