import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OpenRouter API key is available
    if (!openRouterApiKey) {
      console.error('OPENROUTER_API_KEY environment variable is not set')
      return new Response(JSON.stringify({ 
        error: 'OpenRouter API key not configured',
        details: 'OPENROUTER_API_KEY environment variable is missing. Please configure it in your Supabase project settings.',
        type: 'api_key_missing',
        success: false
      }), {
        status: 200, // Return 200 to avoid non-2xx status code issues
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('OpenRouter API key is configured:', openRouterApiKey.substring(0, 8) + '...')

    const { messages, model, stream = false, max_tokens = 4000, temperature = 0.7, tools, tool_choice } = await req.json();

    console.log('OpenRouter API call:', { 
      model, 
      messageCount: messages.length,
      hasApiKey: !!openRouterApiKey,
      stream 
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparti.ai',
        'X-Title': 'Sparti AI Assistant',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false, // Always use non-streaming for better reliability
        max_tokens,
        temperature,
        ...(tools && { tools }),
        ...(tool_choice && { tool_choice }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', { 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorData,
        model: model,
        apiKey: openRouterApiKey ? '***configured***' : 'NOT_CONFIGURED'
      });
      
      return new Response(JSON.stringify({ 
        error: 'OpenRouter API call failed',
        details: errorData,
        originalStatus: response.status,
        statusText: response.statusText,
        model: model,
        apiKeyConfigured: !!openRouterApiKey,
        success: false
      }), {
        status: 200, // Return 200 to avoid non-2xx status code issues
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    console.log('OpenRouter response received successfully');
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openrouter-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      type: 'openrouter_error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});