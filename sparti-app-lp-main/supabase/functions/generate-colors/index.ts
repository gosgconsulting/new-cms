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
    const { primaryColor } = await req.json();
    
    if (!primaryColor) {
      return new Response(
        JSON.stringify({ error: 'Primary color is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'OpenRouter API key not configured',
          success: false 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating colors for primary:', primaryColor);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparti.ai',
        'X-Title': 'Sparti AI Assistant',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional color designer. Generate complementary colors that work well together for branding and design purposes.'
          },
          {
            role: 'user',
            content: `Given this primary brand color: ${primaryColor}, generate 2 complementary colors (secondary and tertiary) that would work perfectly for a professional brand design. The colors should be harmonious, accessible, and suitable for backgrounds, CTAs, headlines, and gradients. Return ONLY the hex codes in this exact format: {"secondary":"#XXXXXX","tertiary":"#XXXXXX"}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_colors',
              description: 'Generate secondary and tertiary brand colors',
              parameters: {
                type: 'object',
                properties: {
                  secondary: {
                    type: 'string',
                    description: 'The secondary color in hex format (e.g., #8B5CF6)'
                  },
                  tertiary: {
                    type: 'string',
                    description: 'The tertiary color in hex format (e.g., #10B981)'
                  }
                },
                required: ['secondary', 'tertiary'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_colors' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      let errorMessage = 'Failed to generate colors';
      if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      } else if (response.status === 402) {
        errorMessage = 'Payment required. Please add credits to your OpenRouter account.';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorText,
          success: false 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool call found in response');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid AI response format',
          success: false 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const colors = JSON.parse(toolCall.function.arguments);
    console.log('Generated colors:', colors);

    return new Response(
      JSON.stringify({ 
        secondary: colors.secondary,
        tertiary: colors.tertiary,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-colors function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
