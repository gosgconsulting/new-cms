import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WPPostStatus {
  name: string;
  slug: string;
  public: boolean;
  queryable: boolean;
  show_in_list: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching WordPress post statuses');
    
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
      .maybeSingle();

    if (wpError) {
      console.error('WordPress integration fetch error:', wpError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch WordPress integration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let statuses: WPPostStatus[] = [];

    // Fetch WordPress post statuses
    if (wpIntegration && wpIntegration.site_url && wpIntegration.username && wpIntegration.application_password && wpIntegration.is_connected) {
      try {
        console.log('Fetching WordPress post statuses from:', wpIntegration.site_url);
        
        const credentials = btoa(`${wpIntegration.username}:${wpIntegration.application_password}`);
        const wpResponse = await fetch(`${wpIntegration.site_url}/wp-json/wp/v2/statuses`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
        });

        if (wpResponse.ok) {
          const wpStatuses = await wpResponse.json();
          
          // Convert WordPress statuses object to array format
          statuses = Object.entries(wpStatuses).map(([slug, status]: [string, any]) => ({
            name: status.name,
            slug: slug,
            public: status.public,
            queryable: status.queryable,
            show_in_list: status.show_in_list
          }));
          
          // Filter to show only relevant statuses for content management
          statuses = statuses.filter(status => 
            ['draft', 'publish', 'pending', 'private', 'future'].includes(status.slug)
          );
          
          console.log(`Found ${statuses.length} WordPress post statuses`);
        } else {
          const errorText = await wpResponse.text();
          console.error('WordPress API error:', wpResponse.status, errorText);
        }
      } catch (error) {
        console.error('WordPress statuses fetch error:', error);
      }
    }

    // Add default statuses if none found
    if (statuses.length === 0) {
      statuses = [
        { name: 'Draft', slug: 'draft', public: false, queryable: true, show_in_list: true },
        { name: 'Published', slug: 'publish', public: true, queryable: true, show_in_list: true },
        { name: 'Pending Review', slug: 'pending', public: false, queryable: true, show_in_list: true },
        { name: 'Private', slug: 'private', public: false, queryable: true, show_in_list: true },
        { name: 'Scheduled', slug: 'future', public: false, queryable: true, show_in_list: true }
      ];
      console.log('Using default WordPress post statuses');
    }

    console.log(`Returning ${statuses.length} post statuses`);
    
    return new Response(
      JSON.stringify({ statuses }),
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