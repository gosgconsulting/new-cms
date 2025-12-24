import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { calculateTokenCost, extractTokenUsage, formatCostLog } from '../shared/tokenPricing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentEnhancementRequest {
  text: string;
  action: 'rewrite' | 'summarize' | 'expand' | 'improve' | 'make_engaging';
  tone?: 'professional' | 'casual' | 'friendly' | 'formal' | 'creative';
  targetAudience?: string;
  maxLength?: number;
  model?: string;
  brand_id?: string;
}


interface ContentEnhancementResponse {
  success: boolean;
  enhancedText?: string;
  originalText?: string;
  action?: string;
  error?: string;
  suggestions?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: ContentEnhancementRequest = await req.json();
    console.log('📝 Content enhancement request:', requestData);

    const {
      text,
      action,
      tone = 'professional',
      targetAudience = 'general audience',
      maxLength,
      model = 'gpt-4o-mini', // Default to gpt-4o-mini if not specified
      brand_id
    } = requestData;

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate the appropriate prompt based on action
    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'rewrite':
        systemPrompt = `You are an expert content writer. Rewrite the given text to be clearer, more engaging, and better structured while maintaining the original meaning and key information. Use a ${tone} tone suitable for ${targetAudience}.`;
        userPrompt = `Please rewrite this text:\n\n${text}`;
        break;

      case 'summarize':
        systemPrompt = `You are an expert at summarizing content. Create a concise summary that captures the key points and main ideas. Use a ${tone} tone suitable for ${targetAudience}.`;
        userPrompt = `Please summarize this text${maxLength ? ` in approximately ${maxLength} words` : ''}:\n\n${text}`;
        break;

      case 'expand':
        systemPrompt = `You are an expert content writer. Expand the given text with more details, examples, and context while maintaining the original message and tone. Use a ${tone} tone suitable for ${targetAudience}.`;
        userPrompt = `Please expand this text with more details and context:\n\n${text}`;
        break;

      case 'improve':
        systemPrompt = `You are an expert editor and content writer. Improve the given text by enhancing clarity, flow, grammar, and engagement. Maintain the original meaning while making it more compelling. Use a ${tone} tone suitable for ${targetAudience}.`;
        userPrompt = `Please improve this text:\n\n${text}`;
        break;

      case 'make_engaging':
        systemPrompt = `You are an expert content writer specializing in engaging content. Transform the given text to be more captivating, interesting, and compelling while preserving the core information. Use a ${tone} tone suitable for ${targetAudience}.`;
        userPrompt = `Please make this text more engaging and captivating:\n\n${text}`;
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Add length constraint if specified
    if (maxLength) {
      userPrompt += `\n\nPlease keep the response to approximately ${maxLength} words.`;
    }

    console.log('🤖 Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxLength ? Math.min(maxLength * 2, 4000) : 2000,
        temperature: action === 'make_engaging' ? 0.8 : 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedText = data.choices[0].message.content.trim();

    console.log('✅ Content enhanced successfully');

    // Calculate token usage and cost
    const usage = extractTokenUsage(data);
    const cost = calculateTokenCost(usage, model, 2); // * 2 because we are using the model twice

    console.log(formatCostLog(cost, usage, model));

    // Record token usage and deduct from user balance
    try {
      const { data: tokenData, error: tokenError } = await supabase.rpc('deduct_user_tokens', {
        p_user_id: user.id,
        p_service_name: 'ai_content_enhancer',
        p_model_name: model,
        p_cost_usd: cost.totalCost,
        p_brand_id: brand_id,
        p_request_data: {
          action: action,
          tone: tone,
          target_audience: targetAudience,
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.totalTokens,
          original_length: text.length,
          enhanced_length: enhancedText.length,
          timestamp: new Date().toISOString()
        }
      });

      if (tokenError) {
        console.error('Token tracking error:', tokenError);
        // Don't fail the request if token tracking fails
      } else if (!tokenData?.success) {
        console.error('Token deduction failed:', tokenData?.error);
        // Don't fail the request if token deduction fails
      } else {
        console.log(`✅ Tokens deducted: ${tokenData.tokens_deducted}, New balance: ${tokenData.new_balance}`);
      }
    } catch (tokenTrackingError) {
      console.error('Failed to track token usage:', tokenTrackingError);
      // Don't fail the request if token tracking fails
    }

    // Optional: Track usage for analytics
    try {
      await supabase.from('ai_content_enhancements').insert({
        user_id: user.id,
        original_text: text.substring(0, 1000), // Truncate for storage
        enhanced_text: enhancedText.substring(0, 1000),
        action: action,
        tone: tone,
        target_audience: targetAudience,
        original_length: text.length,
        enhanced_length: enhancedText.length,
        model_used: model
      });
    } catch (trackingError) {
      console.error('Failed to track usage:', trackingError);
      // Don't fail the request if tracking fails
    }

    const result: ContentEnhancementResponse = {
      success: true,
      enhancedText,
      originalText: text,
      action,
      suggestions: generateSuggestions(action, tone)
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Content enhancement error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      } as ContentEnhancementResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateSuggestions(action: string, tone: string): string[] {
  const suggestions: { [key: string]: string[] } = {
    rewrite: [
      'Try making it more concise',
      'Add more specific examples',
      'Use active voice instead of passive',
      'Break long sentences into shorter ones'
    ],
    summarize: [
      'Consider bullet points for key takeaways',
      'Focus on the most important 3-5 points',
      'Remove unnecessary details',
      'Highlight the main conclusion'
    ],
    expand: [
      'Add real-world examples',
      'Include relevant statistics or data',
      'Explain technical terms',
      'Add supporting arguments'
    ],
    improve: [
      'Check for grammar and spelling',
      'Enhance transitions between paragraphs',
      'Use stronger, more specific words',
      'Ensure consistent tone throughout'
    ],
    make_engaging: [
      'Start with a compelling hook',
      'Use storytelling elements',
      'Add rhetorical questions',
      'Include emotional appeals'
    ]
  };

  return suggestions[action] || ['Consider the overall clarity and impact'];
}