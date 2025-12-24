import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  businessDescription: string;
  websiteContent?: string;
}

interface LeadSuggestions {
  suggestedActivities: string[];
  suggestedCountries: string[];
  suggestedCities: string[];
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { businessDescription, websiteContent }: AnalysisRequest = await req.json();

    if (!businessDescription?.trim()) {
      throw new Error('Business description is required');
    }

    // Combine business description with website content if available
    const fullContext = websiteContent 
      ? `Business Description: ${businessDescription}\n\nWebsite Content: ${websiteContent}`
      : businessDescription;

    const systemPrompt = `You are a lead generation expert. Analyze the provided business information and suggest optimal parameters for finding potential customers.

Available business categories: Restaurant, Hotel, Cafe, Bar, Retail Store, Healthcare, Professional Services, Auto Services, Beauty & Spa, Real Estate, Education, Entertainment, Financial Services, Technology, Construction, Manufacturing, Transportation, Accounting, Airport, Amusement park, Aquarium, Art gallery, ATM, Auto repair, Bakery, Bank, Beauty salon, Bicycle store, Book store, Bowling alley, Bus station, Campground, Car dealer, Car rental, Car wash, Casino, Cemetery, Church, City hall, Clothing store, Convenience store, Courthouse, Dentist, Department store, Doctor, Drugstore, Electrician, Electronics store, Embassy, Fire station, Florist, Funeral home, Furniture store, Gas station, Gym, Hair care, Hardware store, Hindu temple, Home goods store, Hospital, Insurance agency, Jewelry store, Laundry, Lawyer, Library, Light rail station, Liquor store, Local government office, Locksmith, Lodging, Meal delivery, Meal takeaway, Mosque, Movie rental, Movie theater, Moving company, Museum, Night club, Painter, Park, Parking, Pet store, Pharmacy, Physiotherapist, Plumber, Police, Post office, Primary school, Real estate agency, Roofing contractor, RV park, School, Secondary school, Shoe store, Shopping mall, Spa, Stadium, Storage, Store, Subway station, Supermarket, Synagogue, Taxi stand, Tourist attraction, Train station, Transit station, Travel agency, Truck stop, University, Veterinary care, Zoo.

Available countries: Focus on major markets like United States, United Kingdom, Canada, Australia, Germany, France, Spain, Italy, Netherlands, Thailand, Singapore, Japan, etc.

Respond with a JSON object only, no additional text:
{
  "suggestedActivities": ["category1", "category2"],
  "suggestedCountries": ["country1", "country2"],
  "suggestedCities": ["city1", "city2"],
  "reasoning": "Brief explanation of suggestions"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullContext }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the JSON response
    let suggestions: LeadSuggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (parseError) {
      // Fallback suggestions if parsing fails
      console.error('Failed to parse AI response:', parseError);
      suggestions = {
        suggestedActivities: ['Restaurant', 'Retail Store'],
        suggestedCountries: ['United States', 'United Kingdom'],
        suggestedCities: ['New York', 'London'],
        reasoning: 'Default suggestions due to parsing error'
      };
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-lead-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestedActivities: ['Restaurant'],
      suggestedCountries: ['Thailand'],
      suggestedCities: ['Bangkok'],
      reasoning: 'Fallback suggestions due to error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});