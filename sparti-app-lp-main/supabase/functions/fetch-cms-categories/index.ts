import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CMSCategory {
  id: number;
  name: string;
  slug: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching CMS categories');
    
    const { brandId } = await req.json();
    
    if (!brandId) {
      console.error('Missing brandId parameter');
      return new Response(
        JSON.stringify({ error: 'brandId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get WordPress integration configuration
    console.log(`Fetching WordPress integration for brand: ${brandId}`);
    
    const { data: wpIntegration, error: wpError } = await supabase
      .from('wordpress_integrations')
      .select('site_url, username, application_password, is_connected')
      .eq('brand_id', brandId)
      .single();

    if (wpError) {
      console.error('WordPress integration fetch error:', wpError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch WordPress integration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let categories: CMSCategory[] = [];

    // Fetch WordPress categories
    if (wpIntegration && wpIntegration.site_url && wpIntegration.username && wpIntegration.application_password && wpIntegration.is_connected) {
      try {
        console.log('Fetching WordPress categories from:', wpIntegration.site_url);
        
        const credentials = btoa(`${wpIntegration.username}:${wpIntegration.application_password}`);
        const wpResponse = await fetch(`${wpIntegration.site_url}/wp-json/wp/v2/categories`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
        });

        if (wpResponse.ok) {
          const wpCategories = await wpResponse.json();
          categories = wpCategories.map((category: any) => ({
            id: category.id,
            name: category.name,
            slug: category.slug
          }));
          console.log(`Found ${categories.length} WordPress categories`);
        } else {
          const errorText = await wpResponse.text();
          console.error('WordPress API error:', wpResponse.status, errorText);
        }
      } catch (error) {
        console.error('WordPress categories fetch error:', error);
      }
    }

    // Add default categories if none found
    if (categories.length === 0) {
      categories = [
        { id: 1, name: 'General', slug: 'general' },
        { id: 2, name: 'News', slug: 'news' },
        { id: 3, name: 'Updates', slug: 'updates' }
      ];
      console.log('Using default categories');
    }

    console.log(`Returning ${categories.length} categories`);
    
    return new Response(
      JSON.stringify({ categories }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
