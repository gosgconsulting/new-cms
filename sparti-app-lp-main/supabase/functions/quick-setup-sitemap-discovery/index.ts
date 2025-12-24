import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl } = await req.json();
    console.log("Discovering sitemap for:", websiteUrl);
    
    if (!websiteUrl) {
      throw new Error("websiteUrl is required");
    }

    // Normalize URL
    const normalizedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    const urlObj = new URL(normalizedUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

    // Common sitemap locations
    const sitemapLocations = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemap1.xml`,
      `${baseUrl}/sitemap-index.xml`,
      `${baseUrl}/wp-sitemap.xml`,
    ];

    const foundSitemaps: string[] = [];
    
    // Check each location
    for (const sitemapUrl of sitemapLocations) {
      try {
        console.log("Checking sitemap at:", sitemapUrl);
        const response = await fetch(sitemapUrl, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Sparti SEO Bot/1.0'
          }
        });
        
        if (response.ok) {
          console.log("Found sitemap:", sitemapUrl);
          foundSitemaps.push(sitemapUrl);
        }
      } catch (error) {
        console.log(`Sitemap not found at ${sitemapUrl}:`, error);
        // Continue checking other locations
      }
    }

    // Also check robots.txt for sitemap references
    try {
      const robotsUrl = `${baseUrl}/robots.txt`;
      console.log("Checking robots.txt at:", robotsUrl);
      const robotsResponse = await fetch(robotsUrl);
      
      if (robotsResponse.ok) {
        const robotsText = await robotsResponse.text();
        const sitemapMatches = robotsText.matchAll(/Sitemap:\s*(.+)/gi);
        
        for (const match of sitemapMatches) {
          const sitemapUrl = match[1].trim();
          if (!foundSitemaps.includes(sitemapUrl)) {
            console.log("Found sitemap in robots.txt:", sitemapUrl);
            foundSitemaps.push(sitemapUrl);
          }
        }
      }
    } catch (error) {
      console.log("Could not read robots.txt:", error);
    }

    return new Response(
      JSON.stringify({ 
        sitemap_urls: foundSitemaps.length > 0 ? foundSitemaps : [],
        message: foundSitemaps.length > 0 
          ? `Found ${foundSitemaps.length} sitemap(s)` 
          : "No sitemaps found. You can add them manually later."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("quick-setup-sitemap-discovery error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        sitemap_urls: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
