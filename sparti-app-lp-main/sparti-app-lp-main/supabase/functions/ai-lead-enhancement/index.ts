import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadEnhancementRequest {
  leads: any[];
  query: string;
  enhancementType: 'qualify' | 'score' | 'filter' | 'analyze';
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== AI LEAD ENHANCEMENT REQUEST ===');
    
    // Get Anthropic API key from database
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'anthropic_api_key')
      .eq('is_global', true)
      .single();

    if (settingsError || !settingsData?.value) {
      console.error('❌ Failed to get Anthropic API key from database:', settingsError);
      throw new Error('Anthropic API key not found in database settings');
    }

    const anthropicApiKey = settingsData.value;
    console.log('✅ Retrieved Anthropic API key from database');

    const { leads, query, enhancementType }: LeadEnhancementRequest = await req.json();

    if (!leads || !Array.isArray(leads)) {
      throw new Error('Invalid leads data provided');
    }

    if (!query || typeof query !== 'string') {
      throw new Error('Invalid query provided');
    }

    // Create AI prompt based on enhancement type
    let systemPrompt = '';
    let userPrompt = '';

    switch (enhancementType) {
      case 'filter':
        systemPrompt = `You are an AI assistant specialized in business lead filtering. 
        Analyze the provided business leads and return only those that match the user's natural language criteria.
        Return a JSON array of lead IDs that match the criteria.
        Focus on business characteristics like: industry type, digital presence, contact availability, ratings, reviews, location, etc.`;
        
        userPrompt = `Filter these business leads based on: "${query}"

Business Leads:
${JSON.stringify(leads.map(lead => ({
  id: lead.id,
  name: lead.name,
  category: lead.category,
  rating: lead.rating,
  reviews_count: lead.reviews_count,
  phone: lead.phone || lead.contactInfo?.phone,
  email: lead.email || lead.contactInfo?.email,
  website: lead.website || lead.contactInfo?.website,
  social_media: lead.social_media,
  address: lead.address
})), null, 2)}

Return only a JSON array of lead IDs that match the criteria: ["lead_id_1", "lead_id_2", ...]`;
        break;

      case 'qualify':
        systemPrompt = `You are an AI assistant specialized in lead qualification for business services.
        Analyze each lead and assign a qualification score (0-100) with reasoning.
        Consider factors like: digital presence gaps, business size, contact availability, reputation, growth potential.
        Return a JSON object mapping lead IDs to qualification data.`;
        
        userPrompt = `Qualify these leads for: "${query}"

Business Leads:
${JSON.stringify(leads.slice(0, 10).map(lead => ({
  id: lead.id,
  name: lead.name,
  category: lead.category,
  rating: lead.rating,
  reviews_count: lead.reviews_count,
  phone: lead.phone || lead.contactInfo?.phone,
  email: lead.email || lead.contactInfo?.email,
  website: lead.website || lead.contactInfo?.website,
  social_media: lead.social_media
})), null, 2)}

Return JSON format:
{
  "lead_id": {
    "score": 85,
    "reasoning": "High-quality prospect because...",
    "opportunities": ["website development", "SEO optimization"],
    "priority": "high"
  }
}`;
        break;

      case 'score':
        systemPrompt = `You are an AI assistant specialized in lead scoring for sales and marketing.
        Analyze each lead and provide detailed scoring with factors and opportunities.
        Consider: contact completeness, digital presence, business reputation, market position, growth indicators.
        Return JSON with detailed scoring breakdown.`;
        
        userPrompt = `Score these leads for: "${query}"

Business Leads:
${JSON.stringify(leads.slice(0, 10).map(lead => ({
  id: lead.id,
  name: lead.name,
  category: lead.category,
  rating: lead.rating,
  reviews_count: lead.reviews_count,
  phone: lead.phone || lead.contactInfo?.phone,
  email: lead.email || lead.contactInfo?.email,
  website: lead.website || lead.contactInfo?.website,
  social_media: lead.social_media,
  business_status: lead.business_status
})), null, 2)}

Return JSON format:
{
  "lead_id": {
    "overall_score": 78,
    "factors": {
      "contact_completeness": 90,
      "digital_presence": 60,
      "reputation": 85,
      "market_position": 70
    },
    "opportunities": ["social media marketing", "review management"],
    "next_actions": ["contact via phone", "website audit"]
  }
}`;
        break;

      case 'analyze':
        systemPrompt = `You are an AI assistant specialized in market analysis and business intelligence.
        Analyze the provided business leads to identify market trends, opportunities, and insights.
        Focus on: market gaps, competitive landscape, digital transformation opportunities, industry trends.`;
        
        userPrompt = `Analyze this market data for: "${query}"

Business Data Summary:
- Total businesses: ${leads.length}
- Industries: ${[...new Set(leads.map(l => l.category).filter(Boolean))].slice(0, 10).join(', ')}
- Average rating: ${(leads.reduce((sum, l) => sum + (l.rating || 0), 0) / leads.length).toFixed(1)}
- Businesses with websites: ${leads.filter(l => l.website || l.contactInfo?.website).length}
- Businesses with social media: ${leads.filter(l => l.social_media?.facebook || l.social_media?.instagram).length}

Provide market insights in JSON format:
{
  "market_overview": "string",
  "key_opportunities": ["opportunity1", "opportunity2"],
  "digital_gaps": ["gap1", "gap2"],
  "recommendations": ["rec1", "rec2"],
  "target_segments": [{"segment": "name", "size": number, "opportunity": "description"}]
}`;
        break;

      default:
        throw new Error('Invalid enhancement type');
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Try to parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      // Fallback: extract JSON from response if it's wrapped in text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI response is not valid JSON');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      enhancementType,
      query,
      result: parsedResponse,
      leadsProcessed: leads.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-lead-enhancement function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});