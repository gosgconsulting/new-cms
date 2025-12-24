import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SitemapResult {
  success: boolean;
  sitemapUrl?: string;
  links?: string[];
  totalLinks?: number;
  error?: string;
  discoveredUrls?: string[];
  fetchedSitemaps?: string[];
}

// Common sitemap paths to check
const COMMON_SITEMAP_PATHS = [
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/sitemaps.xml',
  '/sitemap-index.xml',
  '/sitemap/sitemap.xml',
  '/sitemaps/sitemap.xml',
  '/wp-sitemap.xml',
  '/wp-sitemap-index.xml',
  '/sitemap_news.xml',
  '/sitemap_products.xml',
  '/sitemap_categories.xml',
  '/sitemap_articles.xml'
];

// Robots.txt sitemap patterns
const ROBOTS_SITEMAP_PATTERNS = [
  /Sitemap:\s*(.+)/gi,
  /sitemap:\s*(.+)/gi
];

async function normalizeUrl(url: string): Promise<string> {
  try {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    const urlObj = new URL(url);
    
    // Remove trailing slashes except for root
    if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    return urlObj.toString();
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`);
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapBot/1.0; +https://example.com/bot)',
        'Accept': 'application/xml, text/xml, */*',
      },
      redirect: 'follow',
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

async function checkSitemapExists(url: string): Promise<{ exists: boolean; response?: Response }> {
  try {
    const response = await fetchWithTimeout(url, 8000);
    
    // Check if response is successful and content type indicates XML
    const contentType = response.headers.get('content-type') || '';
    const isXml = contentType.includes('xml') || url.endsWith('.xml');
    
    if (response.ok && isXml) {
      return { exists: true, response };
    }
    
    return { exists: false };
  } catch (error) {
    console.log(`Failed to check sitemap at ${url}:`, error.message);
    return { exists: false };
  }
}

interface SitemapParseResult {
  links: string[];
  subSitemaps: string[];
}

async function parseSitemapXml(xmlText: string, baseUrl: string): Promise<SitemapParseResult> {
  const links: string[] = [];
  const subSitemaps: string[] = [];
  
  try {
    // Check if this is a sitemap index file
    const isIndexFile = xmlText.includes('<sitemapindex') || xmlText.includes('<sitemap>');
    console.log(`Parsing ${isIndexFile ? 'sitemap index' : 'regular sitemap'} file`);
    
    if (isIndexFile) {
      // Parse sitemap index - look for <sitemap> tags
      const sitemapMatches = xmlText.match(/<sitemap[^>]*>[\s\S]*?<\/sitemap>/gi);
      
      if (sitemapMatches) {
        for (const sitemapMatch of sitemapMatches) {
          const locMatch = sitemapMatch.match(/<loc[^>]*>([^<]+)<\/loc>/i);
          if (locMatch && locMatch[1]) {
            let sitemapUrl = locMatch[1].trim();
            
            // Handle relative URLs
            if (sitemapUrl.startsWith('/')) {
              try {
                const baseUrlObj = new URL(baseUrl);
                sitemapUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${sitemapUrl}`;
              } catch (error) {
                console.warn('Failed to resolve relative sitemap URL:', sitemapUrl);
                continue;
              }
            }
            
            // Validate URL
            try {
              new URL(sitemapUrl);
              subSitemaps.push(sitemapUrl);
            } catch (error) {
              console.warn('Invalid sitemap URL found in index:', sitemapUrl);
            }
          }
        }
      }
      
      console.log(`Found ${subSitemaps.length} sub-sitemaps in index`);
    } else {
      // Parse regular sitemap - look for <url> tags
      const urlMatches = xmlText.match(/<url[^>]*>[\s\S]*?<\/url>/gi);
      
      if (urlMatches) {
        for (const urlMatch of urlMatches) {
          const locMatch = urlMatch.match(/<loc[^>]*>([^<]+)<\/loc>/i);
          if (locMatch && locMatch[1]) {
            let url = locMatch[1].trim();
            
            // Handle relative URLs
            if (url.startsWith('/')) {
              try {
                const baseUrlObj = new URL(baseUrl);
                url = `${baseUrlObj.protocol}//${baseUrlObj.host}${url}`;
              } catch (error) {
                console.warn('Failed to resolve relative URL:', url);
                continue;
              }
            }
            
            // Validate URL
            try {
              new URL(url);
              links.push(url);
            } catch (error) {
              console.warn('Invalid URL found in sitemap:', url);
            }
          }
        }
      }
      
      // Fallback: look for any <loc> tags if no <url> tags found
      if (links.length === 0) {
        const locMatches = xmlText.match(/<loc[^>]*>([^<]+)<\/loc>/gi);
        
        if (locMatches) {
          for (const match of locMatches) {
            const urlMatch = match.match(/<loc[^>]*>([^<]+)<\/loc>/i);
            if (urlMatch && urlMatch[1]) {
              let url = urlMatch[1].trim();
              
              // Handle relative URLs
              if (url.startsWith('/')) {
                try {
                  const baseUrlObj = new URL(baseUrl);
                  url = `${baseUrlObj.protocol}//${baseUrlObj.host}${url}`;
                } catch (error) {
                  console.warn('Failed to resolve relative URL:', url);
                  continue;
                }
              }
              
              // Validate URL
              try {
                new URL(url);
                links.push(url);
              } catch (error) {
                console.warn('Invalid URL found in sitemap:', url);
              }
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error parsing sitemap XML:', error);
    throw new Error('Failed to parse sitemap XML');
  }
  
  return { links, subSitemaps };
}

async function fetchSitemapRecursively(sitemapUrl: string, baseUrl: string, maxDepth: number = 3, currentDepth: number = 0): Promise<{ links: string[]; fetchedUrls: string[] }> {
  const allLinks: string[] = [];
  const fetchedUrls: string[] = [];
  
  // Prevent infinite recursion
  if (currentDepth >= maxDepth) {
    console.log(`Max depth (${maxDepth}) reached for ${sitemapUrl}`);
    return { links: allLinks, fetchedUrls };
  }
  
  console.log(`Fetching sitemap (depth ${currentDepth}): ${sitemapUrl}`);
  
  try {
    const { exists, response } = await checkSitemapExists(sitemapUrl);
    
    if (!exists || !response) {
      console.log(`Sitemap not found or failed to fetch: ${sitemapUrl}`);
      return { links: allLinks, fetchedUrls };
    }
    
    fetchedUrls.push(sitemapUrl);
    const xmlText = await response.text();
    const parseResult = await parseSitemapXml(xmlText, baseUrl);
    
    // Add direct links from this sitemap
    allLinks.push(...parseResult.links);
    console.log(`Found ${parseResult.links.length} direct links in ${sitemapUrl}`);
    
    // If this is an index file with sub-sitemaps, fetch them recursively
    if (parseResult.subSitemaps.length > 0) {
      console.log(`Found ${parseResult.subSitemaps.length} sub-sitemaps, fetching recursively...`);
      
      // Process sub-sitemaps in parallel (but limit concurrency)
      const batchSize = 5;
      for (let i = 0; i < parseResult.subSitemaps.length; i += batchSize) {
        const batch = parseResult.subSitemaps.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (subSitemapUrl) => {
          try {
            const subResult = await fetchSitemapRecursively(subSitemapUrl, baseUrl, maxDepth, currentDepth + 1);
            return subResult;
          } catch (error) {
            console.error(`Error fetching sub-sitemap ${subSitemapUrl}:`, error.message);
            return { links: [], fetchedUrls: [] };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        // Combine results
        for (const result of batchResults) {
          allLinks.push(...result.links);
          fetchedUrls.push(...result.fetchedUrls);
        }
      }
    }
    
  } catch (error) {
    console.error(`Error processing sitemap ${sitemapUrl}:`, error.message);
  }
  
  return { links: allLinks, fetchedUrls };
}

async function discoverSitemapsFromRobots(domain: string): Promise<string[]> {
  const robotsUrl = `${domain}/robots.txt`;
  const discoveredSitemaps: string[] = [];
  
  try {
    const response = await fetchWithTimeout(robotsUrl, 5000);
    
    if (response.ok) {
      const robotsText = await response.text();
      
      // Extract sitemap URLs from robots.txt
      for (const pattern of ROBOTS_SITEMAP_PATTERNS) {
        const matches = robotsText.match(pattern);
        if (matches) {
          for (const match of matches) {
            const urlMatch = match.match(/Sitemap:\s*(.+)/i);
            if (urlMatch && urlMatch[1]) {
              let sitemapUrl = urlMatch[1].trim();
              
              // Handle relative URLs
              if (sitemapUrl.startsWith('/')) {
                try {
                  const domainObj = new URL(domain);
                  sitemapUrl = `${domainObj.protocol}//${domainObj.host}${sitemapUrl}`;
                } catch (error) {
                  continue;
                }
              }
              
              try {
                new URL(sitemapUrl);
                discoveredSitemaps.push(sitemapUrl);
              } catch (error) {
                console.warn('Invalid sitemap URL in robots.txt:', sitemapUrl);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('Failed to fetch robots.txt:', error.message);
  }
  
  return discoveredSitemaps;
}

async function discoverSitemapForDomain(domain: string): Promise<SitemapResult> {
  try {
    const normalizedDomain = await normalizeUrl(domain);
    console.log(`Discovering sitemap for domain: ${normalizedDomain}`);
    
    const discoveredUrls: string[] = [];
    
    // 1. Check common sitemap paths
    console.log('Checking common sitemap paths...');
    for (const path of COMMON_SITEMAP_PATHS) {
      const sitemapUrl = `${normalizedDomain}${path}`;
      discoveredUrls.push(sitemapUrl);
      
      const { exists } = await checkSitemapExists(sitemapUrl);
      if (exists) {
        console.log(`Found sitemap at: ${sitemapUrl}`);
        
        try {
          // Use recursive fetching to handle sitemap index files
          const { links, fetchedUrls } = await fetchSitemapRecursively(sitemapUrl, normalizedDomain);
          
          return {
            success: true,
            sitemapUrl,
            links,
            totalLinks: links.length,
            discoveredUrls: [...discoveredUrls],
            fetchedSitemaps: fetchedUrls
          };
        } catch (parseError) {
          console.error('Failed to parse sitemap:', parseError);
          return {
            success: false,
            error: 'Found sitemap but failed to parse it',
            discoveredUrls: [...discoveredUrls]
          };
        }
      }
    }
    
    // 2. Check robots.txt for sitemap references
    console.log('Checking robots.txt for sitemap references...');
    const robotsSitemaps = await discoverSitemapsFromRobots(normalizedDomain);
    
    for (const sitemapUrl of robotsSitemaps) {
      discoveredUrls.push(sitemapUrl);
      
      const { exists } = await checkSitemapExists(sitemapUrl);
      if (exists) {
        console.log(`Found sitemap from robots.txt at: ${sitemapUrl}`);
        
        try {
          // Use recursive fetching to handle sitemap index files
          const { links, fetchedUrls } = await fetchSitemapRecursively(sitemapUrl, normalizedDomain);
          
          return {
            success: true,
            sitemapUrl,
            links,
            totalLinks: links.length,
            discoveredUrls: [...discoveredUrls],
            fetchedSitemaps: fetchedUrls
          };
        } catch (parseError) {
          console.error('Failed to parse sitemap from robots.txt:', parseError);
          return {
            success: false,
            error: 'Found sitemap in robots.txt but failed to parse it',
            discoveredUrls: [...discoveredUrls]
          };
        }
      }
    }
    
    // 3. If no sitemap found, return failure with discovered URLs
    return {
      success: false,
      error: 'No sitemap found. Checked common paths and robots.txt.',
      discoveredUrls: [...discoveredUrls]
    };
    
  } catch (error) {
    console.error('Error in sitemap discovery:', error);
    return {
      success: false,
      error: error.message || 'Failed to discover sitemap'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();
    
    if (!domain || typeof domain !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Domain parameter is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Starting sitemap discovery for domain: ${domain}`);
    const result = await discoverSitemapForDomain(domain);
    
    console.log('Discovery result:', {
      success: result.success,
      sitemapUrl: result.sitemapUrl,
      totalLinks: result.totalLinks,
      discoveredUrlsCount: result.discoveredUrls?.length || 0,
      fetchedSitemapsCount: result.fetchedSitemaps?.length || 0
    });

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});