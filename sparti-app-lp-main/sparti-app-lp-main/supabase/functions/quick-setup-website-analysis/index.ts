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
    const { websiteUrl, messages, extractStructured = true, requestSummary = false } = await req.json();
    console.log('Analyzing website:', websiteUrl);
    console.log('Extract structured:', extractStructured);
    console.log('Request summary:', requestSummary);

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Fetch website content using Firecrawl
    let websiteContent = '';
    let contentSource = '';
    
    console.log('Fetching website content via Firecrawl for URL:', websiteUrl);
    
    // Call Firecrawl API directly (like other functions do)
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY') || 'fc-200bce4322aa42ffa3eabae53b6d80bd';
    
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url: websiteUrl,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000,
        timeout: 30000
      })
    });
    
    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error('Firecrawl API error:', firecrawlResponse.status, errorText);
      throw new Error(`Failed to scrape website: ${firecrawlResponse.status} - ${errorText}`);
    }
    
    const firecrawlData = await firecrawlResponse.json();
    const markdown = firecrawlData.data?.markdown || '';
    
    if (!markdown || markdown.length < 100) {
      throw new Error('Insufficient content extracted from website');
    }
    
    websiteContent = markdown.substring(0, 10000); // Increased limit for better analysis
    contentSource = 'firecrawl';
    console.log('Successfully fetched content via Firecrawl API, length:', websiteContent.length);

    // If requesting summary, generate a conversational summary
    if (requestSummary) {
      const summaryPrompt = `I've analyzed the website ${websiteUrl}. Create a friendly, conversational summary of what you found. Format it nicely with markdown and include:
- The brand name and what they do
- Who their target audience is
- Their key selling points or unique features

Website Content:
${websiteContent}

Be concise but informative, and end by asking if the user wants to add any additional information.`;

      const response = await fetch(`${supabaseUrl}/functions/v1/openrouter-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "user", content: summaryPrompt }
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "AI gateway error" }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
        },
      });
    }

    // If extracting structured data, use direct JSON response instead of tool calling
    if (extractStructured) {
      const analysisPrompt = `You are a data extraction assistant. Analyze this website and extract key information. 

CRITICAL: You must respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks. Just the raw JSON.

Required JSON structure:
{
  "brand_name": "string",
  "brand_description": "string", 
  "target_audience": "string",
  "key_selling_points": ["string1", "string2", "string3"],
  "target_country": "string",
  "content_language": "string",
  "suggested_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Website URL: ${websiteUrl}
Website Content:
${websiteContent}

Extract the following information:
- Brand name: The company/brand name
- Brand description: Brief description of what the brand does (1-2 sentences)
- Target audience: Who the target customers are (be specific)
- Key selling points: 3-5 main benefits or features (as array of strings)
- Target country: Primary target country (infer from domain, content, or language)
- Content language: Primary content language
- Suggested keywords: 5 relevant SEO keywords that describe the brand, products, or services (as array of strings)

Respond with ONLY the JSON object. No other text.`;

      const response = await fetch(`${supabaseUrl}/functions/v1/openrouter-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "user", content: analysisPrompt }
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        
        // Check if it's an authentication error
        if (response.status === 401) {
          console.log('[fallback] OpenRouter API failed, using fallback analysis');
          
          // Fallback: Use basic text analysis without AI
          const fallbackData = {
            brand_name: websiteUrl.split('/')[2]?.split('.')[0] || 'Unknown Brand',
            brand_description: `Website analysis for ${websiteUrl}. Content extracted successfully but AI analysis unavailable due to API authentication issues.`,
            target_audience: 'General audience (AI analysis unavailable)',
            key_selling_points: [
              'Website content successfully extracted',
              'Basic analysis completed',
              'AI analysis requires API key configuration'
            ],
            target_country: 'Unknown (AI analysis unavailable)',
            content_language: 'English (detected from content)',
            suggested_keywords: ['website', 'analysis', 'content', 'extraction', 'basic']
          };
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: fallbackData,
              warning: "AI analysis unavailable - using fallback data. Please configure OpenRouter API key for full analysis."
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: "AI gateway error", details: errorText }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      console.log('[testing] AI response data:', JSON.stringify(data, null, 2));
      
      const aiResponse = data.choices?.[0]?.message?.content;
      console.log('[testing] AI response content:', aiResponse);
      
      // Check if aiResponse exists and is a string
      if (!aiResponse || typeof aiResponse !== 'string') {
        console.error('[testing] Invalid AI response:', { 
          type: typeof aiResponse, 
          value: aiResponse,
          fullResponse: data 
        });
        return new Response(
          JSON.stringify({ 
            error: "Invalid AI response format", 
            details: "AI response content is missing or invalid",
            responseStructure: data
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      try {
        // Try multiple approaches to extract JSON
        let extractedData = null;
        
        // Approach 1: Look for JSON object in the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            extractedData = JSON.parse(jsonMatch[0]);
            console.log('[testing] Extracted data via regex:', JSON.stringify(extractedData, null, 2));
          } catch (e) {
            console.log('[testing] Regex match failed to parse:', e);
          }
        }
        
        // Approach 2: Try to parse the entire response as JSON
        if (!extractedData) {
          try {
            extractedData = JSON.parse(aiResponse);
            console.log('[testing] Extracted data via direct parse:', JSON.stringify(extractedData, null, 2));
          } catch (e) {
            console.log('[testing] Direct parse failed:', e);
          }
        }
        
        // Approach 3: Look for JSON in code blocks
        if (!extractedData) {
          const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (codeBlockMatch) {
            try {
              extractedData = JSON.parse(codeBlockMatch[1]);
              console.log('[testing] Extracted data via code block:', JSON.stringify(extractedData, null, 2));
            } catch (e) {
              console.log('[testing] Code block parse failed:', e);
            }
          }
        }
        
        if (extractedData) {
          // Validate required fields
          const requiredFields = ['brand_name', 'brand_description', 'target_audience', 'key_selling_points', 'target_country', 'content_language', 'suggested_keywords'];
          const missingFields = requiredFields.filter(field => !extractedData[field]);
          
          if (missingFields.length > 0) {
            console.log('[testing] Missing fields:', missingFields);
            return new Response(
              JSON.stringify({ 
                error: "Incomplete data extraction", 
                details: `Missing fields: ${missingFields.join(', ')}`,
                extractedData
              }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          return new Response(
            JSON.stringify({ success: true, data: extractedData }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          console.log('[testing] No valid JSON found in response');
          return new Response(
            JSON.stringify({ 
              error: "Failed to extract structured data", 
              details: "AI response did not contain valid JSON",
              aiResponse: aiResponse
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (parseError) {
        console.error('[testing] JSON parse error:', parseError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to parse AI response", 
            details: parseError.message,
            aiResponse: aiResponse
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // If not extracting structured data, stream the chat response
    const systemPrompt = `You are an AI assistant helping to analyze a website and extract key information for SEO content strategy.

Provide a well-formatted summary of the website analysis including brand information, products/services, target audience, and key selling points.

Website URL: ${websiteUrl}
Website Content:
${websiteContent}`;

    const response = await fetch(`${supabaseUrl}/functions/v1/openrouter-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your OpenRouter account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });

  } catch (error) {
    console.error("Error in website analysis:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to analyze website",
        details: "Please check the URL and try again. Ensure the website is accessible."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
